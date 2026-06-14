import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

interface FadePanelProps {
  video: VideoFile;
}

export default function FadePanel({ video }: FadePanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [fadeIn, setFadeIn] = useState(1);
  const [fadeOut, setFadeOut] = useState(1);
  const [fadeType, setFadeType] = useState<"video" | "audio" | "both">("both");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleFade = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "faded" + ext;

      await instance.writeFile(inputName, video.data);

      const filters: string[] = [];
      if (fadeType === "video" || fadeType === "both") {
        filters.push(`fade=t=in:st=0:d=${fadeIn},fade=t=out:st=10:d=${fadeOut}`);
      }
      if (fadeType === "audio" || fadeType === "both") {
        filters.push(`afade=t=in:st=0:d=${fadeIn},afade=t=out:st=10:d=${fadeOut}`);
      }

      const args = ["-i", inputName];
      if (filters.length === 2) {
        args.push("-vf", filters[0], "-af", filters[1]);
      } else if (filters.length === 1) {
        if (fadeType === "video") {
          args.push("-vf", filters[0], "-c:a", "copy");
        } else {
          args.push("-af", filters[0], "-c:v", "copy");
        }
      }
      args.push("-y", outputName);

      await instance.exec(args);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, fadeIn, fadeOut, fadeType]);

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-surface-400 mb-2">{t("fade.type")}</label>
        <div className="flex gap-2">
          {(["video", "audio", "both"] as const).map((ft) => (
            <button key={ft} onClick={() => setFadeType(ft)}
              className={`px-4 py-2 rounded-lg text-sm ${fadeType === ft ? "bg-brand-600 text-white" : "bg-surface-800 text-surface-300 hover:bg-surface-700"}`}>
              {t(`fade.${ft}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("fade.in")}: {fadeIn}s</label>
          <input type="range" min={0} max={10} step={0.5} value={fadeIn} onChange={(e) => setFadeIn(Number(e.target.value))} className="input-range" />
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("fade.out")}: {fadeOut}s</label>
          <input type="range" min={0} max={10} step={0.5} value={fadeOut} onChange={(e) => setFadeOut(Number(e.target.value))} className="input-range" />
        </div>
      </div>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("fade.applying")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleFade} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("fade.apply")}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_faded.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
