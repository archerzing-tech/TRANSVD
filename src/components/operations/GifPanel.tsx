import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import FFmpegLoader from "../common/FFmpegLoader";
import ProcessingOverlay from "../common/ProcessingOverlay";
import { saveBlob } from "../../lib/save";

interface GifPanelProps {
  video: VideoFile;
}

export default function GifPanel({ video }: GifPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [fps, setFps] = useState(10);
  const [scale, setScale] = useState(320);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const isBusy = processing || ffmpeg.loading;

  useEffect(() => { ffmpeg.init(); }, []);

  const handleGenerate = useCallback(async () => {
    setOutputUrl(null);
    setProcessing(true);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");
      const inputName = "input" + (video.name.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = "output.gif";
      await instance.writeFile(inputName, video.data);

      const paletteName = "palette.png";
      await instance.exec(["-ss", String(startTime), "-t", String(duration), "-i", inputName,
        "-vf", `fps=${fps},scale=${scale}:-1:flags=lanczos,palettegen=stats_mode=diff`, "-y", paletteName]);

      await instance.exec(["-ss", String(startTime), "-t", String(duration), "-i", inputName, "-i", paletteName,
        "-lavfi", `fps=${fps},scale=${scale}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`, "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "image/gif" });
      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
    setProcessing(false);
  }, [video.data, video.name, startTime, duration, fps, scale]);

  return (
    <div className="card space-y-6">
      <FFmpegLoader loading={ffmpeg.loading} progress={ffmpeg.progress} loadPhase={ffmpeg.loadPhase} loadPercent={ffmpeg.loadPercent} />
      {!ffmpeg.loading && processing && <ProcessingOverlay active={true} progress={ffmpeg.progress} label={t("gif.generating")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("gif.start_time")}</label>
          <input type="number" min={0} step={0.5} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="select-input w-full" />
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("gif.duration")}</label>
          <input type="number" min={0.5} max={30} step={0.5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="select-input w-full" />
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("gif.fps")}</label>
          <input type="range" min={5} max={30} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="input-range" />
          <span className="text-xs text-surface-500">{fps} fps</span>
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("gif.width")}</label>
          <input type="range" min={120} max={720} step={8} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="input-range" />
          <span className="text-xs text-surface-500">{scale}px</span>
        </div>
      </div>

      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleGenerate} disabled={isBusy} className="btn-primary">
          {isBusy ? (ffmpeg.progress > 0 ? `${Math.round(ffmpeg.progress)}%` : t("gif.generating")) : t("gif.generate")}
        </button>
        {outputUrl && outputBlob && (
          <button onClick={() => saveBlob(outputBlob, {
            defaultName: video.name.replace(/\.[^.]+$/, "") + ".gif",
            filters: [{ name: "GIF Image", extensions: ["gif"] }],
          })} className="btn-secondary">
            {t("common.save_as")}
          </button>
        )}
      </div>
      {outputUrl && <img src={outputUrl} alt="GIF preview" className="max-w-full rounded-lg border border-surface-700" />}
    </div>
  );
}
