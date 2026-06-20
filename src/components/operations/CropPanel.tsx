import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface CropPanelProps {  video: VideoFile;}

export default function CropPanel({ video }: CropPanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();  const { t } = useTranslation();
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);  useEffect(() => { init(); }, [init]);  const handleCrop = useCallback(async () => {    setOutputUrl(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";      const inputName = "input" + ext;      const outputName = "cropped" + ext;      await instance.writeFile(inputName, video.data);      await instance.exec(["-i", inputName, "-vf", `crop=${width}:${height}:${x}:${y}`, "-c:a", "copy", "-y", outputName]);      const raw = await instance.readFile(outputName);      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, width, height, x, y, run]);
  return (    <div className="card space-y-6">      <div className="grid grid-cols-2 gap-4">        <div>          <label className="block text-sm text-surface-400 mb-1">{t("crop.w")}: {width}px</label>          <input type="range" min={16} max={1920} step={2} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="input-range" />        </div>        <div>          <label className="block text-sm text-surface-400 mb-1">{t("crop.h")}: {height}px</label>          <input type="range" min={16} max={1080} step={2} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="input-range" />        </div>        <div>          <label className="block text-sm text-surface-400 mb-1">{t("crop.x")}: {x}px</label>          <input type="range" min={0} max={1000} step={2} value={x} onChange={(e) => setX(Number(e.target.value))} className="input-range" />        </div>        <div>          <label className="block text-sm text-surface-400 mb-1">{t("crop.y")}: {y}px</label>          <input type="range" min={0} max={1000} step={2} value={y} onChange={(e) => setY(Number(e.target.value))} className="input-range" />        </div>      </div>      <ProcessingOverlay active={running} progress={progress} label={t("crop.cropping")} log={log} onCancel={cancel} cancelling={cancelling} />      {error && <div className="banner-error">{error}</div>}      <div className="flex gap-3">        <button onClick={handleCrop} disabled={loading || running} className="btn-primary">          {!loaded ? t("common.load_ffmpeg") : t("crop.crop")}        </button>        {outputUrl && outputBlob && <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + "_cropped.mp4"} filters={[{ name: "MP4 Video", extensions: ["mp4"] }]} label={t("common.download")} />}      </div>    </div>  );}