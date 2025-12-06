import { useScrollAnimation, useCounterAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: LucideIcon;
  className?: string;
  duration?: number;
}

export function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  icon: Icon,
  className,
  duration = 2000,
}: StatCounterProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const count = useCounterAnimation(value, isVisible, duration);

  return (
    <div
      ref={ref}
      className={cn(
        "text-center p-6 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {Icon && (
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      )}
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-2 font-medium">{label}</div>
    </div>
  );
}
