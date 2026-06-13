import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface AdjustPanelProps {
  video: VideoFile;
}

export default function AdjustPanel({ video }: AdjustPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [grayscale, setGrayscale] = useState(false);
  const [gamma, setGamma] = useState(1);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleAdjust = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "adjusted" + ext;

      await instance.writeFile(inputName, video.data);

      const eq = `eq=brightness=${brightness.toFixed(2)}:contrast=${contrast.toFixed(2)}:saturation=${saturation.toFixed(2)}:gamma=${gamma.toFixed(2)}`;
      const vf = grayscale ? `${eq},hue=s=0` : eq;

      await instance.exec(["-i", inputName, "-vf", vf, "-c:a", "copy", "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, brightness, contrast, saturation, grayscale, gamma]);

  return (
    <div className="card space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Brightness: {brightness.toFixed(2)}</label>
          <input type="range" min={-0.5} max={0.5} step={0.05} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Contrast: {contrast.toFixed(2)}</label>
          <input type="range" min={0} max={3} step={0.05} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Saturation: {saturation.toFixed(2)}</label>
          <input type="range" min={0} max={3} step={0.05} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gamma: {gamma.toFixed(2)}</label>
          <input type="range" min={0.1} max={3} step={0.05} value={gamma} onChange={(e) => setGamma(Number(e.target.value))} className="input-range" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)}
          className="rounded bg-gray-800 border-gray-700" />
        Grayscale
      </label>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Applying adjustments..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleAdjust} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Apply"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_adjusted.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
