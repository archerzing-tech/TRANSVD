import { useState, useCallback, useEffect, useRef } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface MixAudioPanelProps {  video: VideoFile;}

export default function MixAudioPanel({ video }: MixAudioPanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();  const { t } = useTranslation();
  const [audioFile, setAudioFile] = useState<Uint8Array | null>(null);
  const [audioName, setAudioName] = useState("");
  const [mixVolume, setMixVolume] = useState(0.5);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);  const inputRef = useRef<HTMLInputElement>(null);  useEffect(() => { init(); }, [init]);  const handleAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {    const file = e.target.files?.[0];    if (!file) return;    setAudioName(file.name);    file.arrayBuffer().then((buf) => setAudioFile(new Uint8Array(buf)));  };  const handleMix = useCallback(async () => {    if (!audioFile) return;    setOutputUrl(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const vExt = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";      const aExt = audioName.match(/\.[^.]+$/)?.[0] || ".mp3";      const vInput = "video" + vExt;      const aInput = "bgmusic" + aExt;      const outputName = "mixed" + vExt;      await instance.writeFile(vInput, video.data);      await instance.writeFile(aInput, audioFile);      await instance.exec([        "-i", vInput,        "-i", aInput,        "-filter_complex", `[1:a]volume=${mixVolume.toFixed(2)}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2`,        "-c:v", "copy",        "-y", outputName,      ]);      const raw = await instance.readFile(outputName);      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, audioFile, audioName, mixVolume, run]);
  return (    <div className="card space-y-6">      <div className="bg-surface-800 rounded-lg p-4 text-sm text-surface-300">        <p>{t("mix.desc")}</p>      </div>      <div>        <label className="block text-sm text-surface-400 mb-2">{t("mix.audio_label")}</label>        <input ref={inputRef} type="file" accept="audio/*" onChange={handleAudioFile} className="hidden" />        <button onClick={() => inputRef.current?.click()} className="btn-secondary text-sm">          {audioName ? audioName : t("mix.choose")}        </button>      </div>      <div>        <label className="block text-sm text-surface-400 mb-1">{t("mix.volume")}: {Math.round(mixVolume * 100)}%</label>        <input type="range" min={0} max={1} step={0.05} value={mixVolume} onChange={(e) => setMixVolume(Number(e.target.value))} className="input-range" />      </div>      <ProcessingOverlay active={running} progress={progress} label={t("mix.mixing")} log={log} onCancel={cancel} cancelling={cancelling} />      {error && <div className="banner-error">{error}</div>}      <div className="flex gap-3">        <button onClick={handleMix} disabled={!audioFile || loading || running} className="btn-primary">          {!loaded ? t("common.load_ffmpeg") : t("mix.mix")}        </button>        {outputUrl && outputBlob && <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + "_mixed.mp4"} filters={[{ name: "MP4 Video", extensions: ["mp4"] }]} label={t("common.download")} />}      </div>    </div>  );}