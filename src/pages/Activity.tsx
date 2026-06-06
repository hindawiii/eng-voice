import { useState } from "react";
import {
  ArrowDown, ArrowUp, Bell, MessageCircle, Send, Share2, Sparkles,
  FileText, Image as ImageIcon, Mic, Award, Lightbulb, Shield, Trophy, HelpCircle, Zap, X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LevelBadge } from "@/components/LevelBadge";
import { MiniProfileSheet, MiniProfileUser } from "@/components/MiniProfileSheet";
import { FACTS, FactItem } from "@/data/rooms";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

type PostKind = "text" | "image" | "audio" | "achievement" | "tip";

const KIND_TABS: { id: PostKind; emoji: string; en: string; ar: string; max: number }[] = [
  { id: "text", emoji: "📝", en: "Text", ar: "نص", max: 500 },
  { id: "image", emoji: "🖼️", en: "Image", ar: "صورة", max: 200 },
  { id: "audio", emoji: "🎙️", en: "Audio", ar: "صوت", max: 100 },
  { id: "achievement", emoji: "🏆", en: "Achievement", ar: "إنجاز", max: 0 },
  { id: "tip", emoji: "💡", en: "Tip", ar: "نصيحة", max: 300 },
];

const REACTIONS = [
  { id: "brilliant", emoji: "💡", label: "Brilliant", labelAr: "رائع" },
  { id: "helpful", emoji: "🙌", label: "Helpful", labelAr: "مفيد" },
  { id: "fire", emoji: "🔥", label: "Fire", labelAr: "ناري" },
  { id: "love", emoji: "❤️", label: "Love", labelAr: "أحببته" },
] as const;
type ReactionId = typeof REACTIONS[number]["id"];

const NOTIFICATIONS = [
  { id: "n1", icon: "🏆", title: { en: "You earned 50 LP", ar: "ربحت ٥٠ ن.ت" }, body: { en: "Tip got 25 upvotes!", ar: "حصلت نصيحتك على ٢٥ تصويتاً!" }, time: "2m" },
  { id: "n2", icon: "🎤", title: { en: "Layla invited you to speak", ar: "ليلى دعتك للتحدث" }, body: { en: "English Lounge", ar: "صالون الإنجليزية" }, time: "12m" },
];

// ── Dynamic in-feed widgets ─────────────────────────────────────
type Widget =
  | { kind: "challenge"; id: string }
  | { kind: "question"; id: string }
  | { kind: "highlight"; id: string }
  | { kind: "quicktip"; id: string };

const WIDGETS: Widget[] = [
  { kind: "challenge", id: "w1" },
  { kind: "highlight", id: "w3" },
  { kind: "quicktip", id: "w4" },
];

const Waveform = () => (
  <div className="flex items-center gap-0.5 h-6">
    {Array.from({ length: 18 }).map((_, i) => (
      <span
        key={i}
        className="waveform-bar w-0.5 rounded-full bg-primary"
        style={{ height: `${30 + (i % 5) * 12}%`, animationDelay: `${i * 0.07}s` }}
      />
    ))}
  </div>
);

const CARD_BASE =
  "h-full flex flex-col rounded-2xl border border-slate-800 bg-[#111827] p-3 text-white overflow-hidden";

const ChallengeWidget = ({ lang }: { lang: "en" | "ar" }) => {
  const [accepted, setAccepted] = useState(false);
  const [count, setCount] = useState(124);
  const [progress, setProgress] = useState(35);
  return (
    <div className={CARD_BASE}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">
        <Zap className="h-3.5 w-3.5" /> {lang === "ar" ? "تحدي اليوم" : "Daily Challenge"}
      </div>
      <p className="mt-1.5 text-xs font-semibold line-clamp-2 text-white">
        {lang === "ar" ? "استخدم كلمة 'Sobremesa' في جملة كاملة." : "Use 'Sobremesa' in a full sentence."}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg,#FBBF24,#F59E0B)" }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>{count} {lang === "ar" ? "مشارك" : "joined"}</span>
        <span className="tabular-nums text-[#FBBF24]">⏱ 12:34</span>
      </div>
      <div className="mt-auto pt-2 flex gap-1.5">
        <button
          disabled={accepted}
          onClick={() => {
            setAccepted(true);
            setCount((c) => c + 1);
            setProgress((p) => Math.min(100, p + 10));
            toast.success(lang === "ar" ? "+20 ن.ت" : "+20 LP");
          }}
          className="flex-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-[#111827] disabled:opacity-50 transition-spring hover:scale-105"
          style={{ background: "linear-gradient(90deg,#FBBF24,#F59E0B)" }}
        >
          {accepted ? (lang === "ar" ? "تم القبول" : "Accepted") : (lang === "ar" ? "اقبل التحدي" : "Accept")}
        </button>
      </div>
    </div>
  );
};

