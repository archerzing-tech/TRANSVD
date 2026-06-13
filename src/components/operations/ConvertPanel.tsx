import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import FFmpegLoader from "../common/FFmpegLoader";
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
      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg text-sm">
        <span className="text-gray-500">📄</span>
        <div className="flex-1 min-w-0">
          <p className="text-gray-200 truncate font-mono">{video.name}</p>
          <p className="text-xs text-gray-500">
            {(video.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <span className="text-gray-600">→</span>
        <div className="text-gray-200 font-mono text-sm">{targetFormat.ext.toUpperCase()}</div>
      </div>

      {/* Loading / Processing / Progress */}
      <FFmpegLoader loading={ffmpeg.loading} progress={ffmpeg.progress} loadPhase={ffmpeg.loadPhase} loadPercent={ffmpeg.loadPercent} />
      {!ffmpeg.loading && processing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full" />
            <span>
              {ffmpeg.progress > 0 ? `Converting... ${Math.round(ffmpeg.progress)}%` : "Processing..."}
            </span>
          </div>
          {ffmpeg.progress > 0 && (
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all duration-200" style={{ width: `${Math.min(ffmpeg.progress, 100)}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2">
        {(["video", "audio", "image"] as const).map((cat) => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}>
            {cat === "video" ? "🎬 Video" : cat === "audio" ? "🎵 Audio" : "🖼️ Image"}
          </button>
        ))}
      </div>

      {/* Format & codec selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Target Format</label>
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
          <label className="block text-sm text-gray-400 mb-1">Encoding</label>
          <select value={codec} onChange={(e) => setCodec(e.target.value)} className="select-input w-full">
            <option value="copy">Stream Copy (fast)</option>
            <option value="reencode">Re-encode</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            {codec === "copy"
              ? "Copies streams without re-encoding (may not work across formats)"
              : "Full re-encode for compatibility"}
          </p>
        </div>
      </div>

      {/* Error */}
      {ffmpeg.error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>
      )}

      {/* Output file info (shown after conversion) */}
      {outputUrl && (
        <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg text-sm space-y-1">
          <p className="text-green-400 font-medium">✅ Conversion complete</p>
          <div className="flex items-center gap-2 text-gray-300 font-mono text-xs">
            <span>📁</span>
            <span className="truncate">{outputFilename}</span>
          </div>
          {outputSize !== null && (
            <p className="text-gray-500 text-xs">Size: {(outputSize / 1024 / 1024).toFixed(2)} MB</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleConvert}
          disabled={isBusy}
          className="btn-primary">
          {isBusy ? "Converting..." : "Convert"}
        </button>
        {outputUrl && outputBlob && (
          <button onClick={() => saveBlob(outputBlob, {
            defaultName: outputFilename,
            filters: [{ name: targetFormat.label, extensions: [targetFormat.ext] }],
          })} className="btn-secondary">
            💾 Save {targetFormat.ext.toUpperCase()}
          </button>
        )}
      </div>
    </div>
  );
}
