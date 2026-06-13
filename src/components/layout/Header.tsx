import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTranslation } from "../../context/LanguageContext";
import { useFFmpeg } from "../../hooks/useFFmpeg";

interface HeaderProps {
  onHome?: () => void;
}

export default function Header({ onHome }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-3 shrink-0">
      <button onClick={onHome} className="text-2xl hover:scale-110 transition-transform" title="Home">🎬</button>
      <h1 className="text-xl font-bold text-white">TRANSVD</h1>
      <span className="text-sm text-gray-400 ml-2">{t("app.subtitle")}</span>
      <div className="ml-auto flex items-center gap-3">
        <FFmpegStatus />
        <LanguageSwitcher />
      </div>
    </header>
  );
}

function FFmpegStatus() {
  const { ready, loading, loadPhase, loadPercent } = useFFmpeg();
  if (loading) return (
    <span className="text-xs text-yellow-500 flex items-center gap-1" title={`${loadPhase} ${Math.round(loadPercent)}%`}>
      <span className="animate-spin w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full inline-block" />
      {Math.round(loadPercent)}%
    </span>
  );
  if (ready) return <span className="text-xs text-green-500">✅ ffmpeg</span>;
  return <span className="text-xs text-gray-500">⏸️ ffmpeg</span>;
}
