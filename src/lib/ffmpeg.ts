import { FFmpeg } from "@ffmpeg/ffmpeg";

export type ProgressCallback = (progress: number) => void;
export type LogCallback = (message: string) => void;
export type LoadProgressCallback = (phase: string, percent: number) => void;

/**
 * Load ffmpeg-core using data URLs for the JS file.
 *
 * Why data URL: the ffmpeg worker first tries importScripts(url) which hangs on
 * blob URLs pointing to ES modules. A data URL makes importScripts fail
 * immediately (syntax error in classic-script context), which triggers the
 * fallback path: await import(url) — which works perfectly for data URLs.
 */
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

export async function createFFmpeg(
  onProgress?: ProgressCallback,
  onLog?: LogCallback,
  onLoadProgress?: LoadProgressCallback,
): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();

  ffmpeg.on("progress", ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(progress * 100, 99.9));
  });

  ffmpeg.on("log", ({ message }: { message: string }) => {
    onLog?.(message);
  });

  // ── Fetch JS → data URL (importScripts fails fast, import() works) ──
  onLoadProgress?.("Loading ffmpeg-core...", 20);

  const [jsResp, wasmResp] = await Promise.all([
    fetch("/ffmpeg/ffmpeg-core.js"),
    fetch("/ffmpeg/ffmpeg-core.wasm"),
  ]);

  if (!jsResp.ok) throw new Error(`Failed to load ffmpeg-core.js (${jsResp.status})`);
  if (!wasmResp.ok) throw new Error(`Failed to load ffmpeg-core.wasm (${wasmResp.status})`);

  const jsText = await jsResp.text();
  const wasmBytes = await wasmResp.arrayBuffer();

  const coreURL = `data:text/javascript;base64,${btoa(jsText)}`;
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
