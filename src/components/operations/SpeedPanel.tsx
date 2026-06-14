import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

interface SpeedPanelProps {
  video: VideoFile;
}

export default function SpeedPanel({ video }: SpeedPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [speed, setSpeed] = useState(1.0);
  const [preservePitch, setPreservePitch] = useState(true);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleSpeed = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "speed" + ext;

      await instance.writeFile(inputName, video.data);

      const setpts = 1 / speed;
      if (preservePitch) {
        const tempo = speed < 0.5 ? 0.5 : speed > 2.0 ? 2.0 : speed;
        const atempo = `atempo=${tempo.toFixed(2)}`;
        await instance.exec([
          "-i", inputName,
          "-c:v", "libx264",
          "-vf", `setpts=${setpts.toFixed(2)}*PTS`,
          "-af", atempo,
          "-y", outputName,
        ]);
      } else {
        await instance.exec([
          "-i", inputName,
          "-c:v", "libx264",
          "-vf", `setpts=${setpts.toFixed(2)}*PTS`,
          "-an",
          "-y", outputName,
        ]);
      }

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, speed, preservePitch]);

  const speedLabel = speed < 1 ? t("speed.slower") : speed > 1 ? t("speed.faster") : t("speed.normal");

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-surface-400 mb-1">{t("speed.speed")}: {speed.toFixed(2)}x ({speedLabel})</label>
        <input type="range" min={0.25} max={4} step={0.05} value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))} className="input-range" />
        <div className="flex justify-between text-xs text-surface-500 mt-1">
          <span>0.25x</span><span>1x</span><span>4x</span>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-surface-400">
        <input type="checkbox" checked={preservePitch} onChange={(e) => setPreservePitch(e.target.checked)}
          className="rounded bg-surface-800 border-surface-700" />
        {t("speed.preserve")}
      </label>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("speed.changing")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleSpeed} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("speed.change")}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_${speed.toFixed(2)}x.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
