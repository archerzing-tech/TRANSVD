import { type OperationId, OPERATIONS } from "../../types";
import { useTranslation } from "../../context/LanguageContext";
import { OPERATION_ICONS } from "../../lib/icons";

interface SidebarProps {
  activeOperation: OperationId | null;
  onSelect: (id: OperationId) => void;
}

const CATEGORIES: { titleKey: string; ids: OperationId[] }[] = [
  {
    titleKey: "Convert & Compress",
    ids: ["gif", "convert", "compress"],
  },
  {
    titleKey: "Trim & Transform",
    ids: ["trim", "crop", "rotate", "resize", "speed", "reverse"],
  },
  {
    titleKey: "Audio & Effects",
    ids: ["audio-extract", "mute", "volume", "fade", "adjust"],
  },
  {
    titleKey: "Advanced",
    ids: ["overlay", "concat", "pip", "subtitles", "side-by-side", "mix-audio", "loop", "strip-meta", "mediainfo", "thumbnail", "raw"],
  },
];

export default function Sidebar({ activeOperation, onSelect }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="w-[220px] shrink-0 bg-surface-900 border-r border-surface-800/60 flex flex-col overflow-y-auto">
      <div className="px-3 pt-3 pb-2">
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest px-2">
          {t("sidebar.operations")}
        </p>
      </div>

      <div className="flex-1 px-2 pb-4 space-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.titleKey}>
            {/* Category label */}
            <p className="text-[9px] font-semibold text-surface-600 uppercase tracking-widest px-2 mb-1">
              {cat.titleKey}
            </p>

            {/* Operation items */}
            <div className="space-y-0.5">
              {cat.ids.map((id) => {
                const op = OPERATIONS.find((o) => o.id === id);
                if (!op) return null;
                const Icon = OPERATION_ICONS[id];
                const isActive = activeOperation === id;

                return (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer text-left
                      ${isActive
                        ? "bg-brand-500/10 text-brand-400 border border-brand-500/15"
                        : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 border border-transparent"
                      }
                    `}
                  >
                    <span className={`shrink-0 transition-colors duration-150 ${isActive ? "text-brand-400" : "text-surface-500"}`}>
                      {Icon && <Icon size={15} />}
                    </span>
                    <span className="truncate">{t(op.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
