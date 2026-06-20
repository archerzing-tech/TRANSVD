import { useState, useEffect, useCallback } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
interface MediaInfoPanelProps {  video: VideoFile;}

export default function MediaInfoPanel({ video }: MediaInfoPanelProps) {
  const { init, run, progress, loaded, loading, error, running } = useFFmpeg();  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [ffprobeOutput, setFfprobeOutput] = useState<string | null>(null);  useEffect(() => {
    init();
  }, [init]);
  const analyze = useCallback(async () => {    setProcessing(true);    setFfprobeOutput(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const inputName = "input" + (video.name.match(/\.[^.]+$/)?.[0] || ".mp4");      await instance.writeFile(inputName, video.data);      const logs: string[] = [];      instance.on("log", ({ message }) => { logs.push(message); });      await instance.exec(["-hide_banner", "-i", inputName]);      setFfprobeOutput(logs.join("\n"));    });    setProcessing(false);  }, [video.data, video.name, run]);
  const isWorking = processing || running;  return (    <div className="card space-y-6">      <div className="grid grid-cols-2 gap-4 text-sm">        <div className="p-3 bg-surface-800 rounded-lg">          <span className="text-surface-500">{t("info.filename")}</span>          <p className="text-surface-200 font-mono">{video.name}</p>        </div>        <div className="p-3 bg-surface-800 rounded-lg">          <span className="text-surface-500">{t("common.size")}</span>          <p className="text-surface-200">            {(video.size / 1024 / 1024).toFixed(2)} MB            {" ("}            {(video.size / 1024).toFixed(1)} KB            {")"}          </p>        </div>      </div>      <button        onClick={analyze}        disabled={loading || isWorking}        className="btn-primary"      >        {isWorking ? t("common.processing") : !loaded ? t("info.load_and_analyze") : t("info.analyze")}      </button>      {isWorking && <ProcessingOverlay active={running || processing} progress={progress || 50} label={t("info.analyze")} />}      {error && (        <div className="banner-error">          {error}        </div>      )}      {ffprobeOutput && (        <div>          <h3 className="text-sm font-medium text-surface-300 mb-2">{t("info.output")}</h3>          <pre className="bg-surface-950 rounded-lg p-4 text-xs text-surface-400 font-mono overflow-auto max-h-96 whitespace-pre-wrap">            {ffprobeOutput}          </pre>        </div>      )}    </div>  );}