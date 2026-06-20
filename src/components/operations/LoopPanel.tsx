import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface LoopPanelProps {  video: VideoFile;}

export default function LoopPanel({ video }: LoopPanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();  const { t } = useTranslation();
  const [count, setCount] = useState(3);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);  useEffect(() => { init(); }, [init]);  const handleLoop = useCallback(async () => {    setOutputUrl(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";      const inputName = "input" + ext;      const outputName = "looped" + ext;      await instance.writeFile(inputName, video.data);      await instance.exec([        "-stream_loop", String(count - 1),        "-i", inputName,        "-c", "copy",        "-y", outputName,      ]);      const raw = await instance.readFile(outputName);      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, count, run]);
  return (    <div className="card space-y-6">      <div>        <label className="block text-sm text-surface-400 mb-1">{t("loop.count")}: {count}x</label>        <input type="range" min={2} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="input-range" />        <div className="flex justify-between text-xs text-surface-500 mt-1">          <span>2x</span><span>25x</span><span>50x</span>        </div>      </div>      <ProcessingOverlay active={running} progress={progress} label={t("loop.looping")} log={log} onCancel={cancel} cancelling={cancelling} />      {error && <div className="banner-error">{error}</div>}      <div className="flex gap-3">        <button onClick={handleLoop} disabled={loading || running} className="btn-primary">          {!loaded ? t("common.load_ffmpeg") : `${t("loop.loop")} ${count}x`}        </button>        {outputUrl && outputBlob && <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + "_looped.mp4"} filters={[{ name: "MP4 Video", extensions: ["mp4"] }]} label={t("common.download")} />}      </div>    </div>  );}