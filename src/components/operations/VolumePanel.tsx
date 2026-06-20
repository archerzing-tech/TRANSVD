import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface VolumePanelProps {  video: VideoFile;}

export default function VolumePanel({ video }: VolumePanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();  const { t } = useTranslation();
  const [volume, setVolume] = useState(1.0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);  useEffect(() => { init(); }, [init]);  const handleVolume = useCallback(async () => {    setOutputUrl(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";      const inputName = "input" + ext;      const outputName = "volume" + ext;      await instance.writeFile(inputName, video.data);      await instance.exec(["-i", inputName, "-af", `volume=${volume.toFixed(2)}`, "-c:v", "copy", "-y", outputName]);      const raw = await instance.readFile(outputName);      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, volume, run]);
  return (    <div className="card space-y-6">      <div>        <label className="block text-sm text-surface-400 mb-1">{t("volume.volume")}: {(volume * 100).toFixed(0)}%</label>        <input type="range" min={0} max={4} step={0.1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="input-range" />        <div className="flex justify-between text-xs text-surface-500 mt-1">          <span>0% ({t("volume.mute")})</span><span>100%</span><span>400%</span>        </div>        <p className="text-xs text-surface-600 mt-1">{t("volume.note")}</p>      </div>      <ProcessingOverlay active={running} progress={progress} label={t("volume.adjusting")} log={log} onCancel={cancel} cancelling={cancelling} />      {error && <div className="banner-error">{error}</div>}      <div className="flex gap-3">        <button onClick={handleVolume} disabled={loading || running} className="btn-primary">          {!loaded ? t("common.load_ffmpeg") : t("volume.adjust")}        </button>        {outputUrl && outputBlob && <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + "_volume.mp4"} filters={[{ name: "MP4 Video", extensions: ["mp4"] }]} label={t("common.download")} />}      </div>    </div>  );}