const QuestionWidget = ({ lang }: { lang: "en" | "ar" }) => (
  <div className={CARD_BASE}>
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">
      <HelpCircle className="h-3.5 w-3.5" /> {lang === "ar" ? "سؤال الجماعة" : "Community Q"}
    </div>
    <p className="mt-1.5 text-xs font-semibold line-clamp-3 text-white">
      {lang === "ar" ? "ما أصعب صوت في لغتك الأم لغير الناطقين؟" : "Hardest sound in your native language?"}
    </p>
    <div className="mt-auto pt-2 flex gap-1.5">
      <button className="flex-1 rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-white">🎙️ {lang === "ar" ? "سجّل" : "Record"}</button>
      <button className="flex-1 rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-white">✍️ {lang === "ar" ? "اكتب" : "Write"}</button>
    </div>
  </div>
);

const HighlightWidget = ({ lang, onView }: { lang: "en" | "ar"; onView: () => void }) => (
  <div className={CARD_BASE}>
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">
      <Trophy className="h-3.5 w-3.5" /> {lang === "ar" ? "إنجاز الأسبوع" : "Weekly Highlight"}
    </div>
    <button onClick={onView} className="mt-1.5 flex items-center gap-2 text-start">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBBF24] text-lg text-[#111827]">🇸🇦</div>
      <div className="min-w-0">
        <p className="font-bold text-sm text-white truncate">Layla</p>
        <p className="text-[10px] text-slate-400 truncate">{lang === "ar" ? "أعلى مشارك" : "Top contributor"}</p>
      </div>
    </button>
    <div className="mt-2 grid grid-cols-3 gap-1 text-center">
      {[
        { v: "12h", l: lang === "ar" ? "تحدث" : "Talk" },
        { v: "48", l: lang === "ar" ? "كلمة" : "Words" },
        { v: "21", l: lang === "ar" ? "تصحيح" : "Fixes" },
      ].map((s) => (
        <div key={s.l} className="rounded-lg bg-slate-800/70 py-1">
          <p className="font-bold text-xs text-[#FBBF24] tabular-nums">{s.v}</p>
          <p className="text-[9px] text-slate-400">{s.l}</p>
        </div>
      ))}
    </div>
    <button
      onClick={() => toast.success(lang === "ar" ? "هنّأت ليلى! 🎉" : "Congrats sent! 🎉")}
      className="mt-auto rounded-full py-1.5 text-[11px] font-bold text-[#111827]"
      style={{ background: "linear-gradient(90deg,#FBBF24,#F59E0B)" }}
    >
      {lang === "ar" ? "هنّئ" : "Congratulate"}
    </button>
  </div>
);

const QuickTipWidget = ({ lang, onDismiss }: { lang: "en" | "ar"; onDismiss: () => void }) => (
  <div className={CARD_BASE}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">
        <Lightbulb className="h-3.5 w-3.5" /> {lang === "ar" ? "نصيحة سريعة" : "Quick Tip"}
      </div>
      <button onClick={onDismiss} className="text-slate-400 hover:text-white">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
    <p className="mt-1.5 text-xs text-white line-clamp-3">
      {lang === "ar" ? "كرر الكلمات الجديدة بصوت عالٍ ٣ مرات قبل النوم لتثبيتها." : "Repeat new words aloud 3× before sleep to lock them in."}
    </p>
    <div className="mt-auto pt-2 flex gap-1.5 text-[11px]">
      <button className="rounded-full bg-slate-800 px-3 py-1 font-bold text-[#FBBF24]">👍 {lang === "ar" ? "مفيد" : "Helpful"}</button>
      <button className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-white">↗ {lang === "ar" ? "شارك" : "Share"}</button>
    </div>
  </div>
);

