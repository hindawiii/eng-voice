import { useState } from "react";
import { ArrowDown, ArrowUp, Bell, MessageCircle, Send, Share2, Sparkles } from "lucide-react";
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

const REACTIONS = [
  { id: "brilliant", emoji: "💡", label: "Brilliant", labelAr: "رائع" },
  { id: "helpful", emoji: "🙌", label: "Helpful", labelAr: "مفيد" },
  { id: "fire", emoji: "🔥", label: "Fire", labelAr: "ناري" },
  { id: "love", emoji: "❤️", label: "Love", labelAr: "أحببته" },
] as const;
type ReactionId = typeof REACTIONS[number]["id"];

const Activity = () => {
  const { t, lang } = useI18n();
  const [tip, setTip] = useState("");
  const [facts, setFacts] = useState<FactItem[]>(FACTS);
  const [voted, setVoted] = useState<Record<string, "up" | "down" | undefined>>({});
  const [downvotes, setDownvotes] = useState<Record<string, number>>({});
  const [reactions, setReactions] = useState<Record<string, Record<ReactionId, number>>>({});
  const [myReaction, setMyReaction] = useState<Record<string, ReactionId | undefined>>({});
  const [comments, setComments] = useState<Record<string, { id: string; user: string; text: string }[]>>({
    f1: [{ id: "c1", user: "Hassan", text: lang === "ar" ? "تستخدم أيضاً 'إزيّك' مع التشديد" : "Also used as 'Ezzayyak' with emphasis" }],
  });
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [draftComment, setDraftComment] = useState<Record<string, string>>({});

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

  const vote = (id: string, dir: "up" | "down") => {
    const current = voted[id];
    if (current === dir) return;
    setVoted((v) => ({ ...v, [id]: dir }));
    if (dir === "up") {
      setFacts((f) => f.map((x) => (x.id === id ? { ...x, upvotes: x.upvotes + 1 } : x)));
      if (current === "down") {
        setDownvotes((d) => ({ ...d, [id]: Math.max(0, (d[id] || 0) - 1) }));
      }
    } else {
      setDownvotes((d) => ({ ...d, [id]: (d[id] || 0) + 1 }));
      if (current === "up") {
        setFacts((f) => f.map((x) => (x.id === id ? { ...x, upvotes: Math.max(0, x.upvotes - 1) } : x)));
      }
    }
  };

  const toggleComments = (id: string) =>
    setOpenComments((o) => ({ ...o, [id]: !o[id] }));

  const submitComment = (id: string) => {
    const text = (draftComment[id] || "").trim().slice(0, 200);
    if (text.length < 2) return;
    setComments((c) => ({
      ...c,
      [id]: [...(c[id] || []), { id: `c${Date.now()}`, user: "You", text }],
    }));
    setDraftComment((d) => ({ ...d, [id]: "" }));
  };

  const react = (id: string, rid: ReactionId) => {
    const prev = myReaction[id];
    setReactions((r) => {
      const cur = { ...(r[id] || ({} as Record<ReactionId, number>)) };
      if (prev === rid) {
        cur[rid] = Math.max(0, (cur[rid] || 1) - 1);
        return { ...r, [id]: cur };
      }
      if (prev) cur[prev] = Math.max(0, (cur[prev] || 1) - 1);
      cur[rid] = (cur[rid] || 0) + 1;
      return { ...r, [id]: cur };
    });
    setMyReaction((m) => ({ ...m, [id]: prev === rid ? undefined : rid }));
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => vote(f.id, "up")}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-smooth ${
                        voted[f.id] === "up"
                          ? "bg-gold text-primary-foreground"
                          : "bg-gold-soft text-gold-foreground hover:bg-gold hover:text-primary-foreground"
                      }`}
                      aria-label={lang === "ar" ? "تصويت إيجابي" : "Upvote"}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                      {f.upvotes}
                    </button>
                    <button
                      onClick={() => vote(f.id, "down")}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-smooth ${
                        voted[f.id] === "down"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      }`}
                      aria-label={lang === "ar" ? "تصويت سلبي" : "Downvote"}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      {downvotes[f.id] || 0}
                    </button>
                  </div>
                </div>
                <p className="mt-3 font-arabic text-base leading-relaxed">{f.fact}</p>
                {f.translation && (
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {f.translation}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {REACTIONS.map((r) => {
                    const count = reactions[f.id]?.[r.id] || 0;
                    const mine = myReaction[f.id] === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => react(f.id, r.id)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-smooth ${
                          mine
                            ? "bg-primary-soft text-primary ring-1 ring-primary"
                            : "bg-secondary text-muted-foreground hover:bg-primary-soft hover:text-primary"
                        }`}
                        aria-label={lang === "ar" ? r.labelAr : r.label}
                      >
                        <span>{r.emoji}</span>
                        <span>{lang === "ar" ? r.labelAr : r.label}</span>
                        {count > 0 && <span className="tabular-nums">{count}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => toggleComments(f.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-smooth hover:text-primary"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {(comments[f.id]?.length || 0)} {lang === "ar" ? "تعليقات" : "comments"}
                  </button>
                  <button
                    onClick={() => share(f)}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-smooth hover:text-primary"
                  >
                    <Share2 className="h-3.5 w-3.5" /> {lang === "ar" ? "مشاركة" : "Share"}
                  </button>
                </div>

                {openComments[f.id] && (
                  <div className="mt-3 space-y-2 rounded-2xl bg-secondary/40 p-3">
                    {(comments[f.id] || []).length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        {lang === "ar" ? "كن أول من يعلّق" : "Be the first to comment"}
                      </p>
                    )}
                    {(comments[f.id] || []).map((c) => (
                      <div key={c.id} className="rounded-xl bg-card p-2 text-sm">
                        <span className="font-semibold text-primary">{c.user}: </span>
                        <span>{c.text}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        value={draftComment[f.id] || ""}
                        onChange={(e) => setDraftComment((d) => ({ ...d, [f.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && submitComment(f.id)}
                        maxLength={200}
                        placeholder={lang === "ar" ? "صحّح أو أضف ملاحظة…" : "Correct or add nuance…"}
                        className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => submitComment(f.id)}
                        className="rounded-full bg-primary p-1.5 text-primary-foreground transition-smooth hover:scale-105"
                        aria-label={lang === "ar" ? "إرسال" : "Send"}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
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
