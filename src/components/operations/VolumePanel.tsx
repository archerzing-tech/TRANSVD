import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

interface VolumePanelProps {
  video: VideoFile;
}

export default function VolumePanel({ video }: VolumePanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [volume, setVolume] = useState(1.0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleVolume = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "volume" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec(["-i", inputName, "-af", `volume=${volume.toFixed(2)}`, "-c:v", "copy", "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, volume]);

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-surface-400 mb-1">{t("volume.volume")}: {(volume * 100).toFixed(0)}%</label>
        <input type="range" min={0} max={4} step={0.1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="input-range" />
        <div className="flex justify-between text-xs text-surface-500 mt-1">
          <span>0% ({t("volume.mute")})</span><span>100%</span><span>400%</span>
        </div>
        <p className="text-xs text-surface-600 mt-1">{t("volume.note")}</p>
      </div>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("volume.adjusting")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleVolume} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("volume.adjust")}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_volume.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
