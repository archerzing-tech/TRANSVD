import { useState, useCallback } from "react";
import { saveBlob } from "../../lib/save";
import { IconCheck } from "../../lib/icons";

interface DownloadButtonProps {
  blob: Blob;
  filename: string;
  label?: string;
  filters?: { name: string; extensions: string[] }[];
  className?: string;
}

export default function DownloadButton({
  blob,
  filename,
  label = "Save As",
  filters,
  className = "btn-secondary btn-pill",
}: DownloadButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleClick = useCallback(async () => {
    setSaving(true);
    try {
      await saveBlob(blob, {
        defaultName: filename,
        filters,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // saveBlob already handles errors internally
    } finally {
      setSaving(false);
    }
  }, [blob, filename, filters]);

  return (
    <div className="relative inline-flex flex-col items-start">
      <button
        onClick={handleClick}
        disabled={saving}
        className={className}
      >
        {saving ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Saving...
          </span>
        ) : label}
      </button>
      {saved && (
        <div
          className="mt-2 flex items-center gap-1.5 text-xs text-status-green"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <IconCheck size={12} />
          Saved successfully
        </div>
      )}
    </div>
  );
}
