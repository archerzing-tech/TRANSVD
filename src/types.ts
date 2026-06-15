export type OperationId =
  | "gif" | "convert" | "compress" | "trim" | "resize"
  | "audio-extract" | "mute" | "speed" | "rotate" | "crop"
  | "thumbnail" | "reverse" | "fade" | "adjust" | "strip-meta"
  | "subtitles" | "volume" | "loop" | "overlay" | "mix-audio"
  | "concat" | "side-by-side" | "pip" | "mediainfo" | "raw";

export interface VideoFile {
  name: string;
  path: string;
  size: number;
  data: Uint8Array | null;
}

export const OPERATIONS: { id: OperationId; labelKey: string }[] = [
  { id: "gif", labelKey: "op.gif" },
  { id: "convert", labelKey: "op.convert" },
  { id: "compress", labelKey: "op.compress" },
  { id: "trim", labelKey: "op.trim" },
  { id: "resize", labelKey: "op.resize" },
  { id: "audio-extract", labelKey: "op.audio-extract" },
  { id: "mute", labelKey: "op.mute" },
  { id: "speed", labelKey: "op.speed" },
  { id: "rotate", labelKey: "op.rotate" },
  { id: "crop", labelKey: "op.crop" },
  { id: "thumbnail", labelKey: "op.thumbnail" },
  { id: "reverse", labelKey: "op.reverse" },
  { id: "fade", labelKey: "op.fade" },
  { id: "adjust", labelKey: "op.adjust" },
  { id: "strip-meta", labelKey: "op.strip-meta" },
  { id: "subtitles", labelKey: "op.subtitles" },
  { id: "volume", labelKey: "op.volume" },
  { id: "loop", labelKey: "op.loop" },
  { id: "overlay", labelKey: "op.overlay" },
  { id: "mix-audio", labelKey: "op.mix-audio" },
  { id: "concat", labelKey: "op.concat" },
  { id: "side-by-side", labelKey: "op.side-by-side" },
  { id: "pip", labelKey: "op.pip" },
  { id: "mediainfo", labelKey: "op.mediainfo" },
  { id: "raw", labelKey: "op.raw" },
];
