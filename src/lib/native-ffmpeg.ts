/**
 * Native FFmpeg runner via Tauri sidecar.
 *
 * Provides the same `writeFile` / `exec` / `readFile` interface as
 * @ffmpeg/ffmpeg (FFmpeg class), but runs ffmpeg.exe natively.
 * No WASM loading, no ArrayBuffer detachment.
 *
 * Falls back gracefully when not in a Tauri context.
 */

const SIDECAR_NAME = "binaries/ffmpeg";

// ── Lazy Tauri imports (so browser fallback works) ──────────────

async function getFs() {
  return import("@tauri-apps/plugin-fs");
}
async function getShell() {
  return import("@tauri-apps/plugin-shell");
}
async function getPath() {
  return import("@tauri-apps/api/path");
}

// ── Temp directory helpers ──────────────────────────────────────

let tempDirCounter = 0;
let _isTauri: boolean | null = null;

export type Platform = "desktop" | "android" | "browser";

let _platform: Platform | null = null;

export async function getPlatform(): Promise<Platform> {
  if (_platform !== null) return _platform;
  try {
    const { appCacheDir } = await getPath();
    await appCacheDir();
    // It's a Tauri context — check if it's Android
    try {
      const { type } = await import("@tauri-apps/api/platform");
      if ((await type()) === "android") {
        _platform = "android";
      } else {
        _platform = "desktop";
      }
    } catch {
      // Fallback: check user agent for Android
      _platform = navigator.userAgent.includes("Android") ? "android" : "desktop";
    }
  } catch {
    _platform = "browser";
  }
  return _platform;
}

/** @deprecated Use getPlatform() instead */
export async function isTauriContext(): Promise<boolean> {
  return (await getPlatform()) !== "browser";
}

async function createTempDir(): Promise<string> {
  const { mkdir, BaseDirectory } = await getFs();
  const dir = `transvd-${Date.now()}-${tempDirCounter++}`;
  await mkdir(dir, { baseDir: BaseDirectory.AppCache, recursive: true });
  return dir; // relative to AppCache
}

export type ProgressCallback = (pct: number) => void;
export type LogCallback = (msg: string) => void;

/**
 * Drop-in replacement for the @ffmpeg/ffmpeg FFmpeg class.
 * Panels call `writeFile`, `exec`, `readFile` exactly as before.
 */
export class NativeFFmpeg {
  private tempDir: string | null = null;
  private absTd: string = "";
  private _ready = false;
  private _child: { kill: () => Promise<void> } | null = null;
  private _killed = false;
  private _progressListeners: ProgressCallback[] = [];
  private _logListeners: LogCallback[] = [];

  // Map of logical file names → original file paths (for m3u8 / HLS)
  // When present, exec() uses the original path instead of the temp dir path
  private originalPaths: Map<string, string> = new Map();

  /**
   * Register an original file path for logical file name.
   * Useful for playlist files (m3u8) that reference external segments.
   * When exec() resolves this file's name, it'll use the original path directly.
   */
  setOriginalPath(name: string, originalPath: string): void {
    this.originalPaths.set(name, originalPath);
  }

  /** Emulates ffmpeg.on("progress", cb) */
  on(event: "progress" | "log", cb: (...args: unknown[]) => void): void {
    if (event === "progress") {
      this._progressListeners.push(cb as ProgressCallback);
    } else if (event === "log") {
      this._logListeners.push(cb as LogCallback);
    }
  }

  /** Kill the currently running ffmpeg process */
  async kill(): Promise<void> {
    this._killed = true;
    if (this._child) {
      try { await this._child.kill(); } catch { /* best effort */ }
      this._child = null;
    }
  }

  async load(): Promise<void> {
    if (this._ready) return;
    this.tempDir = await createTempDir();
    const { join, appCacheDir } = await import("@tauri-apps/api/path");
    this.absTd = await join(await appCacheDir(), this.tempDir);
    this.absTd = this.absTd.replace(/\\/g, '/');
    this._ready = true;
  }

