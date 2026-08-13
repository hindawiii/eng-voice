import { useState } from "react";
import { Link } from "react-router-dom";
import { ACADEMY_LANGS, LANG_ONLINE } from "@/data/academy";
import { useCustomRooms } from "@/data/customRooms";
import { cn } from "@/lib/utils";
import { LanguageCorner } from "./LanguageCorner";
import { ActiveRoomCard } from "@/components/ActiveRoomCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const ALL = { key: "all", labelAr: "الكل", flag: "🌍" } as const;


export const AcademyHub = () => {
  const [active, setActive] = useState<string>("all");
  const lang = ACADEMY_LANGS.find((l) => l.key === active);

  const items = [ALL, ...ACADEMY_LANGS];
  const activeRooms = useCustomRooms().filter((r) => (r.status ?? "active") === "active");


  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4 px-4 pt-4">
        {/* Flag-only pills with fade edges */}
        <div className="relative -mx-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-background to-transparent" />
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
          <div className="space-y-3">
            <h3 className="font-arabic text-sm font-bold text-foreground/85 px-1">
              🎙️ الغرف النشطة الآن
            </h3>
            {activeRooms.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center font-arabic text-xs text-muted-foreground">
                لا توجد غرف نشطة حالياً — كن أول من ينشئ غرفة!
              </p>
            ) : (
              <div className="space-y-2.5">
                {activeRooms.map((r) => (
                  <ActiveRoomCard key={r.key} room={r} />
                ))}
              </div>
            )}
          </div>

        )}
      </div>
    </TooltipProvider>
  );
};
