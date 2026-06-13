import { type OperationId, OPERATIONS } from "../../App";
import { useTranslation } from "../../context/LanguageContext";

interface SidebarProps {
  activeOperation: OperationId;
  onSelect: (id: OperationId) => void;
}

export default function Sidebar({ activeOperation, onSelect }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 overflow-y-auto shrink-0">
      <div className="p-3 border-b border-gray-800">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Operations
        </h2>
      </div>
      <nav className="py-2">
        {OPERATIONS.map((op) => (
          <button
            key={op.id}
            onClick={() => onSelect(op.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
              ${activeOperation === op.id ? "bg-brand-600/20 text-brand-300 border-r-2 border-brand-500" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
          >
            <span className="text-base">{op.icon}</span>
            <span>{t(op.labelKey)}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
