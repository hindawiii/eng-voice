import { Coins, Crown, Gift, MapPin, Play, Settings, Share2, TrendingUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ProBadge } from "@/components/ProBadge";
import { LEVELS } from "@/data/rooms";
import { useI18n } from "@/i18n/I18nProvider";

const USER = {
  name: "Yusuf Al-Amin",
  handle: "@yusuf",
  flag: "🇸🇩",
  country: { en: "Sudan", ar: "السودان" },
  city: { en: "Khartoum", ar: "الخرطوم" },
  gender: "male" as "male" | "female",
  xp: 1340,
  lp: 1240,
  level: 3,
  streak: 12,
  pro: false,
};

const RECEIVED_GIFTS = [
  { id: "g1", emoji: "🌹", from: "Layla", count: 12 },
  { id: "g2", emoji: "👑", from: "Hans", count: 2 },
  { id: "g3", emoji: "💎", from: "Min", count: 1 },
  { id: "g4", emoji: "🍀", from: "Léa", count: 5 },
  { id: "g5", emoji: "⭐", from: "Aria", count: 7 },
  { id: "g6", emoji: "🔥", from: "Emir", count: 3 },
];

const Profile = () => {
  const { t, lang } = useI18n();
  const currentLevel = LEVELS.find((l) => l.id === USER.level)!;
  const nextLevel = LEVELS.find((l) => l.id === USER.level + 1);
  const progress = nextLevel
    ? Math.min(100, ((USER.xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;

  return (
    <AppShell>
      <header className="bg-gradient-hero px-6 pb-20 pt-12 text-primary-foreground">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
          <Link
            to="/settings"
            aria-label={t("settings.title")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-smooth hover:bg-white/20"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="space-y-5 px-5 -mt-14">
        {/* Identity card */}
        <section className="rounded-3xl bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary text-3xl font-black text-primary-foreground shadow-soft">
                YA
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card text-lg">
                {USER.flag}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{USER.name}</h2>
                {USER.pro && <ProBadge />}
              </div>
              <p className="text-sm text-muted-foreground">{USER.handle}</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-gold-foreground">
                🔥 {USER.streak}-{t("profile.streak")}
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-smooth hover:bg-primary hover:text-primary-foreground">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Level progress */}
          <div className="mt-6 rounded-2xl bg-primary-soft p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-primary">
                {currentLevel.emoji} {lang === "ar" ? currentLevel.nameAr : currentLevel.name} · Lv {currentLevel.id}
              </span>
              {nextLevel && (
                <span className="text-xs text-muted-foreground">
                  {USER.xp} / {nextLevel.min} {t("profile.xp")}
                </span>
              )}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-gradient-gold transition-smooth" style={{ width: `${progress}%` }} />
            </div>
            {nextLevel && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("profile.next")}: <span className="font-semibold text-foreground">{nextLevel.emoji} {lang === "ar" ? nextLevel.nameAr : nextLevel.name}</span> {t("profile.in")} {nextLevel.min - USER.xp} {t("profile.xp")}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> {t("profile.xp")}
              </div>
              <p className="mt-1 text-2xl font-black">{USER.xp.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border bg-gold-soft/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Coins className="h-3.5 w-3.5 text-gold" /> {t("profile.lp")}
              </div>
              <p className="mt-1 text-2xl font-black text-gold-foreground">{USER.lp.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Levels ladder */}
        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("profile.journey")}</h3>
          <div className="flex items-center justify-between">
            {LEVELS.map((l) => {
              const reached = USER.level >= l.id;
              return (
                <div key={l.id} className="flex flex-col items-center gap-1">
                  <div
                    className={
                      "flex h-12 w-12 items-center justify-center rounded-full text-xl transition-spring " +
                      (reached
                        ? "bg-gradient-gold shadow-gold"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {l.emoji}
                  </div>
                  <span className={"text-[11px] font-semibold " + (reached ? "text-foreground" : "text-muted-foreground")}>
                    {lang === "ar" ? l.nameAr : l.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Earn LP */}
        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("profile.earnLp")}</h3>
          <button className="flex w-full items-center gap-3 rounded-2xl bg-secondary p-4 text-start transition-smooth hover:bg-primary-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Play className="h-5 w-5" fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{t("profile.watchAd")}</p>
              <p className="text-xs text-muted-foreground">{t("profile.adSub")}</p>
            </div>
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">+25 {t("profile.lp")}</span>
          </button>
        </section>

        {/* Pro upsell */}
        {!USER.pro && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                <h3 className="text-lg font-bold">{t("profile.goPro")}</h3>
              </div>
              <p className="mt-1 text-sm text-primary-foreground/80">
                {t("profile.proPerks")}
              </p>
              <button className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-bold text-gold-foreground shadow-gold transition-spring hover:scale-[1.02]">
                {t("profile.upgrade")}
              </button>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default Profile;
