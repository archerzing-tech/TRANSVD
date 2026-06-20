import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeSwitcher from "../common/ThemeSwitcher";
import { useTranslation } from "../../context/LanguageContext";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { IconFilm, IconLoading } from "../../lib/icons";

interface HeaderProps {
  onHome?: () => void;
}

export default function Header({ onHome }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-surface-900/95 backdrop-blur-sm border-b border-surface-800/70 px-5 py-2.5 flex items-center gap-3 shrink-0 z-20">
      {/* Logo + Title */}
      <button
        onClick={onHome}
        className="flex items-center gap-3 group cursor-pointer"
        title={t("app.title")}
      >
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:border-brand-500/30 transition-all duration-200">
          <IconFilm size={18} className="text-brand-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-bold text-surface-50 tracking-tight">{t("app.title")}</h1>
          <span className="text-[11px] text-surface-500 font-medium hidden sm:inline">
            {t("app.subtitle")}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-800/60 text-surface-500 font-mono border border-surface-700/50 leading-none hidden sm:inline">
            v{__APP_VERSION__}
          </span>
        </div>
      </button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
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
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-850 border border-surface-800/50">
        <IconLoading size={12} className="text-brand-500 animate-spin-slow" />
        <span className="text-xs text-surface-500">
          {loadPhase} {Math.round(loadPercent)}%
        </span>
      </div>
    );
  }

  if (ready) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg badge-status-green">
        <span className="w-1.5 h-1.5 rounded-full bg-status-green-dot shadow-sm shadow-emerald-500/40" />
        <span className="text-xs text-status-green font-medium">ffmpeg</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-850 border border-surface-800/50">
      <span className="w-1.5 h-1.5 rounded-full bg-surface-600" />
      <span className="text-xs text-surface-500">ffmpeg</span>
    </div>
  );
}
