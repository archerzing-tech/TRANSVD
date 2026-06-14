import { useState, useCallback, useEffect, useRef } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";

interface ConcatPanelProps {
  video: VideoFile;
}

export default function ConcatPanel({ video }: ConcatPanelProps) {
  const ffmpeg = useFFmpeg();
  const { t } = useTranslation();
  const [secondVideo, setSecondVideo] = useState<Uint8Array | null>(null);
  const [secondName, setSecondName] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { ffmpeg.init(); }, []);

  const handleSecondFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSecondName(file.name);
    file.arrayBuffer().then((buf) => setSecondVideo(new Uint8Array(buf)));
  };

  const handleConcat = useCallback(async () => {
    if (!secondVideo) return;
    setOutputUrl(null);
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      const v1Input = "video1" + ext;
      const v2Input = "video2" + (secondName.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = "concatenated" + ext;

      await instance.writeFile(v1Input, video.data);
      await instance.writeFile(v2Input, secondVideo);

      const listContent = `file '${v1Input}'\nfile '${v2Input}'\n`;
      await instance.writeFile("filelist.txt", new TextEncoder().encode(listContent));

      await instance.exec([
        "-f", "concat",
        "-safe", "0",
        "-i", "filelist.txt",
        "-c", "copy",
        "-y", outputName,
      ]);

      const raw = await instance.readFile(outputName);
      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, secondVideo, secondName]);

  return (
    <div className="card space-y-6">
      <div className="bg-surface-800 rounded-lg p-4 text-sm text-surface-300">
        <p>{t("concat.desc")}</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 p-3 bg-surface-800 rounded-lg text-center">
          <p className="text-xs text-surface-500">{t("concat.first")}</p>
          <p className="text-sm text-surface-200 mt-1">{video.name}</p>
        </div>
        <span className="text-surface-500 text-xl">+</span>
        <div className="flex-1 p-3 bg-surface-800 rounded-lg text-center">
          <p className="text-xs text-surface-500">{t("concat.second")}</p>
          <input ref={inputRef} type="file" accept="video/*" onChange={handleSecondFile} className="hidden" />
          <button onClick={() => inputRef.current?.click()} className="text-sm text-brand-400 hover:text-brand-300 mt-1">
            {secondName ? secondName : t("concat.choose")}
          </button>
        </div>
      </div>

      <ProcessingOverlay active={ffmpeg.progress > 0} progress={ffmpeg.progress} label={t("concat.concatenating")} log={ffmpeg.log} onCancel={ffmpeg.cancel} cancelling={ffmpeg.cancelling} />
      {ffmpeg.error && <div className="banner-error">{ffmpeg.error}</div>}

      <div className="flex gap-3">
        <button onClick={handleConcat} disabled={!secondVideo || ffmpeg.loading || (ffmpeg.progress > 0 && ffmpeg.progress < 100)} className="btn-primary">
          {!ffmpeg.loaded ? t("common.load_ffmpeg") : t("concat.join")}
        </button>
        {outputUrl && <a href={outputUrl} download={`${video.name.replace(/\.[^.]+$/, "")}_concat.mp4`} className="btn-secondary">{t("common.download")}</a>}
      </div>
    </div>
  );
}
