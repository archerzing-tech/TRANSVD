import { FFmpeg } from "@ffmpeg/ffmpeg";

export type ProgressCallback = (progress: number) => void;
export type LogCallback = (message: string) => void;
export type LoadProgressCallback = (phase: string, percent: number) => void;

/**
 * Global live callbacks — updated by the currently active panel.
 * The ffmpeg event handlers read these instead of captured closures,
 * so switching panels never loses progress/log events.
 */
export let globalProgressCallback: ProgressCallback | null = null;
export let globalLogCallback: LogCallback | null = null;

export function setGlobalProgressCallback(cb: ProgressCallback | null) {
  globalProgressCallback = cb;
}
export function setGlobalLogCallback(cb: LogCallback | null) {
  globalLogCallback = cb;
}

// ── Cached WASM payload ────────────────────────────────────────
// Stored as Uint8Array (non-transferable) to avoid detachment issues.
let cachedCoreJS: string | null = null;
let cachedCoreWasm: Uint8Array | null = null;

async function ensureCachedPayload(onLoadProgress?: LoadProgressCallback) {
  if (cachedCoreJS && cachedCoreWasm) return;
  onLoadProgress?.("Loading ffmpeg-core...", 20);
  const [jsResp, wasmResp] = await Promise.all([
    fetch("/ffmpeg/ffmpeg-core.js"),
    fetch("/ffmpeg/ffmpeg-core.wasm"),
  ]);
  if (!jsResp.ok) throw new Error(`Failed to load ffmpeg-core.js (${jsResp.status})`);
  if (!wasmResp.ok) throw new Error(`Failed to load ffmpeg-core.wasm (${wasmResp.status})`);
  cachedCoreJS = await jsResp.text();
  // Store as Uint8Array — ArrayBuffer can be silently detached in some runtimes
  cachedCoreWasm = new Uint8Array(await wasmResp.arrayBuffer());
}

async function loadWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  context: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${context} timed out after ${ms / 1000}s`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Create a fresh ffmpeg instance.
 * Caches the ~31 MB WASM payload so subsequent calls skip the network.
 *
 * ⚠️ Each call creates a new Worker and new WASM memory.
 *    The previous instance MUST be terminated before calling this again.
 */
export async function createFFmpeg(
  onLoadProgress?: LoadProgressCallback,
): Promise<FFmpeg> {
  await ensureCachedPayload(onLoadProgress);

  const ffmpeg = new FFmpeg();

  // Event handlers read the live global callbacks (updated per-panel)
  ffmpeg.on("progress", ({ progress }: { progress: number }) => {
    globalProgressCallback?.(Math.min(progress * 100, 99.9));
  });
  ffmpeg.on("log", ({ message }: { message: string }) => {
    globalLogCallback?.(message);
  });

  // Core URL as data URL (no transferables involved)
  const coreURL = `data:text/javascript;base64,${btoa(cachedCoreJS!)}`;

  // WASM: create a fresh blob from a COPY of the cached bytes.
  // We use .slice() to get a new Uint8Array so the cached copy is never touched.
  const wasmBytes = cachedCoreWasm!.slice(0);
  const wasmBlob = new Blob([wasmBytes], { type: "application/wasm" });
  const wasmURL = URL.createObjectURL(wasmBlob);

  onLoadProgress?.("Initializing WebAssembly...", 50);

  await loadWithTimeout(
    ffmpeg.load({ coreURL, wasmURL }),
    120_000,
    "ffmpeg WASM loading",
  );

  URL.revokeObjectURL(wasmURL);
  onLoadProgress?.("Ready", 100);
  return ffmpeg;
}
