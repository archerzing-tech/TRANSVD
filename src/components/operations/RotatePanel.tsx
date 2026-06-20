import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface RotatePanelProps {  video: VideoFile;}const TRANSFORMS = [  { key: "rotate.cw" as const, vf: "transpose=1" },  { key: "rotate.ccw" as const, vf: "transpose=2" },  { key: "rotate.180" as const, vf: "transpose=1,transpose=1" },  { key: "rotate.hflip" as const, vf: "hflip" },  { key: "rotate.vflip" as const, vf: "vflip" },];
export default function RotatePanel({ video }: RotatePanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();  const { t } = useTranslation();
  const [selected, setSelected] = useState(TRANSFORMS[0]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);  useEffect(() => { init(); }, [init]);  const handleRotate = useCallback(async () => {    setOutputUrl(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";      const inputName = "input" + ext;      const outputName = "transformed" + ext;      await instance.writeFile(inputName, video.data);      await instance.exec(["-i", inputName, "-vf", selected.vf, "-c:a", "copy", "-y", outputName]);      const raw = await instance.readFile(outputName);      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, selected, run]);
  return (    <div className="card space-y-6">      <div className="grid grid-cols-2 gap-2">        {TRANSFORMS.map((tr) => (          <button key={tr.key} onClick={() => setSelected(tr)}            className={`p-4 rounded-lg text-sm font-medium text-center transition-colors ${selected.key === tr.key ? "bg-brand-600 text-white ring-2 ring-brand-400" : "bg-surface-800 text-surface-300 hover:bg-surface-700"}`}>            {t(tr.key)}          </button>        ))}      </div>      <ProcessingOverlay active={running} progress={progress} label={t("rotate.applying")} log={log} onCancel={cancel} cancelling={cancelling} />      {error && <div className="banner-error">{error}</div>}      <div className="flex gap-3">        <button onClick={handleRotate} disabled={loading || running} className="btn-primary">          {!loaded ? t("common.load_ffmpeg") : t("rotate.apply")}        </button>        {outputUrl && outputBlob && <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + "_transformed.mp4"} filters={[{ name: "MP4 Video", extensions: ["mp4"] }]} label={t("common.download")} />}      </div>    </div>  );}