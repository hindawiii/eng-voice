import { useState } from "react";
import { ACADEMY_LANGS, LANG_ONLINE } from "@/data/academy";
import { cn } from "@/lib/utils";
import { LanguageCorner } from "./LanguageCorner";
import { RoomCard } from "@/components/RoomCard";
import { ROOMS } from "@/data/rooms";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ALL = { key: "all", labelAr: "الكل", flag: "🌍" } as const;

export const AcademyHub = () => {
  const [active, setActive] = useState<string>("all");
  const lang = ACADEMY_LANGS.find((l) => l.key === active);

  const items = [ALL, ...ACADEMY_LANGS];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4 px-4 pt-4">
        {/* Flag-only pills with fade edges */}
        <div className="relative -mx-1">
          <div className="pointer-events-none absolute inset-y-0 start-0 w-8 z-10 bg-gradient-to-e from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 end-0 w-8 z-10 bg-gradient-to-w from-background to-transparent" />
          <div className="no-scrollbar overflow-x-auto px-1">
            <div className="flex gap-2 min-w-max py-1">
              {items.map((l) => {
                const isActive = active === l.key;
                const online = LANG_ONLINE[l.key] ?? 0;
                return (
                  <Tooltip key={l.key}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActive(l.key)}
                        aria-label={l.labelAr}
                        className={cn(
                          "group inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-bold whitespace-nowrap transition-all",
                          isActive
                            ? "bg-gold/15 text-gold border-gold shadow-gold"
                            : "bg-card text-foreground/85 border-border hover:border-gold/40"
                        )}
                      >
                        <span className="text-[22px] leading-none">{l.flag}</span>
                        {online > 0 && (
                          <span
                            dir="ltr"
                            className={cn(
                              "text-[11px] font-black tabular-nums",
                              isActive ? "text-gold" : "text-foreground/75"
                            )}
                          >
                            {online}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="font-arabic">
                      {l.labelAr}{online ? ` · ${online} متصل` : ""}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {lang ? (
          <LanguageCorner lang={lang} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {ROOMS.map((r) => (<RoomCard key={r.key} room={r} />))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
