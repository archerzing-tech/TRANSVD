import { useState, useCallback, useEffect, useRef } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface OverlayPanelProps {
  video: VideoFile;
}

const POSITIONS = [
  { label: "Top Left", value: "10:10" },
  { label: "Top Right", value: "main_w-overlay_w-10:10" },
  { label: "Bottom Left", value: "10:main_h-overlay_h-10" },
  { label: "Bottom Right", value: "main_w-overlay_w-10:main_h-overlay_h-10" },
  { label: "Center", value: "(main_w-overlay_w)/2:(main_h-overlay_h)/2" },
];

export default function OverlayPanel({ video }: OverlayPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [logoFile, setLogoFile] = useState<Uint8Array | null>(null);
  const [logoName, setLogoName] = useState("");
  const [position, setPosition] = useState(POSITIONS[3]);
  const [scale, setScale] = useState(0.15);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoName(file.name);
    file.arrayBuffer().then((buf) => setLogoFile(new Uint8Array(buf)));
  };

  const handleOverlay = useCallback(async () => {
    if (!logoFile) return;
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const logoInputName = "logo." + (logoName.match(/\.(\w+)$/)?.[1] || "png");
      const outputName = "watermarked" + ext;

      await instance.writeFile(inputName, video.data);
      await instance.writeFile(logoInputName, logoFile);

      const scaleFilter = `scale=iw*${scale}:-1`;
      await instance.exec([
        "-i", inputName,
        "-i", logoInputName,
        "-filter_complex", `[1:v]${scaleFilter}[logo];[0:v][logo]overlay=${position.value}`,
        "-c:a", "copy",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, logoFile, logoName, position, scale]);

  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Logo / Watermark Image</label>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
        <button onClick={() => inputRef.current?.click()} className="btn-secondary text-sm">
          {logoName ? `🖼️ ${logoName}` : "Choose Image"}
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Position</label>
        <div className="grid grid-cols-3 gap-2">
          {POSITIONS.map((p) => (
            <button key={p.label} onClick={() => setPosition(p)}
              className={`px-3 py-2 rounded-lg text-xs ${position.label === p.label ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Logo Size: {Math.round(scale * 100)}%</label>
        <input type="range" min={0.05} max={0.5} step={0.05} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="input-range" />
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Applying overlay..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleOverlay} disabled={!logoFile || ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Apply Watermark"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_watermarked.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
