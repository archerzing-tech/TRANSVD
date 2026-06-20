import { useState, useCallback, useEffect } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface SpeedPanelProps {  video: VideoFile;}

export default function SpeedPanel({ video }: SpeedPanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();  const { t } = useTranslation();
  const [speed, setSpeed] = useState(1.0);
  const [preservePitch, setPreservePitch] = useState(true);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);  useEffect(() => { init(); }, [init]);  const handleSpeed = useCallback(async () => {    setOutputUrl(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";      const inputName = "input" + ext;      const outputName = "speed" + ext;      await instance.writeFile(inputName, video.data);      const setpts = 1 / speed;
      if (preservePitch) {
        // Chain atempo filters to support speeds outside [0.5, 2.0]
        // atempo only accepts 0.5–2.0, so decompose into a product
        // e.g. speed=3.0 → atempo=2.0,atempo=1.5
        const atempoFilters: string[] = [];
        let remaining = speed;
        while (remaining > 2.0) {
          atempoFilters.push("atempo=2.0");
          remaining /= 2.0;
        }
        while (remaining < 0.5) {
          atempoFilters.push("atempo=0.5");
          remaining /= 0.5;
        }
        if (Math.abs(remaining - 1.0) > 0.001) {
          atempoFilters.push(`atempo=${remaining.toFixed(2)}`);
        }
        const atempo = atempoFilters.join(",");        await instance.exec([          "-i", inputName,          "-c:v", "libx264",          "-vf", `setpts=${setpts.toFixed(2)}*PTS`,          "-af", atempo,          "-y", outputName,        ]);      } else {        await instance.exec([          "-i", inputName,          "-c:v", "libx264",          "-vf", `setpts=${setpts.toFixed(2)}*PTS`,          "-an",          "-y", outputName,        ]);      }      const raw = await instance.readFile(outputName);      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });
      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, speed, preservePitch, run]);
  const speedLabel = speed < 1 ? t("speed.slower") : speed > 1 ? t("speed.faster") : t("speed.normal");  return (    <div className="card space-y-6">      <div>        <label className="block text-sm text-surface-400 mb-1">{t("speed.speed")}: {speed.toFixed(2)}x ({speedLabel})</label>        <input type="range" min={0.25} max={4} step={0.05} value={speed}          onChange={(e) => setSpeed(Number(e.target.value))} className="input-range" />        <div className="flex justify-between text-xs text-surface-500 mt-1">          <span>0.25x</span><span>1x</span><span>4x</span>        </div>      </div>      <label className="flex items-center gap-2 text-sm text-surface-400">        <input type="checkbox" checked={preservePitch} onChange={(e) => setPreservePitch(e.target.checked)}          className="rounded bg-surface-800 border-surface-700" />        {t("speed.preserve")}      </label>      <ProcessingOverlay active={running} progress={progress} label={t("speed.changing")} log={log} onCancel={cancel} cancelling={cancelling} />      {error && <div className="banner-error">{error}</div>}      <div className="flex gap-3">        <button onClick={handleSpeed} disabled={loading || running} className="btn-primary">          {!loaded ? t("common.load_ffmpeg") : t("speed.change")}        </button>        {outputUrl && outputBlob && <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + `_${speed.toFixed(2)}x.mp4`} filters={[{ name: "MP4 Video", extensions: ["mp4"] }]} label={t("common.download")} />}      </div>    </div>  );}