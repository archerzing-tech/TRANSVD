import { IconLoading, IconCheck, IconX } from "../../lib/icons";

interface ProcessingOverlayProps {
  /** Whether processing is active */
  active: boolean;
  /** Progress percentage 0-100 */
  progress: number;
  /** Label shown during processing (e.g. "Converting...") */
  label: string;
  /** Optional log output lines */
  log?: string[];
  /** Callback to cancel the current operation */
  onCancel?: () => void;
  /** Whether cancellation is in progress */
  cancelling?: boolean;
}

export default function ProcessingOverlay({
  active,
  progress,
  label,
  log,
  onCancel,
  cancelling,
}: ProcessingOverlayProps) {
  if (!active && progress === 0 && !cancelling) return null;

  const isComplete = progress >= 100 && !cancelling;
  const isProcessing = active && !cancelling;

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-300 ${
        cancelling
          ? "border-red-900/40 bg-red-950/10"
          : isComplete
          ? "border-emerald-800/50 bg-emerald-950/20"
          : isProcessing
          ? "border-brand-500/30 bg-brand-950/20 shadow-sm shadow-brand-500/5"
          : "border-surface-800 bg-surface-850"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {isComplete ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <IconCheck size={14} className="text-emerald-400" />
            </div>
          ) : cancelling ? (
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <IconX size={14} className="text-red-400" />
            </div>
          ) : isProcessing ? (
            <IconLoading size={16} className="text-brand-500 animate-spin-slow" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-700 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-surface-500" />
            </div>
          )}
          <span
            className={`text-sm font-medium ${
              isComplete
                ? "text-emerald-400"
                : cancelling
                ? "text-red-400"
                : isProcessing
                ? "text-brand-400"
                : "text-surface-500"
            }`}
          >
            {isComplete ? "Complete" : cancelling ? "Cancelling..." : isProcessing ? label : "Ready"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-bold font-mono tabular-nums ${
              isComplete
                ? "text-emerald-400"
                : cancelling
                ? "text-red-400"
                : isProcessing
                ? "text-brand-400"
                : "text-surface-600"
            }`}
          >
            {isComplete ? "100%" : cancelling ? "—" : isProcessing ? `${Math.round(progress)}%` : "0%"}
          </span>
        </div>
      </div>

      {/* Progress bar track */}
      <div
        className={`relative h-2 rounded-full overflow-hidden ${
          cancelling
            ? "bg-red-950/30"
            : isComplete
            ? "bg-emerald-950/40"
            : "bg-surface-800"
        }`}
      >
        {/* Animated shimmer */}
        {isProcessing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent animate-pulse rounded-full" />
        )}

        {/* Fill bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete
              ? "bg-emerald-500"
              : cancelling
              ? "bg-red-600/50"
              : "bg-gradient-to-r from-brand-600 to-brand-500"
          }`}
          style={{ width: `${cancelling ? 100 : Math.min(progress, 100)}%` }}
        />

        {/* Glow dot */}
        {isProcessing && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-400 shadow-md shadow-brand-500/50"
            style={{
              left: `calc(${Math.min(progress, 100)}% - 6px)`,
              transition: "left 500ms ease-out",
            }}
          />
        )}
      </div>

      {/* Stage + Cancel button row */}
      {isProcessing && (
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="flex-1 h-0.5 rounded-full bg-brand-500/20 overflow-hidden max-w-[120px]">
              <div
                className="h-full bg-brand-500 rounded-full animate-pulse"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-surface-500 font-mono truncate">{label}</span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         text-xs font-medium text-red-400 hover:text-red-300
                         bg-red-950/30 hover:bg-red-950/50 border border-red-900/40
                         transition-all duration-150 active:scale-95"
            >
              <IconX size={12} />
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Log output */}
      {isProcessing && log && log.length > 0 && (
        <div className="mt-3 pt-3 border-t border-surface-800/50">
          <div className="max-h-20 overflow-y-auto space-y-0.5">
            {log.slice(-4).map((msg, i) => (
              <p key={i} className="text-[10px] text-surface-600 font-mono truncate leading-relaxed">
                {msg}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
