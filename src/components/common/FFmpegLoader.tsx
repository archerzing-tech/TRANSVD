import { useTranslation } from "../../context/LanguageContext";

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
      <div className="card space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="animate-spin w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full shrink-0" />
          <span>{loadPhase || t("common.loading_ffmpeg")}</span>
        </div>
      </div>
    );
  }

  // ── Processing (ffmpeg exec progress) ──
  if (progress > 0 && progress < 100) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">{t("common.processing")}</span>
          <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return null;
}