const Activity = () => {
  const { t, lang } = useI18n();
  const [kind, setKind] = useState<PostKind>("text");
  const [text, setText] = useState("");
  const [facts, setFacts] = useState<FactItem[]>(FACTS);
  const [voted, setVoted] = useState<Record<string, "up" | "down" | undefined>>({});
  const [downvotes, setDownvotes] = useState<Record<string, number>>({});
  const [reactions, setReactions] = useState<Record<string, Record<ReactionId, number>>>({});
  const [myReaction, setMyReaction] = useState<Record<string, ReactionId | undefined>>({});
  const [comments, setComments] = useState<Record<string, { id: string; user: string; text: string }[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [draftComment, setDraftComment] = useState<Record<string, string>>({});
  const [dismissedTip, setDismissedTip] = useState(false);
  const [miniUser, setMiniUser] = useState<MiniProfileUser | null>(null);

  const activeKind = KIND_TABS.find((k) => k.id === kind)!;
  const canPublish = kind === "achievement" || text.trim().length >= 2;

  const post = () => {
    if (!canPublish) return;
    const content =
      kind === "achievement"
        ? lang === "ar" ? "🏆 أكملت سلسلة تعلّم ٧ أيام!" : "🏆 Completed 7-day learning streak!"
        : text.trim().slice(0, activeKind.max);
    setFacts((f) => [
      {
        id: `f${Date.now()}`,
        user: "You",
        flag: "🌟",
        level: 3,
        language: lang === "ar" ? "Arabic" : "English",
        fact: `${activeKind.emoji} ${content}`,
        upvotes: 0,
      },
      ...f,
    ]);
    setText("");
    toast.success(lang === "ar" ? "تم النشر" : "Posted!");
  };

  const vote = (id: string, dir: "up" | "down") => {
    const current = voted[id];
    if (current === dir) return;
    setVoted((v) => ({ ...v, [id]: dir }));
    if (dir === "up") {
      setFacts((f) => f.map((x) => (x.id === id ? { ...x, upvotes: x.upvotes + 1 } : x)));
      if (current === "down") setDownvotes((d) => ({ ...d, [id]: Math.max(0, (d[id] || 0) - 1) }));
    } else {
      setDownvotes((d) => ({ ...d, [id]: (d[id] || 0) + 1 }));
      if (current === "up") setFacts((f) => f.map((x) => (x.id === id ? { ...x, upvotes: Math.max(0, x.upvotes - 1) } : x)));
    }
  };

  const submitComment = (id: string) => {
    const c = (draftComment[id] || "").trim().slice(0, 200);
    if (c.length < 2) return;
    setComments((cs) => ({ ...cs, [id]: [...(cs[id] || []), { id: `c${Date.now()}`, user: "You", text: c }] }));
    setDraftComment((d) => ({ ...d, [id]: "" }));
  };

  const react = (id: string, rid: ReactionId) => {
    const prev = myReaction[id];
    setReactions((r) => {
      const cur = { ...(r[id] || ({} as Record<ReactionId, number>)) };
      if (prev === rid) { cur[rid] = Math.max(0, (cur[rid] || 1) - 1); return { ...r, [id]: cur }; }
      if (prev) cur[prev] = Math.max(0, (cur[prev] || 1) - 1);
      cur[rid] = (cur[rid] || 0) + 1;
      return { ...r, [id]: cur };
    });
    setMyReaction((m) => ({ ...m, [id]: prev === rid ? undefined : rid }));
  };

  const renderWidget = (w: Widget) => {
    switch (w.kind) {
      case "challenge": return <ChallengeWidget lang={lang} />;
      case "question": return <QuestionWidget lang={lang} />;
      case "highlight": return <HighlightWidget lang={lang} onView={() => setMiniUser({ id: "u1", name: "Layla", flag: "🇸🇦", gender: "female", country: "Saudi Arabia", city: "Riyadh", level: 5 })} />;
      case "quicktip": return dismissedTip ? null : <QuickTipWidget lang={lang} onDismiss={() => setDismissedTip(true)} />;
    }
  };

  // Feed is now ONLY user posts — widgets live in pinned hero carousel above
  const feed: Array<{ type: "fact"; item: FactItem }> = facts.map((f) => ({ type: "fact", item: f }));

  return (
    <AppShell>
      <header className="bg-gradient-hero px-6 pb-8 pt-12 text-primary-foreground">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("activity.title")}</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            <Bell className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-primary-foreground/70">
          {lang === "ar" ? "حائط Engvoice الاجتماعي" : "Engvoice social wall"}
        </p>
      </header>

      <div className="space-y-4 px-5 -mt-4">
        {/* PINNED HERO — community widgets at the very top */}
        <section className="-mx-5 overflow-x-auto px-5 pt-1 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="flex gap-3 snap-x snap-mandatory pb-2">
            {WIDGETS.map((w) => {
              const node = renderWidget(w);
              if (!node) return null;
              return (
                <div key={w.id} className="snap-start shrink-0 w-[88%] sm:w-[60%] md:w-[48%]">
                  {node}
                </div>
              );
            })}
          </div>
        </section>

        {/* Composer with post-type tabs */}
        <section className="rounded-3xl bg-card p-4 shadow-elegant border border-border">

          <div className="mb-3 flex gap-1 overflow-x-auto rounded-full bg-secondary p-1">
            {KIND_TABS.map((k) => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-smooth ${
                  kind === k.id ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
                }`}
              >
                <span>{k.emoji}</span>
                <span>{lang === "ar" ? k.ar : k.en}</span>
              </button>
            ))}
          </div>

          {kind === "achievement" ? (
            <div className="rounded-2xl border border-gold/40 bg-gold-soft p-4 text-center">
              <Award className="mx-auto h-8 w-8 text-gold" />
              <p className="mt-2 text-sm font-bold">
                {lang === "ar" ? "🏆 أكملت سلسلة تعلّم ٧ أيام!" : "🏆 Completed 7-day learning streak!"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar" ? "بطاقة مُنشأة تلقائياً" : "Auto-generated card"}
              </p>
            </div>
          ) : kind === "audio" ? (
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
                  <Mic className="h-4 w-4" />
                </button>
                <Waveform />
                <span className="text-xs tabular-nums text-muted-foreground">0:12 / 1:00</span>
              </div>
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={activeKind.max}
                placeholder={lang === "ar" ? "وصف اختياري…" : "Optional caption…"}
                className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : kind === "image" ? (
            <div className="space-y-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background p-6 text-sm text-muted-foreground transition-smooth hover:border-primary hover:text-primary">
                <ImageIcon className="h-5 w-5" /> {lang === "ar" ? "اختر صورة" : "Choose image"}
              </button>
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={activeKind.max}
                placeholder={lang === "ar" ? "تعليق على الصورة…" : "Image caption…"}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={activeKind.max}
              rows={3}
              placeholder={
                kind === "tip"
                  ? lang === "ar" ? "شارك نصيحة لغوية مفيدة…" : "Share a useful language tip…"
                  : lang === "ar" ? "ما الذي يدور في ذهنك؟" : "What's on your mind?"
              }
              className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {kind === "achievement" ? "—" : `${text.length}/${activeKind.max}`}
            </span>
            <button
              onClick={post}
              disabled={!canPublish}
              className="flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-elegant transition-spring hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="h-3.5 w-3.5" />
              {lang === "ar" ? "نشر" : "Publish"}
            </button>
          </div>
        </section>

        {/* Pinned guidelines */}
        <section className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold-soft/60 to-card p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-foreground">
            <Shield className="h-4 w-4 text-gold" /> {lang === "ar" ? "إرشادات المجتمع" : "Community Guidelines"}
          </div>
          <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-foreground/80 sm:grid-cols-3">
            <li>✅ {lang === "ar" ? "احترم الجميع" : "Respect everyone"}</li>
            <li>🚫 {lang === "ar" ? "بدون إعلانات خارجية" : "No external ads"}</li>
            <li>🗣️ {lang === "ar" ? "محتوى لغوي فقط" : "Language content only"}</li>
          </ul>
        </section>

        {/* Notifications */}
        <section className="rounded-3xl bg-card p-4 shadow-soft">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Bell className="h-4 w-4" /> {t("activity.notifications")}
          </h2>
          <ul className="space-y-2">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-lg shadow-soft">{n.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{n.title[lang]}</p>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.body[lang]}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>




        {/* Feed (chronological user posts only) */}
        <section className="space-y-3">
          {feed.map((entry) => (
              <article key={entry.item.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border">

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setMiniUser({ id: entry.item.id, name: entry.item.user, flag: entry.item.flag, level: entry.item.level })}
                    className="flex items-center gap-2 text-start"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-base">{entry.item.flag}</div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{entry.item.user}</p>
                      <div className="flex items-center gap-1.5">
                        <LevelBadge level={entry.item.level} />
                        <span className="text-xs text-muted-foreground">· {entry.item.language}</span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => vote(entry.item.id, "up")} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-smooth ${voted[entry.item.id] === "up" ? "bg-gold text-primary-foreground" : "bg-gold-soft text-gold-foreground hover:bg-gold hover:text-primary-foreground"}`}>
                      <ArrowUp className="h-3.5 w-3.5" />{entry.item.upvotes}
                    </button>
                    <button onClick={() => vote(entry.item.id, "down")} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-smooth ${voted[entry.item.id] === "down" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-muted-foreground hover:bg-destructive/20 hover:text-destructive"}`}>
                      <ArrowDown className="h-3.5 w-3.5" />{downvotes[entry.item.id] || 0}
                    </button>
                  </div>
                </div>
                <p className="mt-3 font-arabic text-base leading-relaxed">{entry.item.fact}</p>
                {entry.item.translation && (
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{entry.item.translation}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {REACTIONS.map((r) => {
                    const count = reactions[entry.item.id]?.[r.id] || 0;
                    const mine = myReaction[entry.item.id] === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => react(entry.item.id, r.id)}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-smooth ${mine ? "bg-primary-soft text-primary ring-1 ring-primary" : "bg-secondary text-muted-foreground hover:bg-primary-soft hover:text-primary"}`}
                      >
                        <span>{r.emoji}</span>
                        {count > 0 && <span className="tabular-nums">{count}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => setOpenComments((o) => ({ ...o, [entry.item.id]: !o[entry.item.id] }))}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    {openComments[entry.item.id] ? "▲" : "▼"} <MessageCircle className="h-3.5 w-3.5" />
                    {(comments[entry.item.id]?.length || 0)} {lang === "ar" ? "تعليق" : "comments"}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <Share2 className="h-3.5 w-3.5" /> {lang === "ar" ? "شارك" : "Share"}
                  </button>
                </div>
                {openComments[entry.item.id] && (
                  <div className="mt-3 space-y-2 rounded-2xl bg-[#F8F9FA] p-3">
                    {(comments[entry.item.id] || []).map((c) => (
                      <div key={c.id} className="rounded-xl bg-card p-2 text-sm">
                        <span className="font-semibold text-primary">{c.user}: </span>{c.text}
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        value={draftComment[entry.item.id] || ""}
                        onChange={(e) => setDraftComment((d) => ({ ...d, [entry.item.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && submitComment(entry.item.id)}
                        maxLength={200}
                        placeholder={lang === "ar" ? "صحّح أو علّق…" : "Correct or comment…"}
                        className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                      <button onClick={() => submitComment(entry.item.id)} className="rounded-full bg-primary p-1.5 text-primary-foreground hover:scale-105 transition-spring">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
          ))}
        </section>

      </div>

      <MiniProfileSheet user={miniUser} onClose={() => setMiniUser(null)} />
    </AppShell>
  );
};

export default Activity;
