import { ArrowUp, Bell, MessageCircle, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LevelBadge } from "@/components/LevelBadge";
import { FACTS } from "@/data/rooms";
import { useI18n } from "@/i18n/I18nProvider";

const NOTIFICATIONS = [
  { id: "n1", icon: "🏆", title: { en: "You earned 50 LP", ar: "ربحت ٥٠ ن.ت" }, body: { en: "Your tip about 'Sobremesa' got 25 upvotes!", ar: "حصلت نصيحتك عن 'Sobremesa' على ٢٥ تصويتاً!" }, time: "2m" },
  { id: "n2", icon: "🎤", title: { en: "Layla invited you to speak", ar: "ليلى دعتك للتحدث" }, body: { en: "English Lounge · 'Weird foods' topic", ar: "صالون الإنجليزية · موضوع 'أطعمة غريبة'" }, time: "12m" },
  { id: "n3", icon: "✨", title: { en: "New level unlocked", ar: "فُتح مستوى جديد" }, body: { en: "You reached Tree 🌳 (Level 3)", ar: "وصلت إلى شجرة 🌳 (المستوى ٣)" }, time: "1h" },
];

const Activity = () => {
  const { t, lang } = useI18n();
  return (
  <AppShell>
    <header className="bg-gradient-hero px-6 pb-8 pt-12 text-primary-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("activity.title")}</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur">
          <Bell className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-1 text-sm text-primary-foreground/70">{t("activity.subtitle")}</p>
    </header>

    <div className="space-y-6 px-5 -mt-4">
      {/* Notifications */}
      <section className="rounded-3xl bg-card p-4 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Bell className="h-4 w-4" /> {t("activity.notifications")}
        </h2>
        <ul className="space-y-2">
          {NOTIFICATIONS.map((n) => (
            <li key={n.id} className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-3 transition-smooth hover:bg-secondary">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-lg shadow-soft">
                {n.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{n.title[lang]}</p>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{n.body[lang]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Facts wall */}
      <section className="rounded-3xl bg-card p-4 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4 text-gold" /> {t("activity.facts")}
        </h2>
        <ul className="space-y-3">
          {FACTS.map((f) => (
            <li key={f.id} className="rounded-2xl border border-border p-4 transition-smooth hover:shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-base">{f.flag}</div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{f.user}</p>
                    <div className="flex items-center gap-1.5">
                      <LevelBadge level={f.level} />
                      <span className="text-xs text-muted-foreground">· {f.language}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-1 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold-foreground transition-smooth hover:bg-gold hover:text-primary-foreground">
                  <ArrowUp className="h-3.5 w-3.5" />
                  {f.upvotes}
                </button>
              </div>
              <p className="mt-3 font-arabic text-base leading-relaxed">{f.fact}</p>
              {f.translation && (
                <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {f.translation}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  </AppShell>
  );
};

export default Activity;
