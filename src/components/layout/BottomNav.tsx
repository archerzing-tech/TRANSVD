import { type OperationId, OPERATIONS } from "../../types";
import { useTranslation } from "../../context/LanguageContext";
import { OPERATION_ICONS } from "../../lib/icons";

interface BottomNavProps {
  activeOperation: OperationId | null;
  onSelect: (id: OperationId) => void;
  onHome: () => void;
  videoLoaded: boolean;
}

export default function BottomNav({ activeOperation, onSelect, onHome, videoLoaded }: BottomNavProps) {
  const { t } = useTranslation();

  // Collapse operations into categories for the bottom nav
  const navItems: { id: OperationId | "home" | "files"; label: string; icon: React.ComponentType<{ size?: number; className?: string }> | null }[] = [
    { id: "home", label: "Home", icon: null },
    ...(videoLoaded
      ? OPERATIONS.slice(0, 5).map((op) => ({
          id: op.id,
          label: t(op.labelKey),
          icon: OPERATION_ICONS[op.id] || null,
        }))
      : []),
  ];

  // For the "more" button if there are many ops
  const displayItems = navItems.length > 5 ? navItems.slice(0, 4) : navItems;
  const hasMore = navItems.length > 5;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-900/95 backdrop-blur-lg border-t border-surface-800/60 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {/* Home button */}
        <button
          onClick={onHome}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer
            ${activeOperation === null && videoLoaded ? "text-brand-500" : "text-surface-500 hover:text-surface-300"}
          `}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-[10px] font-medium">{t("nav.home")}</span>
        </button>

        {/* Operation tabs */}
        {displayItems.map((item) => {
          if (item.id === "home") return null;
          const isActive = activeOperation === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id as OperationId)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer min-w-0
                ${isActive
                  ? "text-brand-500"
                  : "text-surface-500 hover:text-surface-300"
                }
              `}
            >
              <span className={isActive ? "text-brand-500" : "text-surface-500"}>
                {Icon && <Icon size={20} />}
              </span>
              <span className="text-[10px] font-medium truncate max-w-[56px]">{item.label}</span>
              {isActive && <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-brand-500" />}
            </button>
          );
        })}

        {/* "More" button */}
        {hasMore && (
          <button
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-surface-500 hover:text-surface-300 transition-all duration-150 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
            <span className="text-[10px] font-medium">{t("nav.more")}</span>
          </button>
        )}
      </div>
    </nav>
  );
}
