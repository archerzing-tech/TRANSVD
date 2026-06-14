import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

interface RotatePanelProps {
  video: VideoFile;
}

const TRANSFORMS = [
  { key: "rotate.cw" as const, vf: "transpose=1" },
  { key: "rotate.ccw" as const, vf: "transpose=2" },
  { key: "rotate.180" as const, vf: "transpose=1,transpose=1" },
  { key: "rotate.hflip" as const, vf: "hflip" },
  { key: "rotate.vflip" as const, vf: "vflip" },
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
        {TRANSFORMS.map((tr) => (
          <button key={tr.key} onClick={() => setSelected(tr)}
            className={`p-4 rounded-lg text-sm font-medium text-center transition-colors ${selected.key === tr.key ? "bg-brand-600 text-white ring-2 ring-brand-400" : "bg-surface-800 text-surface-300 hover:bg-surface-700"}`}>
            {t(tr.key)}
          </button>
        ))}
      </div>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("rotate.applying")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleRotate} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("rotate.apply")}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_transformed.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
