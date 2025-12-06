import { cn } from "@/lib/utils";

interface QuickSelectTagsProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
  singleSelect?: boolean;
}

export function QuickSelectTags({ options, selected, onToggle, className, singleSelect }: QuickSelectTagsProps) {
  const handleToggle = (value: string) => {
    if (singleSelect) {
      onToggle(value);
    } else {
      onToggle(value);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleToggle(option)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
            selected.includes(option)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
