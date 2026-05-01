import { useState } from "react";
import { ArrowUp, Bell, MessageCircle, Send, Share2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LevelBadge } from "@/components/LevelBadge";
import { FACTS, FactItem } from "@/data/rooms";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

const NOTIFICATIONS = [
  { id: "n1", icon: "🏆", title: { en: "You earned 50 LP", ar: "ربحت ٥٠ ن.ت" }, body: { en: "Your tip about 'Sobremesa' got 25 upvotes!", ar: "حصلت نصيحتك عن 'Sobremesa' على ٢٥ تصويتاً!" }, time: "2m" },
  { id: "n2", icon: "🎤", title: { en: "Layla invited you to speak", ar: "ليلى دعتك للتحدث" }, body: { en: "English Lounge · 'Weird foods' topic", ar: "صالون الإنجليزية · موضوع 'أطعمة غريبة'" }, time: "12m" },
  { id: "n3", icon: "✨", title: { en: "New level unlocked", ar: "فُتح مستوى جديد" }, body: { en: "You reached Tree 🌳 (Level 3)", ar: "وصلت إلى شجرة 🌳 (المستوى ٣)" }, time: "1h" },
];

const Activity = () => {
  const { t, lang } = useI18n();
  const [tip, setTip] = useState("");
  const [facts, setFacts] = useState<FactItem[]>(FACTS);
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const post = () => {
    const trimmed = tip.trim().slice(0, 150);
    if (trimmed.length < 4) {
      toast.error(lang === "ar" ? "اكتب نصيحة أطول" : "Write a longer tip");
      return;
    }
    setFacts((f) => [
      {
        id: `f${Date.now()}`,
        user: "You",
        flag: "🌟",
        level: 3,
        language: lang === "ar" ? "Arabic" : "English",
        fact: trimmed,
        upvotes: 0,
      },
      ...f,
    ]);
    setTip("");
    toast.success(lang === "ar" ? "تم النشر" : "Posted!");
  };

  const upvote = (id: string) => {
    if (voted[id]) return;
    setVoted((v) => ({ ...v, [id]: true }));
    setFacts((f) => f.map((x) => (x.id === id ? { ...x, upvotes: x.upvotes + 1 } : x)));
  };

  const share = async (item: FactItem) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "حِوار", text: item.fact });
      } else {
        await navigator.clipboard.writeText(item.fact);
        toast.success(lang === "ar" ? "تم النسخ" : "Copied");
      }
    } catch {}
  };

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
        {/* Composer */}
        <section className="rounded-3xl bg-card p-4 shadow-elegant">
          <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-4 w-4 text-gold" />
            {lang === "ar" ? "شارك نصيحة لغوية" : "Share a language tip"}
          </h2>
          <textarea
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            maxLength={150}
            rows={3}
            placeholder={lang === "ar" ? "أخبرنا تعبيراً مفيداً تعلمته…" : "Share a phrase or idiom you learned…"}
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none transition-smooth focus:border-primary"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{tip.length}/150</span>
            <button
              onClick={post}
              className="flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-elegant transition-spring hover:scale-105"
            >
              <Send className="h-3.5 w-3.5" />
              {lang === "ar" ? "نشر" : "Post"}
            </button>
          </div>
        </section>

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
            {facts.map((f) => (
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
                  <button
                    onClick={() => upvote(f.id)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-smooth ${
                      voted[f.id]
                        ? "bg-gold text-primary-foreground"
                        : "bg-gold-soft text-gold-foreground hover:bg-gold hover:text-primary-foreground"
                    }`}
                  >
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
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => share(f)}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-smooth hover:text-primary"
                  >
                    <Share2 className="h-3.5 w-3.5" /> {lang === "ar" ? "مشاركة" : "Share"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
};

export default Activity;
