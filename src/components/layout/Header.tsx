import { useState, useCallback } from "react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeSwitcher from "../common/ThemeSwitcher";
import SettingsDrawer from "../common/SettingsDrawer";
import { useTranslation } from "../../context/LanguageContext";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useIsMobile } from "../../hooks/useIsMobile";
import { IconFilm, IconLoading } from "../../lib/icons";
import type { VideoFile } from "../../types";

interface HeaderProps {
  onHome?: () => void;
  video?: VideoFile | null;
}

export default function Header({ onHome, video }: HeaderProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <header className="bg-surface-900/95 backdrop-blur-sm border-b border-surface-800/70 px-3 py-2.5 flex items-center gap-2 shrink-0 z-20 safe-area-top">
      {/* Back/Home button */}
      <button
        onClick={onHome}
        className="flex items-center gap-2 group cursor-pointer min-w-0"
        title={t("app.title")}
      >
        <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
          <IconFilm size={16} className="text-brand-500" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-surface-50 tracking-tight truncate max-w-[120px]">{t("app.title")}</h1>
        </div>
      </button>

      {/* File name (when video loaded) */}
      {video && !isMobile && (
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-[10px] text-surface-600">·</span>
          <span className="text-xs text-surface-500 font-mono truncate max-w-[160px]">{video.name}</span>
          <span className="text-[10px] text-surface-600">·</span>
          <span className="text-[11px] text-surface-500">{(video.size / 1024 / 1024).toFixed(1)}MB</span>
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        <FFmpegStatus />
        {isMobile ? (
          <>
            {/* Settings gear button (mobile) */}
            <button
              onClick={openSettings}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-800/60 transition-all duration-150 cursor-pointer"
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <SettingsDrawer open={settingsOpen} onClose={closeSettings} />
          </>
        ) : (
          <>
            <ThemeSwitcher />
            <LanguageSwitcher />
          </>
        )}
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
