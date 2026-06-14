import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import FFmpegLoader from "../common/FFmpegLoader";
import ProcessingOverlay from "../common/ProcessingOverlay";
import { saveBlob } from "../../lib/save";

interface FormatOption {
  ext: string;
  mime: string;
  label: string;
}

const FORMATS: Record<string, FormatOption[]> = {
  video: [
    { ext: "mp4", mime: "video/mp4", label: "MP4 (H.264)" },
    { ext: "webm", mime: "video/webm", label: "WebM (VP9)" },
    { ext: "mkv", mime: "video/x-matroska", label: "MKV" },
    { ext: "mov", mime: "video/quicktime", label: "MOV" },
    { ext: "avi", mime: "video/x-msvideo", label: "AVI" },
  ],
  audio: [
    { ext: "mp3", mime: "audio/mpeg", label: "MP3" },
    { ext: "aac", mime: "audio/aac", label: "AAC" },
    { ext: "wav", mime: "audio/wav", label: "WAV" },
    { ext: "ogg", mime: "audio/ogg", label: "OGG" },
    { ext: "flac", mime: "audio/flac", label: "FLAC" },
  ],
  image: [
    { ext: "jpg", mime: "image/jpeg", label: "JPEG" },
    { ext: "png", mime: "image/png", label: "PNG" },
  ],
};

interface ConvertPanelProps {
  video: VideoFile;
}

export default function ConvertPanel({ video }: ConvertPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [category, setCategory] = useState<"video" | "audio" | "image">("video");
  const [targetFormat, setTargetFormat] = useState(FORMATS.video[0]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [codec, setCodec] = useState("copy");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { ffmpeg.init(); }, []);

  const isBusy = processing || ffmpeg.loading;

  const handleCategoryChange = (cat: "video" | "audio" | "image") => {
    setCategory(cat);
    setTargetFormat(FORMATS[cat][0]);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const handleConvert = useCallback(async () => {
    setOutputUrl(null);
    setOutputSize(null);
    setProcessing(true);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const inputName = "input" + (video.name.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = `output.${targetFormat.ext}`;

      await instance.writeFile(inputName, video.data);

      const args = ["-i", inputName];

      if (codec === "copy") {
        if (targetFormat.ext === "mp3" || targetFormat.ext === "aac") args.push("-vn");
        args.push("-c", "copy");
      } else {
        switch (targetFormat.ext) {
          case "mp4": args.push("-c:v", "libx264", "-c:a", "aac"); break;
          case "webm": args.push("-c:v", "libvpx-vp9", "-c:a", "libopus"); break;
          case "mkv": args.push("-c:v", "libx264", "-c:a", "aac"); break;
          case "mov": args.push("-c:v", "libx264", "-c:a", "aac"); break;
          case "avi": args.push("-c:v", "mpeg4", "-c:a", "mp3"); break;
          case "mp3": args.push("-vn", "-c:a", "libmp3lame"); break;
          case "aac": args.push("-vn", "-c:a", "aac"); break;
          case "wav": args.push("-vn", "-c:a", "pcm_s16le"); break;
          case "ogg": args.push("-vn", "-c:a", "libvorbis"); break;
          case "flac": args.push("-vn", "-c:a", "flac"); break;
          case "jpg": args.push("-vframes", "1", "-q:v", "2"); break;
          case "png": args.push("-vframes", "1"); break;
        }
      }

      args.push("-y", outputName);
      await instance.exec(args);

      const raw = await instance.readFile(outputName);
      setOutputSize(raw instanceof Uint8Array ? raw.length : 0);
      const blob = new Blob([raw as BlobPart], { type: targetFormat.mime });
      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
    setProcessing(false);
  }, [video.data, video.name, targetFormat, codec]);

  const outputFilename = video.name.replace(/\.[^.]+$/, "") + "." + targetFormat.ext;

  return (
    <div className="card space-y-6">
      {/* Input file info */}
      <div className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-lg text-sm">
        <span className="text-surface-500 text-base">🎞</span>
        <div className="flex-1 min-w-0">
          <p className="text-surface-200 truncate font-mono">{video.name}</p>
          <p className="text-xs text-surface-500">
            {(video.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <span className="text-surface-600">→</span>
        <div className="text-surface-200 font-mono text-sm">{targetFormat.ext.toUpperCase()}</div>
      </div>

      {/* Loading / Processing / Progress */}
      <FFmpegLoader loading={ffmpeg.loading} progress={ffmpeg.progress} loadPhase={ffmpeg.loadPhase} loadPercent={ffmpeg.loadPercent} />
      {!ffmpeg.loading && processing && <ProcessingOverlay active={true} progress={ffmpeg.progress} label={t("convert.converting")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />}

      {/* Category tabs */}
      <div className="flex gap-2">
        {(["video", "audio", "image"] as const).map((cat) => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat ? "bg-brand-600 text-white" : "bg-surface-800 text-surface-400 hover:text-surface-200"
            }`}>
            {t(`convert.${cat}`)}
          </button>
        ))}
      </div>

      {/* Format & codec selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("convert.target")}</label>
          <select value={targetFormat.ext} onChange={(e) => {
            const fmt = FORMATS[category].find((f) => f.ext === e.target.value);
            if (fmt) { setTargetFormat(fmt); setOutputUrl(null); setOutputSize(null); }
          }} className="select-input w-full">
            {FORMATS[category].map((fmt) => (
              <option key={fmt.ext} value={fmt.ext}>{fmt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("convert.encoding")}</label>
          <select value={codec} onChange={(e) => setCodec(e.target.value)} className="select-input w-full">
            <option value="copy">{t("convert.stream_copy")}</option>
            <option value="reencode">{t("convert.reencode")}</option>
          </select>
          <p className="text-xs text-surface-600 mt-1">
            {codec === "copy"
              ? t("convert.stream_copy_desc")
              : t("convert.reencode_desc")}
          </p>
        </div>
      </div>

      {/* Error */}
      {ffmpeg.error && (
        <div className="banner-error">{ffmpeg.error}</div>
      )}

      {/* Output file info (shown after conversion) */}
      {outputUrl && (
        <div className="banner-success flex-col items-start">
          <p className="text-emerald-400 font-medium">{t("convert.complete")}</p>
          <div className="flex items-center gap-2 text-surface-300 font-mono text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-500 shrink-0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span className="truncate">{outputFilename}</span>
          </div>
          {outputSize !== null && (
            <p className="text-surface-500 text-xs">{t("common.size")}: {(outputSize / 1024 / 1024).toFixed(2)} MB</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleConvert}
          disabled={isBusy}
          className="btn-primary">
          {isBusy ? t("convert.converting") : t("convert.do_convert")}
        </button>
        {outputUrl && outputBlob && (
          <button onClick={() => saveBlob(outputBlob, {
            defaultName: outputFilename,
            filters: [{ name: targetFormat.label, extensions: [targetFormat.ext] }],
          })} className="btn-secondary">
            {t("convert.save")} {targetFormat.ext.toUpperCase()}
          </button>
        )}
      </div>
    </div>
  );
}
