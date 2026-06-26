# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TRANSVD** — Desktop port of [ffmpeg-webCLI](https://github.com/tejaswigowda/ffmpeg-webCLI) using **Tauri 2.x**.

The original project is a browser-based video editor powered by `@ffmpeg/ffmpeg` (WebAssembly). All processing happens client-side with zero server uploads. This port wraps that experience in a native Tauri 2.x desktop application for **Windows 10+**, adding native OS integration (file dialogs, drag-and-drop, file system access, tray/shell integration) while keeping the core ffmpeg.wasm processing engine.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | **Tauri 2.x** (Rust) |
| Frontend | **React 18+** (Vite + TypeScript) |
| Styling | **Tailwind CSS** |
| FFmpeg Engine | `@ffmpeg/ffmpeg` (WebAssembly, same as upstream) |
| Web Worker | Comlink or native workers for background processing |
| State | React hooks + Context |
| Routing | React Router v6 |

## Architecture

```
TRANSVD/
├── src-tauri/          # Tauri 2.x Rust backend
│   ├── src/
│   │   ├── main.rs     # Entry point, Tauri app builder
│   │   ├── lib.rs      # Plugin registration, commands
│   │   ├── commands/   # #[tauri::command] handlers
│   │   │   ├── mod.rs
│   │   │   ├── file_ops.rs      # File open/save dialogs, paths
│   │   │   ├── ffmpeg.rs        # Native ffmpeg sidecar (optional perf path)
│   │   │   └── system.rs        # OS integration (wake lock, notifications)
│   │   └── tray/        # System tray (optional)
│   ├── capabilities/    # Tauri 2.x capability files
│   ├── tauri.conf.json  # Tauri configuration
│   └── Cargo.toml
├── src/                 # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/      # React components
│   │   ├── common/      # Shared UI (Button, Slider, Modal, DropZone)
│   │   ├── operations/  # Per-operation panels (Trim, Convert, GIF, etc.)
│   │   └── layout/      # Shell layout (Header, Sidebar, Player)
│   ├── hooks/           # Custom React hooks (useFFmpeg, useFileDrop, etc.)
│   ├── lib/             # Core logic
│   │   ├── ffmpeg.ts    # ffmpeg.wasm wrapper, worker management
│   │   ├── formats.ts   # Supported codecs/format definitions
│   │   └── presets.ts   # Operation presets
│   ├── workers/         # Web Workers for background processing
│   └── styles/          # Tailwind entry + global styles
├── public/              # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── CLAUDE.md
```

### Key Architectural Decisions

1. **ffmpeg.wasm (primary) + optional native sidecar** — The primary processing path uses `@ffmpeg/ffmpeg` in a Web Worker (identical to upstream). An optional Rust `ffmpeg-next` or Tauri sidecar path can be added later for large files where WASM performance is a bottleneck.

2. **Tauri 2.x plugin system** — Capabilities-based security model. Each OS feature (dialogs, fs, shell) gets a capability file. No `shell:allow-execute` unless explicitly scoped.

3. **Web Worker isolation** — ffmpeg.wasm runs in a dedicated Web Worker to keep the UI thread responsive. Communication via structured clone (no SharedArrayBuffer needed for most operations).

4. **Frontend as upstream fork** — The React UI is a port/adaptation of the upstream vanilla JS app, keeping the same operation panels but using React component composition.

### Porting Strategy from ffmpeg-webCLI

| Upstream Concept | Tauri Port |
|-----------------|------------|
| PWA / Service Worker | Replaced by Tauri native window + offline resources |
| `ffmpeg.wasm` in main thread | Moved to dedicated Web Worker |
| Browser File API | Tauri `dialog.open` + `fs` plugin |
| Screen Wake Lock API | Tauri power plugin or `wake-lock` API |
| Download as blob | Tauri save dialog + fs write |
| Browser drag-and-drop | Tauri drag-drop event handler |

## Development Commands

```bash
# Install frontend dependencies
npm install

# Run in development mode (hot-reload)
npm run tauri dev

# Build for production
npm run tauri build

# Preview production build
npm run tauri preview

# Run lint
npm run lint

# Run type check
npm run typecheck

# Run frontend unit tests
npm run test

# Run Rust tests
cd src-tauri && cargo test

# Run all tests
npm run test:all

# Generate Rust API docs
cd src-tauri && cargo doc --open

# Check Rust code (clippy)
cd src-tauri && cargo clippy --all-targets --all-features -- -D warnings

# Open Tauri devtools
npm run tauri devtools
```

## Tauri 2.x Conventions

- **Commands** are defined with `#[tauri::command]` in Rust modules under `src-tauri/src/commands/`
- **Plugins** are registered in `lib.rs` via `.plugin(tauri_plugin_xxx::init())`
- **Capabilities** are declared as JSON files in `src-tauri/capabilities/` — each capability grants specific permissions
- **Package identifiers** use reverse-domain notation (e.g. `com.tranvd.app`)
- **Window configuration** lives in `tauri.conf.json` under `app.windows`
- **Security**: minimal capability grants, no wildcard permissions, `dangerousRemoteDomainIpcAccess` only when needed
- **Tauri 2.x API is async** — all `invoke` calls are promises on the JS side

## Key Dependencies (to add in package.json)

```json
{
  "@tauri-apps/api": "^2.0.0",
  "@tauri-apps/plugin-dialog": "^2.0.0",
  "@tauri-apps/plugin-fs": "^2.0.0",
  "@tauri-apps/plugin-shell": "^2.0.0",
  "@ffmpeg/ffmpeg": "^0.12.0",
  "@ffmpeg/util": "^0.12.0"
}
```

## Important Notes

- **Windows 10+ target**: Use `msie` target for Rust (`rustup target add x86_64-pc-windows-msvc`). WebView2 is pre-installed on Windows 10+.
- **ffmpeg.wasm loading**: The ~31 MB WASM core must be bundled in `src-tauri/resources/` or served from the frontend. In dev mode it loads from CDN; in production it's bundled.
- **File associations**: Register video/audio MIME types in `tauri.conf.json` `app.security.assetProtocol.scope`.
- **Large files**: WASM has a ~2 GB memory limit. For files >1 GB, consider adding a native ffmpeg sidecar path via `tauri-plugin-shell`.

## Version Bump Checklist

When bumping the version (e.g. for a release), update ALL three files to the same version number:

| File | Key |
|------|-----|
| `package.json` | `"version"` |
| `src-tauri/Cargo.toml` | `[package] version` |
| `src-tauri/tauri.conf.json` | `"version"` |

`tauri-action` reads the version from `tauri.conf.json` to determin the release tag (`v__VERSION__`), while the Android CI job reads from `package.json`. A mismatch causes the Android build to wait for a release tag that will never be created. Always keep the three synchronized.
