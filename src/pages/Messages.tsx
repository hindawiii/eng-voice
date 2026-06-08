import { useMemo, useRef, useState, useEffect } from "react";
import {
  Search, ArrowRight, Phone, UserRound, Mic, Send,
  Check, CheckCheck, Languages, Sparkles, X, Smile,
  ImagePlus, Video, Download, Play, Pause, Trash2, BellOff, Archive, Pin,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { translateText, detectIsArabic } from "@/hooks/useDictionary";

interface Friend { id: string; name: string; handle: string; avatar: string; online: boolean; lastSeen?: string }
interface Msg { id: string; from: "me" | "them"; text: string; time: string; lang?: string; status?: "sent" | "delivered" | "read"; audioUrl?: string; imageUrl?: string; videoUrl?: string }
interface Thread { id: string; friend: Friend; messages: Msg[]; unread: number; preview: string; time: string; status: "sent" | "delivered" | "read"; muted?: boolean; archived?: boolean; pinned?: boolean }

const FRIENDS: Friend[] = [
  { id: "u1", name: "Léa Martin", handle: "@lea", avatar: "https://i.pravatar.cc/120?img=47", online: true },
  { id: "u2", name: "Hans Müller", handle: "@hans", avatar: "https://i.pravatar.cc/120?img=12", online: true },
  { id: "u3", name: "Yuki Tanaka", handle: "@yuki", avatar: "https://i.pravatar.cc/120?img=32", online: true },
  { id: "u4", name: "Carlos Vega", handle: "@carlos", avatar: "https://i.pravatar.cc/120?img=15", online: false, lastSeen: "منذ ١٠ د" },
  { id: "u5", name: "Sara Ahmed", handle: "@sara", avatar: "https://i.pravatar.cc/120?img=49", online: true },
  { id: "u6", name: "Marco Rossi", handle: "@marco", avatar: "https://i.pravatar.cc/120?img=8", online: false, lastSeen: "منذ ساعة" },
];

const SEED_THREADS: Thread[] = [
  { id: "t1", friend: FRIENDS[0], unread: 2, preview: "On va pratiquer ce soir ?", time: "21:14", status: "delivered",
    messages: [
      { id: "m1", from: "them", text: "Salut! Comment ça va aujourd'hui ?", time: "21:10", lang: "fr" },
      { id: "m2", from: "me", text: "أنا بخير، شكراً!", time: "21:12", status: "read" },
      { id: "m3", from: "them", text: "On va pratiquer ce soir ?", time: "21:14", lang: "fr" },
    ] },
  { id: "t2", friend: FRIENDS[1], unread: 0, preview: "Danke schön 🙏", time: "19:02", status: "read",
    messages: [
      { id: "m1", from: "me", text: "Hier ist die Datei", time: "18:59", status: "read" },
      { id: "m2", from: "them", text: "Danke schön 🙏", time: "19:02", lang: "de" },
    ] },
  { id: "t3", friend: FRIENDS[2], unread: 5, preview: "また明日話そう！", time: "أمس", status: "sent",
    messages: [
      { id: "m1", from: "them", text: "今日はとても楽しかった", time: "أمس", lang: "ja" },
      { id: "m2", from: "them", text: "また明日話そう！", time: "أمس", lang: "ja" },
    ] },
  { id: "t4", friend: FRIENDS[3], unread: 0, preview: "Perfecto, nos vemos.", time: "أمس", status: "read",
    messages: [{ id: "m1", from: "them", text: "Perfecto, nos vemos.", time: "أمس", lang: "es" }] },
];

const EMOJI_SET = ["😀","😂","🥰","😎","🤔","🙏","👍","🔥","🎉","❤️","💯","🌟","✨","🎙️","📚","🇸🇦","🇫🇷","🇩🇪","🇯🇵","🇪🇸"];

const checkGrammar = (s: string): string | null => {
  const t = s.trim(); if (!t) return null;
  if (/\s{2,}/.test(t)) return "تجنّب المسافات المزدوجة.";
  if (/([a-zA-Z\u0600-\u06FF])\1{3,}/.test(t)) return "حروف مكررة قد تكون خطأً مطبعياً.";
  if (/^[a-z]/.test(t)) return "ابدأ الجملة بحرف كبير (Capital).";
  if (t.length > 12 && !/[.!?؟…]$/.test(t)) return "أضف علامة ترقيم في النهاية.";
  if (/\bi\b/.test(t)) return "اكتب \"I\" بحرف كبير.";
  return null;
};

const StatusTick = ({ s }: { s?: "sent" | "delivered" | "read" }) => {
  if (!s) return null;
  if (s === "sent") return <Check className="h-3.5 w-3.5 text-slate-500" />;
  if (s === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-slate-500" />;
  return <CheckCheck className="h-3.5 w-3.5 text-[#FBBF24]" />;
};

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

// ---------- Media lightbox
const Lightbox = ({ src, kind, onClose, alt }: { src: string; kind: "image" | "video"; onClose: () => void; alt?: string }) => {
  const download = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `engvoice-${Date.now()}.${kind === "image" ? "jpg" : "mp4"}`;
    document.body.appendChild(a); a.click(); a.remove();
  };
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#070A13]/95 backdrop-blur-md" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="rounded-full bg-slate-800/80 p-2 text-white hover:bg-slate-700">
          <X className="h-5 w-5" />
        </button>
        <button onClick={download} className="inline-flex items-center gap-2 rounded-full bg-[#FBBF24] px-4 py-2 text-sm font-extrabold text-[#111827] shadow-[0_0_18px_rgba(251,191,36,0.5)]">
          <Download className="h-4 w-4" /> تحميل المرفق
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        {kind === "image"
          ? <img src={src} alt={alt || ""} className="max-h-full max-w-full rounded-2xl object-contain" />
          : <video src={src} controls autoPlay className="max-h-full max-w-full rounded-2xl" />}
      </div>
    </div>
  );
};

