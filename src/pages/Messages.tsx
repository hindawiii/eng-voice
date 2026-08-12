import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  Search, ArrowRight, Phone, UserRound, Mic, Send, Check, CheckCheck,
  Languages, Sparkles, X, Smile, ImagePlus, Video, Download, Play, Pause,
  Trash2, BellOff, Archive, Pin, Reply, Copy, Pencil, MoreHorizontal,
  Bookmark, Eye, EyeOff, ShieldAlert, ShieldOff, Lock, Users, Plus,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EmojiStickerPicker } from "@/components/EmojiStickerPicker";
import { translateText, detectIsArabic } from "@/hooks/useDictionary";
import { useMsg, tm, MsgKey } from "@/i18n/msg";
import { Lang } from "@/i18n/I18nProvider";

// ================= Types =================
interface Friend { id: string; name: string; handle: string; avatar: string; online: boolean; lastSeen?: string }
type Kind = "friend" | "room" | "saved";
interface Msg {
  id: string; from: "me" | "them"; text: string; time: string;
  lang?: string; status?: "sent" | "delivered" | "read";
  audioUrl?: string; imageUrl?: string; videoUrl?: string;
  replyTo?: { id: string; text: string; from: "me" | "them" };
  reactions?: string[];
  viewOnce?: boolean; consumed?: boolean;
  editedAt?: string; deletedForMe?: boolean;
}
interface Thread {
  id: string; kind: Kind; friend: Friend; messages: Msg[];
  unread: number; preview: string; time: string;
  status: "sent" | "delivered" | "read";
  muted?: boolean; archived?: boolean; pinned?: boolean;
  blocked?: boolean; theyRecording?: boolean; theyTyping?: boolean;
}

