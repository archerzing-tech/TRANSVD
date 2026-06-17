const zh: Record<string, string> = {
  // App
  "app.title": "TRANSVD — 桌面视频编辑器",
  "app.subtitle": "桌面视频编辑器",
  "app.ffmpeg_wasm": "ffmpeg.wasm",

  // Operations sidebar
  "sidebar.operations": "操作功能",
  "op.gif": "GIF 制作",
  "op.convert": "格式转换",
  "op.compress": "视频压缩",
  "op.trim": "视频裁剪",
  "op.resize": "调整尺寸",
  "op.audio-extract": "音频提取",
  "op.mute": "视频静音",
  "op.speed": "速度调整",
  "op.rotate": "旋转 / 翻转",
  "op.crop": "画面裁剪",
  "op.thumbnail": "缩略图提取",
  "op.reverse": "倒放",
  "op.fade": "淡入淡出",
  "op.adjust": "画面调节",
  "op.strip-meta": "去除元数据",
  "op.subtitles": "嵌入字幕",
  "op.volume": "音量调节",
  "op.loop": "循环播放",
  "op.overlay": "水印叠加",
  "op.mix-audio": "音频混合",
  "op.concat": "视频拼接",
  "op.side-by-side": "并排对比",
  "op.pip": "画中画",
  "op.mediainfo": "媒体信息",
  "op.raw": "原始 FFmpeg",

  // Common
  "common.loading_ffmpeg": "正在加载 FFmpeg WASM（约 31 MB）...",
  "common.downloading": "正在下载",
  "common.download_step": "步骤",
  "common.processing": "处理中...",
  "common.download": "下载",
  "common.save_as": "另存为...",
  "common.cancel": "取消",
  "common.reset": "重置",
  "common.file": "文件",
  "common.size": "大小",
  "common.load_ffmpeg": "加载 FFmpeg",
  "common.load_and_run": "加载 FFmpeg 并开始",
  "common.error": "错误",
  "common.coming_soon": "即将推出",
  "common.coming_soon_desc": "该功能正在开发中",

  // DropZone
  "dz.title": "拖放视频文件到此处",
  "dz.hint": "或点击选择文件",
  "dz.supported": "支持 MP4, WebM, MKV, MOV, AVI, GIF, M3U8 等格式",
  "dz.privacy": "所有处理均在本地完成 · 不上传任何数据",
  "dz.loading_file": "正在加载文件...",

  // OperationPanel
  "op.open_new": "打开新文件",

  // GIF Panel
  "gif.start_time": "开始时间（秒）",
  "gif.duration": "持续时间（秒）",
  "gif.fps": "帧率",
  "gif.width": "宽度（像素）",
  "gif.generate": "生成 GIF",
  "gif.generating": "正在生成 GIF...",

  // Convert Panel
  "convert.target": "目标格式",
  "convert.encoding": "编码方式",
  "convert.stream_copy": "流复制（快速）",
  "convert.stream_copy_desc": "流复制无需重新编码（跨格式可能不兼容）",
  "convert.reencode": "重新编码",
  "convert.reencode_desc": "完全重新编码以确保兼容性",
  "convert.do_convert": "转换",
  "convert.converting": "正在转换...",
  "convert.complete": "转换完成",
  "convert.save": "保存",
  "convert.video": "视频",
  "convert.audio": "音频",
  "convert.image": "图片",

  // Compress Panel
  "compress.crf": "CRF",
  "compress.high_quality": "高质量",
  "compress.balanced": "平衡",
  "compress.small_size": "小体积",
  "compress.preset": "编码预设",
  "compress.preset_hint": "越慢 = 压缩越好，文件越小",
  "compress.compress": "压缩",
  "compress.compressing": "正在压缩...",

  // Trim Panel
  "trim.start": "开始",
  "trim.end": "结束",
  "trim.duration": "时长",
  "trim.trim": "裁剪",
  "trim.trimming": "正在裁剪...",

  // Resize Panel
  "resize.presets": "分辨率预设",
  "resize.width": "宽度（像素）",
  "resize.height": "高度（像素）",
  "resize.maintain": "保持宽高比（加黑边）",
  "resize.resize": "调整尺寸",
  "resize.resizing": "正在调整尺寸...",

  // Audio Extract Panel
  "audio.format": "输出格式",
  "audio.extract": "提取音频",
  "audio.extracting": "正在提取音频...",

  // Mute Panel
  "mute.desc": "此操作将移除视频中的所有音轨，同时保持视频流不变（流复制）。",
  "mute.mute": "视频静音",
  "mute.muting": "正在静音...",

  // Speed Panel
  "speed.speed": "速度",
  "speed.slower": "慢速",
  "speed.faster": "快速",
  "speed.normal": "正常",
  "speed.preserve": "保持音频音调（atempo 滤镜，仅支持 0.5×–2× 范围）",
  "speed.change": "调整速度",
  "speed.changing": "正在调整速度...",

  // Rotate Panel
  "rotate.cw": "顺时针 90°",
  "rotate.ccw": "逆时针 90°",
  "rotate.180": "旋转 180°",
  "rotate.hflip": "水平翻转",
  "rotate.vflip": "垂直翻转",
  "rotate.apply": "应用变换",
  "rotate.applying": "正在应用变换...",

  // Crop Panel
  "crop.w": "宽度",
  "crop.h": "高度",
  "crop.x": "X 偏移",
  "crop.y": "Y 偏移",
  "crop.crop": "裁剪",
  "crop.cropping": "正在裁剪...",

  // Thumbnail Panel
  "thumb.time": "时间点（秒）",
  "thumb.format": "格式",
  "thumb.extract": "提取缩略图",
  "thumb.extracting": "正在提取缩略图...",

  // Reverse Panel
  "reverse.desc": "同时反转视频和音频播放。此操作可能需要较长时间。",
  "reverse.warn": "倒放需要逐帧解码，可能占用大量内存。",
  "reverse.reverse": "倒放视频",
  "reverse.reversing": "正在倒放...",

  // Fade Panel
  "fade.type": "应用淡入淡出到",
  "fade.video": "视频",
  "fade.audio": "音频",
  "fade.both": "两者",
  "fade.in": "淡入",
  "fade.out": "淡出",
  "fade.apply": "应用淡入淡出",
  "fade.applying": "正在应用淡入淡出...",

  // Adjust Panel
  "adjust.brightness": "亮度",
  "adjust.contrast": "对比度",
  "adjust.saturation": "饱和度",
  "adjust.gamma": "伽马",
  "adjust.grayscale": "灰度模式",
  "adjust.apply": "应用调节",
  "adjust.applying": "正在应用调节...",

  // Strip Metadata Panel
  "strip.desc": "从视频文件中移除所有元数据，包括：",
  "strip.gps": "GPS 位置信息",
  "strip.camera": "相机信息（品牌、型号）",
  "strip.timestamp": "时间戳和录制日期",
  "strip.software": "软件和编码器标签",
  "strip.all": "所有其他元数据字段",
  "strip.note": "视频和音频流直接复制，无需重新编码（快速）。",
  "strip.strip": "去除元数据",
  "strip.stripping": "正在去除元数据...",

  // Subtitles Panel
  "sub.desc": "将字幕文件（SRT、VTT、ASS）作为软字幕轨道嵌入到视频中。",
  "sub.file_label": "字幕文件",
  "sub.choose": "选择字幕文件",
  "sub.supported": "支持格式：SRT、VTT、ASS",
  "sub.embed": "嵌入字幕",
  "sub.embedding": "正在嵌入字幕...",

  // Volume Panel
  "volume.volume": "音量",
  "volume.mute": "静音",
  "volume.note": "视频流直接复制，无需重新编码。",
  "volume.adjust": "调节音量",
  "volume.adjusting": "正在调节音量...",

  // Loop Panel
  "loop.count": "循环次数",
  "loop.loop": "循环",
  "loop.looping": "正在循环...",

  // Overlay Panel
  "overlay.choose": "选择水印图片",
  "overlay.image": "水印图片",
  "overlay.position": "位置",
  "overlay.tl": "左上",
  "overlay.tr": "右上",
  "overlay.bl": "左下",
  "overlay.br": "右下",
  "overlay.center": "居中",
  "overlay.size": "水印大小",
  "overlay.apply": "添加水印",
  "overlay.applying": "正在添加水印...",

  // Mix Audio Panel
  "mix.desc": "将背景音乐与视频原音混合。背景音频会自动循环以匹配视频时长。",
  "mix.choose": "选择音频文件",
  "mix.audio_label": "背景音乐",
  "mix.volume": "背景音量",
  "mix.mix": "混合音频",
  "mix.mixing": "正在混合音频...",

  // Concat Panel
  "concat.desc": "将两个视频片段首尾拼接在一起。为获得最佳效果，两个片段的编码和分辨率应相同。",
  "concat.first": "第一个片段",
  "concat.second": "第二个片段",
  "concat.choose": "选择文件",
  "concat.join": "拼接片段",
  "concat.concatenating": "正在拼接...",

  // Side by Side Panel
  "sbs.first": "第一个视频",
  "sbs.second": "第二个视频",
  "sbs.choose": "选择文件",
  "sbs.side": "并排",
  "sbs.top": "上下",
  "sbs.create": "创建对比",
  "sbs.creating": "正在创建对比...",

  // PiP Panel
  "pip.main": "主视频",
  "pip.pip": "画中画视频（小窗）",
  "pip.choose": "选择文件",
  "pip.size": "小窗大小",
  "pip.position": "小窗位置",
  "pip.tl": "左上",
  "pip.tr": "右上",
  "pip.bl": "左下",
  "pip.br": "右下",
  "pip.create": "创建画中画",
  "pip.creating": "正在创建画中画...",

  // Media Info Panel
  "info.filename": "文件名",
  "info.analyze": "分析媒体",
  "info.load_and_analyze": "加载 FFmpeg 并分析",
  "info.output": "FFmpeg 分析结果",

  // Raw FFmpeg Panel
  "raw.recipes": "预设命令库",
  "raw.args": "FFmpeg 参数（-i 输入文件之后）",
  "raw.output_ext": "输出扩展名",
  "raw.run": "运行命令",
  "raw.running": "正在运行...",

  // Language
  "lang.zh": "中文",
  "lang.en": "English",
};

export default zh;
