import { useState, useCallback, useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { useFFmpeg } from "./hooks/useFFmpeg";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import DropZone from "./components/common/DropZone";
import OperationPanel from "./components/layout/OperationPanel";
import { useTranslation } from "./context/LanguageContext";

export type OperationId =
  | "gif" | "convert" | "compress" | "trim" | "resize"
  | "audio-extract" | "mute" | "speed" | "rotate" | "crop"
  | "thumbnail" | "reverse" | "fade" | "adjust" | "strip-meta"
  | "subtitles" | "volume" | "loop" | "overlay" | "mix-audio"
  | "concat" | "side-by-side" | "pip" | "mediainfo" | "raw";

export interface VideoFile {
  name: string;
  path: string;
  size: number;
  data: Uint8Array | null;
}

export const OPERATIONS: { id: OperationId; labelKey: string; icon: string }[] = [
  { id: "gif", labelKey: "op.gif", icon: "🎞️" },
  { id: "convert", labelKey: "op.convert", icon: "🔄" },
  { id: "compress", labelKey: "op.compress", icon: "📦" },
  { id: "trim", labelKey: "op.trim", icon: "✂️" },
  { id: "resize", labelKey: "op.resize", icon: "📐" },
  { id: "audio-extract", labelKey: "op.audio-extract", icon: "🎵" },
  { id: "mute", labelKey: "op.mute", icon: "🔇" },
  { id: "speed", labelKey: "op.speed", icon: "⚡" },
  { id: "rotate", labelKey: "op.rotate", icon: "🔄" },
  { id: "crop", labelKey: "op.crop", icon: "✂️" },
  { id: "thumbnail", labelKey: "op.thumbnail", icon: "🖼️" },
  { id: "reverse", labelKey: "op.reverse", icon: "⏪" },
  { id: "fade", labelKey: "op.fade", icon: "🌅" },
  { id: "adjust", labelKey: "op.adjust", icon: "🎨" },
  { id: "strip-meta", labelKey: "op.strip-meta", icon: "🏷️" },
  { id: "subtitles", labelKey: "op.subtitles", icon: "📝" },
  { id: "volume", labelKey: "op.volume", icon: "🔊" },
  { id: "loop", labelKey: "op.loop", icon: "🔁" },
  { id: "overlay", labelKey: "op.overlay", icon: "🖼️" },
  { id: "mix-audio", labelKey: "op.mix-audio", icon: "🎚️" },
  { id: "concat", labelKey: "op.concat", icon: "🔗" },
  { id: "side-by-side", labelKey: "op.side-by-side", icon: "📺" },
  { id: "pip", labelKey: "op.pip", icon: "🖥️" },
  { id: "mediainfo", labelKey: "op.mediainfo", icon: "ℹ️" },
  { id: "raw", labelKey: "op.raw", icon: "⌨️" },
];

/** Load a file from user's filesystem using Tauri dialog or browser file input. */
async function pickAndReadFile(): Promise<VideoFile | null> {
  // Try Tauri native dialog first
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

  // Browser fallback: hidden file input
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
  const [activeOperation, setActiveOperation] = useState<OperationId>("gif");
  const ff = useFFmpeg();

  useEffect(() => { ff.init(); }, []);

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
              />
            </main>
          </div>
        </div>
      )}
    </LanguageProvider>
  );
}

function LandingPage({ onFileSelected }: { onFileSelected: (f: VideoFile) => void }) {
  const { t } = useTranslation();
  const ff = useFFmpeg();

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <header className="flex items-center justify-center px-6 py-8 shrink-0">
        <span className="text-3xl mr-3">🎬</span>
        <h1 className="text-2xl font-bold text-white">TRANSVD</h1>
        <span className="text-sm text-gray-400 ml-3">{t("app.subtitle")}</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-lg">
          <DropZone onFileSelected={onFileSelected} />
          <div className="mt-4 flex justify-center">
            {ff.loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full" />
                {ff.loadPhase} {Math.round(ff.loadPercent)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
