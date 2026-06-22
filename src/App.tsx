import { useState, useCallback, useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useFFmpeg, setNativeInputInfo } from "./hooks/useFFmpeg";
import { useIsMobile } from "./hooks/useIsMobile";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";
import DropZone from "./components/common/DropZone";
import OperationPanel from "./components/layout/OperationPanel";
import ThemeSwitcher from "./components/common/ThemeSwitcher";
import LanguageSwitcher from "./components/common/LanguageSwitcher";
import SettingsDrawer from "./components/common/SettingsDrawer";
import { useTranslation } from "./context/LanguageContext";
import { OPERATIONS, type OperationId, type VideoFile } from "./types";
import { OPERATION_ICONS, IconFilm, IconLoading } from "./lib/icons";

export type { OperationId, VideoFile } from "./types";
export { OPERATIONS } from "./types";

async function pickAndReadFile(): Promise<VideoFile | null> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const fileInfo = await invoke<{ name: string; path: string; size: number } | null>("pick_video_file");
    if (!fileInfo) return null;
    const { readFile } = await import("@tauri-apps/plugin-fs");
    const data = await readFile(fileInfo.path);
    return { name: fileInfo.name, path: fileInfo.path, size: fileInfo.size, data };
  } catch (err) {
    console.warn("Tauri file read failed, falling back to browser input:", err);
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*,audio/*,.mp4,.webm,.mkv,.mov,.avi,.gif,.ts,.mts,.m2ts,.m3u8,.mp3,.aac,.wav,.ogg,.flac";
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
  const [activeOperation, setActiveOperation] = useState<OperationId | null>(null);
  const [showOpPicker, setShowOpPicker] = useState(false);
  const { init } = useFFmpeg();
  const isMobile = useIsMobile();

  useEffect(() => { init(); }, [init]);

  const handleFileSelected = useCallback((file: VideoFile) => {
    setVideo(file);
    setActiveOperation(null);
    setShowOpPicker(true);
    const ext = file.name.match(/\.[^.]+$/)?.[0] || "";
    if (ext.toLowerCase() === ".m3u8") {
      setNativeInputInfo(file.path, "input" + ext);
    } else {
      setNativeInputInfo(null, null);
    }
  }, []);

  const handleOpenFile = useCallback(async () => {
    const file = await pickAndReadFile();
    if (file) {
      setVideo(file);
      setActiveOperation(null);
      setShowOpPicker(true);
      const ext = file.name.match(/\.[^.]+$/)?.[0] || "";
      if (ext.toLowerCase() === ".m3u8") {
        setNativeInputInfo(file.path, "input" + ext);
      } else {
        setNativeInputInfo(null, null);
      }
    }
  }, []);

  const handleHome = useCallback(() => {
    setVideo(null);
    setActiveOperation(null);
    setShowOpPicker(false);
    setNativeInputInfo(null, null);
  }, []);

  const handleSelectOp = useCallback((id: OperationId) => {
    setActiveOperation(id);
    setShowOpPicker(false);
  }, []);

  if (!video) {
    return (
      <ThemeProvider>
      <LanguageProvider>
        <LandingPage onFileSelected={handleFileSelected} />
      </LanguageProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
    <LanguageProvider>
      <div className="h-full flex flex-col bg-surface-950">
        {isMobile ? (
          /* ═══ MOBILE LAYOUT ═══
             Top: scrollable content (card grid or operation panel)
             Bottom: nav bar (Home + shortcuts + settings) */
          <MobileLayout
            video={video}
            activeOperation={activeOperation}
            showOpPicker={showOpPicker}
            onSelectOp={handleSelectOp}
            onOpenFile={handleOpenFile}
            onBack={() => { setActiveOperation(null); setShowOpPicker(true); }}
            onHome={handleHome}
          />
        ) : (
          /* ═══ DESKTOP LAYOUT ═══
             Top: minimal header with file info
             Middle: sidebar (left) + operation panel (right) */
          <DesktopLayout
            video={video}
            activeOperation={activeOperation}
            onSelectOp={handleSelectOp}
            onOpenFile={handleOpenFile}
            onHome={handleHome}
          />
        )}
      </div>
    </LanguageProvider>
    </ThemeProvider>
  );
}

// ── Desktop Layout ──

function DesktopLayout({
  video,
  activeOperation,
  onSelectOp,
  onOpenFile,
  onHome,
}: {
  video: VideoFile;
  activeOperation: OperationId | null;
  onSelectOp: (id: OperationId) => void;
  onOpenFile: () => void;
  onHome: () => void;
}) {
  return (
    <>
      <Header onHome={onHome} video={video} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeOperation={activeOperation} onSelect={onSelectOp} />
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <OperationPanel
            operation={activeOperation}
            video={video}
            onOpenFile={onOpenFile}
            onSelectOperation={onSelectOp}
          />
        </main>
      </div>
    </>
  );
}

