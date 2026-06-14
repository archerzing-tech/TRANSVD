import { useTranslation } from "../../context/LanguageContext";
import { IconLoading } from "../../lib/icons";

interface FFmpegLoaderProps {
  loading: boolean;
  progress: number;
  loadPhase?: string;
  loadPercent?: number;
}

export default function FFmpegLoader({ loading, progress, loadPhase }: FFmpegLoaderProps) {
  const { t } = useTranslation();

  // ── Loading (WASM initialization) ──
  if (loading) {
    return (
      <div className="banner-info">
        <IconLoading size={16} className="text-brand-400 animate-spin-slow shrink-0 mt-0.5" />
        <span>{loadPhase || t("common.loading_ffmpeg")}</span>
      </div>
    );
  }

  // ── Processing (ffmpeg exec progress) ──
  if (progress > 0 && progress < 100) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-surface-400">{t("common.processing")}</span>
          <span className="text-xs font-mono text-surface-500">{Math.round(progress)}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-bar"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return null;
}