// ================= Seed data =================
const makeSelf = (l: Lang): Friend => ({ id: "me", name: tm(l, "saved"), handle: "@saved", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=saved&backgroundColor=FBBF24", online: true });
const makeFriends = (l: Lang): Friend[] => [
  { id: "u1", name: "Léa Martin", handle: "@lea", avatar: "https://i.pravatar.cc/120?img=47", online: true },
  { id: "u2", name: "Hans Müller", handle: "@hans", avatar: "https://i.pravatar.cc/120?img=12", online: true },
  { id: "u3", name: "Yuki Tanaka", handle: "@yuki", avatar: "https://i.pravatar.cc/120?img=32", online: true },
  { id: "u4", name: "Carlos Vega", handle: "@carlos", avatar: "https://i.pravatar.cc/120?img=15", online: false, lastSeen: tm(l, "min10") },
  { id: "u5", name: "Sara Ahmed", handle: "@sara", avatar: "https://i.pravatar.cc/120?img=49", online: true },
  { id: "u6", name: "Marco Rossi", handle: "@marco", avatar: "https://i.pravatar.cc/120?img=8", online: false, lastSeen: tm(l, "hour1") },
];
const makeRoomFriends = (l: Lang): Friend[] => [
  { id: "r1", name: tm(l, "roomEnglish"), handle: "@english-cafe", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=english&backgroundColor=1E3A5F", online: true },
  { id: "r2", name: tm(l, "roomFrench"), handle: "@fr-elite", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=fr&backgroundColor=4C1D95", online: true },
];

const makeSeedThreads = (l: Lang): Thread[] => {
  const F = makeFriends(l);
  const R = makeRoomFriends(l);
  const yest = tm(l, "yesterday");
  return [
    {
      id: "saved", kind: "saved", friend: makeSelf(l), unread: 0, preview: tm(l, "savedPreview"),
      time: tm(l, "now"), status: "read", pinned: true,
      messages: [{ id: "s1", from: "me", text: tm(l, "savedIntro"), time: tm(l, "now"), status: "read" }],
    },
    { id: "t1", kind: "friend", friend: F[0], unread: 2, preview: "On va pratiquer ce soir ?", time: "21:14", status: "delivered",
      messages: [
        { id: "m1", from: "them", text: "Salut! Comment ça va aujourd'hui ?", time: "21:10", lang: "fr" },
        { id: "m2", from: "me", text: tm(l, "seedFine"), time: "21:12", status: "read" },
        { id: "m3", from: "them", text: "On va pratiquer ce soir ?", time: "21:14", lang: "fr" },
      ] },
    { id: "t2", kind: "friend", friend: F[1], unread: 0, preview: "Danke schön 🙏", time: "19:02", status: "read",
      messages: [
        { id: "m1", from: "me", text: "Hier ist die Datei", time: "18:59", status: "read" },
        { id: "m2", from: "them", text: "Danke schön 🙏", time: "19:02", lang: "de" },
      ] },
    { id: "t3", kind: "friend", friend: F[2], unread: 5, preview: "また明日話そう！", time: yest, status: "sent",
      messages: [
        { id: "m1", from: "them", text: "今日はとても楽しかった", time: yest, lang: "ja" },
        { id: "m2", from: "them", text: "また明日話そう！", time: yest, lang: "ja" },
      ] },
    { id: "t4", kind: "friend", friend: F[3], unread: 0, preview: "Perfecto, nos vemos.", time: yest, status: "read",
      messages: [{ id: "m1", from: "them", text: "Perfecto, nos vemos.", time: yest, lang: "es" }] },
    { id: "r1", kind: "room", friend: R[0], unread: 1, preview: tm(l, "seedRoomTopic"), time: "20:30", status: "delivered",
      messages: [
        { id: "m1", from: "them", text: tm(l, "seedRoomWelcome"), time: "20:00" },
        { id: "m2", from: "them", text: tm(l, "seedRoomTopic"), time: "20:30" },
      ] },
    { id: "r2", kind: "room", friend: R[1], unread: 0, preview: "Léa: bienvenue tout le monde", time: yest, status: "read",
      messages: [{ id: "m1", from: "them", text: "Léa: bienvenue tout le monde", time: yest, lang: "fr" }] },
  ];
};

const QUICK_REACTIONS = ["❤️", "😂", "👍", "🔥", "🙏"];

const FOLDERS: { id: "all" | "friends" | "rooms"; key: MsgKey }[] = [
  { id: "all", key: "folderAll" },
  { id: "friends", key: "folderFriends" },
  { id: "rooms", key: "folderRooms" },
];

// ================= Helpers =================
const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const checkGrammar = (s: string, l: Lang): string | null => {
  const t = s.trim(); if (!t) return null;
  if (/\s{2,}/.test(t)) return tm(l, "gDoubleSpace");
  if (/([a-zA-Z\u0600-\u06FF])\1{3,}/.test(t)) return tm(l, "gRepeated");
  if (/^[a-z]/.test(t)) return tm(l, "gCapital");
  if (t.length > 12 && !/[.!?\u061F\u2026]$/.test(t)) return tm(l, "gPunct");
  if (/\bi\b/.test(t)) return tm(l, "gCapitalI");
  return null;
};

const StatusTick = ({ s }: { s?: "sent" | "delivered" | "read" }) => {
  if (!s) return null;
  if (s === "sent") return <Check className="h-3.5 w-3.5 text-slate-500" />;
  if (s === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-slate-500" />;
  return <CheckCheck className="h-3.5 w-3.5 text-gold" />;
};

// ================= Active friends bar =================
const ActiveFriends = ({ friends, onPick }: { friends: Friend[]; onPick: (f: Friend) => void }) => (
  <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 py-1">
    {friends.filter((f) => f.online).map((f) => (
      <button key={f.id} onClick={() => onPick(f)} className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
        <div className="relative">
          <img src={f.avatar} alt={f.name} className="h-14 w-14 rounded-full border-2 border-slate-800 object-cover" />
          <span className="absolute bottom-0.5 end-0.5 block h-3 w-3 rounded-full border-2 border-background bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
          </span>
        </div>
        <span className="w-full truncate text-[11px] text-slate-300">{f.name.split(" ")[0]}</span>
      </button>
    ))}
  </div>
);

// ================= Media lightbox =================
const Lightbox = ({ src, kind, onClose, alt }: { src: string; kind: "image" | "video"; onClose: () => void; alt?: string }) => {
  const { tm: T } = useMsg();
  const download = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `engvoice-${Date.now()}.${kind === "image" ? "jpg" : "mp4"}`;
    document.body.appendChild(a); a.click(); a.remove();
  };
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="rounded-full bg-slate-800/80 p-2 text-white hover:bg-slate-700">
          <X className="h-5 w-5" />
        </button>
        <button onClick={download} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-extrabold text-gold-foreground shadow-[0_0_18px_rgba(251,191,36,0.5)]">
          <Download className="h-4 w-4" /> {T("download")}
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

// ================= Audio preview =================
const AudioPreview = ({ url, onSend, onDelete }: { url: string; onSend: () => void; onDelete: () => void }) => {
  const { tm: T } = useMsg();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-card p-2">
      <button
        onClick={() => { const a = audioRef.current; if (!a) return; if (playing) { a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); } }}
        className="rounded-full bg-gold/20 p-2 text-gold"
        aria-label="play/pause"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
      <span className="flex-1 text-[11px] text-slate-300">{T("audioPreview")}</span>
      <button onClick={onDelete} className="rounded-full bg-rose-500/15 p-2 text-rose-300 hover:bg-rose-500/30" aria-label={T("delete")}>
        <Trash2 className="h-4 w-4" />
      </button>
      <button onClick={onSend} className="rounded-full bg-gradient-to-r from-gold to-gold-hover p-2.5 text-gold-foreground shadow-[0_0_14px_rgba(251,191,36,0.5)]" aria-label={T("send")}>
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
};

// ================= Message bubble with swipe & long-press =================
const MessageBubble = ({
  m, isSaved, translation, onTranslate, onReply, onLongPress, onOpenMedia,
  onConsumeViewOnce,
}: {
  m: Msg; isSaved: boolean; translation?: string;
  onTranslate: (m: Msg) => void;
  onReply: (m: Msg) => void;
  onLongPress: (m: Msg, rect: DOMRect) => void;
  onOpenMedia: (src: string, kind: "image" | "video") => void;
  onConsumeViewOnce: (m: Msg) => void;
}) => {
  const { tm: T } = useMsg();
  const mine = m.from === "me" || isSaved;
  const wrapRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const longRef = useRef<number | null>(null);

  const clearLong = () => { if (longRef.current) { clearTimeout(longRef.current); longRef.current = null; } };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    longRef.current = window.setTimeout(() => {
      const rect = bubbleRef.current?.getBoundingClientRect();
      if (rect) onLongPress(m, rect);
      startX.current = null;
    }, 450);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const delta = e.touches[0].clientX - startX.current;
    if (Math.abs(delta) > 6) clearLong();
    // Right-side swipe in RTL means user pulling toward reply; we mirror for both
    const clamped = Math.max(-80, Math.min(80, delta));
    setDx(clamped);
  };
  const onTouchEnd = () => {
    clearLong();
    if (Math.abs(dx) > 55) onReply(m);
    setDx(0);
    startX.current = null;
  };
  const onContext = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) onLongPress(m, rect);
  };

  if (m.deletedForMe) return null;

  const isBlurredViewOnce = m.viewOnce && m.consumed;
  const showViewOnceGate = m.viewOnce && !m.consumed && (m.imageUrl || m.videoUrl);

  return (
    <div ref={wrapRef} className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className="relative max-w-[78%] space-y-1" style={{ transform: `translateX(${dx}px)`, transition: dx === 0 ? "transform 200ms" : "none" }}>
        {Math.abs(dx) > 20 && (
          <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-gold",
            dx > 0 ? "-right-8" : "-left-8")}>
            <Reply className="h-4 w-4" /> {T("reply")}
          </div>
        )}
        <div
          ref={bubbleRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={onContext}
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft select-none",
            mine
              ? "rounded-br-sm border border-indigo-500/40 bg-indigo-950/50 text-white"
              : "rounded-bl-sm border border-slate-800 bg-slate-900/80 text-slate-100 backdrop-blur",
            isBlurredViewOnce && "opacity-70"
          )}
        >
          {m.replyTo && (
            <div className="mb-1.5 rounded-lg border-l-2 border-gold bg-black/25 px-2 py-1 text-[11px] text-slate-300">
              <span className="block font-bold text-gold">{m.replyTo.from === "me" ? T("you") : T("replyTo")}</span>
              <span className="line-clamp-2">{m.replyTo.text}</span>
            </div>
          )}

          {isBlurredViewOnce ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-black/40 px-3 py-4 text-xs text-slate-300">
              <Lock className="h-4 w-4 text-gold" />
              {T("viewOnceBurned")}
            </div>
          ) : showViewOnceGate ? (
            <button
              onClick={() => {
                onOpenMedia((m.imageUrl || m.videoUrl)!, m.imageUrl ? "image" : "video");
                onConsumeViewOnce(m);
              }}
              className="flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-3 py-4 text-xs font-bold text-gold"
            >
              <Eye className="h-4 w-4" /> {T("viewOnceOpen")}
            </button>
          ) : m.audioUrl ? (
            <audio controls src={m.audioUrl} className="h-8" />
          ) : m.imageUrl ? (
            <button onClick={() => onOpenMedia(m.imageUrl!, "image")}>
              <img src={m.imageUrl} alt="" className="max-h-64 rounded-xl object-cover" />
            </button>
          ) : m.videoUrl ? (
            <button onClick={() => onOpenMedia(m.videoUrl!, "video")}>
              <video src={m.videoUrl} className="max-h-64 rounded-xl" muted />
            </button>
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {m.text}
              {m.editedAt && <span className="ml-1 text-[10px] italic text-slate-400">{T("edited")}</span>}
            </p>
          )}
          {translation && (
            <p className="mt-1.5 border-t border-white/10 pt-1.5 text-xs text-gold">{translation}</p>
          )}
          {m.reactions && m.reactions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {m.reactions.map((r, i) => (
                <span key={i} className="rounded-full border border-gold/30 bg-surface-2 px-1.5 py-0.5 text-[11px]">{r}</span>
              ))}
            </div>
          )}
        </div>
        <div className={cn("flex items-center gap-2 px-1 text-[10px] text-slate-500", mine && "justify-end")}>
          <span>{m.time}</span>
          {mine && <StatusTick s={m.status} />}
          {!mine && m.lang && !isBlurredViewOnce && (
            <button onClick={() => onTranslate(m)}
              className="flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-gold hover:bg-slate-700/70">
              <Languages className="h-3 w-3" /> {T("translate")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ================= Floating reaction/context menu =================
type MenuState = { m: Msg; top: number; left: number; mine: boolean } | null;
const FloatingMenu = ({
  state, onClose, onReact, onOpenEmojiPicker, onReply, onCopy, onEdit, onTranslate, onDelete,
}: {
  state: MenuState; onClose: () => void;
  onReact: (m: Msg, emoji: string) => void;
  onOpenEmojiPicker: (m: Msg) => void;
  onReply: (m: Msg) => void;
  onCopy: (m: Msg) => void;
  onEdit: (m: Msg) => void;
  onTranslate: (m: Msg) => void;
  onDelete: (m: Msg) => void;
}) => {
  const { tm: T } = useMsg();
  if (!state) return null;
  const top = Math.max(80, state.top - 60);
  return (
    <div className="fixed inset-0 z-[80]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="absolute z-[81] flex items-center gap-1 rounded-full border border-gold/30 bg-card/95 px-2 py-1.5 shadow-[0_0_24px_rgba(251,191,36,0.25)]"
        style={{ top, left: Math.max(12, Math.min(state.left, window.innerWidth - 260)) }}
        onClick={(e) => e.stopPropagation()}
      >
        {QUICK_REACTIONS.map((e) => (
          <button key={e} onClick={() => { onReact(state.m, e); onClose(); }} className="rounded-full p-1.5 text-lg transition hover:scale-125">{e}</button>
        ))}
        <button onClick={() => { onOpenEmojiPicker(state.m); onClose(); }} className="rounded-full bg-gold/15 p-1.5 text-gold hover:bg-gold/25">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div
        className="absolute z-[81] w-56 overflow-hidden rounded-2xl border border-slate-800 bg-card shadow-2xl"
        style={{ top: top + 56, left: Math.max(12, Math.min(state.left, window.innerWidth - 240)) }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuBtn icon={<Reply className="h-4 w-4" />} label={T("reply")} onClick={() => { onReply(state.m); onClose(); }} />
        <MenuBtn icon={<Copy className="h-4 w-4" />} label={T("copyMsg")} onClick={() => { onCopy(state.m); onClose(); }} />
        {state.mine && !state.m.imageUrl && !state.m.videoUrl && !state.m.audioUrl && (
          <MenuBtn icon={<Pencil className="h-4 w-4" />} label={T("editMsg")} onClick={() => { onEdit(state.m); onClose(); }} />
        )}
        <MenuBtn icon={<Languages className="h-4 w-4" />} label={T("translateMsg")} onClick={() => { onTranslate(state.m); onClose(); }} />
        <MenuBtn icon={<Trash2 className="h-4 w-4 text-rose-400" />} label={T("deleteMsg")} danger onClick={() => { onDelete(state.m); onClose(); }} />
      </div>
    </div>
  );
};

const MenuBtn = ({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) => (
  <button onClick={onClick} className={cn("flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-800", danger ? "text-rose-300" : "text-white")}>
    {icon}{label}
  </button>
);

// ================= Chat Screen =================
const ChatScreen = ({
  thread, onBack, onSend, onUpdateMessage, onDeleteMessage, onClearHistory, onToggleMute, onBlock, onUpdateThread,
}: {
  thread: Thread;
  onBack: () => void;
  onSend: (m: Msg) => void;
  onUpdateMessage: (id: string, patch: Partial<Msg>) => void;
  onDeleteMessage: (id: string, scope: "me" | "all") => void;
  onClearHistory: (scope: "me" | "all") => void;
  onToggleMute: () => void;
  onBlock: () => void;
  onUpdateThread: (patch: Partial<Thread>) => void;
}) => {
  const { tm: T, lang, dir } = useMsg();
  const isSaved = thread.kind === "saved";
  const [text, setText] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileImgRef = useRef<HTMLInputElement>(null);
  const fileVidRef = useRef<HTMLInputElement>(null);
  const grammarHint = useMemo(() => checkGrammar(text, lang), [text, lang]);

  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiTargetMsgId, setEmojiTargetMsgId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [editing, setEditing] = useState<Msg | null>(null);
  const [viewOnce, setViewOnce] = useState(false);
  const [menu, setMenu] = useState<MenuState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Msg | null>(null);
  const [clearTarget, setClearTarget] = useState<null | true>(null);
  const [sidebar, setSidebar] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    if (editing) {
      onUpdateMessage(editing.id, { text: trimmed, editedAt: nowTime() });
      setEditing(null);
    } else {
      onSend({
        id: `m${Date.now()}`, from: "me", text: trimmed, time: nowTime(), status: "sent",
        ...(replyTo ? { replyTo: { id: replyTo.id, text: replyTo.text.slice(0, 80), from: replyTo.from } } : {}),
      });
      setReplyTo(null);
    }
    setText("");
  };

  const insertEmoji = (e: string) => {
    if (emojiTargetMsgId) {
      const m = thread.messages.find((x) => x.id === emojiTargetMsgId);
      if (m) {
        const list = [...(m.reactions || []), e];
        onUpdateMessage(m.id, { reactions: list });
      }
      setEmojiTargetMsgId(null);
      setShowEmoji(false);
      return;
    }
    setText((t) => t + e);
  };

  const handleFile = (file: File | null, kind: "image" | "video") => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSend({
      id: `m${Date.now()}`, from: "me", text: kind === "image" ? T("photoMsg") : T("videoMsg"),
      time: nowTime(), status: "sent", viewOnce,
      ...(kind === "image" ? { imageUrl: url } : { videoUrl: url }),
    });
    setViewOnce(false);
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

  const addReaction = (m: Msg, emoji: string) => {
    const list = [...(m.reactions || []), emoji];
    onUpdateMessage(m.id, { reactions: list });
  };

  const copyMsg = (m: Msg) => { navigator.clipboard?.writeText(m.text).catch(() => {}); };

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
    onSend({
      id: `m${Date.now()}`, from: "me", text: T("voiceMsg"), time: nowTime(), status: "sent", audioUrl: previewUrl,
    });
    setPreviewUrl(null);
  };

  const consumeViewOnce = (m: Msg) => {
    // small delay so lightbox opens with content first
    setTimeout(() => onUpdateMessage(m.id, { consumed: true }), 400);
  };

  const openLongPress = (m: Msg, rect: DOMRect) => {
    setMenu({ m, top: rect.top, left: rect.left, mine: m.from === "me" || isSaved });
  };

  const partnerStatus = thread.blocked
    ? T("blockedUser")
    : thread.theyRecording
    ? T("recordingNow")
    : thread.theyTyping
    ? T("typingNow")
    : thread.friend.online
    ? T("onlineNow")
    : `${T("lastSeen")} ${thread.friend.lastSeen || T("soon")}`;

  const filteredMsgs = useMemo(() => {
    if (!searchOpen || !searchQ.trim()) return thread.messages;
    return thread.messages.filter((m) => m.text?.toLowerCase().includes(searchQ.toLowerCase()));
  }, [thread.messages, searchOpen, searchQ]);

  return (
    <div className="flex h-[100dvh] flex-col bg-background" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-800 bg-card/90 px-4 py-3 backdrop-blur">
        <button onClick={onBack} className="rounded-full p-2 text-slate-300 hover:bg-slate-800/60" aria-label={T("back")}>
          <ArrowRight className="h-5 w-5 rtl:rotate-180" />
        </button>
        <button onClick={() => setLightbox({ src: thread.friend.avatar, kind: "image", alt: thread.friend.name })}>
          <img src={thread.friend.avatar} className="h-10 w-10 rounded-full object-cover" alt={thread.friend.name} />
        </button>
        <button onClick={() => setSidebar(true)} className="flex-1 min-w-0 text-start">
          <p className="truncate text-sm font-bold text-white">{thread.friend.name}</p>
          <p className={cn("flex items-center gap-1.5 text-[11px]",
            thread.theyRecording ? "text-gold" : thread.blocked ? "text-rose-400" : "text-emerald-400"
          )}>
            {thread.theyRecording && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="waveform-bar block h-2.5 w-[3px] rounded-full bg-gold" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </span>
            )}
            {partnerStatus}
          </p>
        </button>
        <button onClick={() => setSearchOpen((v) => !v)} className="rounded-full bg-slate-800/70 p-2 text-slate-300 hover:bg-slate-700/70" aria-label={T("search")}>
          <Search className="h-4 w-4" />
        </button>
        <button className="rounded-full bg-slate-800/70 p-2 text-emerald-300 hover:bg-slate-700/70" aria-label={T("call")}>
          <Phone className="h-4 w-4" />
        </button>
        <button onClick={() => setSidebar(true)} className="rounded-full bg-slate-800/70 p-2 text-gold hover:bg-slate-700/70" aria-label={T("profile")}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      {searchOpen && (
        <div className="border-b border-slate-800 bg-card px-3 py-2">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder={T("searchChat")}
            className="w-full rounded-xl border border-slate-800 bg-surface-2 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      )}

      {/* Messages list */}
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {filteredMsgs.map((m) => (
          <MessageBubble
            key={m.id}
            m={m}
            isSaved={isSaved}
            translation={translations[m.id]}
            onTranslate={toggleTranslate}
            onReply={setReplyTo}
            onLongPress={openLongPress}
            onOpenMedia={(src, kind) => setLightbox({ src, kind })}
            onConsumeViewOnce={consumeViewOnce}
          />
        ))}
      </div>

      {/* Grammar hint */}
      {grammarHint && (
        <div className="mx-4 mb-1 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] text-gold">
          <Sparkles className="h-3.5 w-3.5" /> {grammarHint}
        </div>
      )}

      {/* Reply / edit banner */}
      {(replyTo || editing) && (
        <div className="mx-3 mb-1 flex items-center gap-2 rounded-xl border border-slate-800 bg-surface-2 px-3 py-2 text-[11px] text-slate-300">
          {editing ? <Pencil className="h-3.5 w-3.5 text-gold" /> : <Reply className="h-3.5 w-3.5 text-gold" />}
          <span className="flex-1 truncate">
            <span className="font-bold text-gold">{editing ? T("editingPrefix") : T("replyPrefix")}</span>
            {(editing || replyTo)!.text}
          </span>
          <button onClick={() => { setReplyTo(null); setEditing(null); setText(""); }} className="text-slate-500 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Emoji + stickers panel */}
      {showEmoji && (
        <div className="mx-3 mb-1">
          <EmojiStickerPicker onSelect={insertEmoji} />
        </div>
      )}


      {/* View-once badge */}
      {viewOnce && (
        <div className="mx-3 mb-1 flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-3 py-1.5 text-[11px] text-gold">
          <EyeOff className="h-3.5 w-3.5" /> {T("viewOnceBanner")}
          <button onClick={() => setViewOnce(false)} className="ms-auto text-slate-400 hover:text-white"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Sticky bottom input dock — safe area padded */}
      <div
        className="sticky bottom-0 z-50 border-t border-slate-800 bg-card/95 px-3 pt-3 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
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
                <span key={i} className="waveform-bar block h-4 w-1 rounded-full bg-gold" style={{ animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            <span className="tabular-nums text-xs font-extrabold text-gold">0:{secondsLeft.toString().padStart(2, "0")}</span>
            <button onClick={stopVoice} className="rounded-full bg-gold px-3 py-1.5 text-[11px] font-extrabold text-gold-foreground">{T("stop")}</button>
          </div>
        ) : (
          <div className="flex items-end gap-1 rounded-2xl border border-slate-800 bg-surface-2 p-2">
            <button onClick={() => fileImgRef.current?.click()} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-gold" aria-label={T("image")}>
              <ImagePlus className="h-5 w-5" />
            </button>
            <button onClick={() => fileVidRef.current?.click()} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-gold" aria-label={T("video")}>
              <Video className="h-5 w-5" />
            </button>
            <button onClick={() => setViewOnce((v) => !v)} className={cn("rounded-full p-2 hover:bg-slate-800/60", viewOnce ? "text-gold" : "text-slate-400 hover:text-gold")} aria-label={T("viewOnce")}>
              <EyeOff className="h-5 w-5" />
            </button>
            <button onClick={() => { setEmojiTargetMsgId(null); setShowEmoji((v) => !v); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-gold" aria-label={T("emoji")}>
              <Smile className="h-5 w-5" />
            </button>
            <button onClick={translateDraft} disabled={!text.trim()} className="rounded-full p-2 text-slate-400 hover:bg-slate-800/60 hover:text-gold disabled:opacity-40" aria-label={T("instantTranslate")}>
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
              placeholder={isSaved ? T("writeNote") : T("writeMsg")}
              className="no-scrollbar flex-1 resize-none bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
            {text.trim() ? (
              <button onClick={send} className="rounded-full bg-gradient-to-r from-gold to-gold-hover p-2.5 text-gold-foreground shadow-[0_0_14px_rgba(251,191,36,0.45)] transition hover:scale-105" aria-label={T("send")}>
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={startVoice} className="rounded-full bg-gold/15 p-2.5 text-gold hover:bg-gold/25 shadow-[0_0_18px_rgba(251,191,36,0.25)]" aria-label={T("voiceRecord")}>
                <Mic className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {lightbox && <Lightbox src={lightbox.src} kind={lightbox.kind} alt={lightbox.alt} onClose={() => setLightbox(null)} />}

      {/* Floating reactions + context menu */}
      <FloatingMenu
        state={menu}
        onClose={() => setMenu(null)}
        onReact={addReaction}
        onOpenEmojiPicker={(m) => { setEmojiTargetMsgId(m.id); setShowEmoji(true); }}
        onReply={(m) => setReplyTo(m)}
        onCopy={copyMsg}
        onEdit={(m) => { setEditing(m); setText(m.text); }}
        onTranslate={toggleTranslate}
        onDelete={(m) => setDeleteTarget(m)}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="border-slate-800 bg-card text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{T("deleteMsg")}</DialogTitle>
            <DialogDescription className="text-slate-400">{T("deleteScope")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <button
              onClick={() => { if (deleteTarget) onDeleteMessage(deleteTarget.id, "me"); setDeleteTarget(null); }}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-surface-2 px-3 py-3 text-sm text-white hover:border-gold/40"
            >
              <Trash2 className="h-4 w-4 text-slate-300" /> {T("deleteForMe")}
            </button>
            <button
              onClick={() => { if (deleteTarget) onDeleteMessage(deleteTarget.id, "all"); setDeleteTarget(null); }}
              className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-3 text-sm text-rose-200 hover:bg-rose-900/40"
            >
              <ShieldAlert className="h-4 w-4 text-rose-300" /> {T("deleteForAll")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear history */}
      <Dialog open={!!clearTarget} onOpenChange={(o) => !o && setClearTarget(null)}>
        <DialogContent className="border-slate-800 bg-card text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{T("clearHistory")}</DialogTitle>
            <DialogDescription className="text-slate-400">{T("irreversible")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <button onClick={() => { onClearHistory("me"); setClearTarget(null); }}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-surface-2 px-3 py-3 text-sm text-white hover:border-gold/40">
              <Trash2 className="h-4 w-4" /> {T("clearForMe")}
            </button>
            <button onClick={() => { onClearHistory("all"); setClearTarget(null); }}
              className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-3 text-sm text-rose-200 hover:bg-rose-900/40">
              <ShieldAlert className="h-4 w-4" /> {T("clearForAll")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Side drawer settings */}
      <Sheet open={sidebar} onOpenChange={setSidebar}>
        <SheetContent side="left" className="w-[86vw] max-w-md border-slate-800 bg-card p-0 text-white">
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-slate-800 p-4">
              <SheetTitle className="text-white">{T("chatDetails")}</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col items-center gap-2 p-6">
              <button onClick={() => setLightbox({ src: thread.friend.avatar, kind: "image", alt: thread.friend.name })} className="relative">
                <img src={thread.friend.avatar} alt={thread.friend.name} className="h-28 w-28 rounded-full border-2 border-gold/50 object-cover shadow-[0_0_24px_rgba(251,191,36,0.25)]" />
                {thread.friend.online && <span className="absolute bottom-1 end-1 block h-4 w-4 rounded-full border-2 border-card bg-emerald-400" />}
              </button>
              <p className="text-lg font-extrabold text-white">{thread.friend.name}</p>
              <p className="text-xs text-gold">{thread.friend.handle}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 px-4">
              <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-surface-2 px-3 py-3 text-sm font-bold text-white hover:border-gold/40">
                <UserRound className="h-4 w-4 text-gold" /> {T("viewProfile")}
              </button>
              <button onClick={() => { setSidebar(false); setSearchOpen(true); }} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-surface-2 px-3 py-3 text-sm font-bold text-white hover:border-gold/40">
                <Search className="h-4 w-4 text-gold" /> {T("search")}
              </button>
            </div>

            <div className="mt-4 space-y-1 px-3">
              <button onClick={onToggleMute} className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-surface-2 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-white"><BellOff className="h-4 w-4 text-slate-300" /> {T("muteNotifs")}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                  thread.muted ? "bg-gold text-gold-foreground" : "bg-slate-700 text-slate-300")}>
                  {thread.muted ? T("on") : T("off")}
                </span>
              </button>
              <button onClick={() => setClearTarget(true)} className="flex w-full items-center gap-2 rounded-2xl border border-slate-800 bg-surface-2 px-4 py-3 text-sm text-white">
                <Trash2 className="h-4 w-4 text-slate-300" /> {T("clearHistory")}
              </button>
              <button onClick={onBlock} className="flex w-full items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm font-bold text-rose-200 hover:bg-rose-900/40">
                {thread.blocked ? <ShieldOff className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {thread.blocked ? T("unblock") : T("block")}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ================= Inbox row =================
const InboxRow = ({ t, onOpen, onAction }: {
  t: Thread; onOpen: () => void;
  onAction: (a: "mute" | "archive" | "pin") => void;
}) => {
  const { tm: T } = useMsg();
  const [menu, setMenu] = useState(false);
  const longRef = useRef<number | null>(null);
  const start = () => { longRef.current = window.setTimeout(() => setMenu(true), 450); };
  const cancel = () => { if (longRef.current) { clearTimeout(longRef.current); longRef.current = null; } };
  const isSaved = t.kind === "saved";

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
          {isSaved ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-hover text-gold-foreground shadow-[0_0_18px_rgba(251,191,36,0.4)]">
              <Bookmark className="h-6 w-6" />
            </div>
          ) : (
            <img src={t.friend.avatar} alt={t.friend.name} className="h-12 w-12 rounded-full object-cover" />
          )}
          {t.friend.online && !isSaved && (
            <span className="absolute bottom-0 end-0 block h-3 w-3 rounded-full border-2 border-background bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 truncate text-sm font-bold text-white">
              {t.pinned && <Pin className="h-3 w-3 text-gold" />}
              {t.muted && <BellOff className="h-3 w-3 text-slate-500" />}
              {t.kind === "room" && <Users className="h-3 w-3 text-cyan-400" />}
              {isSaved ? T("savedFull") : t.friend.name}
            </p>
            <span className="shrink-0 text-[10px] text-slate-500">{t.time}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {t.theyRecording ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-gold">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className="waveform-bar block h-2 w-[3px] rounded-full bg-gold" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
                {T("recordingNowShort")}
              </span>
            ) : (
              <>
                {t.unread === 0 && !isSaved && <StatusTick s={t.status} />}
                <p className={cn("truncate text-xs", t.unread ? "font-semibold text-slate-200" : "text-slate-400")}>{t.preview}</p>
              </>
            )}
          </div>
        </div>
        {t.unread > 0 && (
          <span className="ml-1 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-extrabold text-gold-foreground shadow-[0_0_14px_rgba(251,191,36,0.55)]">
            {t.unread}
          </span>
        )}
      </button>

      {menu && (
        <div className="absolute inset-x-2 top-full z-30 mt-1 overflow-hidden rounded-2xl border border-slate-800 bg-surface-2 shadow-2xl">
          <button onClick={() => { onAction("pin"); setMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-slate-800">
            <Pin className="h-4 w-4 text-gold" /> {T("pinTop")}
          </button>
          <button onClick={() => { onAction("mute"); setMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-slate-800">
            <BellOff className="h-4 w-4 text-slate-300" /> {t.muted ? T("unmute") : T("mute")}
          </button>
          <button onClick={() => { onAction("archive"); setMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-slate-800">
            <Archive className="h-4 w-4 text-slate-300" /> {T("archive")}
          </button>
          <button onClick={() => setMenu(false)} className="block w-full border-t border-slate-800 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800">{T("close")}</button>
        </div>
      )}
    </li>
  );
};

// ================= Inbox =================
const Inbox = ({ threads, onOpen, onAction, query, setQuery, folder, setFolder }: {
  threads: Thread[]; onOpen: (t: Thread) => void;
  onAction: (id: string, a: "mute" | "archive" | "pin") => void;
  query: string; setQuery: (s: string) => void;
  folder: "all" | "friends" | "rooms"; setFolder: (f: "all" | "friends" | "rooms") => void;
}) => {
  const { tm: T, lang } = useMsg();
  const sorted = [...threads]
    .filter((x) => !x.archived)
    .filter((x) => {
      if (folder === "friends") return x.kind === "friend" || x.kind === "saved";
      if (folder === "rooms") return x.kind === "room" || x.kind === "saved";
      return true;
    })
    .filter((x) => !query.trim() || x.friend.name.toLowerCase().includes(query.toLowerCase()) || x.friend.handle.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (a.kind === "saved") return -1;
      if (b.kind === "saved") return 1;
      return Number(!!b.pinned) - Number(!!a.pinned);
    });

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-white">{T("title")}</h1>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-800 bg-surface-2 px-3 py-2.5">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={T("searchInbox")}
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        )}
      </div>

      {/* Folder tabs */}
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFolder(f.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition",
              folder === f.id
                ? "bg-gradient-to-r from-gold to-gold-hover text-gold-foreground shadow-[0_0_14px_rgba(251,191,36,0.45)]"
                : "border border-slate-800 bg-surface-2 text-slate-300 hover:text-white"
            )}
          >
            {T(f.key)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <ActiveFriends friends={makeFriends(lang)} onPick={(f) => {
          const t = threads.find((x) => x.friend.id === f.id);
          if (t) onOpen(t);
        }} />
      </div>

      <ul className="mt-3 space-y-1">
        {sorted.map((t) => (
          <InboxRow key={t.id} t={t} onOpen={() => onOpen(t)} onAction={(a) => onAction(t.id, a)} />
        ))}
        {sorted.length === 0 && (
          <li className="py-10 text-center text-sm text-slate-500">{T("noThreads")}</li>
        )}
      </ul>
    </div>
  );
};

// ================= Main =================
const Messages = () => {
  const { lang, dir } = useMsg();
  const [threads, setThreads] = useState<Thread[]>(() => makeSeedThreads(lang));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<"all" | "friends" | "rooms">("all");
  const active = threads.find((t) => t.id === activeId) || null;

  // Re-localize seeded demo content when the interface language changes
  const firstLang = useRef(lang);
  useEffect(() => {
    if (firstLang.current === lang) return;
    firstLang.current = lang;
    setThreads(makeSeedThreads(lang));
  }, [lang]);

  // Simulate a partner recording indicator every ~14s on Léa's thread for demo
  useEffect(() => {
    const int = window.setInterval(() => {
      setThreads((prev) => prev.map((x) => x.id === "t1" ? { ...x, theyRecording: true } : x));
      window.setTimeout(() => {
        setThreads((prev) => prev.map((x) => x.id === "t1" ? { ...x, theyRecording: false } : x));
      }, 4200);
    }, 14000);
    return () => clearInterval(int);
  }, []);

  const openThread = (t: Thread) => {
    setThreads((prev) => prev.map((x) => x.id === t.id ? { ...x, unread: 0 } : x));
    setActiveId(t.id);
  };

  const sendMessage = (m: Msg) => {
    setThreads((prev) => prev.map((x) =>
      x.id === activeId ? { ...x, messages: [...x.messages, m], preview: m.text, time: m.time, status: "sent" } : x
    ));
  };

  const updateMessage = (id: string, patch: Partial<Msg>) => {
    setThreads((prev) => prev.map((x) => x.id !== activeId ? x : ({
      ...x, messages: x.messages.map((mm) => mm.id === id ? { ...mm, ...patch } : mm),
    })));
  };

  const deleteMessage = (id: string, scope: "me" | "all") => {
    setThreads((prev) => prev.map((x) => x.id !== activeId ? x : ({
      ...x, messages: scope === "all"
        ? x.messages.filter((mm) => mm.id !== id)
        : x.messages.map((mm) => mm.id === id ? { ...mm, deletedForMe: true } : mm),
    })));
  };

  const clearHistory = (_scope: "me" | "all") => {
    setThreads((prev) => prev.map((x) => x.id !== activeId ? x : ({ ...x, messages: [], preview: "" })));
  };

  const toggleMute = () => {
    setThreads((prev) => prev.map((x) => x.id !== activeId ? x : ({ ...x, muted: !x.muted })));
  };

  const toggleBlock = () => {
    setThreads((prev) => prev.map((x) => x.id !== activeId ? x : ({ ...x, blocked: !x.blocked })));
  };

  const updateThread = useCallback((patch: Partial<Thread>) => {
    setThreads((prev) => prev.map((x) => x.id !== activeId ? x : ({ ...x, ...patch })));
  }, [activeId]);

  const onAction = (id: string, a: "mute" | "archive" | "pin") => {
    setThreads((prev) => prev.map((x) => x.id !== id ? x : (
      a === "mute" ? { ...x, muted: !x.muted } :
      a === "archive" ? { ...x, archived: true } :
      { ...x, pinned: !x.pinned }
    )));
  };

  // Chat screen owns the full viewport (no bottom nav gap).
  if (active) {
    return (
      <ChatScreen
        thread={active}
        onBack={() => setActiveId(null)}
        onSend={sendMessage}
        onUpdateMessage={updateMessage}
        onDeleteMessage={deleteMessage}
        onClearHistory={clearHistory}
        onToggleMute={toggleMute}
        onBlock={toggleBlock}
        onUpdateThread={updateThread}
      />
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background" dir={dir}>
        <Inbox
          threads={threads}
          onOpen={openThread}
          onAction={onAction}
          query={query} setQuery={setQuery}
          folder={folder} setFolder={setFolder}
        />
      </div>
    </AppShell>
  );
};

export default Messages;