// ── Mobile Layout ──

function MobileLayout({
  video,
  activeOperation,
  showOpPicker,
  onSelectOp,
  onOpenFile,
  onBack,
  onHome,
}: {
  video: VideoFile;
  activeOperation: OperationId | null;
  showOpPicker: boolean;
  onSelectOp: (id: OperationId) => void;
  onOpenFile: () => void;
  onBack: () => void;
  onHome: () => void;
}) {
  return (
    <>
      {/* No header bar — just safe-area-top padding to avoid status bar overlap */}
      <div className="flex-1 overflow-y-auto safe-area-top">
        {!activeOperation || showOpPicker ? (
          <MobileOperationCards
            video={video}
            onSelect={onSelectOp}
            onOpenFile={onOpenFile}
          />
        ) : (
          <MobileOperationView
            operation={activeOperation}
            video={video}
            onBack={onBack}
            onOpenFile={onOpenFile}
          />
        )}
      </div>
      <BottomNav
        activeOperation={activeOperation}
        onSelect={onSelectOp}
        onHome={onHome}
        videoLoaded={true}
      />
    </>
  );
}

// ── Mobile: Full-screen operation view ──

function MobileOperationView({
  operation,
  video,
  onBack,
  onOpenFile,
}: {
  operation: OperationId;
  video: VideoFile;
  onBack: () => void;
  onOpenFile: () => void;
}) {
  const { t } = useTranslation();
  const OpIcon = OPERATION_ICONS[operation];

  return (
    <div className="flex-1 flex flex-col bg-surface-950">
      {/* Minimal back bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-800/50 bg-surface-900/95 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-all duration-150 cursor-pointer active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-xs font-medium">{t("nav.back")}</span>
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            {OpIcon ? <OpIcon size={16} className="text-brand-500" /> : <IconFilm size={16} className="text-brand-500" />}
          </div>
          <span className="text-sm font-semibold text-surface-50 truncate">{t(`op.${operation}`)}</span>
        </div>
      </div>

      {/* Scrollable content with bottom padding for BottomNav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 pb-20">
        <OperationPanel
          operation={operation}
          video={video}
          onOpenFile={onOpenFile}
          onSelectOperation={() => {}}
        />
      </div>
    </div>
  );
}

// ── Mobile: Card-based operation grid ──

const OP_CATEGORIES: {
  title: string;
  color: string;
  subtitle: string;
  ids: OperationId[];
  cardBg: string;
  hoverRing: string;
  iconHover: string;
  iconHoverColor: string;
}[] = [
  {
    title: "Convert & Compress",
    color: "from-brand-500/20 to-brand-600/10",
    subtitle: "GIF, format, compress",
    ids: ["gif", "convert", "compress"],
    cardBg: "bg-surface-850/80",
    hoverRing: "hover:ring-1 hover:ring-brand-500/20 hover:shadow-lg hover:shadow-brand-500/5",
    iconHover: "group-hover:bg-brand-500/10 group-hover:border-brand-500/20",
    iconHoverColor: "group-hover:text-brand-400",
  },
  {
    title: "Trim & Transform",
    color: "from-brand-500/20 to-brand-600/10",
    subtitle: "Cut, crop, rotate, speed",
    ids: ["trim", "crop", "rotate", "resize", "speed", "reverse"],
    cardBg: "bg-surface-850/80",
    hoverRing: "hover:ring-1 hover:ring-brand-500/20 hover:shadow-lg hover:shadow-brand-500/5",
    iconHover: "group-hover:bg-brand-500/10 group-hover:border-brand-500/20",
    iconHoverColor: "group-hover:text-brand-400",
  },
  {
    title: "Audio & Effects",
    color: "from-brand-500/20 to-brand-600/10",
    subtitle: "Volume, fade, adjust",
    ids: ["audio-extract", "mute", "volume", "fade", "adjust"],
    cardBg: "bg-surface-850/80",
    hoverRing: "hover:ring-1 hover:ring-brand-500/20 hover:shadow-lg hover:shadow-brand-500/5",
    iconHover: "group-hover:bg-brand-500/10 group-hover:border-brand-500/20",
    iconHoverColor: "group-hover:text-brand-400",
  },
  {
    title: "Advanced",
    color: "from-brand-500/20 to-brand-600/10",
    subtitle: "Overlay, concat, PiP...",
    ids: ["overlay", "concat", "pip", "subtitles", "side-by-side", "mix-audio", "loop", "strip-meta", "mediainfo", "thumbnail", "raw"],
    cardBg: "bg-surface-850/80",
    hoverRing: "hover:ring-1 hover:ring-brand-500/20 hover:shadow-lg hover:shadow-brand-500/5",
    iconHover: "group-hover:bg-brand-500/10 group-hover:border-brand-500/20",
    iconHoverColor: "group-hover:text-brand-400",
  },
];

function MobileOperationCards({
  video,
  onSelect,
  onOpenFile,
}: {
  video: VideoFile;
  onSelect: (id: OperationId) => void;
  onOpenFile: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="px-4 pt-4 pb-20">
      {/* File info bar */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-surface-850 border border-surface-800/50">
        <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
          <IconFilm size={18} className="text-brand-500" />
        </div>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-sm font-medium text-surface-200 truncate max-w-full">{video.name}</p>
          <p className="text-xs text-surface-500">{(video.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
        <button onClick={onOpenFile} className="btn-secondary btn-sm shrink-0 text-xs cursor-pointer">
          {t("op.open_new")}
        </button>
      </div>

      <h2 className="text-base font-bold text-surface-50 text-center mb-1">{t("app.choose_operation")}</h2>

      <div className="space-y-4 mt-4">
        {OP_CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-0.5 rounded-full bg-brand-500/40" />
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{cat.title}</h3>
              <span className="text-[10px] text-surface-600 ml-auto">{cat.subtitle}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {cat.ids.map((id) => {
                const op = OPERATIONS.find((o) => o.id === id);
                if (!op) return null;
                const Icon = OPERATION_ICONS[id];
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-150 cursor-pointer group
                               border-surface-800/40
                               hover:scale-[1.02] active:scale-[0.97]
                               ${cat.cardBg} ${cat.hoverRing}`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-surface-800/80 border border-surface-700/50 flex items-center justify-center transition-all duration-150 ${cat.iconHover}`}>
                      {Icon && <Icon size={20} className={`text-surface-500 transition-colors duration-150 ${cat.iconHoverColor}`} />}
                    </div>
                    <span className={`text-xs font-medium text-surface-400 text-center leading-tight transition-colors duration-150 ${cat.iconHoverColor} line-clamp-2 break-words`}>
                      {t(op.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Landing page (shared, mobile-optimized) ──

function LandingPage({ onFileSelected }: { onFileSelected: (f: VideoFile) => void }) {
  const { t } = useTranslation();
  const { loading, loadPhase, loadPercent, ready } = useFFmpeg();
  const isMobile = useIsMobile();
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-surface-950 overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <IconFilm size={20} className="text-brand-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-50 tracking-tight">{t("app.title")}</h1>
            <p className="text-[10px] text-surface-500 font-medium tracking-wider uppercase">{t("app.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isMobile ? (
            <>
              <button
                onClick={() => setMobileSettingsOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-800/60 transition-all duration-150 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <SettingsDrawer open={mobileSettingsOpen} onClose={() => setMobileSettingsOpen(false)} />
            </>
          ) : (
            <>
              <ThemeSwitcher />
              <LanguageSwitcher />
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-4 pb-6">
        <p className="text-xs text-surface-500 mb-5 text-center max-w-xs mx-auto leading-relaxed">
          {t("app.tagline")}
        </p>

        <div className="animate-fade-in">
          <DropZone onFileSelected={onFileSelected} />

          <div className="mt-3 flex justify-center">
            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-850 border border-surface-800">
                <IconLoading size={12} className="text-brand-500 animate-spin-slow" />
                <span className="text-xs text-surface-500">
                  <span className="text-brand-400">{loadPhase}</span> {Math.round(loadPercent)}%
                </span>
              </div>
            )}
            {ready && (
              <div className="text-[11px] text-surface-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-green-dot opacity-70" />
                ffmpeg ready
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <p className="text-[10px] text-surface-600 font-medium tracking-widest uppercase text-center mb-3">{t("app.quick_actions")}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {OP_CATEGORIES.slice(0, 4).map((cat) => (
              <div key={cat.title} className="card-hover !p-3">
                <div className="h-0.5 -mx-3 -mt-3 mb-2 bg-gradient-to-r from-brand-600/15 to-brand-700/8" />
                <p className="text-xs font-semibold text-surface-300 mb-0.5">{cat.title}</p>
                <p className="text-[10px] text-surface-600">{cat.ids.length} operations</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="mt-6 text-center pb-2">
          <p className="text-[10px] text-surface-700 flex items-center justify-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-600">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {t("app.privacy")}
          </p>
        </div>
      </div>
    </div>
  );
}
