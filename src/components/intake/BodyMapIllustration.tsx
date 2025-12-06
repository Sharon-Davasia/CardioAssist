import { cn } from "@/lib/utils";

interface BodyMapIllustrationProps {
  selectedSites: string[];
  onToggleSite: (site: string) => void;
  className?: string;
}

const BODY_SITES = [
  { id: "head", label: "Head", x: 50, y: 8, width: 20, height: 12 },
  { id: "neck", label: "Neck", x: 50, y: 20, width: 12, height: 6 },
  { id: "chest", label: "Chest", x: 50, y: 32, width: 30, height: 16 },
  { id: "abdomen", label: "Abdomen", x: 50, y: 50, width: 26, height: 14 },
  { id: "pelvis", label: "Pelvis", x: 50, y: 65, width: 28, height: 10 },
  { id: "left-arm", label: "L. Arm", x: 22, y: 38, width: 10, height: 30 },
  { id: "right-arm", label: "R. Arm", x: 78, y: 38, width: 10, height: 30 },
  { id: "left-leg", label: "L. Leg", x: 38, y: 78, width: 12, height: 20 },
  { id: "right-leg", label: "R. Leg", x: 62, y: 78, width: 12, height: 20 },
];

export function BodyMapIllustration({ selectedSites, onToggleSite, className }: BodyMapIllustrationProps) {
  return (
    <div className={cn("relative w-full max-w-[200px] aspect-[1/1.5]", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Body outline */}
        <ellipse cx="50" cy="12" rx="10" ry="10" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="44" y="20" width="12" height="6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="35" y="26" width="30" height="22" rx="2" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="37" y="48" width="26" height="14" rx="1" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="36" y="62" width="28" height="8" rx="1" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="17" y="28" width="8" height="30" rx="3" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="75" y="28" width="8" height="30" rx="3" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="36" y="70" width="10" height="28" rx="3" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        <rect x="54" y="70" width="10" height="28" rx="3" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />
        
        {/* Clickable regions */}
        {BODY_SITES.map((site) => (
          <g key={site.id} onClick={() => onToggleSite(site.id)} className="cursor-pointer">
            <rect
              x={site.x - site.width / 2}
              y={site.y - site.height / 2}
              width={site.width}
              height={site.height}
              rx="2"
              fill={selectedSites.includes(site.id) ? "#ef4444" : "transparent"}
              fillOpacity={selectedSites.includes(site.id) ? 0.5 : 0}
              stroke={selectedSites.includes(site.id) ? "#ef4444" : "transparent"}
              strokeWidth="1"
              className="transition-all hover:fill-red-200 hover:fill-opacity-50"
            />
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground">Click to select injury sites</p>
      </div>
    </div>
  );
}
