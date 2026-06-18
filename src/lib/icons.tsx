import type { FC, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({
  children,
  size = 20,
  viewBox = "0 0 24 24",
  ...props
}: IconProps & { viewBox?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

// ── Operation Icons ──

export const IconGif: FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 8v8" />
    <path d="M12 8v8" />
    <path d="M15 8v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2" />
  </Icon>
);

export const IconConvert: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M4 17V4h10" />
    <path d="M20 7v13H10" />
    <path d="m4 17 3-3 3 3" />
    <path d="m14 7 3 3 3-3" />
  </Icon>
);

export const IconCompress: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 12v6" />
    <path d="m9 15 3-3 3 3" />
  </Icon>
);

export const IconTrim: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M7 21h10" />
    <path d="M5 3h14" />
    <path d="M12 3v18" />
    <circle cx="9" cy="9" r="1" />
    <circle cx="15" cy="15" r="1" />
  </Icon>
);

export const IconResize: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="17 8 21 4 21 8" />
    <line x1="21" y1="4" x2="14" y2="11" />
  </Icon>
);

export const IconAudioExtract: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </Icon>
);

export const IconMute: FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </Icon>
);

export const IconSpeed: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 12V6" />
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" />
    <path d="M12 22v-4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
  </Icon>
);

export const IconRotate: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <path d="M21 3v5h-5" />
  </Icon>
);

export const IconCrop: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M6 2v14a2 2 0 0 0 2 2h14" />
    <path d="M18 22V8a2 2 0 0 0-2-2H2" />
  </Icon>
);

export const IconThumbnail: FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </Icon>
);

export const IconReverse: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </Icon>
);

export const IconFade: FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20" />
    <path d="M12 6v6l4 2" />
  </Icon>
);

export const IconAdjust: FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="12" x2="14" y2="12" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </Icon>
);

export const IconStripMeta: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </Icon>
);

export const IconSubtitles: FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 12h4" />
    <path d="M14 12h4" />
    <path d="M6 16h8" />
  </Icon>
);

export const IconVolume: FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </Icon>
);

export const IconLoop: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </Icon>
);

export const IconOverlay: FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="2" width="20" height="16" rx="2" />
    <rect x="10" y="6" width="10" height="10" rx="1.5" />
  </Icon>
);

export const IconMixAudio: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M9 2v12" />
    <path d="M15 6v8" />
    <path d="M3 8v4" />
    <path d="M21 10v2" />
    <path d="M5 18a3 3 0 1 0 6 0" />
    <path d="M13 16a3 3 0 1 0 6 0" />
  </Icon>
);

export const IconConcat: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);

export const IconSideBySide: FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
    <line x1="10" y1="4" x2="14" y2="4" />
    <line x1="10" y1="20" x2="14" y2="20" />
  </Icon>
);

export const IconPip: FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <rect x="12" y="10" width="8" height="6" rx="1.5" />
  </Icon>
);

export const IconMediaInfo: FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Icon>
);

export const IconRaw: FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </Icon>
);

export const IconOpenFile: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);

export const IconDownload: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);

export const IconCheck: FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

export const IconChevronRight: FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

export const IconX: FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const IconAlertCircle: FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

export const IconFilm: FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="2" width="20" height="20" rx="2.5" />
    <path d="M7 2v20" />
    <path d="M17 2v20" />
    <path d="M2 7h5" />
    <path d="M2 12h5" />
    <path d="M2 17h5" />
    <path d="M17 7h5" />
    <path d="M17 12h5" />
    <path d="M17 17h5" />
  </Icon>
);

export const IconPlus: FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

export const IconSave: FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Icon>
);

export const IconPlay: FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </Icon>
);

export const IconLoading: FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </Icon>
);

export const IconClock: FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

// ── Operation icon map ──

import type { OperationId } from "../types";

export const OPERATION_ICONS: Record<OperationId, FC<IconProps>> = {
  gif: IconGif,
  convert: IconConvert,
  compress: IconCompress,
  trim: IconTrim,
  resize: IconResize,
  "audio-extract": IconAudioExtract,
  mute: IconMute,
  speed: IconSpeed,
  rotate: IconRotate,
  crop: IconCrop,
  thumbnail: IconThumbnail,
  reverse: IconReverse,
  fade: IconFade,
  adjust: IconAdjust,
  "strip-meta": IconStripMeta,
  subtitles: IconSubtitles,
  volume: IconVolume,
  loop: IconLoop,
  overlay: IconOverlay,
  "mix-audio": IconMixAudio,
  concat: IconConcat,
  "side-by-side": IconSideBySide,
  pip: IconPip,
  mediainfo: IconMediaInfo,
  raw: IconRaw,
};
