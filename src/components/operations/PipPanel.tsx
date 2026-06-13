import { useState, useCallback, useEffect, useRef } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface PipPanelProps {
  video: VideoFile;
}

export default function PipPanel({ video }: PipPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [pipVideo, setPipVideo] = useState<Uint8Array | null>(null);
  const [pipName, setPipName] = useState("");
  const [pipScale, setPipScale] = useState(0.3);
  const [pipPosition, setPipPosition] = useState<"tl" | "tr" | "bl" | "br">("br");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handlePipFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPipName(file.name);
    file.arrayBuffer().then((buf) => setPipVideo(new Uint8Array(buf)));
  };

  const positionMap = {
    tl: "10:10",
    tr: "main_w-overlay_w-10:10",
    bl: "10:main_h-overlay_h-10",
    br: "main_w-overlay_w-10:main_h-overlay_h-10",
  };

  const handlePip = useCallback(async () => {
    if (!pipVideo) return;
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const mainInput = "main" + ext;
      const pipInput = "pip" + (pipName.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = "pip.mp4";

      await instance.writeFile(mainInput, video.data);
      await instance.writeFile(pipInput, pipVideo);

      const pipW = Math.round(1280 * pipScale);
      const pipH = Math.round(720 * pipScale);

      await instance.exec([
        "-i", mainInput,
        "-i", pipInput,
        "-filter_complex",
        `[1:v]scale=${pipW}:${pipH}[pip];[0:v][pip]overlay=${positionMap[pipPosition]}:format=auto`,
        "-c:a", "copy",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, pipVideo, pipName, pipScale, pipPosition]);

  return (
    <div className="card space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 p-3 bg-gray-800 rounded-lg text-center">
          <p className="text-xs text-gray-500">Main Video</p>
          <p className="text-sm text-gray-200 mt-1">{video.name}</p>
        </div>
        <span className="text-gray-500 text-xl">🖥️</span>
        <div className="flex-1 p-3 bg-gray-800 rounded-lg text-center">
          <p className="text-xs text-gray-500">PiP Video (inset)</p>
          <input ref={inputRef} type="file" accept="video/*" onChange={handlePipFile} className="hidden" />
          <button onClick={() => inputRef.current?.click()} className="text-sm text-brand-400 hover:text-brand-300 mt-1">
            {pipName ? `🎬 ${pipName}` : "Choose File"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Inset Size: {Math.round(pipScale * 100)}%</label>
        <input type="range" min={0.1} max={0.5} step={0.05} value={pipScale} onChange={(e) => setPipScale(Number(e.target.value))} className="input-range" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Inset Position</label>
        <div className="grid grid-cols-2 gap-2">
          {([["tl", "Top Left"], ["tr", "Top Right"], ["bl", "Bottom Left"], ["br", "Bottom Right"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setPipPosition(key)}
              className={`px-4 py-2 rounded-lg text-sm ${pipPosition === key ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Creating PiP..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handlePip} disabled={!pipVideo || ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Create PiP"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_pip.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
