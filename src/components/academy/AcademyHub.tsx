import { useState } from "react";
import { Link } from "react-router-dom";
import { ACADEMY_LANGS, LANG_ONLINE } from "@/data/academy";
import { useCustomRooms } from "@/data/customRooms";
import { cn } from "@/lib/utils";
import { LanguageCorner } from "./LanguageCorner";
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
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {activeRooms.map((r) => (
                  <Tooltip key={r.key}>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/room/${r.key}`}
                        className="group flex flex-col items-center gap-1 outline-none"
                      >
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-xl ring-1 ring-gold/40 transition-all group-hover:-translate-y-0.5 group-hover:ring-gold">
                            {r.flag}
                          </div>
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                        </div>
                        <span className="max-w-[56px] truncate text-[10px] font-semibold text-foreground/80">
                          {r.language}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[190px] font-arabic">
                      <p className="text-xs font-bold">{r.language}</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-foreground/80">{r.topic}</p>
                      <p className="mt-0.5 text-[10px] text-gold">{r.liveUsers} مباشر</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

        )}
      </div>
    </TooltipProvider>
  );
};
