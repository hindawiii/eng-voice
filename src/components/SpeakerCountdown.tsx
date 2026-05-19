import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact blinking crimson countdown visible ONLY to the active speaker.
 */
export const SpeakerCountdown = ({ seconds, className }: { seconds: number; className?: string }) => {
  const mm = Math.floor(seconds / 60);
  const ss = (seconds % 60).toString().padStart(2, "0");
  const low = seconds <= 10;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[hsl(348_83%_47%/0.15)] px-2.5 py-1 text-[11px] font-bold tabular-nums text-[hsl(348_83%_47%)]",
        "animate-pulse ring-1 ring-[hsl(348_83%_47%/0.4)]",
        low && "ring-2 ring-[hsl(348_83%_47%)]",
        className
      )}
    >
      <Timer className="h-3 w-3" />
      {mm}:{ss}
    </span>
  );
};
