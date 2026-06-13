import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface AudioExtractPanelProps {
  video: VideoFile;
}

const FORMATS = [
  { ext: "mp3", mime: "audio/mpeg", label: "MP3", codec: "libmp3lame", args: ["-q:a", "2"] },
  { ext: "aac", mime: "audio/aac", label: "AAC", codec: "aac", args: [] },
  { ext: "wav", mime: "audio/wav", label: "WAV", codec: "pcm_s16le", args: [] },
  { ext: "ogg", mime: "audio/ogg", label: "OGG", codec: "libvorbis", args: ["-q:a", "4"] },
  { ext: "flac", mime: "audio/flac", label: "FLAC", codec: "flac", args: [] },
];

export default function AudioExtractPanel({ video }: AudioExtractPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [format, setFormat] = useState(FORMATS[0]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleExtract = useCallback(async () => {
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = `audio.${format.ext}`;

      await instance.writeFile(inputName, video.data);
      await instance.exec(["-i", inputName, "-vn", "-c:a", format.codec, ...format.args, "-y", outputName]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: format.mime });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, format]);

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Output Format</label>
        <div className="flex gap-2">
          {FORMATS.map((f) => (
            <button key={f.ext} onClick={() => setFormat(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format.ext === f.ext ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Extracting audio..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleExtract} disabled={ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Extract Audio"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}.${format.ext}`} className="btn-secondary">Download {format.label}</a>}
      </div>
    </div>
  );
}
