import { useState } from "react";
import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import { ACADEMY_LANGS, LANG_ONLINE, generateTalkRooms } from "@/data/academy";
import { cn } from "@/lib/utils";
import { LanguageCorner } from "./LanguageCorner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ALL = { key: "all", labelAr: "الكل", flag: "🌍" } as const;

const LEVEL_STYLE: Record<string, { ar: string; color: string }> = {
  beginner: { ar: "مبتدئ", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  intermediate: { ar: "متوسط", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  advanced: { ar: "متقدم", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
};

export const AcademyHub = () => {
  const [active, setActive] = useState<string>("all");
  const lang = ACADEMY_LANGS.find((l) => l.key === active);

  const items = [ALL, ...ACADEMY_LANGS];

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
              🎙️ كل غرف التحدث النشطة
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {ACADEMY_LANGS.flatMap((L) =>
                generateTalkRooms(L.key).map((r) => ({ ...r, langFlag: L.flag, langAr: L.labelAr }))
              )
                .sort((a, b) => b.live - a.live)
                .map((r) => {
                  const meta = LEVEL_STYLE[r.level];
                  return (
                    <Link
                      key={r.id}
                      to={`/room/${r.id}`}
                      className="block rounded-2xl border border-border bg-card p-4 hover:border-gold/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{r.langFlag}</span>
                          <div>
                            <h4 className="font-bold text-foreground text-sm">{r.titleAr}</h4>
                            <p className="text-[11px] text-muted-foreground font-arabic">{r.langAr}</p>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.color}`}>
                          {meta.ar}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-foreground/70">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                          </span>
                          <span className="text-gold font-bold">{r.live}</span> مباشر
                        </span>
                        <span className="flex items-center gap-1 text-foreground/70">
                          <Mic className="h-3 w-3" /> صوتي
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
