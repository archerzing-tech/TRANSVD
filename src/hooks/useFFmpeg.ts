import { useState, useCallback, useRef, useEffect } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { createFFmpeg, setGlobalProgressCallback, setGlobalLogCallback } from "../lib/ffmpeg";
import { NativeFFmpeg, isTauriContext } from "../lib/native-ffmpeg";

// ── Module-level state ──────────────────────────────────────────
// Used only for the WASM fallback path.
let globalInstance: FFmpeg | null = null;
let globalLoadPromise: Promise<void> | null = null;
let globalLoaded = false;
let globalLoading = false;
let globalError: string | null = null;
let globalLoadPhase = "";
let globalLoadPercent = 0;
let globalRunning = false;
let globalCancelling = false;
let globalUseNative = false; // cached after first check

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function notify() { listeners.forEach((fn) => fn()); }

// ── WASM path (keep for browser dev) ────────────────────────────

async function loadWasmFFmpeg(): Promise<FFmpeg> {
  if (globalInstance && globalLoaded) return globalInstance;
  if (globalLoadPromise) { await globalLoadPromise; return globalInstance!; }

  globalLoading = true;
  globalLoadPhase = "Loading ffmpeg-core...";
  globalLoadPercent = 0;
  notify();

  globalLoadPromise = (async () => {
    try {
      globalInstance = await createFFmpeg((phase, pct) => {
        globalLoadPhase = phase; globalLoadPercent = pct; notify();
      });
      globalLoaded = true; globalError = null;
    } catch (err: any) {
      globalError = err.message || "Failed to load FFmpeg";
      globalInstance = null; globalLoaded = false;
    } finally {
      globalLoading = false; globalLoadPromise = null; notify();
    }
  })();
  await globalLoadPromise;
  return globalInstance!;
}

function terminateWasmInstance() {
  if (globalInstance) { try { globalInstance.terminate(); } catch {} globalInstance = null; }
  globalLoaded = false; globalError = null;
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

  // Auto-detect Tauri context once
  useEffect(() => {
    isTauriContext().then((yes) => {
      globalUseNative = yes;
      if (yes) {
        // Mark as ready immediately — no WASM to load
        globalLoaded = true;
        globalLoading = false;
        notify();
      }
    });
  }, []);

  useEffect(() => {
    setGlobalProgressCallback((p: number) => setProgress(p));
    setGlobalLogCallback((msg: string) => setLog((prev) => [...prev, msg]));
    const unsub = subscribe(() => forceUpdate((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const init = useCallback(async () => {
    if (globalUseNative) return; // native path: nothing to init
    if (globalLoaded && globalInstance) return;
    try { await loadWasmFFmpeg(); } catch {}
  }, []);

  const run = useCallback(async (action: (ff: FFmpeg) => Promise<void>) => {
    if (globalRunning) { setOpError("Another operation is still running"); return; }
    if (runningRef.current) return;

    setGlobalProgressCallback((p: number) => setProgress(p));
    setGlobalLogCallback((msg: string) => setLog((prev) => [...prev, msg]));

    globalCancelling = false;
    globalRunning = true;
    runningRef.current = true;
    setOpError(null);
    setProgress(0);
    setLog([]);

    try {
      if (globalUseNative) {
        // ── Native path: fresh NativeFFmpeg per operation ──
        const nff = new NativeFFmpeg();
        // Cast to FFmpeg — compatible interface
        await action(nff as unknown as FFmpeg);
        await nff.terminate();
      } else {
        // ── WASM fallback path ──
        await loadWasmFFmpeg();
        const ff = globalInstance;
        if (!ff) { setOpError(globalError || "FFmpeg failed to load"); return; }
        await action(ff);
      }
      setProgress(100);
    } catch (err: any) {
      if (!globalCancelling) {
        const msg = err.message || String(err);
        setLog((prev) => [...prev, `Error: ${msg}`]);
        setOpError(msg);
        notify();
      }
    } finally {
      if (!globalUseNative) terminateWasmInstance();
      globalCancelling = false;
      globalRunning = false;
      runningRef.current = false;
      notify();
    }
  }, []);

  const cancel = useCallback(() => {
    globalCancelling = true; notify();
    if (globalUseNative) {
      // Native cancellation is handled by the next operation creating a fresh instance
    } else {
      terminateWasmInstance();
    }
    setProgress(0); notify();
  }, []);

  const loading = globalUseNative ? false : globalLoading;
  const loaded = globalUseNative ? true : globalLoaded;
  const ready = globalUseNative ? true : (globalLoaded && !globalLoading);

  return {
    loaded,
    loading,
    error: globalError || opError,
    loadPhase: globalUseNative ? "Native" : globalLoadPhase,
    loadPercent: globalUseNative ? 100 : globalLoadPercent,
    ready,
    progress,
    log,
    cancelling: globalCancelling,
    init,
    run,
    cancel,
  };
}
