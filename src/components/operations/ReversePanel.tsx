import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface ReversePanelProps {
  video: VideoFile;
}

export default function ReversePanel({ video }: ReversePanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleReverse = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "reversed" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec(["-i", inputName, "-vf", "reverse", "-af", "areverse", "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name]);

  return (
    <div className="card space-y-6">
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300">
        <p>Reverses both video and audio playback. This operation can take a while as ffmpeg needs to process the entire file.</p>
        <p className="mt-2 text-yellow-400">⚠ Note: Reverse requires frame-accurate decoding and may use significant memory.</p>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Reversing..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleReverse} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Reverse Video"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_reversed.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
