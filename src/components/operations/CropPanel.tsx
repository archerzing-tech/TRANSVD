import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

interface CropPanelProps {
  video: VideoFile;
}

export default function CropPanel({ video }: CropPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleCrop = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "cropped" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec(["-i", inputName, "-vf", `crop=${width}:${height}:${x}:${y}`, "-c:a", "copy", "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, width, height, x, y]);

  return (
    <div className="card space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("crop.w")}: {width}px</label>
          <input type="range" min={16} max={1920} step={2} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("crop.h")}: {height}px</label>
          <input type="range" min={16} max={1080} step={2} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("crop.x")}: {x}px</label>
          <input type="range" min={0} max={1000} step={2} value={x} onChange={(e) => setX(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("crop.y")}: {y}px</label>
          <input type="range" min={0} max={1000} step={2} value={y} onChange={(e) => setY(Number(e.target.value))} className="input-range" />
        </div>
      </div>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("crop.cropping")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleCrop} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("crop.crop")}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_cropped.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
