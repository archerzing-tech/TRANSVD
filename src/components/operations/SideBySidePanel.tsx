import { useState, useCallback, useEffect, useRef } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProgressBar from "../common/ProgressBar";

interface SideBySidePanelProps {
  video: VideoFile;
}

export default function SideBySidePanel({ video }: SideBySidePanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [secondVideo, setSecondVideo] = useState<Uint8Array | null>(null);
  const [secondName, setSecondName] = useState("");
  const [layout, setLayout] = useState<"hstack" | "vstack">("hstack");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleSecondFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSecondName(file.name);
    file.arrayBuffer().then((buf) => setSecondVideo(new Uint8Array(buf)));
  };

  const handleCompare = useCallback(async () => {
    if (!secondVideo) return;
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const v1Input = "video1" + ext;
      const v2Input = "video2" + (secondName.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = "comparison.mp4";

      await instance.writeFile(v1Input, video.data);
      await instance.writeFile(v2Input, secondVideo);

      const filter = layout === "hstack"
        ? "hstack=inputs=2"
        : "vstack=inputs=2";

      // Scale both to same height first for hstack, or same width for vstack
      const scaleFilter = layout === "hstack"
        ? `[0:v]scale=-1:480[v0];[1:v]scale=-1:480[v1];[v0][v1]${filter}`
        : `[0:v]scale=640:-1[v0];[1:v]scale=640:-1[v1];[v0][v1]${filter}`;

      await instance.exec([
        "-i", v1Input,
        "-i", v2Input,
        "-filter_complex", scaleFilter,
        "-c:a", "aac",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, secondVideo, secondName, layout]);

  return (
    <div className="card space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 p-3 bg-gray-800 rounded-lg text-center">
          <p className="text-xs text-gray-500">First Video</p>
          <p className="text-sm text-gray-200 mt-1">{video.name}</p>
        </div>
        <span className="text-gray-500 text-xl">{layout === "hstack" ? "‖" : "≡"}</span>
        <div className="flex-1 p-3 bg-gray-800 rounded-lg text-center">
          <p className="text-xs text-gray-500">Second Video</p>
          <input ref={inputRef} type="file" accept="video/*" onChange={handleSecondFile} className="hidden" />
          <button onClick={() => inputRef.current?.click()} className="text-sm text-brand-400 hover:text-brand-300 mt-1">
            {secondName ? `🎬 ${secondName}` : "Choose File"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={() => setLayout("hstack")} className={`px-4 py-2 rounded-lg text-sm ${layout === "hstack" ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-300"}`}>
          Side by Side
        </button>
        <button onClick={() => setLayout("vstack")} className={`px-4 py-2 rounded-lg text-sm ${layout === "vstack" ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-300"}`}>
          Top / Bottom
        </button>
      </div>

      {ffmpeg.progress > 0 && ffmpeg.progress < 100 && <ProgressBar progress={ffmpeg.progress} label="Creating comparison..." />}
      {ffmpeg.error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleCompare} disabled={!secondVideo || ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : "Create Comparison"}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_vs_${secondName}`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
