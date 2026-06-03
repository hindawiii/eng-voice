import { CheckCircle2, Circle, Sprout, Lock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useOnboarding, MISSION_IDS, MISSION_LABELS } from "@/hooks/useOnboarding";
import { cn } from "@/lib/utils";

export const BeginnerMissions = () => {
  const { lang } = useI18n();
  const { state, completed, total, isSeedling, completeMission } = useOnboarding();

  const progress = (completed / total) * 100;

  return (
    <section className="rounded-3xl border border-border bg-[hsl(220_39%_11%)] p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl text-xl shadow-soft",
              isSeedling ? "bg-gradient-gold text-gold-foreground" : "bg-emerald-500/15 text-emerald-400"
            )}
          >
            {isSeedling ? "🌿" : <Sprout className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
              {lang === "ar" ? "مهام البداية" : "Beginner Missions"}
            </p>
            <p className="text-sm font-bold text-white">
              {isSeedling
                ? lang === "ar" ? "وصلت لمستوى نبتة 🌿 — استضافة الغرف مفتوحة!" : "Seedling 🌿 unlocked — hosting open!"
                : lang === "ar"
                  ? `أكمل ${total - completed} مهام لفتح مستوى نبتة 🌿`
                  : `Finish ${total - completed} more to unlock Seedling 🌿`}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-black text-gold">
          {completed}/{total}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-gradient-gold transition-smooth" style={{ width: `${progress}%` }} />
      </div>

      <ol className="mt-4 space-y-1.5">
        {MISSION_IDS.map((id, i) => {
          const done = state[id];
          return (
            <li key={id}>
              <button
                onClick={() => !done && completeMission(id)}
                disabled={done}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-smooth",
                  done
                    ? "border-gold/30 bg-gold/5 text-white"
                    : "border-border bg-card text-white/85 hover:border-gold/40 hover:bg-card/80"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black",
                    done ? "bg-gold text-gold-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("flex-1 text-sm font-semibold", done && "line-through opacity-80")}>
                  {MISSION_LABELS[id][lang]}
                </span>
                {!done && <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </li>
          );
        })}
      </ol>

      {!isSeedling && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/60">
          <Lock className="h-3 w-3 text-gold" />
          {lang === "ar"
            ? "إنشاء الغرف مقفل حتى الوصول لمستوى نبتة 🌿"
            : "Room hosting is locked until you reach Seedling 🌿"}
        </p>
      )}
    </section>
  );
};