// ---------- Audio preview component (post-recording)
const AudioPreview = ({ url, onSend, onDelete }: { url: string; onSend: () => void; onDelete: () => void }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  return (
    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#FBBF24]/40 bg-[#0B101D] p-2">
      <button
        onClick={() => {
          const a = audioRef.current; if (!a) return;
          if (playing) { a.pause(); setPlaying(false); }
          else { a.play(); setPlaying(true); }
        }}
        className="rounded-full bg-[#FBBF24]/20 p-2 text-[#FBBF24]"
        aria-label="play/pause"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
      <span className="flex-1 text-[11px] text-slate-300">معاينة الصوت — استمع قبل الإرسال</span>
      <button onClick={onDelete} className="rounded-full bg-rose-500/15 p-2 text-rose-300 hover:bg-rose-500/30" aria-label="حذف">
        <Trash2 className="h-4 w-4" />
      </button>
      <button onClick={onSend} className="rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] p-2.5 text-[#111827] shadow-[0_0_14px_rgba(251,191,36,0.5)]" aria-label="إرسال">
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
};

// ---------- Chat Screen
const ChatScreen = ({ thread, onBack, onSend }: { thread: Thread; onBack: () => void; onSend: (m: Msg) => void }) => {
  const [text, setText] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileImgRef = useRef<HTMLInputElement>(null);
  const fileVidRef = useRef<HTMLInputElement>(null);
  const grammarHint = useMemo(() => checkGrammar(text), [text]);

  const [showEmoji, setShowEmoji] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);

  // Audio recorder state
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Lightbox
  const [lightbox, setLightbox] = useState<{ src: string; kind: "image" | "video"; alt?: string } | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.messages.length]);
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + "px";
  }, [text]);

  const send = () => {
    const trimmed = text.trim(); if (!trimmed) return;
    onSend({ id: `m${Date.now()}`, from: "me", text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "sent" });
    setText("");
  };

  const insertEmoji = (e: string) => setText((t) => t + e);

  const handleFile = (file: File | null, kind: "image" | "video") => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSend({
      id: `m${Date.now()}`, from: "me", text: kind === "image" ? "📷 صورة" : "🎬 فيديو",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent", ...(kind === "image" ? { imageUrl: url } : { videoUrl: url }),
    });
  };

  const translateDraft = async () => {
    const t = text.trim(); if (!t) return;
    const isAr = detectIsArabic(t);
    const res = await translateText(t, isAr ? "ar" : "en", isAr ? "en" : "ar");
    if (res) setText(res);
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" }));
        setPreviewUrl(url);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setRecording(false);
      };
      mr.start();
      setRecording(true);
      setSecondsLeft(60);
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { mr.state !== "inactive" && mr.stop(); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch { setRecording(false); }
  };
  const stopVoice = () => { mediaRecRef.current?.state !== "inactive" && mediaRecRef.current?.stop(); };
  const cancelPreview = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); };
  const sendVoice = () => {
    if (!previewUrl) return;
    onSend({ id: `m${Date.now()}`, from: "me", text: "🎙️ رسالة صوتية",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent", audioUrl: previewUrl });
    setPreviewUrl(null);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      <header className="flex items-center gap-3 border-b border-slate-800 bg-[#0B101D]/80 px-4 py-3 backdrop-blur">
        <button onClick={onBack} className="rounded-full p-2 text-slate-300 hover:bg-slate-800/60" aria-label="رجوع">
          <ArrowRight className="h-5 w-5 rtl:rotate-180" />
        </button>
        <button onClick={() => setLightbox({ src: thread.friend.avatar, kind: "image", alt: thread.friend.name })}>
          <img src={thread.friend.avatar} className="h-10 w-10 rounded-full object-cover" alt={thread.friend.name} />
        </button>
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

      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
        {thread.messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[78%] space-y-1")}>
                <div className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft",
                  mine
                    ? "rounded-br-sm border border-indigo-500/40 bg-indigo-950/50 text-white"
                    : "rounded-bl-sm border border-slate-800 bg-slate-900/80 text-slate-100 backdrop-blur"
                )}>
                  {m.audioUrl ? (
                    <audio controls src={m.audioUrl} className="h-8" />
                  ) : m.imageUrl ? (
                    <button onClick={() => setLightbox({ src: m.imageUrl!, kind: "image" })}>
                      <img src={m.imageUrl} alt="" className="max-h-64 rounded-xl object-cover" />
                    </button>
                  ) : m.videoUrl ? (
                    <button onClick={() => setLightbox({ src: m.videoUrl!, kind: "video" })}>
                      <video src={m.videoUrl} className="max-h-64 rounded-xl" muted />
                    </button>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  )}
                  {translations[m.id] && (
                    <p className="mt-1.5 border-t border-white/10 pt-1.5 text-xs text-[#FBBF24]">{translations[m.id]}</p>
                  )}
                </div>
                <div className={cn("flex items-center gap-2 px-1 text-[10px] text-slate-500", mine && "justify-end")}>
                  <span>{m.time}</span>
                  {mine && <StatusTick s={m.status} />}
                  {!mine && m.lang && (
                    <button onClick={() => toggleTranslate(m)}
                      className="flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-[#FBBF24] hover:bg-slate-700/70">
                      <Languages className="h-3 w-3" /> ترجمة
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {grammarHint && (
        <div className="mx-4 mb-1 flex items-center gap-2 rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-3 py-1.5 text-[11px] text-[#FBBF24]">
          <Sparkles className="h-3.5 w-3.5" /> {grammarHint}
        </div>
      )}

      {/* Emoji panel */}
      {showEmoji && (
        <div className="mx-3 mb-1 grid grid-cols-10 gap-1 rounded-2xl border border-slate-800 bg-[#0B101D] p-2">
          {EMOJI_SET.map((e) => (
            <button key={e} onClick={() => insertEmoji(e)} className="rounded-md p-1 text-lg hover:bg-slate-800">{e}</button>
          ))}
        </div>
      )}

      {/* Bottom dock */}
      <div className="border-t border-slate-800 bg-[#0B101D]/90 p-3 backdrop-blur">
        {previewUrl ? (
          <AudioPreview url={previewUrl} onSend={sendVoice} onDelete={cancelPreview} />
        ) : recording ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-2.5">
            <span className="relative flex h-3 w-3">
              <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/70" />
              <span className="relative h-3 w-3 rounded-full bg-rose-500" />
            </span>
            <div className="flex-1 flex items-center gap-1">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="waveform-bar block h-4 w-1 rounded-full bg-[#FBBF24]" style={{ animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            <span className="tabular-nums text-xs font-extrabold text-[#FBBF24]">0:{secondsLeft.toString().padStart(2, "0")}</span>
            <button onClick={stopVoice} className="rounded-full bg-[#FBBF24] px-3 py-1.5 text-[11px] font-extrabold text-[#111827]">إيقاف</button>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-1 rounded-2xl border border-slate-800 bg-[#111827] p-2">
              <button onClick={() => fileImgRef.current?.click()} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-[#FBBF24]" aria-label="صورة">
                <ImagePlus className="h-5 w-5" />
              </button>
              <button onClick={() => fileVidRef.current?.click()} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-[#FBBF24]" aria-label="فيديو">
                <Video className="h-5 w-5" />
              </button>
              <button onClick={() => setShowEmoji((v) => !v)} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-[#FBBF24]" aria-label="إيموجي">
                <Smile className="h-5 w-5" />
              </button>
              <button onClick={translateDraft} disabled={!text.trim()} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-[#FBBF24] disabled:opacity-40" aria-label="ترجمة فورية">
                <Languages className="h-5 w-5" />
              </button>
              <input ref={fileImgRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0] || null, "image")} />
              <input ref={fileVidRef} type="file" accept="video/*" hidden onChange={(e) => handleFile(e.target.files?.[0] || null, "video")} />
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
                <button onClick={send} className="rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] p-2.5 text-[#111827] shadow-[0_0_14px_rgba(251,191,36,0.45)] transition hover:scale-105" aria-label="إرسال">
                  <Send className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={startVoice} className="rounded-full bg-[#FBBF24]/15 p-2.5 text-[#FBBF24] hover:bg-[#FBBF24]/25 shadow-[0_0_18px_rgba(251,191,36,0.25)]" aria-label="تسجيل صوتي">
                  <Mic className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {lightbox && <Lightbox src={lightbox.src} kind={lightbox.kind} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
  );
};

// ---------- Inbox row with long-press actions
const InboxRow = ({ t, onOpen, onAction }: {
  t: Thread; onOpen: () => void;
  onAction: (a: "mute" | "archive" | "pin") => void;
}) => {
  const [menu, setMenu] = useState(false);
  const longRef = useRef<number | null>(null);
  const start = () => { longRef.current = window.setTimeout(() => setMenu(true), 450); };
  const cancel = () => { if (longRef.current) { clearTimeout(longRef.current); longRef.current = null; } };

  return (
    <li className="relative">
      <button
        onClick={onOpen}
        onMouseDown={start} onMouseUp={cancel} onMouseLeave={cancel}
        onTouchStart={start} onTouchEnd={cancel}
        onContextMenu={(e) => { e.preventDefault(); setMenu(true); }}
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
            <p className="flex items-center gap-1.5 truncate text-sm font-bold text-white">
              {t.pinned && <Pin className="h-3 w-3 text-[#FBBF24]" />}
              {t.muted && <BellOff className="h-3 w-3 text-slate-500" />}
              {t.friend.name}
            </p>
            <span className="shrink-0 text-[10px] text-slate-500">{t.time}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {t.unread === 0 && <StatusTick s={t.status} />}
            <p className={cn("truncate text-xs", t.unread ? "font-semibold text-slate-200" : "text-slate-400")}>{t.preview}</p>
          </div>
        </div>
        {t.unread > 0 && (
          <span className="ml-1 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#FBBF24] px-1.5 text-[11px] font-extrabold text-[#111827] shadow-[0_0_14px_rgba(251,191,36,0.55)]">
            {t.unread}
          </span>
        )}
      </button>

      {menu && (
        <div className="absolute inset-x-2 top-full z-30 mt-1 overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
          <button onClick={() => { onAction("pin"); setMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-slate-800">
            <Pin className="h-4 w-4 text-[#FBBF24]" /> تثبيت في الأعلى
          </button>
          <button onClick={() => { onAction("mute"); setMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-slate-800">
            <BellOff className="h-4 w-4 text-slate-300" /> {t.muted ? "إلغاء الكتم" : "عمل ميوت"}
          </button>
          <button onClick={() => { onAction("archive"); setMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-slate-800">
            <Archive className="h-4 w-4 text-slate-300" /> أرشفة
          </button>
          <button onClick={() => setMenu(false)} className="block w-full border-t border-slate-800 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800">إغلاق</button>
        </div>
      )}
    </li>
  );
};

const Inbox = ({ threads, onOpen, onAction, query, setQuery }: {
  threads: Thread[]; onOpen: (t: Thread) => void;
  onAction: (id: string, a: "mute" | "archive" | "pin") => void;
  query: string; setQuery: (s: string) => void;
}) => {
  const sorted = [...threads]
    .filter((x) => !x.archived)
    .filter((x) => !query.trim() || x.friend.name.toLowerCase().includes(query.toLowerCase()) || x.friend.handle.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

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
          <button onClick={() => setQuery("")} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        )}
      </div>

      <div className="mt-4">
        <ActiveFriends friends={FRIENDS} onPick={(f) => {
          const t = threads.find((x) => x.friend.id === f.id);
          if (t) onOpen(t);
        }} />
      </div>

      <ul className="mt-3 space-y-1">
        {sorted.map((t) => (
          <InboxRow key={t.id} t={t} onOpen={() => onOpen(t)} onAction={(a) => onAction(t.id, a)} />
        ))}
        {sorted.length === 0 && (
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
      x.id === activeId ? { ...x, messages: [...x.messages, m], preview: m.text, time: m.time, status: "sent" } : x
    ));
  };

  const onAction = (id: string, a: "mute" | "archive" | "pin") => {
    setThreads((prev) => prev.map((x) => x.id !== id ? x : (
      a === "mute" ? { ...x, muted: !x.muted } :
      a === "archive" ? { ...x, archived: true } :
      { ...x, pinned: !x.pinned }
    )));
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#070A13]" dir="rtl">
        {active ? (
          <ChatScreen thread={active} onBack={() => setActiveId(null)} onSend={sendMessage} />
        ) : (
          <Inbox threads={threads} onOpen={openThread} onAction={onAction} query={query} setQuery={setQuery} />
        )}
      </div>
    </AppShell>
  );
};

export default Messages;
