import type { OperationId, VideoFile } from "../../App";
import { useTranslation } from "../../context/LanguageContext";
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
  operation: OperationId;
  video: VideoFile;
  onOpenFile: () => void;
}

export default function OperationPanel({ operation, video, onOpenFile }: OperationPanelProps) {
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
      default:             return <PlaceholderPanel />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">
            {t(`op.${operation}`)}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {t("common.file")}: <span className="text-gray-300">{video.name}</span>
            {" · "}
            {(video.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <button onClick={onOpenFile} className="btn-secondary text-sm">
          {t("op.open_new")}
        </button>
      </div>

      {renderPanel()}
    </div>
  );
}

function PlaceholderPanel() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="text-center">
        <div className="text-4xl mb-3">🚧</div>
        <p className="text-lg font-medium">{t("common.coming_soon")}</p>
        <p className="text-sm mt-1">{t("common.coming_soon_desc")}</p>
      </div>
    </div>
  );
}
