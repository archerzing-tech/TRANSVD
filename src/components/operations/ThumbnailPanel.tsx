import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface ThumbnailPanelProps {
  video: VideoFile;
}

export default function ThumbnailPanel({ video }: ThumbnailPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [time, setTime] = useState(1);
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleExtract = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const inputName = "input" + (video.name.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = `thumbnail.${format}`;

      await instance.writeFile(inputName, video.data);

      const args = format === "jpg"
        ? ["-ss", String(time), "-i", inputName, "-vframes", "1", "-q:v", "2", "-y", outputName]
        : ["-ss", String(time), "-i", inputName, "-vframes", "1", "-y", outputName];

      await instance.exec(args);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: `image/${format}` });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, time, format]);

  return (
    <div className="card space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Time (s): {time}</label>
          <input type="range" min={0} max={300} step={0.5} value={time} onChange={(e) => setTime(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Format</label>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setFormat("jpg")} className={`px-4 py-2 rounded-lg text-sm ${format === "jpg" ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-300"}`}>JPEG</button>
            <button onClick={() => setFormat("png")} className={`px-4 py-2 rounded-lg text-sm ${format === "png" ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-300"}`}>PNG</button>
          </div>
        </div>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Extracting thumbnail..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleExtract} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Extract"}
        </button>
        {outputUrl && (
          <>
            <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_thumb.${format}`} className="btn-secondary">{t("common.download")}</a>
            <img src={outputUrl} alt="Thumbnail" className="max-h-32 rounded-lg border border-gray-700" />
          </>
        )}
      </div>
    </div>
  );
}
