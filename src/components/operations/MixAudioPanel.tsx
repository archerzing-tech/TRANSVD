import { useState, useCallback, useEffect, useRef } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface MixAudioPanelProps {
  video: VideoFile;
}

export default function MixAudioPanel({ video }: MixAudioPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [audioFile, setAudioFile] = useState<Uint8Array | null>(null);
  const [audioName, setAudioName] = useState("");
  const [mixVolume, setMixVolume] = useState(0.5);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioName(file.name);
    file.arrayBuffer().then((buf) => setAudioFile(new Uint8Array(buf)));
  };

  const handleMix = useCallback(async () => {
    if (!audioFile) return;
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const vExt = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const aExt = audioName.match(/\.[^.]+$/)?.[0] || ".mp3";
      const vInput = "video" + vExt;
      const aInput = "bgmusic" + aExt;
      const outputName = "mixed" + vExt;

      await instance.writeFile(vInput, video.data);
      await instance.writeFile(aInput, audioFile);
      await instance.exec([
        "-i", vInput,
        "-i", aInput,
        "-filter_complex", `[1:a]volume=${mixVolume.toFixed(2)}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2`,
        "-c:v", "copy",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, audioFile, audioName, mixVolume]);

  return (
    <div className="card space-y-6">
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300">
        <p>Mix background music with your video's original audio track. The background audio is looped to match the video duration.</p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Background Audio</label>
        <input ref={inputRef} type="file" accept="audio/*" onChange={handleAudioFile} className="hidden" />
        <button onClick={() => inputRef.current?.click()} className="btn-secondary text-sm">
          {audioName ? `🎵 ${audioName}` : "Choose Audio File"}
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Background Volume: {Math.round(mixVolume * 100)}%</label>
        <input type="range" min={0} max={1} step={0.05} value={mixVolume} onChange={(e) => setMixVolume(Number(e.target.value))} className="input-range" />
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Mixing audio..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleMix} disabled={!audioFile || ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Mix Audio"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_mixed.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
