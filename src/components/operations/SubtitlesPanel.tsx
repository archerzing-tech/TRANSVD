import { useState, useCallback, useEffect, useRef } from "react";
import type { VideoFile } from "../../types";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import { useTranslation } from "../../context/LanguageContext";
import ProcessingOverlay from "../common/ProcessingOverlay";
import DownloadButton from "../common/DownloadButton";

interface SubtitlesPanelProps {  video: VideoFile;}

export default function SubtitlesPanel({ video }: SubtitlesPanelProps) {
  const { init, run, cancel, progress, log, loaded, loading, error, cancelling, running } = useFFmpeg();  const { t } = useTranslation();
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<Uint8Array | null>(null);
  const [subtitleName, setSubtitleName] = useState("");  const inputRef = useRef<HTMLInputElement>(null);  useEffect(() => { init(); }, [init]);  const handleSubFile = (e: React.ChangeEvent<HTMLInputElement>) => {    const file = e.target.files?.[0];    if (!file) return;    setSubtitleName(file.name);    file.arrayBuffer().then((buf) => setSubtitleFile(new Uint8Array(buf)));  };  const handleEmbed = useCallback(async () => {    if (!subtitleFile) return;    setOutputUrl(null);    await run(async (instance) => {      if (!video.data) throw new Error("No video data loaded");      const ext = video.name.match(/\.[^.]+$/)?.[0] || ".mp4";      const inputName = "input" + ext;      const subInputName = "subtitles." + (subtitleName.match(/\.(\w+)$/)?.[1] || "srt");      const outputName = "withsubs" + ext;      await instance.writeFile(inputName, video.data);      await instance.writeFile(subInputName, subtitleFile);      await instance.exec(["-i", inputName, "-i", subInputName, "-c", "copy", "-c:s", "mov_text", "-y", outputName]);      const raw = await instance.readFile(outputName);      const blob = new Blob([raw as BlobPart], { type: "video/mp4" });      setOutputBlob(blob);
      setOutputUrl(URL.createObjectURL(blob));
    });
  }, [video.data, video.name, subtitleFile, subtitleName, run]);
  return (    <div className="card space-y-6">      <div className="bg-surface-800 rounded-lg p-4 text-sm text-surface-300">        <p>{t("sub.desc")}</p>      </div>      <div>        <label className="block text-sm text-surface-400 mb-2">{t("sub.file_label")}</label>        <input ref={inputRef} type="file" accept=".srt,.vtt,.ass" onChange={handleSubFile} className="hidden" />        <button onClick={() => inputRef.current?.click()} className="btn-secondary text-sm">          {subtitleName ? `📝 ${subtitleName}` : t("sub.choose")}        </button>        {!subtitleName && <p className="text-xs text-surface-500 mt-1">{t("sub.supported")}</p>}      </div>      <ProcessingOverlay active={running} progress={progress} label={t("sub.embedding")} log={log} onCancel={cancel} cancelling={cancelling} />      {error && <div className="banner-error">{error}</div>}      <div className="flex gap-3">        <button onClick={handleEmbed} disabled={!subtitleFile || loading || running} className="btn-primary">          {!loaded ? t("common.load_ffmpeg") : t("sub.embed")}        </button>        {outputUrl && outputBlob && <DownloadButton blob={outputBlob} filename={video.name.replace(/\.[^.]+$/, "") + "_subs.mp4"} filters={[{ name: "MP4 Video", extensions: ["mp4"] }]} label={t("common.download")} />}      </div>    </div>  );}