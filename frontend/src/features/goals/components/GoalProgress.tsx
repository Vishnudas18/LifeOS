interface GoalProgressProps {
  progress: number; // 0 - 100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GoalProgress({
  progress,
  showLabel = true,
  size = "md",
  className = "",
}: GoalProgressProps) {
  const normalized = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const getGradient = (value: number) => {
    if (value === 100) return "bg-emerald-500";
    if (value >= 75) return "bg-gradient-to-r from-blue-500 to-indigo-600";
    if (value >= 40) return "bg-gradient-to-r from-amber-500 to-indigo-500";
    return "bg-gradient-to-r from-rose-500 to-amber-500";
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-mono">{normalized}%</span>
        </div>
      )}
      <div
        className={`w-full bg-muted/60 rounded-full overflow-hidden ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={normalized}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${normalized}%`}
      >
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${getGradient(
            normalized
          )}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
