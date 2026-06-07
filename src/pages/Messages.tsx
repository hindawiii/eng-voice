import { useMemo, useRef, useState, useEffect } from "react";
import {
  Search, ArrowRight, Phone, UserRound, Paperclip, Mic, Send,
  Check, CheckCheck, Languages, Sparkles, Plus, X
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { translateText, detectIsArabic } from "@/hooks/useDictionary";

interface Friend { id: string; name: string; handle: string; avatar: string; online: boolean; lastSeen?: string }
interface Msg { id: string; from: "me" | "them"; text: string; time: string; lang?: string; status?: "sent" | "delivered" | "read"; audioUrl?: string }
interface Thread { id: string; friend: Friend; messages: Msg[]; unread: number; preview: string; time: string; status: "sent" | "delivered" | "read" }

const FRIENDS: Friend[] = [
  { id: "u1", name: "Léa Martin", handle: "@lea", avatar: "https://i.pravatar.cc/120?img=47", online: true },
  { id: "u2", name: "Hans Müller", handle: "@hans", avatar: "https://i.pravatar.cc/120?img=12", online: true },
  { id: "u3", name: "Yuki Tanaka", handle: "@yuki", avatar: "https://i.pravatar.cc/120?img=32", online: true },
  { id: "u4", name: "Carlos Vega", handle: "@carlos", avatar: "https://i.pravatar.cc/120?img=15", online: false, lastSeen: "منذ ١٠ د" },
  { id: "u5", name: "Sara Ahmed", handle: "@sara", avatar: "https://i.pravatar.cc/120?img=49", online: true },
  { id: "u6", name: "Marco Rossi", handle: "@marco", avatar: "https://i.pravatar.cc/120?img=8", online: false, lastSeen: "منذ ساعة" },
];

const SEED_THREADS: Thread[] = [
  {
    id: "t1", friend: FRIENDS[0], unread: 2, preview: "On va pratiquer ce soir ?", time: "21:14", status: "delivered",
    messages: [
      { id: "m1", from: "them", text: "Salut! Comment ça va aujourd'hui ?", time: "21:10", lang: "fr" },
      { id: "m2", from: "me", text: "أنا بخير، شكراً!", time: "21:12", status: "read" },
      { id: "m3", from: "them", text: "On va pratiquer ce soir ?", time: "21:14", lang: "fr" },
    ],
  },
  {
    id: "t2", friend: FRIENDS[1], unread: 0, preview: "Danke schön 🙏", time: "19:02", status: "read",
    messages: [
      { id: "m1", from: "me", text: "Hier ist die Datei", time: "18:59", status: "read" },
      { id: "m2", from: "them", text: "Danke schön 🙏", time: "19:02", lang: "de" },
    ],
  },
  {
    id: "t3", friend: FRIENDS[2], unread: 5, preview: "また明日話そう！", time: "أمس", status: "sent",
    messages: [
      { id: "m1", from: "them", text: "今日はとても楽しかった", time: "أمس", lang: "ja" },
      { id: "m2", from: "them", text: "また明日話そう！", time: "أمس", lang: "ja" },
    ],
  },
  {
    id: "t4", friend: FRIENDS[3], unread: 0, preview: "Perfecto, nos vemos.", time: "أمس", status: "read",
    messages: [{ id: "m1", from: "them", text: "Perfecto, nos vemos.", time: "أمس", lang: "es" }],
  },
];

// ---------- tiny grammar/typo hinter (client-side, lightweight)
const checkGrammar = (s: string): string | null => {
  const t = s.trim();
  if (!t) return null;
  if (/\s{2,}/.test(t)) return "تجنّب المسافات المزدوجة.";
  if (/([a-zA-Z\u0600-\u06FF])\1{3,}/.test(t)) return "حروف مكررة قد تكون خطأً مطبعياً.";
  if (/^[a-z]/.test(t)) return "ابدأ الجملة بحرف كبير (Capital).";
  if (t.length > 12 && !/[.!?؟…]$/.test(t)) return "أضف علامة ترقيم في النهاية.";
  if (/\bi\b/.test(t)) return "اكتب \"I\" بحرف كبير.";
  return null;
};

// ---------- Inbox row
const StatusTick = ({ s }: { s?: "sent" | "delivered" | "read" }) => {
  if (!s) return null;
  if (s === "sent") return <Check className="h-3.5 w-3.5 text-slate-500" />;
  if (s === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-slate-500" />;
  return <CheckCheck className="h-3.5 w-3.5 text-[#FBBF24]" />;
};

// ---------- Active Friends Carousel
const ActiveFriends = ({ friends, onPick }: { friends: Friend[]; onPick: (f: Friend) => void }) => (
  <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 py-1">
    {friends.filter((f) => f.online).map((f) => (
      <button key={f.id} onClick={() => onPick(f)} className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
        <div className="relative">
          <img src={f.avatar} alt={f.name} className="h-14 w-14 rounded-full border-2 border-slate-800 object-cover" />
          <span className="absolute bottom-0.5 end-0.5 block h-3 w-3 rounded-full border-2 border-[#070A13] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
          </span>
        </div>
        <span className="w-full truncate text-[11px] text-slate-300">{f.name.split(" ")[0]}</span>
      </button>
    ))}
  </div>
);

// ---------- Chat Screen
const ChatScreen = ({ thread, onBack, onSend }: { thread: Thread; onBack: () => void; onSend: (m: Msg) => void }) => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const grammarHint = useMemo(() => checkGrammar(text), [text]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.messages.length]);

  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + "px";
  }, [text]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend({
      id: `m${Date.now()}`, from: "me", text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    });
    setText("");
  };

  const toggleTranslate = async (m: Msg) => {
    if (translations[m.id]) {
      setTranslations((t) => { const n = { ...t }; delete n[m.id]; return n; });
      return;
    }
    setTranslations((t) => ({ ...t, [m.id]: "…" }));
    const isAr = detectIsArabic(m.text);
    const from = isAr ? "ar" : (m.lang || "en");
    const to = isAr ? "en" : "ar";
    const res = await translateText(m.text, from, to);
    setTranslations((t) => ({ ...t, [m.id]: res || "—" }));
  };

  const startVoice = async () => {
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunks, { type: "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
        onSend({
          id: `m${Date.now()}`, from: "me", text: "🎙️ رسالة صوتية",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "sent", audioUrl: url,
        });
        setRecording(false);
      };
      mr.start();
      setTimeout(() => mr.state !== "inactive" && mr.stop(), 4000);
    } catch {
      setRecording(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-slate-800 bg-[#0B101D]/80 px-4 py-3 backdrop-blur">
        <button onClick={onBack} className="rounded-full p-2 text-slate-300 hover:bg-slate-800/60" aria-label="رجوع">
          <ArrowRight className="h-5 w-5 rtl:rotate-180" />
        </button>
        <img src={thread.friend.avatar} className="h-10 w-10 rounded-full object-cover" alt={thread.friend.name} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-white">{thread.friend.name}</p>
          <p className="text-[11px] text-emerald-400">
            {thread.friend.online ? "نشط الآن" : `آخر ظهور ${thread.friend.lastSeen || "قريباً"}`}
          </p>
        </div>
        <button className="rounded-full bg-slate-800/70 p-2 text-emerald-300 hover:bg-slate-700/70" aria-label="مكالمة">
          <Phone className="h-4 w-4" />
        </button>
        <button className="rounded-full bg-slate-800/70 p-2 text-[#FBBF24] hover:bg-slate-700/70" aria-label="الملف">
          <UserRound className="h-4 w-4" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
        {thread.messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[78%] space-y-1")}>
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft",
                    mine
                      ? "rounded-br-sm border border-indigo-500/40 bg-indigo-950/50 text-white"
                      : "rounded-bl-sm border border-slate-800 bg-slate-900/80 text-slate-100 backdrop-blur"
                  )}
                >
                  {m.audioUrl ? (
                    <audio controls src={m.audioUrl} className="h-8" />
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  )}
                  {translations[m.id] && (
                    <p className="mt-1.5 border-t border-white/10 pt-1.5 text-xs text-[#FBBF24]">
                      {translations[m.id]}
                    </p>
                  )}
                </div>
                <div className={cn("flex items-center gap-2 px-1 text-[10px] text-slate-500", mine && "justify-end")}>
                  <span>{m.time}</span>
                  {mine && <StatusTick s={m.status} />}
                  {!mine && m.lang && (
                    <button
                      onClick={() => toggleTranslate(m)}
                      className="flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-[#FBBF24] hover:bg-slate-700/70"
                    >
                      <Languages className="h-3 w-3" /> ترجمة
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grammar hint */}
      {grammarHint && (
        <div className="mx-4 mb-1 flex items-center gap-2 rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-3 py-1.5 text-[11px] text-[#FBBF24]">
          <Sparkles className="h-3.5 w-3.5" /> {grammarHint}
        </div>
      )}

      {/* Bottom dock */}
      <div className="border-t border-slate-800 bg-[#0B101D]/90 p-3 backdrop-blur">
        <div className="flex items-end gap-2 rounded-2xl border border-slate-800 bg-[#111827] p-2">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-white" aria-label="إرفاق">
            <Plus className="h-5 w-5" />
          </button>
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="اكتب رسالة…"
            className="no-scrollbar flex-1 resize-none bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
          {text.trim() ? (
            <button onClick={send} className="rounded-full bg-gradient-gold p-2.5 text-[#111827] shadow-gold transition hover:scale-105" aria-label="إرسال">
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={startVoice}
              className={cn(
                "relative rounded-full p-2.5 transition",
                recording
                  ? "bg-rose-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.7)]"
                  : "bg-[#FBBF24]/15 text-[#FBBF24] hover:bg-[#FBBF24]/25 shadow-[0_0_18px_rgba(251,191,36,0.25)]"
              )}
              aria-label="تسجيل صوتي"
            >
              <Mic className="h-4 w-4" />
              {recording && (
                <span className="absolute -inset-1 animate-ping rounded-full bg-rose-500/40" />
              )}
            </button>
          )}
        </div>
        {recording && (
          <div className="mt-2 flex items-center justify-center gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="waveform-bar block h-4 w-1 rounded-full bg-[#FBBF24]"
                style={{ animationDelay: `${i * 0.06}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Inbox
const Inbox = ({ threads, onOpen, query, setQuery }: {
  threads: Thread[]; onOpen: (t: Thread) => void; query: string; setQuery: (s: string) => void;
}) => {
  const filtered = threads.filter((t) =>
    !query.trim() ||
    t.friend.name.toLowerCase().includes(query.toLowerCase()) ||
    t.friend.handle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-white">الرسائل</h1>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#111827] px-3 py-2.5">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو @المعرّف"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <ActiveFriends friends={FRIENDS} onPick={(f) => {
          const t = threads.find((x) => x.friend.id === f.id);
          if (t) onOpen(t);
        }} />
      </div>

      <ul className="mt-3 space-y-1">
        {filtered.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onOpen(t)}
              className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-start transition hover:bg-slate-900/60"
            >
              <div className="relative">
                <img src={t.friend.avatar} alt={t.friend.name} className="h-12 w-12 rounded-full object-cover" />
                {t.friend.online && (
                  <span className="absolute bottom-0 end-0 block h-3 w-3 rounded-full border-2 border-[#070A13] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-white">{t.friend.name}</p>
                  <span className="shrink-0 text-[10px] text-slate-500">{t.time}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {t.unread === 0 && <StatusTick s={t.status} />}
                  <p className={cn("truncate text-xs", t.unread ? "font-semibold text-slate-200" : "text-slate-400")}>
                    {t.preview}
                  </p>
                </div>
              </div>
              {t.unread > 0 && (
                <span className="ml-1 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#FBBF24] px-1.5 text-[11px] font-extrabold text-[#111827] shadow-[0_0_14px_rgba(251,191,36,0.55)]">
                  {t.unread}
                </span>
              )}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-sm text-slate-500">لا توجد محادثات مطابقة.</li>
        )}
      </ul>
    </div>
  );
};

const Messages = () => {
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const active = threads.find((t) => t.id === activeId) || null;

  const openThread = (t: Thread) => {
    setThreads((prev) => prev.map((x) => x.id === t.id ? { ...x, unread: 0 } : x));
    setActiveId(t.id);
  };

  const sendMessage = (m: Msg) => {
    setThreads((prev) => prev.map((x) =>
      x.id === activeId
        ? { ...x, messages: [...x.messages, m], preview: m.text, time: m.time, status: "sent" }
        : x
    ));
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#070A13]" dir="rtl">
        {active ? (
          <ChatScreen thread={active} onBack={() => setActiveId(null)} onSend={sendMessage} />
        ) : (
          <Inbox threads={threads} onOpen={openThread} query={query} setQuery={setQuery} />
        )}
      </div>
    </AppShell>
  );
};

export default Messages;
