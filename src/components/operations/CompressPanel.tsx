import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

interface CompressPanelProps {
  video: VideoFile;
}

const PRESETS = [
  { label: "Ultra Fast", value: "ultrafast" },
  { label: "Fast", value: "fast" },
  { label: "Medium", value: "medium" },
  { label: "Slow", value: "slow" },
  { label: "Very Slow", value: "veryslow" },
];

export default function CompressPanel({ video }: CompressPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [crf, setCrf] = useState(23);
  const [preset, setPreset] = useState("medium");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleCompress = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "compressed" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-crf", String(crf),
        "-preset", preset,
        "-c:a", "aac",
        "-movflags", "+faststart",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, crf, preset]);

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-surface-400 mb-1">
          {t("compress.crf")}: {crf} ({crf <= 18 ? t("compress.high_quality") : crf <= 28 ? t("compress.balanced") : t("compress.small_size")})
        </label>
        <input type="range" min={18} max={51} value={crf} onChange={(e) => setCrf(Number(e.target.value))} className="input-range" />
        <div className="flex justify-between text-xs text-surface-500 mt-1">
          <span>{t("compress.high_quality")} (18)</span>
          <span>{t("compress.small_size")} (51)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-surface-400 mb-1">{t("compress.preset")}</label>
        <select value={preset} onChange={(e) => setPreset(e.target.value)} className="select-input w-full">
          {PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <p className="text-xs text-surface-600 mt-1">{t("compress.preset_hint")}</p>
      </div>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("compress.compressing")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleCompress} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("compress.compress")}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_compressed.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
