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
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition-smooth hover:border-primary hover:text-primary">
          <Plus className="h-4 w-4" />
        </div>
        <span className="text-[9px] text-muted-foreground">{index + 1}</span>
      </div>
    );
  }

  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground transition-smooth",
            user.speaking && "speaker-ring speaker-ring-active"
          )}
        >
          {initials}
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-card text-[9px] leading-none">
          {user.flag}
        </span>
        <span
          className={cn(
            "absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full border border-background text-[9px]",
            user.speaking ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {user.speaking ? <Mic className="h-2.5 w-2.5" /> : <MicOff className="h-2.5 w-2.5" />}
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
