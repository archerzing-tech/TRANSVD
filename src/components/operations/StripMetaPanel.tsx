import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface StripMetaPanelProps {
  video: VideoFile;
}

export default function StripMetaPanel({ video }: StripMetaPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleStrip = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "clean" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec(["-i", inputName, "-map_metadata", "-1", "-map", "0", "-c", "copy", "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name]);

  return (
    <div className="card space-y-6">
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 space-y-2">
        <p>Removes all metadata from the video file, including:</p>
        <ul className="list-disc pl-5 text-gray-400 space-y-1">
          <li>GPS location data</li>
          <li>Camera information (make, model)</li>
          <li>Timestamps and recording date</li>
          <li>Software and encoder tags</li>
          <li>All other metadata fields</li>
        </ul>
        <p className="text-green-400 mt-2">Video and audio streams are copied without re-encoding (fast).</p>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Stripping metadata..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleStrip} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Strip Metadata"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_clean.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
