import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

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
        <label className="block text-sm text-surface-400 mb-1">{t("loop.count")}: {count}x</label>
        <input type="range" min={2} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="input-range" />
        <div className="flex justify-between text-xs text-surface-500 mt-1">
          <span>2x</span><span>25x</span><span>50x</span>
        </div>
      </div>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("loop.looping")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleLoop} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : `${t("loop.loop")} ${count}x`}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_looped.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
