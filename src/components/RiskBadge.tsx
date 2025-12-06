import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/demoMode";

interface RiskBadgeProps {
  level: RiskLevel;
  score: number;
  className?: string;
}

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const variants = {
    high: "bg-risk-high text-risk-high-foreground",
    medium: "bg-risk-medium text-risk-medium-foreground",
    low: "bg-risk-low text-risk-low-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold",
        variants[level],
        className
      )}
      role="status"
      aria-label={`Risk level ${level}, score ${score}`}
    >
      <span className="uppercase tracking-wide">{level}</span>
      <span className="text-xs opacity-90">({score})</span>
    </div>
  );
}
