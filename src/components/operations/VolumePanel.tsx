import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface VolumePanelProps {
  video: VideoFile;
}

export default function VolumePanel({ video }: VolumePanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [volume, setVolume] = useState(1.0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleVolume = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "volume" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec(["-i", inputName, "-af", `volume=${volume.toFixed(2)}`, "-c:v", "copy", "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, volume]);

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Volume: {(volume * 100).toFixed(0)}%</label>
        <input type="range" min={0} max={4} step={0.1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="input-range" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (mute)</span><span>100%</span><span>400%</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Video stream is copied without re-encoding.</p>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Adjusting volume..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleVolume} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Adjust Volume"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_volume.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
