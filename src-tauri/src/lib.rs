mod commands;

#[cfg(debug_assertions)]
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| {
            #[cfg(debug_assertions)]
            if let Some(window) = _app.get_webview_window("main") {
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::file_ops::get_file_info,
            commands::file_ops::pick_video_file,
            commands::file_ops::read_file_bytes,
            commands::system::get_app_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
