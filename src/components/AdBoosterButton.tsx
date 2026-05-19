import { Zap, Tv } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useDailyAllowance, AD_BONUS_MIN, MAX_ADS } from "@/hooks/useDailyAllowance";
import { toast } from "sonner";

export const AdBoosterButton = () => {
  const { lang } = useI18n();
  const { adsWatched, totalAllowedMin, remainingSec, canWatchAd, watchAd } = useDailyAllowance();

  const trigger = () => {
    if (!canWatchAd) {
      toast.error(lang === "ar" ? "وصلت الحد الأقصى للإعلانات اليوم" : "Daily ad limit reached");
      return;
    }
    toast.loading(lang === "ar" ? "جارٍ تشغيل الإعلان…" : "Playing ad…", { id: "ad" });
    setTimeout(() => {
      if (watchAd()) {
        toast.success(
          lang === "ar" ? `+${AD_BONUS_MIN} دقيقة!` : `+${AD_BONUS_MIN} min!`,
          { id: "ad" }
        );
      }
    }, 1500);
  };

  return (
    <section className="rounded-3xl bg-gradient-hero p-4 text-primary-foreground shadow-elegant">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider opacity-80">
            {lang === "ar" ? "رصيدك اليومي" : "Daily allowance"}
          </p>
          <p className="text-xl font-bold tabular-nums">
            {Math.floor(remainingSec / 60)} / {totalAllowedMin} {lang === "ar" ? "د" : "min"}
          </p>
          <p className="text-[10px] opacity-70">
            {lang === "ar" ? `إعلانات: ${adsWatched}/${MAX_ADS}` : `Ads: ${adsWatched}/${MAX_ADS}`}
          </p>
        </div>
        <button
          onClick={trigger}
          disabled={!canWatchAd}
          className="flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground shadow-gold transition-spring hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Zap className="h-3.5 w-3.5" />
          {lang === "ar" ? `+${AD_BONUS_MIN} د بإعلان` : `+${AD_BONUS_MIN}m via Ad`}
          <Tv className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
};
