import { type OperationId, OPERATIONS } from "../../types";
import { useTranslation } from "../../context/LanguageContext";
import { OPERATION_ICONS, IconChevronRight } from "../../lib/icons";
import { useState } from "react";

interface SidebarProps {
  activeOperation: OperationId | null;
  onSelect: (id: OperationId) => void;
}

export default function Sidebar({ activeOperation, onSelect }: SidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`relative bg-surface-900/80 border-r border-surface-800/60 overflow-y-auto shrink-0 flex flex-col transition-all duration-200 ${collapsed ? 'w-14' : 'w-56'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-surface-800/60 shrink-0">
        {!collapsed && (
          <h2 className="text-[11px] font-semibold text-surface-500 uppercase tracking-[0.12em]">
            {t("sidebar.operations")}
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`btn-ghost p-1 ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <IconChevronRight
            size={14}
            className={`text-surface-500 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-1.5 overflow-y-auto">
        {OPERATIONS.map((op) => {
          const Icon = OPERATION_ICONS[op.id];
          const isActive = activeOperation === op.id;

          return (
            <button
              key={op.id}
              onClick={() => onSelect(op.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-sm transition-all duration-150 cursor-pointer group
                ${isActive
                  ? "bg-brand-500/10 text-brand-400 border-r-2 border-brand-500"
                  : "text-surface-500 hover:text-surface-300 hover:bg-surface-800/40 border-r-2 border-transparent"
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
              title={collapsed ? t(op.labelKey) : undefined}
            >
              <span className={`shrink-0 ${isActive ? 'text-brand-500' : 'text-surface-500 group-hover:text-surface-300'}`}>
                {Icon && <Icon size={18} />}
              </span>
              {!collapsed && (
                <span className="truncate">{t(op.labelKey)}</span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
