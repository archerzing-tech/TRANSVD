interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({ progress, label, showPercent = true }: ProgressBarProps) {
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-surface-400">{label}</span>}
          {showPercent && (
            <span className="text-sm text-surface-500 font-mono text-xs">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-track">
        <div
          className="progress-bar"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
