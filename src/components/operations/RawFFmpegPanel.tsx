import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

const RECIPES = [
  { label: "H.264 Compress (CRF 23)", args: "-c:v libx264 -crf 23 -c:a aac" },
  { label: "H.264 Compress (CRF 28)", args: "-c:v libx264 -crf 28 -c:a aac" },
  { label: "VP9 WebM", args: "-c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus" },
  { label: "Extract Audio MP3", args: "-vn -c:a libmp3lame -q:a 2" },
  { label: "Extract Audio WAV", args: "-vn -c:a pcm_s16le" },
  { label: "Scale to 720p", args: "-vf scale=-1:720 -c:v libx264 -c:a aac" },
  { label: "Scale to 480p", args: "-vf scale=-1:480 -c:v libx264 -c:a aac" },
  { label: "GIF (10fps, 320px)", args: "-vf fps=10,scale=320:-1:flags=lanczos" },
  { label: "Remove Metadata", args: "-map_metadata -1 -map 0" },
  { label: "Grayscale", args: "-vf hue=s=0 -c:a copy" },
];

interface RawFFmpegPanelProps {
  video: VideoFile;
}

export default function RawFFmpegPanel({ video }: RawFFmpegPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [command, setCommand] = useState("");
  const [outputExt, setOutputExt] = useState("mp4");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => {
    ffmpeg.init();
  }, []);

  const applyRecipe = (recipeArgs: string) => {
    setCommand(recipeArgs);
    if (recipeArgs.includes("mp3")) setOutputExt("mp3");
    else if (recipeArgs.includes("wav")) setOutputExt("wav");
    else if (recipeArgs.includes("webm") || recipeArgs.includes("vp9")) setOutputExt("webm");
    else if (recipeArgs.includes("gif")) setOutputExt("gif");
    else setOutputExt("mp4");
  };

  const handleRun = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const inputName = "input" + (video.name.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = `output.${outputExt}`;

      await instance.writeFile(inputName, video.data);

      const args = command
        .split(/\s+/)
        .filter(Boolean)
        .concat(["-y", outputName]);

      await instance.exec(["-i", inputName, ...args]);

      const raw = await instance.readFile(outputName);
      const mimeMap: Record<string, string> = {
        mp4: "video/mp4", webm: "video/webm", mkv: "video/x-matroska",
        mov: "video/quicktime", avi: "video/x-msvideo",
        mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac",
        ogg: "audio/ogg", flac: "audio/flac",
        gif: "image/gif", jpg: "image/jpeg", png: "image/png",
      };
      const blob = new Blob([raw as BlobPart], { type: mimeMap[outputExt] || "application/octet-stream" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, command, outputExt]);

  const handleDownload = () => {
    if (outputUrl) {
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = video.name.replace(/\.[^.]+$/, "") + "." + outputExt;
      a.click();
    }
  };

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-surface-400 mb-2">{t("raw.recipes")}</label>
        <div className="flex flex-wrap gap-2">
          {RECIPES.map((r) => (
            <button
              key={r.label}
              onClick={() => applyRecipe(r.args)}
              className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs rounded-lg transition-colors"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-surface-400 mb-1">
          {t("raw.args")}
        </label>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="-c:v libx264 -crf 23 -c:a aac"
          rows={3}
          className="select-input w-full font-mono text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-400 mb-1">{t("raw.output_ext")}</label>
          <select
            value={outputExt}
            onChange={(e) => setOutputExt(e.target.value)}
            className="select-input w-full"
          >
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mkv">MKV</option>
            <option value="mov">MOV</option>
            <option value="avi">AVI</option>
            <option value="gif">GIF</option>
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="aac">AAC</option>
            <option value="ogg">OGG</option>
            <option value="flac">FLAC</option>
            <option value="jpg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>

      {ffmpeg.loading && (
        <div className="text-sm text-surface-400">{t("common.loading_ffmpeg")}</div>
      )}

      <ProcessingOverlay active={ffmpeg.progress > 0 && ffmpeg.progress < 100} progress={ffmpeg.progress} label={t("raw.running")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />

      {ffmpeg.error && (
        <div className="banner-error text-red-300 whitespace-pre-wrap font-mono">
          {ffmpeg.error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={!command.trim() || ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)}
          className="btn-primary"
        >
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("raw.run")}
        </button>
        {outputUrl && (
          <button onClick={handleDownload} className="btn-secondary">
            {t("common.download")}
          </button>
        )}
      </div>
    </div>
  );
}
