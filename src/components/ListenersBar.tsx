import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ListenerLevel = "beginner" | "intermediate" | "advanced";

export interface ListenerItem {
  id: string;
  name: string;
  flag: string;
  level?: ListenerLevel;
  premium?: boolean;
  muted?: boolean;
}

const LEVEL_RING: Record<ListenerLevel, string> = {
  beginner: "ring-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
  intermediate: "ring-gold/80 shadow-gold",
  advanced: "ring-purple-500/80 shadow-[0_0_12px_rgba(139,92,246,0.4)]",
};

const inferLevel = (id: string): ListenerLevel => {
  const s = id.charCodeAt(id.length - 1) % 3;
  return (["beginner", "intermediate", "advanced"] as const)[s];
};

interface Props {
  listeners: ListenerItem[];
  onSelect?: (l: ListenerItem) => void;
  onInvite?: () => void;
  titleAr?: string;
}

export const ListenersBar = ({
  listeners,
  onSelect,
  onInvite,
  titleAr = "المستمعون",
}: Props) => {
  return (
    <TooltipProvider delayDuration={200}>
      <section className="rounded-3xl bg-card/70 border border-border/60 p-3 shadow-soft">
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
            <span>👥</span> {titleAr}
            <span dir="ltr" className="text-gold font-black tabular-nums">
              {listeners.length}
            </span>
          </h3>
        </div>
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex items-start gap-3 min-w-max px-1 pb-1">
            {listeners.map((l) => {
              const level = l.level ?? inferLevel(l.id);
              return (
                <Tooltip key={l.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelect?.(l)}
                      className="group flex w-[44px] flex-col items-center gap-1 transition-transform hover:-translate-y-0.5"
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-foreground ring-2 transition-all",
                            LEVEL_RING[level],
                            "group-hover:brightness-110"
                          )}
                        >
                          {l.name.slice(0, 2).toUpperCase()}
                        </div>

                        {/* Flag badge */}
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background text-[8px] leading-none shadow-soft border border-border">
                          {l.flag}
                        </span>
                        {/* Premium crown */}
                        {l.premium && (
                          <span className="absolute -top-1 -right-1 text-[11px] leading-none">
                            👑
                          </span>
                        )}
                        {/* Muted */}
                        {l.muted && (
                          <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px]">
                            🔇
                          </span>
                        )}
                      </div>
                      <span className="max-w-[44px] truncate text-[9px] font-medium text-foreground/80">
                        {l.name}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-arabic">
                    {l.name} · {level === "beginner" ? "مبتدئ" : level === "intermediate" ? "متوسط" : "متقدم"}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {onInvite && (
              <button
                onClick={onInvite}
                className="flex w-[44px] flex-col items-center gap-1"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gold/50 text-gold transition-all hover:bg-gold/10 hover:border-gold">
                  <UserPlus className="h-3.5 w-3.5" />
                </div>
                <span className="text-[9px] font-bold text-gold">دعوة</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};
