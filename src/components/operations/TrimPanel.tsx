import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface TrimPanelProps {
  video: VideoFile;
}

export default function TrimPanel({ video }: TrimPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleTrim = useCallback(async () => {
    setOutputUrl(null);
    const duration = end - start;
    if (duration <= 0) return;

    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "trimmed" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec([
        "-ss", String(start),
        "-t", String(duration),
        "-i", inputName,
        "-c", "copy",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, start, end]);

  return (
    <div className="card space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Start (s): {start}</label>
          <input type="range" min={0} max={Math.max(end - 1, 60)} step={0.5} value={start}
            onChange={(e) => setStart(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">End (s): {end}</label>
          <input type="range" min={start + 1} max={300} step={0.5} value={end}
            onChange={(e) => setEnd(Number(e.target.value))} className="input-range" />
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center">Duration: {(end - start).toFixed(1)}s</p>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Trimming..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleTrim} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Trim"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_trimmed.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
