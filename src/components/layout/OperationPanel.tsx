import type { OperationId, VideoFile } from "../../App";
import { OPERATIONS } from "../../App";
import { useTranslation } from "../../context/LanguageContext";
import { OPERATION_ICONS, IconOpenFile, IconFilm } from "../../lib/icons";
import GifPanel from "../operations/GifPanel";
import ConvertPanel from "../operations/ConvertPanel";
import CompressPanel from "../operations/CompressPanel";
import TrimPanel from "../operations/TrimPanel";
import ResizePanel from "../operations/ResizePanel";
import AudioExtractPanel from "../operations/AudioExtractPanel";
import MutePanel from "../operations/MutePanel";
import SpeedPanel from "../operations/SpeedPanel";
import RotatePanel from "../operations/RotatePanel";
import CropPanel from "../operations/CropPanel";
import ThumbnailPanel from "../operations/ThumbnailPanel";
import ReversePanel from "../operations/ReversePanel";
import FadePanel from "../operations/FadePanel";
import AdjustPanel from "../operations/AdjustPanel";
import StripMetaPanel from "../operations/StripMetaPanel";
import SubtitlesPanel from "../operations/SubtitlesPanel";
import VolumePanel from "../operations/VolumePanel";
import LoopPanel from "../operations/LoopPanel";
import OverlayPanel from "../operations/OverlayPanel";
import MixAudioPanel from "../operations/MixAudioPanel";
import ConcatPanel from "../operations/ConcatPanel";
import SideBySidePanel from "../operations/SideBySidePanel";
import PipPanel from "../operations/PipPanel";
import MediaInfoPanel from "../operations/MediaInfoPanel";
import RawFFmpegPanel from "../operations/RawFFmpegPanel";

interface OperationPanelProps {
  operation: OperationId | null;
  video: VideoFile;
  onOpenFile: () => void;
  onSelectOperation: (id: OperationId) => void;
}

export default function OperationPanel({ operation, video, onOpenFile, onSelectOperation }: OperationPanelProps) {
  const { t } = useTranslation();

  const renderPanel = () => {
    switch (operation) {
      case "gif":          return <GifPanel video={video} />;
      case "convert":      return <ConvertPanel video={video} />;
      case "compress":     return <CompressPanel video={video} />;
      case "trim":         return <TrimPanel video={video} />;
      case "resize":       return <ResizePanel video={video} />;
      case "audio-extract": return <AudioExtractPanel video={video} />;
      case "mute":         return <MutePanel video={video} />;
      case "speed":        return <SpeedPanel video={video} />;
      case "rotate":       return <RotatePanel video={video} />;
      case "crop":         return <CropPanel video={video} />;
      case "thumbnail":    return <ThumbnailPanel video={video} />;
      case "reverse":      return <ReversePanel video={video} />;
      case "fade":         return <FadePanel video={video} />;
      case "adjust":       return <AdjustPanel video={video} />;
      case "strip-meta":   return <StripMetaPanel video={video} />;
      case "subtitles":    return <SubtitlesPanel video={video} />;
      case "volume":       return <VolumePanel video={video} />;
      case "loop":         return <LoopPanel video={video} />;
      case "overlay":      return <OverlayPanel video={video} />;
      case "mix-audio":    return <MixAudioPanel video={video} />;
      case "concat":       return <ConcatPanel video={video} />;
      case "side-by-side": return <SideBySidePanel video={video} />;
      case "pip":          return <PipPanel video={video} />;
      case "mediainfo":    return <MediaInfoPanel video={video} />;
      case "raw":          return <RawFFmpegPanel video={video} />;
      default:             return null;
    }
  };

  const OpIcon = operation ? OPERATION_ICONS[operation] : null;

  // ── Welcome view (shown when no operation selected) ──
  if (!operation) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-surface-50 tracking-tight">Ready to edit</h2>
            <p className="text-sm text-surface-500 mt-1">
              <span className="font-mono text-surface-400">{video.name}</span>
              {" · "}
              {(video.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button onClick={onOpenFile} className="btn-secondary text-sm flex items-center gap-2 shrink-0">
            <IconOpenFile size={16} className="text-surface-400" />
            {t("op.open_new")}
          </button>
        </div>

        <WelcomePanel video={video} onSelect={onSelectOperation} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            {OpIcon ? <OpIcon size={20} className="text-brand-500" /> : <IconFilm size={20} className="text-brand-500" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-50 tracking-tight">
              {t(`op.${operation}`)}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-surface-500 font-mono truncate max-w-[280px]">
                {video.name}
              </span>
              <span className="text-[10px] text-surface-600">·</span>
              <span className="text-xs text-surface-500">
                {(video.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <span className="text-[10px] text-surface-600">·</span>
              <span className="text-[11px] text-surface-600 capitalize">{operation}</span>
            </div>
          </div>
        </div>
        <button onClick={onOpenFile} className="btn-secondary text-sm flex items-center gap-2 shrink-0">
          <IconOpenFile size={16} className="text-surface-400" />
          {t("op.open_new")}
        </button>
      </div>

      {/* Panel content */}
      {renderPanel()}
    </div>
  );
}

interface WelcomePanelProps {
  video: VideoFile;
  onSelect: (id: OperationId) => void;
}

const OP_CATEGORIES: { title: string; color: string; ids: OperationId[] }[] = [
  {
    title: "Convert & Compress",
    color: "from-amber-600/20 to-amber-700/10",
    ids: ["gif", "convert", "compress"],
  },
  {
    title: "Trim & Transform",
    color: "from-blue-600/20 to-blue-700/10",
    ids: ["trim", "crop", "rotate", "resize", "speed", "reverse"],
  },
  {
    title: "Audio & Effects",
    color: "from-violet-600/20 to-violet-700/10",
    ids: ["audio-extract", "mute", "volume", "fade", "adjust"],
  },
  {
    title: "Advanced",
    color: "from-emerald-600/20 to-emerald-700/10",
    ids: ["overlay", "concat", "pip", "subtitles", "side-by-side", "mix-audio", "loop", "strip-meta", "mediainfo", "thumbnail", "raw"],
  },
];

function WelcomePanel({ video: _video, onSelect }: WelcomePanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <IconFilm size={24} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-surface-50">File loaded! What would you like to do?</h3>
            <p className="text-sm text-surface-500 mt-1 leading-relaxed">
              Click an operation below or choose from the sidebar to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-4">
        {OP_CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            className="card border-surface-800/50 overflow-hidden"
          >
            <div className={`h-1 -mx-5 -mt-5 mb-3 bg-gradient-to-r ${cat.color}`} />
            <h4 className="text-sm font-semibold text-surface-200 mb-2">{cat.title}</h4>
            <div className="space-y-0.5">
              {cat.ids.map((id) => {
                const op = OPERATIONS.find((o) => o.id === id);
                if (!op) return null;
                const Icon = OPERATION_ICONS[id];
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs
                               text-surface-500 hover:text-surface-200 hover:bg-surface-800/60
                               transition-all duration-150 text-left group cursor-pointer"
                  >
                    {Icon && <Icon size={15} className="text-surface-600 group-hover:text-brand-500 shrink-0 transition-colors" />}
                    <span>{t(op.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="text-center py-3">
        <p className="text-[11px] text-surface-600">
          Tip: You can also drag and drop a new file to replace the current one
        </p>
      </div>
    </div>
  );
}
