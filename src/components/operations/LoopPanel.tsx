import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface LoopPanelProps {
  video: VideoFile;
}

export default function LoopPanel({ video }: LoopPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [count, setCount] = useState(3);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleLoop = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "looped" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec([
        "-stream_loop", String(count - 1),
        "-i", inputName,
        "-c", "copy",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, count]);

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Repeat Count: {count}×</label>
        <input type="range" min={2} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="input-range" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>2×</span><span>25×</span><span>50×</span>
        </div>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Looping..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleLoop} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : `Loop ${count}×`}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_looped.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
