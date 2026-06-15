import { useState, useCallback, useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { useFFmpeg } from "./hooks/useFFmpeg";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import DropZone from "./components/common/DropZone";
import OperationPanel from "./components/layout/OperationPanel";
import { useTranslation } from "./context/LanguageContext";
import { IconFilm, IconLoading } from "./lib/icons";
import type { OperationId, VideoFile } from "./types";

export type { OperationId, VideoFile } from "./types";
export { OPERATIONS } from "./types";

async function pickAndReadFile(): Promise<VideoFile | null> {
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { readFile } = await import("@tauri-apps/plugin-fs");
    const selected = await open({
      multiple: false,
      filters: [
        { name: "Video Files", extensions: ["mp4", "webm", "mkv", "mov", "avi", "gif", "ts", "mts", "m2ts"] },
        { name: "Audio Files", extensions: ["mp3", "aac", "wav", "ogg", "flac"] },
      ],
    });
    if (!selected) return null;
    const path = selected as string;
    const name = path.split(/[/\\]/).pop() || path;
    const data = await readFile(path);
    return { name, path, size: data.length, data };
  } catch {
    // Not in Tauri – use browser file input
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*,audio/*,.mp4,.webm,.mkv,.mov,.avi,.gif,.ts,.mts,.m2ts,.mp3,.aac,.wav,.ogg,.flac";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const buf = await file.arrayBuffer();
      resolve({ name: file.name, path: file.name, size: file.size, data: new Uint8Array(buf) });
    };
    input.click();
  });
}

export default function App() {
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [activeOperation, setActiveOperation] = useState<OperationId | null>(null);    const { init } = useFFmpeg();

  useEffect(() => { init(); }, [init]);

  const handleFileSelected = useCallback((file: VideoFile) => {
    setVideo(file);
  }, []);

  const handleOpenFile = useCallback(async () => {
    const file = await pickAndReadFile();
    if (file) setVideo(file);
  }, []);

  const handleHome = useCallback(() => {
    setVideo(null);
  }, []);

  return (
    <LanguageProvider>
      {!video ? <LandingPage onFileSelected={handleFileSelected} /> : (
        <div className="h-full flex flex-col">
          <Header onHome={handleHome} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              activeOperation={activeOperation}
              onSelect={setActiveOperation}
            />
            <main className="flex-1 overflow-y-auto p-6">
              <OperationPanel
                operation={activeOperation}
                video={video}
                onOpenFile={handleOpenFile}
                onSelectOperation={setActiveOperation}
              />
            </main>
          </div>
        </div>
      )}
    </LanguageProvider>
  );
}

// ── Operation categories for the showcase ──

interface OpCategory {
  title: string;
  subtitle: string;
  ops: { id: OperationId; label: string }[];
}

function useOperationCategories(): OpCategory[] {
  const { t } = useTranslation();
  return [
    {
      title: "🎬 Convert & Compress",
      subtitle: "Change formats, reduce file size",
      ops: [
        { id: "gif", label: t("op.gif") },
        { id: "convert", label: t("op.convert") },
        { id: "compress", label: t("op.compress") },
      ],
    },
    {
      title: "✂️ Trim & Transform",
      subtitle: "Cut, crop, rotate, resize, speed up",
      ops: [
        { id: "trim", label: t("op.trim") },
        { id: "crop", label: t("op.crop") },
        { id: "rotate", label: t("op.rotate") },
        { id: "resize", label: t("op.resize") },
        { id: "speed", label: t("op.speed") },
        { id: "reverse", label: t("op.reverse") },
      ],
    },
    {
      title: "🔊 Audio & Effects",
      subtitle: "Extract audio, adjust volume, add fades",
      ops: [
        { id: "audio-extract", label: t("op.audio-extract") },
        { id: "mute", label: t("op.mute") },
        { id: "volume", label: t("op.volume") },
        { id: "fade", label: t("op.fade") },
        { id: "adjust", label: t("op.adjust") },
      ],
    },
    {
      title: "🔄 Advanced",
      subtitle: "Overlay, concatenate, PiP, subtitles, and more",
      ops: [
        { id: "overlay", label: t("op.overlay") },
        { id: "concat", label: t("op.concat") },
        { id: "pip", label: t("op.pip") },
        { id: "subtitles", label: t("op.subtitles") },
        { id: "side-by-side", label: t("op.side-by-side") },
        { id: "mix-audio", label: t("op.mix-audio") },
      ],
    },
  ];
}

function LandingPage({ onFileSelected }: { onFileSelected: (f: VideoFile) => void }) {
  const { t } = useTranslation();
  const { loading, loadPhase, loadPercent, ready } = useFFmpeg();
  const categories = useOperationCategories();

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-surface-900 via-surface-950 to-surface-950 selection:bg-brand-500/30 overflow-y-auto">
      {/* Ambient top gloss */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-brand-500/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/10 to-transparent" />

      {/* Header */}
      <header className="relative flex items-center justify-center px-6 pt-8 pb-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <IconFilm size={22} className="text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-50 tracking-tight">TRANSVD</h1>
            <p className="text-xs text-surface-500 font-medium tracking-wider uppercase">
              {t("app.subtitle")}
            </p>
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center px-6 pb-8">
        {/* Tagline */}
        <p className="relative text-sm text-surface-500 mb-6 text-center max-w-md">
          Drop a video, do almost anything.
          <br />
          <span className="text-surface-600 text-xs">No uploads. No waiting. All in your machine.</span>
        </p>

        {/* Drop Zone — centered & prominent */}
        <div className="w-full max-w-lg animate-fade-in">
          <DropZone onFileSelected={onFileSelected} />

          {/* FFmpeg status */}
          <div className="mt-4 flex justify-center">
            {loading && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-surface-850 border border-surface-800">
                <IconLoading size={14} className="text-brand-500 animate-spin-slow" />
                <span className="text-sm text-surface-500">
                  <span className="text-brand-400">{loadPhase}</span>
                  {" "}{Math.round(loadPercent)}%
                </span>
              </div>
            )}
            {ready && (
              <div className="text-xs text-surface-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                ffmpeg ready
              </div>
            )}
          </div>
        </div>

        {/* Capability showcase cards */}
        <div className="w-full max-w-4xl mt-10 animate-slide-up">
          <div className="text-center mb-6">
            <p className="text-xs text-surface-600 font-medium tracking-widest uppercase">What you can do</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="group bg-surface-850/60 border border-surface-800/50 rounded-xl p-4
                           hover:bg-surface-850 hover:border-surface-700/60 transition-all duration-200"
              >
                <p className="text-xs font-semibold text-surface-300 mb-1">{cat.title}</p>
                <p className="text-[10px] text-surface-600 mb-3 leading-relaxed">{cat.subtitle}</p>
                <ul className="space-y-1">
                  {cat.ops.slice(0, 4).map((op) => (
                    <li key={op.id} className="text-[11px] text-surface-500 group-hover:text-surface-400 transition-colors flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-surface-700 group-hover:bg-brand-500/50 transition-colors" />
                      {op.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-surface-700 flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            All processing happens locally · No data ever leaves your device
          </p>
        </div>
      </div>
    </div>
  );
}
