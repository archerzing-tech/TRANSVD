use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub extension: String,
}

/// Get file information from a path string.
#[tauri::command]
pub fn get_file_info(path: String) -> Result<FileInfo, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("File does not exist".into());
    }

    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;

    Ok(FileInfo {
        name: p
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(),
        path: path.clone(),
        size: metadata.len(),
        extension: p
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(),
    })
}

/// Open a native file picker dialog for video files.
#[tauri::command]
pub async fn pick_video_file(app: AppHandle) -> Result<Option<FileInfo>, String> {
    let file = app
        .dialog()
        .file()
        .add_filter("Video Files", &["mp4", "webm", "mkv", "mov", "avi", "gif", "ts", "mts", "m2ts"])
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

/// Read a file's bytes into a base64-encoded string for transfer to the frontend.
#[tauri::command]
pub async fn read_file_bytes(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| e.to_string())
}
