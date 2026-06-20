import { useState, useEffect, useRef, useMemo } from "react";
import { IconLoading, IconCheck, IconX, IconClock } from "../../lib/icons";

interface ProcessingOverlayProps {
  /** Whether processing is active (operation is running) */
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

function formatTime(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  if (m > 0) return `${m}:${String(s).padStart(2, "0")}`;
  return `${s}s`;
}

function formatETA(ms: number): string {
  if (ms <= 0) return "—";
  if (ms < 1000) return "<1s";
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function ProcessingOverlay({
  active,
  progress,
  label,
  log,
  onCancel,
  cancelling,
}: ProcessingOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  const isComplete = progress >= 100 && !cancelling;
  const isProcessing = progress > 0 && progress < 100 && !cancelling && active;
  const isIndeterminate = active && progress === 0 && !cancelling;

  // ── Timer for elapsed time ──
  // On each processing phase (indeterminate/processing), always reset the start
  // time so elapsed correctly reflects the current operation cycle. The interval
  // updates elapsed every 200ms. Cleanup only clears the interval — no state reset
  // — so the completion display can show the final elapsed value.
  useEffect(() => {
    if (isProcessing || isIndeterminate) {
      startTimeRef.current = Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsed(0);
      const id = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current!);
      }, 200);
      return () => {
        clearInterval(id);
      };
    }
  }, [isProcessing, isIndeterminate]);

  // ── ETA calculation ──
  const eta = useMemo(() => {
    if (progress <= 0 || elapsed <= 0) return null;
    const rate = progress / elapsed;
    if (rate <= 0) return null;
    return (100 - progress) / rate;
  }, [progress, elapsed]);

  // ── Smooth interpolated progress for display ──
  const displayProgress = useMemo(() => {
    if (isComplete) return 100;
    if (cancelling) return 100;
    return Math.min(progress, 99.9);
  }, [progress, isComplete, cancelling]);

  // Only hide when completely idle — must be after all hooks
  const hasSomethingToShow = active || progress > 0 || cancelling;
  if (!hasSomethingToShow) return null;

  // ── Stage badge colors ──
  const stateStyle = cancelling
    ? "border-red-900/40 bg-red-950/10"
    : isComplete
    ? "badge-status-green border-status-green-divider"
    : isProcessing || isIndeterminate
    ? "border-brand-500/30 bg-brand-950/20 shadow-sm shadow-brand-500/5"
    : "border-surface-800 bg-surface-850";

  const textColor = cancelling
    ? "text-status-red"
    : isComplete
    ? "text-status-green"
    : isProcessing
    ? "text-brand-400"
    : isIndeterminate
    ? "text-brand-400/70"
    : "text-surface-600";

  const percentColor = cancelling
    ? "text-status-red"
    : isComplete
    ? "text-status-green"
    : isProcessing
    ? "text-brand-400"
    : isIndeterminate
    ? "text-brand-400/70"
    : "text-surface-600";

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-300 animate-fade-in ${stateStyle}`}
    >
      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {isComplete ? (
            <div className="w-6 h-6 rounded-full bg-status-green-icon flex items-center justify-center">
              <IconCheck size={14} className="text-status-green" />
            </div>
          ) : cancelling ? (
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <IconX size={14} className="text-status-red" />
            </div>
          ) : isProcessing ? (
            <IconLoading size={16} className="text-brand-500 animate-spin-slow" />
          ) : isIndeterminate ? (
            <div className="relative w-4 h-4">
              <span className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping" />
              <span className="absolute inset-1 rounded-full bg-brand-500/60" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-700 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-surface-500" />
            </div>
          )}
          <span className={`text-sm font-medium ${textColor}`}>
            {isComplete ? "Complete" : cancelling ? "Cancelling..." : isIndeterminate ? `Starting ${label.toLowerCase()}...` : isProcessing ? label : "Ready"}
          </span>
        </div>

        {/* Percentage & elapsed */}
        <div className="flex items-center gap-3">
          {/* Elapsed time */}
          {elapsed > 0 && (isProcessing || isIndeterminate) && (
            <span className="flex items-center gap-1 text-[11px] text-surface-500 font-mono tabular-nums">
              <IconClock size={11} />
              {formatTime(elapsed)}
            </span>
          )}
          <span className={`text-lg font-bold font-mono tabular-nums ${percentColor}`}>
            {isComplete ? "100%" : cancelling ? "—" : isProcessing ? `${Math.round(displayProgress)}%` : isIndeterminate ? "—" : "0%"}
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div
        className={`relative h-2 rounded-full overflow-hidden ${
          cancelling
            ? "bg-red-950/30"
            : isComplete
            ? "bg-status-green-track"
            : "bg-surface-800"
        }`}
      >
        {/* Indeterminate: sliding shimmer bar */}
        {isIndeterminate && (
          <>
            <div className="absolute inset-0 bg-surface-800 rounded-full" />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-brand-500/60 to-transparent animate-indeterminate" />
            </div>
          </>
        )}

        {/* Normal: animated shimmer overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent animate-pulse rounded-full" />
        )}

        {/* Fill bar */}
        {!isIndeterminate && (
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isComplete
                ? "bg-status-green-dot"
                : cancelling
                ? "bg-red-600/50"
                : "bg-gradient-to-r from-brand-600 to-brand-500"
            }`}
            style={{
              width: `${displayProgress}%`,
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}

        {/* Glow dot on processing bar */}
        {isProcessing && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-400 shadow-md shadow-brand-500/50"
            style={{
              left: `calc(${displayProgress}% - 6px)`,
              transition: "left 700ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}
      </div>

      {/* ── Info row: ETA + Cancel button ── */}
      {(isProcessing || isIndeterminate) && (
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* ETA */}
            {isProcessing && eta !== null && eta > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] text-surface-500 font-mono tabular-nums">
                <span className="inline-block w-1 h-1 rounded-full bg-surface-600" />
                ETA {formatETA(eta)}
              </span>
            )}
            {/* Sub-stage indicator */}
            {isProcessing && (
              <div className="flex-1 h-0.5 rounded-full bg-brand-500/15 overflow-hidden max-w-[100px]">
                <div
                  className="h-full bg-brand-500/40 rounded-full"
                  style={{
                    width: `${Math.min(displayProgress, 100)}%`,
                    transition: "width 700ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            )}
            {isIndeterminate && (
              <span className="text-[11px] text-surface-500 font-mono animate-pulse">
                Initializing...
              </span>
            )}
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         text-xs font-medium text-status-red text-status-red-hover
                         bg-red-950/30 hover:bg-red-950/50 border border-red-900/40
                         transition-all duration-150 active:scale-95"
            >
              <IconX size={12} />
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ── Log output ── */}
      {log && log.length > 0 && (isProcessing || isIndeterminate) && (
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

      {/* ── Completion info ── */}
      {isComplete && elapsed > 0 && (
        <div className="mt-3 pt-3 border-t border-status-green-divider">
          <div className="flex items-center gap-2 text-[11px] text-surface-500 font-mono">
            <IconClock size={11} className="text-status-green-muted" />
            Completed in {formatTime(elapsed)}
          </div>
        </div>
      )}
    </div>
  );
}
