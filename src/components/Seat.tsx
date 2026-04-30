import { Mic, MicOff, Plus } from "lucide-react";
import { SeatUser } from "@/data/rooms";
import { ProBadge } from "./ProBadge";
import { LevelBadge } from "./LevelBadge";
import { cn } from "@/lib/utils";

interface SeatProps {
  user?: SeatUser;
  index: number;
  timeLeft?: number; // seconds, for active speaker
}

export const Seat = ({ user, index, timeLeft }: SeatProps) => {
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition-smooth hover:border-primary hover:text-primary">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted-foreground">Seat {index + 1}</span>
      </div>
    );
  }

  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-primary-foreground transition-smooth",
            user.speaking && "speaker-ring speaker-ring-active"
          )}
        >
          {initials}
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-card text-xs">
          {user.flag}
        </span>
        <span
          className={cn(
            "absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-xs",
            user.speaking ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {user.speaking ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 text-sm font-semibold">
          {user.name}
          {user.pro && <ProBadge label="" className="px-1" />}
        </div>
        <div className="flex items-center gap-1">
          <LevelBadge level={user.level} />
          {user.speaking && timeLeft !== undefined && (
            <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-gold-foreground tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
