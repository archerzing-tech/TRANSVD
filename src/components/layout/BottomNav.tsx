import { useState } from "react";
import { type OperationId, OPERATIONS } from "../../types";
import { useTranslation } from "../../context/LanguageContext";
import { OPERATION_ICONS } from "../../lib/icons";
import SettingsDrawer from "../common/SettingsDrawer";

interface BottomNavProps {
  activeOperation: OperationId | null;
  onSelect: (id: OperationId) => void;
  onHome: () => void;
  videoLoaded: boolean;
}

export default function BottomNav({ activeOperation, onSelect, onHome, videoLoaded }: BottomNavProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // First 3 operations as quick shortcuts
  const quickOps = videoLoaded ? OPERATIONS.slice(0, 3) : [];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-900/95 backdrop-blur-lg border-t border-surface-800/60 safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-1">
          {/* Home button */}
          <button
            onClick={onHome}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer min-w-0
              ${activeOperation === null && videoLoaded ? "text-brand-500" : "text-surface-500 hover:text-surface-300"}
            `}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-[10px] font-medium">{t("nav.home")}</span>
          </button>

          {/* Quick operation shortcuts */}
          {quickOps.map((op) => {
            const isActive = activeOperation === op.id;
            const Icon = OPERATION_ICONS[op.id];

            return (
              <button
                key={op.id}
                onClick={() => onSelect(op.id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer min-w-0
                  ${isActive ? "text-brand-500" : "text-surface-500 hover:text-surface-300"}
                `}
              >
                <span className={isActive ? "text-brand-500" : "text-surface-500"}>
                  {Icon && <Icon size={20} />}
                </span>
                <span className="text-[10px] font-medium truncate max-w-[52px]">{t(op.labelKey)}</span>
                {isActive && <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-brand-500" />}
              </button>
            );
          })}

          {/* Settings gear */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-surface-500 hover:text-surface-300 transition-all duration-150 cursor-pointer min-w-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="text-[10px] font-medium">{t("nav.more")}</span>
          </button>
        </div>
      </nav>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
