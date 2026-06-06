import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Crown,
  Eye,
  Gift,
  Mic2,
  Play,
  Settings,
  TrendingUp,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ProBadge } from "@/components/ProBadge";
import { AdBoosterButton } from "@/components/AdBoosterButton";
import { RoomScheduler } from "@/components/RoomScheduler";
import { BeginnerMissions } from "@/components/BeginnerMissions";
import { ProfileGpsDropdown } from "@/components/ProfileGpsDropdown";
import { LEVELS } from "@/data/rooms";
import { useI18n } from "@/i18n/I18nProvider";
import { useOnboarding, MISSION_IDS, MISSION_LABELS } from "@/hooks/useOnboarding";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const USER = {
  name: "Yusuf Al-Amin",
  handle: "@yusuf",
  flag: "🇸🇩",
  countryCode: "SD",
  country: { en: "Sudan", ar: "السودان" },
  city: { en: "Port Sudan", ar: "بورتسودان" },
  gender: "male" as "male" | "female",
  xp: 1340,
  lp: 1240,
  level: 3,
  streak: 12,
  pro: false,
  stats: { posts: 24, following: 138, followers: 412, visitors: 1820 },
};

const RECEIVED_GIFTS = [
  { id: "g1", emoji: "🌹", from: "Layla", count: 12 },
  { id: "g2", emoji: "👑", from: "Hans", count: 2 },
  { id: "g3", emoji: "💎", from: "Min", count: 1 },
  { id: "g4", emoji: "🍀", from: "Léa", count: 5 },
  { id: "g5", emoji: "⭐", from: "Aria", count: 7 },
  { id: "g6", emoji: "🔥", from: "Emir", count: 3 },
];

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

// Compact 5-row missions preview with "show more" expanding to the full BeginnerMissions checklist.
const CompactMissions = () => {
  const { lang } = useI18n();
  const { state, completed, total, isSeedling, completeMission } = useOnboarding();
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return (
      <div className="space-y-2">
        <BeginnerMissions />
        <button
          onClick={() => setExpanded(false)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 py-2 text-xs font-bold text-gold hover:bg-slate-900/70"
        >
          {lang === "ar" ? "عرض أقل" : "Show less"} <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const first = MISSION_IDS.slice(0, 5);
  const progress = (completed / total) * 100;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            {lang === "ar" ? "مهام البداية" : "Beginner Missions"}
          </p>
          <p className="text-sm font-bold text-white" dir="ltr">
            {completed}/{total} · {isSeedling ? "🌿 Seedling" : (lang === "ar" ? "اقترب من نبتة 🌿" : "Almost Seedling 🌿")}
          </p>
        </div>
        <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-black text-gold" dir="ltr">
          {completed}/{total}
        </span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-900">
        <div className="h-full rounded-full bg-gradient-gold transition-smooth" style={{ width: `${progress}%` }} />
      </div>
      <ol className="space-y-1.5">
        {first.map((id, i) => {
          const done = state[id];
          return (
            <li key={id}>
              <button
                onClick={() => !done && completeMission(id)}
                disabled={done}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-start transition-smooth",
                  done
                    ? "border-gold/30 bg-gold/5 text-white"
                    : "border-slate-800 bg-slate-900/60 text-white/85 hover:border-gold/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black",
                    done ? "bg-gold text-gold-foreground" : "bg-slate-800 text-white/70"
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("flex-1 text-sm font-semibold", done && "line-through opacity-80")}>
                  {MISSION_LABELS[id][lang]}
                </span>
                {!done && <Circle className="h-3.5 w-3.5 text-white/40" />}
              </button>
            </li>
          );
        })}
      </ol>
      <button
        onClick={() => setExpanded(true)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gold/15 py-2 text-xs font-black text-gold hover:bg-gold/25"
      >
        {lang === "ar" ? "عرض المزيد" : "Show more"} <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {!isSeedling && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/60">
          <Lock className="h-3 w-3 text-gold" />
          {lang === "ar" ? "إنشاء الغرف مقفل حتى نبتة 🌿" : "Hosting locked until Seedling 🌿"}
        </p>
      )}
    </section>
  );
};

