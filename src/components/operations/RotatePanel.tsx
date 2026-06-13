import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface RotatePanelProps {
  video: VideoFile;
}

const TRANSFORMS = [
  { label: "Rotate 90° CW", vf: "transpose=1" },
  { label: "Rotate 90° CCW", vf: "transpose=2" },
  { label: "Rotate 180°", vf: "transpose=1,transpose=1" },
  { label: "Flip Horizontal", vf: "hflip" },
  { label: "Flip Vertical", vf: "vflip" },
];

export default function RotatePanel({ video }: RotatePanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [selected, setSelected] = useState(TRANSFORMS[0]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleRotate = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "transformed" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec(["-i", inputName, "-vf", selected.vf, "-c:a", "copy", "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, selected]);

  return (
    <div className="card space-y-6">
      <div className="grid grid-cols-2 gap-2">
        {TRANSFORMS.map((t) => (
          <button key={t.label} onClick={() => setSelected(t)}
            className={`p-4 rounded-lg text-sm font-medium text-center transition-colors ${selected.label === t.label ? "bg-brand-600 text-white ring-2 ring-brand-400" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Applying transform..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleRotate} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Apply"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_transformed.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
