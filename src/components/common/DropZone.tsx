import { useState, useRef, useCallback } from "react";
import type { VideoFile } from "../../App";
import { useTranslation } from "../../context/LanguageContext";
import { IconFilm, IconPlus } from "../../lib/icons";

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
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        relative w-full p-12 rounded-2xl text-center cursor-pointer
        border-2 border-dashed transition-all duration-300
        ${dragging
          ? "border-brand-500/70 bg-brand-500/[0.06] scale-[1.02] shadow-lg shadow-brand-500/10"
          : "border-surface-800 hover:border-surface-700/70 hover:bg-surface-900/50"
        }
      `}
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
        <div className="text-surface-500">
          <div className="relative mx-auto mb-5 w-16 h-16">
            <div className="absolute inset-0 rounded-2xl border-2 border-brand-500/30 animate-pulse" />
            <div className="absolute inset-1 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <IconFilm size={26} className="text-brand-500/60" />
            </div>
          </div>
          <p className="text-base font-medium text-surface-300">{t("dz.loading_file")}</p>
        </div>
      ) : (
        <>
          {/* Icon */}
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className={`
              absolute inset-0 rounded-2xl transition-all duration-300
              ${dragging ? "bg-brand-500/10 scale-110" : "bg-surface-800"}
            `} />
            <div className="absolute inset-0 flex items-center justify-center">
              {dragging ? (
                <IconPlus size={32} className="text-brand-500" />
              ) : (
                <IconFilm size={32} className="text-surface-500" />
              )}
            </div>
            {/* Decorative corner dots */}
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-surface-700" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-surface-700" />
          </div>

          {/* Text */}
          <p className="text-lg text-surface-200 font-medium mb-2">
            {dragging ? t("dz.title") : t("dz.title")}
          </p>
          <p className="text-sm text-surface-500">
            {t("dz.hint")}
          </p>
          <p className="text-xs text-surface-600 mt-6 max-w-xs mx-auto leading-relaxed">
            {t("dz.privacy")}
          </p>

          {/* Supported formats bar */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {["MP4", "WebM", "MKV", "MOV", "AVI", "GIF", "MP3"].map((fmt) => (
              <span key={fmt} className="px-2 py-0.5 text-[10px] font-mono text-surface-600 bg-surface-850 rounded-md border border-surface-800/50">
                {fmt}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