  async writeFile(name: string, data: Uint8Array | string): Promise<void> {
    if (this._killed) throw new Error("Operation cancelled");
    const { writeFile, BaseDirectory } = await getFs();
    const td = await this.ensureReady();
    const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
    await writeFile(`${td}/${name}`, buf, { baseDir: BaseDirectory.AppCache });
  }

  /** Flags whose next argument is a file path (not a value) */
  private static FILE_FLAGS = new Set(["-i", "-y"]);

  async exec(args: string[]): Promise<void> {
    if (this._killed) throw new Error("Operation cancelled");
    await this.ensureReady();
    const { Command } = await getShell();

    // Only resolve args that are clearly file paths:
    //   * the arg immediately after -i or -y (input / output files)
    //   * or any arg ending with a video/audio extension
    const EXT_RE = /\.(mp4|webm|mkv|mov|avi|gif|m3u8|mp3|aac|wav|ogg|flac|jpg|jpeg|png|srt|ass|vtt)$/i;
    const fullArgs: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const prev = i > 0 ? args[i - 1] : "";
      if (
        NativeFFmpeg.FILE_FLAGS.has(prev) ||  // after -i, -y, etc.
        EXT_RE.test(a)                        // has a known extension
      ) {
        // Check if this file has an original path override (e.g. m3u8 playlists)
        const origPath = this.originalPaths.get(a);
        if (origPath) {
          fullArgs.push(origPath);
        } else {
          fullArgs.push(`${this.absTd}/${a}`);
        }
      } else {
        fullArgs.push(a);
      }
    }

    const command = Command.sidecar(SIDECAR_NAME, fullArgs);

    // Spawn (gives us a killable child) and return promise that resolves on exit
    const child = await command.spawn();
    this._child = child;

    return new Promise<void>((resolve, reject) => {
      let stderr = "";

      // Listen to stderr in real-time for progress, logs & error accumulation
      command.stderr.on("data", (data: string) => {
        stderr += data;
        // Parse progress from this chunk
        const m = data.match(/time=(\d+):(\d+):(\d+)\.(\d+)/);
        if (m) {
          const secs = +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 100;
          this._progressListeners.forEach((cb) => cb(secs % 100));
        }
        // Feed lines to log listeners
        data.split("\n").forEach((line: string) => {
          if (line) this._logListeners.forEach((cb) => cb(line));
        });
      });

      command.on("close", (payload: { code: number | null; signal: number | null }) => {
        this._child = null;
        if (this._killed) {
          // Process was intentionally killed by cancel()
          this._progressListeners = [];
          this._logListeners = [];
          reject(new Error("Operation cancelled"));
        } else if (payload.code === 0) {
          resolve();
        } else {
          const lines = stderr.trim().split("\n");
          const msg = lines[lines.length - 1] || `Exit code ${payload.code ?? "unknown"}`;
          reject(new Error(msg));
        }
      });

      command.on("error", (err: string) => {
        this._child = null;
        if (!this._killed) {
          reject(new Error(err));
        }
      });
    });
  }

  async readFile(name: string): Promise<Uint8Array> {
    if (this._killed) throw new Error("Operation cancelled");
    const { readFile, BaseDirectory } = await getFs();
    const td = await this.ensureReady();
    return await readFile(`${td}/${name}`, { baseDir: BaseDirectory.AppCache });
  }

  async terminate(): Promise<void> {
    if (!this.tempDir) return;
    // Kill child if still running
    if (this._child) {
      try { await this._child.kill(); } catch { /* best effort */ }
      this._child = null;
    }
    try {
      const { remove, BaseDirectory } = await getFs();
      await remove(this.tempDir, { baseDir: BaseDirectory.AppCache, recursive: true });
    } catch { /* best effort */ }
    this.tempDir = null;
    this.absTd = "";
    this._ready = false;
    this._killed = false;
    this._progressListeners = [];
    this._logListeners = [];
    this.originalPaths.clear();
  }

  private async ensureReady(): Promise<string> {
    if (!this._ready) await this.load();
    return this.tempDir!;
  }
}