const Profile = () => {
  const { t, lang } = useI18n();
  const currentLevel = LEVELS.find((l) => l.id === USER.level)!;
  const nextLevel = LEVELS.find((l) => l.id === USER.level + 1);
  const progress = nextLevel
    ? Math.min(100, ((USER.xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;

  const socialStats = useMemo(
    () => [
      { Icon: Mic2, value: USER.stats.posts, label: lang === "ar" ? "المنشورات" : "Posts" },
      { Icon: UserPlus, value: USER.stats.following, label: lang === "ar" ? "أتابع" : "Following" },
      { Icon: UsersIcon, value: USER.stats.followers, label: lang === "ar" ? "المتابعون" : "Followers" },
      { Icon: Eye, value: USER.stats.visitors, label: lang === "ar" ? "الزوار" : "Visitors" },
    ],
    [lang]
  );

  return (
    <AppShell>
      {/* Global brand header with pulsing GPS dropdown */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#070A13]/90 px-5 py-3 backdrop-blur-lg">
        <div className="flex items-center justify-between gap-3">
          <ProfileGpsDropdown />
          <h1 className="text-lg font-black tracking-wide text-white">
            <span className="text-gold">Eng</span>voice
          </h1>
          <Link
            to="/settings"
            aria-label={t("settings.title")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-950/70 text-white/85 transition-smooth hover:text-gold"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black text-white">{t("profile.title")}</h2>
            <p className="text-[11px] font-semibold text-white/60">
              {USER.flag} {USER.country[lang]} · {USER.city[lang]}
            </p>
          </div>
          <span className="rounded-full border border-gold/40 bg-slate-950/70 px-2.5 py-1 text-[10px] font-black text-gold" dir="ltr">
            🔥 {USER.streak} {t("profile.streak")}
          </span>
        </div>
      </header>

      <div className="space-y-4 px-5 pt-4">
        {/* Social stats bar */}
        <section className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
          {socialStats.map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 py-1">
              <Icon className="h-4 w-4 text-gold" />
              <span className="text-lg font-black leading-tight text-gold" dir="ltr">
                {fmt(value)}
              </span>
              <span className="text-[10px] font-semibold text-white/80">{label}</span>
            </div>
          ))}
        </section>

        {/* Consolidated user info container */}
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/90 via-[#0B1024]/90 to-slate-950/90 p-5 shadow-elegant">
          {/* Avatar + identity grouped right */}
          <div className="flex items-start justify-end gap-4 rtl:flex-row-reverse" dir="rtl">
            <div className="flex-1 text-end rtl:text-end">
              <div className="flex items-center justify-end gap-2">
                <h3 className="text-lg font-black text-white">{USER.name}</h3>
                {USER.pro && <ProBadge />}
              </div>
              <p className="text-xs text-white/60">{USER.handle}</p>
              <p className="mt-1 text-[11px] font-semibold text-gold" dir="ltr">
                {USER.flag} {USER.countryCode} · {USER.city.en}
              </p>
            </div>
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-amber-600 text-2xl font-black text-gold-foreground shadow-gold">
                YA
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-900 text-base">
                {USER.flag}
              </span>
            </div>
          </div>

          {/* Level progress */}
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-black text-white" dir="ltr">
                {currentLevel.emoji} Lv {currentLevel.id} · {lang === "ar" ? currentLevel.nameAr : currentLevel.name}
              </span>
              {nextLevel && (
                <span className="text-[11px] font-semibold text-white/70" dir="ltr">
                  {fmt(USER.xp)} / {fmt(nextLevel.min)} XP
                </span>
              )}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-950">
              <div className="h-full rounded-full bg-gradient-gold transition-smooth" style={{ width: `${progress}%` }} />
            </div>
            {nextLevel && (
              <p className="mt-2 text-[11px] text-white/60">
                {t("profile.next")}:{" "}
                <span className="font-bold text-white">
                  {nextLevel.emoji} {lang === "ar" ? nextLevel.nameAr : nextLevel.name}
                </span>{" "}
                {t("profile.in")} <span dir="ltr">{fmt(nextLevel.min - USER.xp)}</span> {t("profile.xp")}
              </p>
            )}
          </div>

          {/* Merged points + XP — high contrast gold/white */}
          <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between gap-2 border-e border-slate-800 bg-slate-950/80 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{t("profile.lp")}</p>
                <p className="text-2xl font-black leading-tight text-gold" dir="ltr">
                  {fmt(USER.lp)}
                </p>
              </div>
              <Coins className="h-6 w-6 text-gold" />
            </div>
            <div className="flex items-center justify-between gap-2 bg-slate-950/80 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{t("profile.xp")}</p>
                <p className="text-2xl font-black leading-tight text-white" dir="ltr">
                  {fmt(USER.xp)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </section>

        {/* Compact missions (first 5 + Show more) */}
        <CompactMissions />

        {/* Levels ladder */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/70">{t("profile.journey")}</h3>
          <div className="flex items-center justify-between">
            {LEVELS.map((l) => {
              const reached = USER.level >= l.id;
              return (
                <div key={l.id} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full text-xl transition-spring",
                      reached ? "bg-gradient-gold shadow-gold" : "bg-slate-900 text-white/40"
                    )}
                  >
                    {l.emoji}
                  </div>
                  <span className={cn("text-[10px] font-bold", reached ? "text-white" : "text-white/50")}>
                    {lang === "ar" ? l.nameAr : l.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Daily allowance ledger */}
        <AdBoosterButton />

        {/* Earn LP */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/70">{t("profile.earnLp")}</h3>
          <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-start transition-smooth hover:border-gold/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 text-gold-foreground">
              <Play className="h-5 w-5" fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{t("profile.watchAd")}</p>
              <p className="text-xs text-white/60">{t("profile.adSub")}</p>
            </div>
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-gold-foreground" dir="ltr">
              +25 {t("profile.lp")}
            </span>
          </button>
        </section>

        {/* Scheduler */}
        <RoomScheduler />

        {/* Pro upsell */}
        {!USER.pro && (
          <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-slate-950 via-[#0B1024] to-slate-950 p-6 text-white shadow-elegant">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                <h3 className="text-lg font-black">{t("profile.goPro")}</h3>
              </div>
              <p className="mt-1 text-sm text-white/75">{t("profile.proPerks")}</p>
              <button className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-black text-gold-foreground shadow-gold transition-spring hover:scale-[1.02]">
                {t("profile.upgrade")}
              </button>
            </div>
          </section>
        )}

        {/* Inventory — Gifts received (bottom) */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/80">
              <Gift className="h-4 w-4 text-gold" />
              {lang === "ar" ? "المخزون · هدايا مُستلمة" : "Inventory · Gifts Received"}
            </h3>
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-black text-gold" dir="ltr">
              {fmt(RECEIVED_GIFTS.reduce((s, g) => s + g.count, 0))}
            </span>
          </div>
          <div className="-mx-5 overflow-x-auto px-5">
            <div className="flex gap-2.5 pb-1">
              {RECEIVED_GIFTS.map((g) => (
                <div
                  key={g.id}
                  className="flex shrink-0 flex-col items-center gap-1 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3 transition-spring hover:scale-105"
                  style={{ minWidth: "76px" }}
                >
                  <span className="text-3xl">{g.emoji}</span>
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-gold-foreground" dir="ltr">
                    ×{g.count}
                  </span>
                  <span className="text-[10px] text-white/60">{g.from}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Profile;
