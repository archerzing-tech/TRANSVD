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

export async function isTauriContext(): Promise<boolean> {
  if (_isTauri !== null) return _isTauri;
  try {
    const { appCacheDir } = await getPath();
    await appCacheDir();
    _isTauri = true;
  } catch {
    _isTauri = false;
  }
  return _isTauri;
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
  private _progressListeners: ProgressCallback[] = [];
  private _logListeners: LogCallback[] = [];

  /** Emulates ffmpeg.on("progress", cb) */
  on(event: "progress" | "log", cb: (...args: any[]) => void): void {
    if (event === "progress") {
      this._progressListeners.push(cb as ProgressCallback);
    } else if (event === "log") {
      this._logListeners.push(cb as LogCallback);
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
    const { writeFile, BaseDirectory } = await getFs();
    const td = await this.ensureReady();
    const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
    await writeFile(`${td}/${name}`, buf, { baseDir: BaseDirectory.AppCache });
  }

  /** Flags whose next argument is a file path (not a value) */
  private static FILE_FLAGS = new Set(["-i", "-y"]);

  async exec(args: string[]): Promise<void> {
    await this.ensureReady();
    const { Command } = await getShell();

    // Only resolve args that are clearly file paths:
    //   * the arg immediately after -i or -y (input / output files)
    //   * or any arg ending with a video/audio extension
    const EXT_RE = /\.(mp4|webm|mkv|mov|avi|gif|mp3|aac|wav|ogg|flac|jpg|jpeg|png|srt|ass|vtt)$/i;
    const fullArgs: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const prev = i > 0 ? args[i - 1] : "";
      if (
        NativeFFmpeg.FILE_FLAGS.has(prev) ||  // after -i, -y, etc.
        EXT_RE.test(a)                        // has a known extension
      ) {
        fullArgs.push(`${this.absTd}/${a}`);
      } else {
        fullArgs.push(a);
      }
    }

    const command = Command.sidecar(SIDECAR_NAME, fullArgs);

    // Execute and collect stderr
    const result = await command.execute();

    const stderr = (result.stderr || "") as string;
    if (stderr) {
      // Feed stderr to log listeners (for MediaInfoPanel etc.)
      stderr.split("\n").forEach((line) => {
        if (line) this._logListeners.forEach((cb) => cb(line));
      });
      // Parse progress from stderr
      const m = stderr.match(/time=(\d+):(\d+):(\d+)\.(\d+)/);
      if (m) {
        const secs = +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 100;
        this._progressListeners.forEach((cb) => cb(secs % 100));
      }
    }

    if (result.code !== 0) {
      const lines = stderr.trim().split("\n");
      const msg = lines[lines.length - 1] || `Exit code ${result.code}`;
      throw new Error(msg);
    }
  }

  async readFile(name: string): Promise<Uint8Array> {
    const { readFile, BaseDirectory } = await getFs();
    const td = await this.ensureReady();
    return await readFile(`${td}/${name}`, { baseDir: BaseDirectory.AppCache });
  }

  async terminate(): Promise<void> {
    if (!this.tempDir) return;
    try {
      const { remove, BaseDirectory } = await getFs();
      await remove(this.tempDir, { baseDir: BaseDirectory.AppCache, recursive: true });
    } catch { /* best effort */ }
    this.tempDir = null;
    this.absTd = "";
    this._ready = false;
    this._progressListeners = [];
    this._logListeners = [];
  }

  private async ensureReady(): Promise<string> {
    if (!this._ready) await this.load();
    return this.tempDir!;
  }
}
