# TRANSVD — Desktop Video Editor

> **Desktop port of [ffmpeg-webCLI](https://github.com/tejaswigowda/ffmpeg-webCLI)** — a browser-based video editor powered by `@ffmpeg/ffmpeg` (WebAssembly).

TRANSVD wraps the ffmpeg-webCLI experience in a native **Tauri 2.x** desktop application for **Windows 10+**, adding native OS integration (file dialogs, drag-and-drop, file system access) while keeping the core ffmpeg.wasm processing engine. All video processing happens **client-side** — zero server uploads.

![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131?logo=tauri)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Rust](https://img.shields.io/badge/Rust-1.85+-DEA584?logo=rust)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Trim** — Cut video segments with precise start/end timestamps
- **Convert** — Transcode between formats (MP4, WebM, AVI, GIF, MKV, MOV, and more)
- **Compress** — Reduce file size via codec and quality settings
- **GIF Maker** — Convert video clips to animated GIFs with FPS and resolution control
- **Merge** — Join multiple video files into one
- **Extract Audio** — Rip audio tracks as MP3, AAC, WAV, FLAC, or Opus
- **Speed** — Adjust playback speed (0.25×–4×)
- **Crop** — Crop video dimensions by region
- **Resize** — Scale video to custom resolution
- **Rotate** — Rotate or flip video orientation
- **Metadata** — View and inspect media file metadata

All operations run locally via **ffmpeg.wasm** — no files leave your machine.

> 📖 **完整使用指南请查看 [USAGE.md](./USAGE.md)** — 包含每个操作的详细参数说明、界面截图、高级功能和常见问题。

## Screenshots

> *(Coming soon)*

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | [Tauri 2.x](https://v2.tauri.app/) (Rust) |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| FFmpeg Engine | `@ffmpeg/ffmpeg` v0.12 (WebAssembly) |
| Processing | Web Worker (Comlink-style structured clone) |
| Routing | React Router v6 |

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Rust** 1.85+ (`rustup target add x86_64-pc-windows-msvc`)
- **WebView2** (pre-installed on Windows 10+)

### Development

```bash
# Install dependencies
npm install

# Run in development mode (hot-reload)
npm run tauri dev

# Run linter
npm run lint

# Run type check
npm run typecheck

# Run tests
npm test
```

### Build for Production

```bash
npm run tauri build
```

Output installers are placed in `src-tauri/target/release/bundle/`.

## Architecture

```
TRANSVD/
├── src-tauri/          # Tauri 2.x Rust backend
│   ├── src/
│   │   ├── main.rs     # Entry point
│   │   ├── lib.rs      # Plugin & command registration
│   │   └── commands/   # #[tauri::command] handlers
│   ├── capabilities/   # Tauri capability permissions
│   └── tauri.conf.json
├── src/                 # React frontend
│   ├── components/      # UI components
│   │   ├── common/      # Button, Slider, Modal, DropZone
│   │   ├── operations/  # Per-operation panels
│   │   └── layout/      # Header, Sidebar, Player
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # ffmpeg wrapper, format definitions, presets
│   └── workers/         # Web Workers for background processing
├── public/
├── index.html
├── package.json
└── vite.config.ts
```

## Upstream

This project is a desktop port of **[ffmpeg-webCLI](https://github.com/tejaswigowda/ffmpeg-webCLI)** by Tejaswi Gowda. The original is a browser-based PWA video editor. Key differences in this port:

| ffmpeg-webCLI (upstream) | TRANSVD (this project) |
|--------------------------|------------------------|
| PWA / Service Worker | Tauri native window + offline resources |
| ffmpeg.wasm in main thread | Dedicated Web Worker |
| Browser File API | Tauri `dialog` + `fs` plugins |
| Download as blob | Save dialog + native file system write |
| Screen Wake Lock API | Tauri power plugin |
| Browser drag-and-drop | Tauri drag-drop event handler |

## License

MIT — see [LICENSE](./LICENSE).
