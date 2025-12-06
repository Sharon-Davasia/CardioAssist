import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/demoMode";
import { Clock, CheckCircle2, AlertCircle, Activity } from "lucide-react";

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    new: {
      icon: Clock,
      label: "New",
      className: "bg-status-new/10 text-status-new border-status-new/20",
    },
    "in-progress": {
      icon: Activity,
      label: "In Progress",
      className: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
    },
    completed: {
      icon: CheckCircle2,
      label: "Completed",
      className: "bg-status-completed/10 text-status-completed border-status-completed/20",
    },
    escalated: {
      icon: AlertCircle,
      label: "Escalated",
      className: "bg-status-escalated/10 text-status-escalated border-status-escalated/20",
    },
  };

  const { icon: Icon, label, className: variantClass } = config[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium",
        variantClass,
        className
      )}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
