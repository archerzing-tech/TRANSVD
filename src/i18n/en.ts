const en: Record<string, string> = {
  // App
  "app.title": "TRANSVD",
  "app.subtitle": "Desktop Video Editor",
  "app.ffmpeg_wasm": "ffmpeg.wasm",

  // Operations sidebar
  "sidebar.operations": "Operations",
  "op.gif": "GIF Maker",
  "op.convert": "Format Converter",
  "op.compress": "Compress",
  "op.trim": "Trim",
  "op.resize": "Resize",
  "op.audio-extract": "Audio Extract",
  "op.mute": "Mute Video",
  "op.speed": "Speed",
  "op.rotate": "Rotate / Flip",
  "op.crop": "Crop",
  "op.thumbnail": "Thumbnail",
  "op.reverse": "Reverse",
  "op.fade": "Fade In/Out",
  "op.adjust": "Adjust",
  "op.strip-meta": "Strip Metadata",
  "op.subtitles": "Embed Subtitles",
  "op.volume": "Volume",
  "op.loop": "Loop",
  "op.overlay": "Logo Overlay",
  "op.mix-audio": "Mix Audio",
  "op.concat": "Concatenate",
  "op.side-by-side": "Side by Side",
  "op.pip": "Picture in Picture",
  "op.mediainfo": "Media Info",
  "op.raw": "Raw FFmpeg",

  // Common
  "common.loading_ffmpeg": "Loading FFmpeg WASM (~31 MB)...",
  "common.downloading": "Downloading",
  "common.download_step": "Step",
  "common.processing": "Processing...",
  "common.download": "Download",
  "common.save_as": "Save As...",
  "common.cancel": "Cancel",
  "common.reset": "Reset",
  "common.file": "File",
  "common.size": "Size",
  "common.load_ffmpeg": "Load FFmpeg",
  "common.load_and_run": "Load FFmpeg & Start",
  "common.error": "Error",
  "common.coming_soon": "Coming Soon",
  "common.coming_soon_desc": "This operation is being built.",

  // DropZone
  "dz.title": "Drop a video file here",
  "dz.hint": "or click to browse",
  "dz.supported": "MP4, WebM, MKV, MOV, AVI, GIF, M3U8, and more",
  "dz.privacy": "All processing happens locally · No uploads",
  "dz.loading_file": "Loading file...",

  // OperationPanel
  "op.open_new": "Open New File",

  // GIF Panel
  "gif.start_time": "Start Time (s)",
  "gif.duration": "Duration (s)",
  "gif.fps": "FPS",
  "gif.width": "Width (px)",
  "gif.generate": "Generate GIF",
  "gif.generating": "Generating GIF...",

  // Convert Panel
  "convert.target": "Target Format",
  "convert.encoding": "Encoding",
  "convert.stream_copy": "Stream Copy (fast)",
  "convert.stream_copy_desc": "Copies streams without re-encoding (may not work across formats)",
  "convert.reencode": "Re-encode",
  "convert.reencode_desc": "Full re-encode for compatibility",
  "convert.do_convert": "Convert",
  "convert.converting": "Converting...",
  "convert.complete": "Conversion complete",
  "convert.save": "Save",
  "convert.video": "Video",
  "convert.audio": "Audio",
  "convert.image": "Image",

  // Compress Panel
  "compress.crf": "CRF",
  "compress.high_quality": "High Quality",
  "compress.balanced": "Balanced",
  "compress.small_size": "Small Size",
  "compress.preset": "Encoding Preset",
  "compress.preset_hint": "Slower = better compression, smaller file",
  "compress.compress": "Compress",
  "compress.compressing": "Compressing...",

  // Trim Panel
  "trim.start": "Start",
  "trim.end": "End",
  "trim.duration": "Duration",
  "trim.trim": "Trim",
  "trim.trimming": "Trimming...",

  // Resize Panel
  "resize.presets": "Resolution Presets",
  "resize.width": "Width (px)",
  "resize.height": "Height (px)",
  "resize.maintain": "Maintain aspect ratio (letterbox)",
  "resize.resize": "Resize",
  "resize.resizing": "Resizing...",

  // Audio Extract Panel
  "audio.format": "Output Format",
  "audio.extract": "Extract Audio",
  "audio.extracting": "Extracting audio...",

  // Mute Panel
  "mute.desc": "Removes all audio tracks while keeping the video stream intact (stream copy).",
  "mute.mute": "Mute Video",
  "mute.muting": "Muting...",

  // Speed Panel
  "speed.speed": "Speed",
  "speed.slower": "Slower",
  "speed.faster": "Faster",
  "speed.normal": "Normal",
  "speed.preserve": "Preserve audio pitch (atempo filter, 0.5×–2× range)",
  "speed.change": "Change Speed",
  "speed.changing": "Changing speed...",

  // Rotate Panel
  "rotate.cw": "Rotate 90° CW",
  "rotate.ccw": "Rotate 90° CCW",
  "rotate.180": "Rotate 180°",
  "rotate.hflip": "Flip Horizontal",
  "rotate.vflip": "Flip Vertical",
  "rotate.apply": "Apply",
  "rotate.applying": "Applying transform...",

  // Crop Panel
  "crop.w": "Width",
  "crop.h": "Height",
  "crop.x": "X Offset",
  "crop.y": "Y Offset",
  "crop.crop": "Crop",
  "crop.cropping": "Cropping...",

  // Thumbnail Panel
  "thumb.time": "Time (s)",
  "thumb.format": "Format",
  "thumb.extract": "Extract Thumbnail",
  "thumb.extracting": "Extracting thumbnail...",

  // Reverse Panel
  "reverse.desc": "Reverses both video and audio playback. This may take a while.",
  "reverse.warn": "Reverse requires frame-accurate decoding and may use significant memory.",
  "reverse.reverse": "Reverse Video",
  "reverse.reversing": "Reversing...",

  // Fade Panel
  "fade.type": "Apply Fade To",
  "fade.video": "Video",
  "fade.audio": "Audio",
  "fade.both": "Both",
  "fade.in": "Fade In",
  "fade.out": "Fade Out",
  "fade.apply": "Apply Fade",
  "fade.applying": "Applying fade...",

  // Adjust Panel
  "adjust.brightness": "Brightness",
  "adjust.contrast": "Contrast",
  "adjust.saturation": "Saturation",
  "adjust.gamma": "Gamma",
  "adjust.grayscale": "Grayscale",
  "adjust.apply": "Apply",
  "adjust.applying": "Applying adjustments...",

  // Strip Metadata Panel
  "strip.desc": "Removes all metadata from the video file, including:",
  "strip.gps": "GPS location data",
  "strip.camera": "Camera information (make, model)",
  "strip.timestamp": "Timestamps and recording date",
  "strip.software": "Software and encoder tags",
  "strip.all": "All other metadata fields",
  "strip.note": "Video and audio streams are copied without re-encoding (fast).",
  "strip.strip": "Strip Metadata",
  "strip.stripping": "Stripping metadata...",

  // Subtitles Panel
  "sub.desc": "Embed subtitle files (SRT, VTT, ASS) as soft subtitle tracks.",
  "sub.file_label": "Subtitle File",
  "sub.choose": "Choose Subtitle File",
  "sub.supported": "Supported: SRT, VTT, ASS",
  "sub.embed": "Embed Subtitles",
  "sub.embedding": "Embedding subtitles...",

  // Volume Panel
  "volume.volume": "Volume",
  "volume.mute": "Mute",
  "volume.note": "Video stream is copied without re-encoding.",
  "volume.adjust": "Adjust Volume",
  "volume.adjusting": "Adjusting volume...",

  // Loop Panel
  "loop.count": "Repeat Count",
  "loop.loop": "Loop",
  "loop.looping": "Looping...",

  // Overlay Panel
  "overlay.choose": "Choose Logo Image",
  "overlay.image": "Logo / Watermark Image",
  "overlay.position": "Position",
  "overlay.tl": "Top Left",
  "overlay.tr": "Top Right",
  "overlay.bl": "Bottom Left",
  "overlay.br": "Bottom Right",
  "overlay.center": "Center",
  "overlay.size": "Logo Size",
  "overlay.apply": "Apply Watermark",
  "overlay.applying": "Applying watermark...",

  // Mix Audio Panel
  "mix.desc": "Mix background music with your video's original audio. Background loops to match video duration.",
  "mix.choose": "Choose Audio File",
  "mix.audio_label": "Background Audio",
  "mix.volume": "Background Volume",
  "mix.mix": "Mix Audio",
  "mix.mixing": "Mixing audio...",

  // Concat Panel
  "concat.desc": "Join two video clips together. Same codec/resolution recommended for best results.",
  "concat.first": "First Clip",
  "concat.second": "Second Clip",
  "concat.choose": "Choose File",
  "concat.join": "Join Clips",
  "concat.concatenating": "Concatenating...",

  // Side by Side Panel
  "sbs.first": "First Video",
  "sbs.second": "Second Video",
  "sbs.choose": "Choose File",
  "sbs.side": "Side by Side",
  "sbs.top": "Top / Bottom",
  "sbs.create": "Create Comparison",
  "sbs.creating": "Creating comparison...",

  // PiP Panel
  "pip.main": "Main Video",
  "pip.pip": "PiP Video (inset)",
  "pip.choose": "Choose File",
  "pip.size": "Inset Size",
  "pip.position": "Inset Position",
  "pip.tl": "Top Left",
  "pip.tr": "Top Right",
  "pip.bl": "Bottom Left",
  "pip.br": "Bottom Right",
  "pip.create": "Create PiP",
  "pip.creating": "Creating PiP...",

  // Media Info Panel
  "info.filename": "Filename",
  "info.analyze": "Analyze Media",
  "info.load_and_analyze": "Load FFmpeg & Analyze",
  "info.output": "FFmpeg Analysis",

  // Raw FFmpeg Panel
  "raw.recipes": "Recipe Library",
  "raw.args": "FFmpeg Arguments (after -i input)",
  "raw.output_ext": "Output Extension",
  "raw.run": "Run Command",
  "raw.running": "Running...",

  // Theme
  "theme.dark": "Dark",
  "theme.light": "Light",
  "theme.switch_dark": "Switch to Dark Mode",
  "theme.switch_light": "Switch to Light Mode",

  // Language
  "lang.zh": "中文",
  "lang.en": "English",
};

export default en;
