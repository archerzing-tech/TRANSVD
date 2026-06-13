import { useState, useCallback, useRef, useEffect } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { createFFmpeg } from "../lib/ffmpeg";

// ── Module-level singleton ─────────────────────────────────────
let globalInstance: FFmpeg | null = null;
let globalLoadPromise: Promise<void> | null = null;
let globalLoaded = false;
let globalLoading = false;
let globalError: string | null = null;
let globalLoadPhase = "";
let globalLoadPercent = 0;

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function notify() { listeners.forEach((fn) => fn()); }

async function ensureGlobalFFmpeg(
  onProgress?: (p: number) => void,
  onLog?: (msg: string) => void,
): Promise<FFmpeg> {
  if (globalInstance) return globalInstance;
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
        onProgress,
        onLog,
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
    } finally {
      globalLoading = false;
      globalLoadPromise = null;
      notify();
    }
  })();

  await globalLoadPromise;
  return globalInstance!;
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
  init: () => Promise<void>;
  run: (action: (ff: FFmpeg) => Promise<void>) => Promise<void>;
  cancel: () => void;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [, forceUpdate] = useState(0);
  const runningRef = useRef(false);

  useEffect(() => {
    const unsub = subscribe(() => forceUpdate((t) => t + 1));
    return unsub;
  }, []);

  const init = useCallback(async () => {
    if (globalLoaded) return;
    if (globalLoading && globalLoadPromise) {
      await globalLoadPromise;
      return;
    }
    try {
      await ensureGlobalFFmpeg(
        (p) => setProgress(p),
        (msg) => setLog((prev) => [...prev, msg]),
      );
    } catch {}
  }, []);

  const run = useCallback(async (action: (ff: FFmpeg) => Promise<void>) => {
    if (!globalInstance) {
      try {
        await ensureGlobalFFmpeg(
          (p) => setProgress(p),
          (msg) => setLog((prev) => [...prev, msg]),
        );
      } catch {}
    }
    const ff = globalInstance;
    if (!ff) return;
    if (runningRef.current) return;
    runningRef.current = true;
    setProgress(0);
    setLog([]);
    try {
      await action(ff);
      setProgress(100);
    } catch (err: any) {
      setLog((prev) => [...prev, `Error: ${err.message}`]);
    } finally {
      runningRef.current = false;
    }
  }, []);

  const cancel = useCallback(() => {
    if (globalInstance) {
      try { globalInstance.terminate(); } catch {}
      globalInstance = null;
    }
    globalLoaded = false;
    setProgress(0);
    notify();
  }, []);

  return {
    loaded: globalLoaded,
    loading: globalLoading,
    error: globalError,
    loadPhase: globalLoadPhase,
    loadPercent: globalLoadPercent,
    ready: globalLoaded && !globalLoading,
    progress,
    log,
    init,
    run,
    cancel,
  };
}
