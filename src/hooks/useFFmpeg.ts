import { useState, useCallback, useRef, useEffect } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { createFFmpeg, setGlobalProgressCallback, setGlobalLogCallback } from "../lib/ffmpeg";

// ── Module-level singleton (recreated per operation) ───────────
let globalInstance: FFmpeg | null = null;
let globalLoadPromise: Promise<void> | null = null;
let globalLoaded = false;
let globalLoading = false;
let globalError: string | null = null;
let globalLoadPhase = "";
let globalLoadPercent = 0;
let globalRunning = false;
let globalCancelling = false;

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function notify() { listeners.forEach((fn) => fn()); }

/**
 * Ensure ffmpeg is loaded, creating a fresh instance if needed.
 * After each operation the instance is terminated (see `run()` finally),
 * so this always creates a new WASM context.
 */
async function ensureGlobalFFmpeg(): Promise<FFmpeg> {
  if (globalInstance && globalLoaded) return globalInstance;
  if (globalLoadPromise) {
    await globalLoadPromise;
    return globalInstance!;
  }

  globalLoading = true;
  globalLoadPhase = "Loading ffmpeg-core...";
  globalLoadPercent = 0;
  notify();

  globalLoadPromise = (async () => {
    try {
      globalInstance = await createFFmpeg(
        (phase, pct) => {
          globalLoadPhase = phase;
          globalLoadPercent = pct;
          notify();
        },
      );
      globalLoaded = true;
      globalError = null;
    } catch (err: any) {
      globalError = err.message || "Failed to load FFmpeg";
      globalInstance = null;
      globalLoaded = false;
    } finally {
      globalLoading = false;
      globalLoadPromise = null;
      notify();
    }
  })();

  await globalLoadPromise;
  return globalInstance!;
}

/** Terminate the current ffmpeg instance so a fresh one is created next time. */
function terminateGlobalInstance() {
  if (globalInstance) {
    try { globalInstance.terminate(); } catch {}
    globalInstance = null;
  }
  globalLoaded = false;
  globalError = null;
}

// ── Hook ────────────────────────────────────────────────────────

export interface FFmpegState {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  loadPhase: string;
  loadPercent: number;
  ready: boolean;
}

export interface UseFFmpegReturn extends FFmpegState {
  progress: number;
  log: string[];
  cancelling: boolean;
  init: () => Promise<void>;
  run: (action: (ff: FFmpeg) => Promise<void>) => Promise<void>;
  cancel: () => void;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [opError, setOpError] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);
  const runningRef = useRef(false);
  const callbacksReady = useRef(false);

  useEffect(() => {
    // Register this component's callbacks
    setGlobalProgressCallback((p: number) => setProgress(p));
    setGlobalLogCallback((msg: string) => setLog((prev) => [...prev, msg]));
    callbacksReady.current = true;

    const unsub = subscribe(() => forceUpdate((t) => t + 1));
    return () => {
      unsub();
      callbacksReady.current = false;
    };
  }, []);

  const init = useCallback(async () => {
    if (globalLoaded && globalInstance) return;
    try {
      await ensureGlobalFFmpeg();
    } catch {}
  }, []);

  const run = useCallback(async (action: (ff: FFmpeg) => Promise<void>) => {
    // Guard: prevent concurrent operations
    if (globalRunning) {
      setOpError("Another operation is still running");
      return;
    }
    if (runningRef.current) return;

    // Ensure callbacks point here
    setGlobalProgressCallback((p: number) => setProgress(p));
    setGlobalLogCallback((msg: string) => setLog((prev) => [...prev, msg]));
    callbacksReady.current = true;

    // 🔑 Kill any stale instance BEFORE creating a fresh one.
    // This avoids sharing corrupted WASM memory between operations.
    terminateGlobalInstance();

    // Load a brand new ffmpeg instance
    setOpError(null);
    try {
      await ensureGlobalFFmpeg();
    } catch {}
    const ff = globalInstance;
    if (!ff) {
      setOpError(globalError || "FFmpeg failed to load");
      return;
    }

    globalCancelling = false;
    globalRunning = true;
    runningRef.current = true;
    setProgress(0);
    setLog([]);

    try {
      await action(ff);
      setProgress(100);
    } catch (err: any) {
      if (!globalCancelling) {
        const msg = err.message || String(err);
        setLog((prev) => [...prev, `Error: ${msg}`]);
        setOpError(msg);
        notify();
      }
    } finally {
      terminateGlobalInstance();
      globalCancelling = false;
      globalRunning = false;
      runningRef.current = false;
      notify();
    }
  }, []);

  const cancel = useCallback(() => {
    globalCancelling = true;
    notify();
    terminateGlobalInstance();
    setProgress(0);
    notify();
  }, []);

  return {
    loaded: globalLoaded,
    loading: globalLoading,
    error: globalError || opError,
    loadPhase: globalLoadPhase,
    loadPercent: globalLoadPercent,
    ready: globalLoaded && !globalLoading,
    progress,
    log,
    cancelling: globalCancelling,
    init,
    run,
    cancel,
  };
}
