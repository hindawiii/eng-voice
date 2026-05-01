import { Crown, MicOff, RotateCcw, Tv, UserMinus, Plus, Settings as Cog } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface Props {
  turnLength: number; // seconds
  onTurnLengthChange: (s: number) => void;
  onResetTimer: () => void;
  onExtendTimer: () => void;
  onMuteAll: () => void;
  onWatchAd: () => void;
  onOpenSettings: () => void;
}

export const AdminPanel = ({
  turnLength,
  onTurnLengthChange,
  onResetTimer,
  onExtendTimer,
  onMuteAll,
  onWatchAd,
  onOpenSettings,
}: Props) => {
  const { lang } = useI18n();
  return (
    <section className="mt-5 rounded-3xl bg-gradient-to-br from-primary to-primary-glow p-5 text-primary-foreground shadow-elegant">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <Crown className="h-4 w-4 text-gold" />
          {lang === "ar" ? "لوحة المشرف" : "Admin Panel"}
        </h2>
        <button
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-smooth hover:bg-white/25"
          aria-label="Room settings"
        >
          <Cog className="h-4 w-4" />
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-80">
          {lang === "ar" ? "مدة التحدث" : "Speaking time"}
        </p>
        <div className="flex gap-2">
          {[60, 120, 180].map((s) => (
            <button
              key={s}
              onClick={() => onTurnLengthChange(s)}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-smooth ${
                turnLength === s
                  ? "bg-gold text-gold-foreground shadow-gold"
                  : "bg-white/15 hover:bg-white/25"
              }`}
            >
              {s / 60} {lang === "ar" ? "د" : "min"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onExtendTimer}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/15 py-2 text-xs font-semibold transition-smooth hover:bg-white/25"
        >
          <Plus className="h-3.5 w-3.5" /> {lang === "ar" ? "+30 ث" : "+30s"}
        </button>
        <button
          onClick={onResetTimer}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/15 py-2 text-xs font-semibold transition-smooth hover:bg-white/25"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {lang === "ar" ? "إعادة" : "Reset"}
        </button>
        <button
          onClick={onMuteAll}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/15 py-2 text-xs font-semibold transition-smooth hover:bg-white/25"
        >
          <MicOff className="h-3.5 w-3.5" /> {lang === "ar" ? "كتم الكل" : "Mute all"}
        </button>
        <button
          onClick={onWatchAd}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-gold py-2 text-xs font-bold text-gold-foreground shadow-gold transition-spring hover:scale-105"
        >
          <Tv className="h-3.5 w-3.5" /> {lang === "ar" ? "+15 د بإعلان" : "+15m via Ad"}
        </button>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] opacity-75">
        <UserMinus className="h-3 w-3" />
        {lang === "ar"
          ? "اضغط على متحدث لكتمه أو نقله إلى المستمعين أو طرده."
          : "Tap a speaker to mute, demote to listener, or kick."}
      </p>
    </section>
  );
};
