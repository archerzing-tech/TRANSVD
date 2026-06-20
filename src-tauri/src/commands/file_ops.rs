use serde::{Deserialize, Serialize};
use std::fs;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

/// Maximum file size we'll read through IPC (200 MB).
/// Larger files should use the Tauri fs plugin directly from JS
/// for efficient Uint8Array transfer without JSON serialization overhead.
const MAX_IPC_FILE_SIZE: u64 = 200 * 1024 * 1024;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub extension: String,
}

/// Get file information from a path string.
///
/// Canonicalizes the path (resolves symlinks) and validates it's a regular file.
#[tauri::command]
pub fn get_file_info(path: String) -> Result<FileInfo, String> {
    // Canonicalize to resolve symlinks and normalize the path.
    // This also validates the path exists (returns Err if not).
    let canonical = fs::canonicalize(&path)
        .map_err(|e| format!("Cannot access file: {}", e))?;

    let metadata = fs::metadata(&canonical)
        .map_err(|e| format!("Cannot read file metadata: {}", e))?;

    // Reject directories — we only handle regular files
    if !metadata.is_file() {
        return Err(format!(
            "Path is not a file: {}",
            canonical.display()
        ));
    }

    Ok(FileInfo {
        name: canonical
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| path.rsplit('/').next()
                .or_else(|| path.rsplit('\\').next())
                .unwrap_or("unknown")
                .to_string()
            ),
        // Return the canonicalized path so the frontend works with a
        // normalized absolute path (symlinks resolved, no `..` segments).
        path: canonical.to_string_lossy().to_string(),
        size: metadata.len(),
        extension: canonical
            .extension()
            .map(|e| e.to_string_lossy().to_string())
            .unwrap_or_default(),
    })
}

/// Open a native file picker dialog for video files.
#[tauri::command]
pub async fn pick_video_file(app: AppHandle) -> Result<Option<FileInfo>, String> {
    let file = app
        .dialog()
        .file()
        .add_filter("Video Files", &["mp4", "webm", "mkv", "mov", "avi", "gif", "ts", "mts", "m2ts", "m3u8"])
        .add_filter("Audio Files", &["mp3", "aac", "wav", "ogg", "flac"])
        .add_filter("All Files", &["*"])
        .blocking_pick_file();

    match file {
        Some(path) => {
            let path_str = path.to_string();
            get_file_info(path_str).map(Some)
        }
        None => Ok(None),
    }
}

/// Read a file's bytes for transfer to the frontend through IPC.
///
/// Files larger than MAX_IPC_FILE_SIZE are rejected to prevent OOM
/// from JSON serialization (Vec<u8> → number[] is ~8x memory overhead).
/// For large files, the frontend should use @tauri-apps/plugin-fs readFile()
/// which returns Uint8Array natively.
#[tauri::command]
pub async fn read_file_bytes(path: String) -> Result<Vec<u8>, String> {
    // Check file size first to avoid OOM
    let metadata = fs::metadata(&path).map_err(|e| format!("Cannot access file: {}", e))?;
    let file_size = metadata.len();

    if file_size > MAX_IPC_FILE_SIZE {
        return Err(format!(
            "File is {} MB — too large for IPC transfer (limit: {} MB).",
            file_size / (1024 * 1024),
            MAX_IPC_FILE_SIZE / (1024 * 1024),
        ));
    }

    fs::read(&path).map_err(|e| format!("Failed to read file: {}", e))
}
