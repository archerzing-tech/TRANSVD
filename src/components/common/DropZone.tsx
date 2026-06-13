import { useState, useRef, useCallback } from "react";
import type { VideoFile } from "../../App";
import { useTranslation } from "../../context/LanguageContext";

interface DropZoneProps {
  onFileSelected: (file: VideoFile) => void;
}

export default function DropZone({ onFileSelected }: DropZoneProps) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mkv|mov|avi|gif|ts|mts|m2ts|mp3|aac|wav|ogg|flac)$/i)) {
        return;
      }
      setLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        onFileSelected({
          name: file.name,
          path: file.name,
          size: file.size,
          data: new Uint8Array(buffer),
        });
      } catch (err) {
        console.error("Failed to read file:", err);
      } finally {
        setLoading(false);
      }
    },
    [onFileSelected],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-2xl p-16 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all
          ${
            dragging
              ? "border-brand-500 bg-brand-500/10 scale-[1.02]"
              : "border-gray-700 hover:border-gray-500 hover:bg-gray-900"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*,.mp4,.webm,.mkv,.mov,.avi,.gif,.ts,.mts,.m2ts,.mp3,.aac,.wav,.ogg,.flac"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {loading ? (
          <div className="text-gray-400">
            <div className="animate-spin w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg">{t("dz.loading_file")}</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">
              {dragging ? "📂" : "🎬"}
            </div>
            <p className="text-xl text-gray-300 font-medium mb-2">
              {dragging ? "📂" : t("dz.title")}
            </p>
            <p className="text-sm text-gray-500">
              {t("dz.hint")}
            </p>
            <p className="text-xs text-gray-600 mt-4">
              {t("dz.privacy")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
