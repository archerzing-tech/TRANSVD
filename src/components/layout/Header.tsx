import ThemeSwitcher from "../common/ThemeSwitcher";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTranslation } from "../../context/LanguageContext";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { IconLeaf, IconLoading } from "../../lib/icons";
import type { VideoFile } from "../../types";

interface HeaderProps {
  onHome?: () => void;
  video?: VideoFile | null;
}

export default function Header({ onHome, video }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-surface-900/95 backdrop-blur-sm border-b border-surface-800/70 px-3 py-2 flex items-center gap-2 shrink-0 z-20">
      {/* App icon + title */}
      <button
        onClick={onHome}
        className="flex items-center gap-2 group cursor-pointer min-w-0 shrink-0"
        title={t("app.title")}
      >
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <IconLeaf size={22} className="text-brand-500" />
        </div>
        <h1 className="text-sm font-bold text-surface-50 tracking-tight">{t("app.title")}</h1>
      </button>

      {/* File info (when video loaded) */}
      {video && (
        <div className="flex items-center gap-1.5 min-w-0 flex-1 ml-1">
          <span className="text-[10px] text-surface-600">·</span>
          <span className="text-xs text-surface-500 font-mono truncate max-w-[200px]">{video.name}</span>
          <span className="text-[10px] text-surface-600">·</span>
          <span className="text-[11px] text-surface-500">{(video.size / 1024 / 1024).toFixed(1)}MB</span>
          {onHome && (
            <button
              onClick={onHome}
              className="ml-1 p-0.5 rounded-md text-surface-600 hover:text-surface-300 hover:bg-surface-800/60 transition-all duration-150 cursor-pointer"
              title="Close file"
            >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          )}
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        <FFmpegStatus />
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
}

function FFmpegStatus() {
  const { ready, loading, loadPhase, loadPercent } = useFFmpeg();

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-850 border border-surface-800/50">
        <IconLoading size={10} className="text-brand-500 animate-spin-slow" />
        <span className="text-[10px] text-surface-500 hidden sm:inline">
          {loadPhase} {Math.round(loadPercent)}%
        </span>
      </div>
    );
  }

  if (ready) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg badge-status-green">
        <span className="w-1 h-1 rounded-full bg-status-green-dot shadow-sm shadow-emerald-500/40" />
        <span className="text-[10px] text-status-green font-medium hidden sm:inline">ffmpeg</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-850 border border-surface-800/50">
      <span className="w-1 h-1 rounded-full bg-surface-600" />
      <span className="text-[10px] text-surface-500 hidden sm:inline">ffmpeg</span>
    </div>
  );
}
