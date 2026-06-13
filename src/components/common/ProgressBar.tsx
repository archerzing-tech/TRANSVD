interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({ progress, label, showPercent = true }: ProgressBarProps) {
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercent && (
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
