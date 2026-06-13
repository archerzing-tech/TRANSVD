/**
 * Save file utility – uses Tauri native save dialog when available,
 * falls back to browser download in dev/web mode.
 */

type SaveOptions = {
  /** Suggested filename */
  defaultName: string;
  /** File extension filters */
  filters?: { name: string; extensions: string[] }[];
};

/**
 * Save a blob to the user's chosen location.
 *
 * In Tauri: opens native "Save As" dialog → writes file to chosen path.
 * In browser: triggers a standard download.
 */
export async function saveBlob(
  blob: Blob,
  { defaultName, filters = [] }: SaveOptions,
): Promise<void> {
  // Try Tauri native dialog first
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");

    const path = await save({
      defaultPath: defaultName,
      filters: filters.length > 0
        ? filters
        : [{ name: "File", extensions: [defaultName.split(".").pop() || "*"] }],
    });

    if (!path) return; // user cancelled

    const buf = await blob.arrayBuffer();
    await writeFile(path, new Uint8Array(buf));
    return;
  } catch {
    // Not in Tauri context or dialog unavailable – fallback to browser download
  }

  // Browser fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultName;
  a.click();
  URL.revokeObjectURL(url);
}
