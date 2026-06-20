import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface ThumbnailPanelProps {
  video: VideoFile;
}

export default function ThumbnailPanel({ video }: ThumbnailPanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();
  const { t } = useTranslation();

  const [time, setTime] = useState(1);

  const [format, setFormat] = useState<"jpg" | "png">("jpg");

  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  useEffect(() => { init(); }, [init]);

  const handleExtract = useCallback(async () => {
    setOutputUrl(null);
    setOutputBlob(null);
    await run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");
      const inputName = "input" + (video.name.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = `thumbnail.${format}`;
      await instance.writeFile(inputName, video.data);
      const args = format === "jpg"
        ? ["-ss", String(time), "-i", inputName, "-vframes", "1", "-q:v", "2", "-y", outputName]
        : ["-ss", String(time), "-i", inputName, "-vframes", "1", "-y", outputName];
      await instance.exec(args);
      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: `image/${format}` });
      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, time, format, run]);

  return (
    <div className="card space-y-6">
      {/* Time & Format Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("thumb.time")}: {time}s</label>
          <input type="range" min={0} max={300} step={0.5} value={time}
            onChange={(e) => setTime(Number(e.target.value))} className="input-range" />
          <input type="number" min={0} max={300} value={time}
            onChange={(e) => setTime(Math.max(0, Number(e.target.value)))}
            className="select-input w-full mt-1" />
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-2">{t("thumb.format")}</label>
          <div className="flex gap-2">
            <button onClick={() => setFormat("jpg")}
              className={`flex-1 px-4 py-2.5 rounded-lg btn-pill text-sm font-medium transition-all ${
                format === "jpg"
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                  : "bg-surface-800 text-surface-300 hover:bg-surface-700"
              }`}>
              JPEG
            </button>
            <button onClick={() => setFormat("png")}
              className={`flex-1 px-4 py-2.5 rounded-lg btn-pill text-sm font-medium transition-all ${
                format === "png"
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                  : "bg-surface-800 text-surface-300 hover:bg-surface-700"
              }`}>
              PNG
            </button>
          </div>
        </div>
      </div>

      {/* Progress / Error */}
      <ProcessingOverlay active={running} progress={progress} label={t("thumb.extracting")}
        log={log} onCancel={cancel} cancelling={cancelling} />
      {error && <div className="banner-error">{error}</div>}

      {/* Preview + Actions */}
      {outputUrl && outputBlob && (
        <div className="space-y-4 animate-fade-in">
          {/* Thumbnail Preview */}
          <div className="rounded-lg overflow-hidden border border-surface-800 bg-surface-900">
            <div className="relative">
              <img src={outputUrl} alt="Thumbnail"
                className="w-full max-h-64 object-contain bg-surface-950" />
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-surface-950/80 text-[10px] text-surface-400 font-mono">
                {format === "jpg" ? "JPEG" : "PNG"} · {time}s
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={handleExtract}
              disabled={loading || running}
              className="btn-primary">
              {!loaded ? t("common.load_ffmpeg") : t("thumb.extract")}
            </button>
            <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + `_thumb.${format}`} filters={[{ name: format === "jpg" ? "JPEG Image" : "PNG Image", extensions: [format] }]} label={t("common.save_as")} />
          </div>
        </div>
      )}

      {/* Initial extract button (hidden after extraction) */}
      {!outputUrl && (
        <div className="flex gap-3">
          <button onClick={handleExtract}
            disabled={loading || running}
            className="btn-primary">
            {!loaded ? t("common.load_ffmpeg") : t("thumb.extract")}
          </button>
        </div>
      )}
    </div>
  );
}
