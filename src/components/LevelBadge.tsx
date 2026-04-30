import { LEVELS } from "@/data/rooms";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  showName?: boolean;
  className?: string;
}

export const LevelBadge = ({ level, showName, className }: LevelBadgeProps) => {
  const lv = LEVELS.find((l) => l.id === level) ?? LEVELS[0];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary", className)}>
      <span>{lv.emoji}</span>
      {showName && <span>{lv.name}</span>}
    </span>
  );
};
