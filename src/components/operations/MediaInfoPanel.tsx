import { useState, useEffect, useCallback } from "react";
import type { VideoFile } from "../../App";
import { useFFmpeg } from "../../hooks/useFFmpeg";

interface MediaInfoPanelProps {
  video: VideoFile;
}

export default function MediaInfoPanel({ video }: MediaInfoPanelProps) {
  const ffmpeg = useFFmpeg();
  const [ffprobeOutput, setFfprobeOutput] = useState<string | null>(null);

  useEffect(() => {
    ffmpeg.init();
  }, []);

  const analyze = useCallback(async () => {
    await ffmpeg.run(async (instance) => {
      if (!video.data) throw new Error("No video data loaded");

      const inputName = "input" + (video.name.match(/\.[^.]+$/)?.[0] || ".mp4");
      await instance.writeFile(inputName, video.data);

      const logs: string[] = [];
      instance.on("log", ({ message }) => { logs.push(message); });

      await instance.exec(["-hide_banner", "-i", inputName]);
      setFfprobeOutput(logs.join("\n"));
    });
  }, [video.data, video.name]);

  return (
    <div className="card space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="text-gray-500">Filename</span>
          <p className="text-gray-200 font-mono">{video.name}</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="text-gray-500">Size</span>
          <p className="text-gray-200">
            {(video.size / 1024 / 1024).toFixed(2)} MB
            {" ("}
            {(video.size / 1024).toFixed(1)} KB
            {")"}
          </p>
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={ffmpeg.loading}
        className="btn-primary"
      >
        {!ffmpeg.loaded ? "Load FFmpeg & Analyze" : "Analyze Media"}
      </button>

      {ffmpeg.error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">
          {ffmpeg.error}
        </div>
      )}

      {ffprobeOutput && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">FFmpeg Analysis</h3>
          <pre className="bg-gray-950 rounded-lg p-4 text-xs text-gray-400 font-mono overflow-auto max-h-96 whitespace-pre-wrap">
            {ffprobeOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
