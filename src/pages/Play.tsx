import { Gamepad2, Sparkles, Trophy, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

const Play = () => {
  const { lang } = useI18n();
  const games = [
    { id: "guess-accent", emoji: "🎧", en: "Guess the Accent", ar: "خمّن اللهجة", reward: 30 },
    { id: "word-duel", emoji: "⚔️", en: "Word Duel", ar: "مبارزة كلمات", reward: 50 },
    { id: "fast-translate", emoji: "⚡", en: "Fast Translate", ar: "ترجمة سريعة", reward: 40 },
    { id: "story-builder", emoji: "📖", en: "Story Builder", ar: "ابنِ قصة", reward: 60 },
  ];
  return (
    <AppShell>
      <header className="bg-gradient-hero px-6 pb-8 pt-12 text-primary-foreground">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" /> {lang === "ar" ? "العب" : "Play"}
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/70">
          {lang === "ar" ? "ألعاب لغوية ممتعة لكسب نقاط التعلم" : "Fun language games to earn LP"}
        </p>
      </header>
      <section className="px-5 -mt-4">
        <div className="rounded-3xl bg-card p-4 shadow-elegant grid grid-cols-2 gap-3">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => toast.success(lang === "ar" ? "قريباً!" : "Coming soon!")}
              className="flex flex-col items-start gap-2 rounded-2xl border border-border p-4 text-start transition-spring hover:-translate-y-1 hover:border-gold hover:shadow-soft"
            >
              <span className="text-3xl">{g.emoji}</span>
              <p className="font-bold text-sm">{lang === "ar" ? g.ar : g.en}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
                <Zap className="h-3 w-3" /> +{g.reward} LP
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-elegant">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="font-bold">{lang === "ar" ? "لوحة الأبطال" : "Leaderboard"}</h2>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              { n: "Layla", flag: "🇸🇦", lp: 2840 },
              { n: "Marco", flag: "🇮🇹", lp: 2110 },
              { n: "Aiko", flag: "🇯🇵", lp: 1980 },
            ].map((u, i) => (
              <li key={u.n} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="font-bold w-5">{i + 1}.</span>
                  <span>{u.flag}</span>
                  <span>{u.n}</span>
                </span>
                <span className="font-bold tabular-nums flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-gold" /> {u.lp}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
};
export default Play;
