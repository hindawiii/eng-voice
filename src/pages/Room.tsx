import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Flag, Hand, Languages, Lock, Mic, Sparkles, Timer, Zap, Plus, Crown, MicOff, UserMinus, X,
  MessageSquare, Wand2, ChevronDown, ChevronUp, Settings as Cog, Users, Download, GraduationCap, LogOut,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ROOMS, SAMPLE_SPEAKERS, SeatUser } from "@/data/rooms";
import { getCustomRoom, CustomRoom } from "@/data/customRooms";
import { Seat } from "@/components/Seat";
import { ChatBox } from "@/components/ChatBox";
import { RequestQueue, SpeakRequest } from "@/components/RequestQueue";
import { AdminPanel } from "@/components/AdminPanel";
import { GiftButton } from "@/components/GiftButton";
import { ShareButton } from "@/components/ShareButton";
import { MiniProfileSheet, MiniProfileUser } from "@/components/MiniProfileSheet";
import { TimerEngineDialog, TimerConfig } from "@/components/TimerEngineDialog";
import { SpeakerCountdown } from "@/components/SpeakerCountdown";
import { LiveTranscriptionDrawer } from "@/components/LiveTranscriptionDrawer";
import { SessionRatingModal } from "@/components/SessionRatingModal";
import { AINoiseToggle } from "@/components/AINoiseToggle";
import { CertifiedTutorBadge } from "@/components/CertifiedTutorBadge";
import { useTutorRecorder } from "@/hooks/useTutorRecorder";
import { useWallet } from "@/hooks/useWallet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

const REACTION_EMOJIS = ["👏", "❤️", "🔥", "😂", "👍"] as const;
const SESSION_TOTAL = 60 * 60; // 60 minutes

const TOPICS_EN = [
  "Tell us about a weird food you've tried",
  "Describe your perfect Sunday morning",
  "A small habit that changed your life",
  "Your favorite city to walk in",
  "What song reminds you of childhood?",
];
const TOPICS_AR = [
  "أخبرنا عن طعام غريب جربته",
  "صف صباح الأحد المثالي",
  "عادة صغيرة غيّرت حياتك",
  "مدينتك المفضلة للمشي",
  "أي أغنية تذكرك بطفولتك؟",
];

const INITIAL_LISTENERS = [
  { id: "l1", flag: "🇩🇪", name: "Hans" },
  { id: "l2", flag: "🇧🇷", name: "Lucas" },
  { id: "l3", flag: "🇰🇷", name: "Min" },
  { id: "l4", flag: "🇲🇦", name: "Salma" },
  { id: "l5", flag: "🇫🇷", name: "Léa" },
  { id: "l6", flag: "🇮🇩", name: "Putri" },
  { id: "l7", flag: "🇹🇷", name: "Emir" },
  { id: "l8", flag: "🇮🇳", name: "Aria" },
];

const INITIAL_REQUESTS: SpeakRequest[] = [
  { id: "r1", name: "Hans", flag: "🇩🇪", level: 2 },
  { id: "r2", name: "Léa", flag: "🇫🇷", level: 4 },
];

const TOPIC_INTERVAL = 300; // 5 min

const Room = () => {
  const { key } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { lp, add: addLp, spend: spendLp } = useWallet();

  const publicRoom = ROOMS.find((r) => r.key === key);
  const customRoom: CustomRoom | undefined = !publicRoom && key ? getCustomRoom(key) : undefined;

  const isCustom = !!customRoom;
  const room = publicRoom ?? {
    key: customRoom?.key || "unknown",
    name: customRoom?.name || "Room",
    nameAr: customRoom?.nameAr || "غرفة",
    flag: customRoom?.flag || "🌍",
    accent: customRoom?.accent || "from-[#1E3A5F] to-[#D4AF37]",
    topic: customRoom?.topic || "",
    topicAr: customRoom?.topicAr || "",
  } as any;

  const isTutorRoom = !!customRoom?.tutorMode;
  const tutorDifficulty = customRoom?.difficulty;

  // Custom rooms: creator is admin. Public rooms: simulate "you are admin" off.
  const isAdmin = isCustom;
  const requiresPassword = isCustom && !!customRoom?.password;
  const urlPassword = searchParams.get("pw") || "";
  const [unlocked, setUnlocked] = useState(
    !requiresPassword || urlPassword === customRoom?.password
  );
  const [pwInput, setPwInput] = useState("");

  const TOPICS = lang === "ar" ? TOPICS_AR : TOPICS_EN;
  const [customTopic, setCustomTopic] = useState(
    isCustom ? (lang === "ar" ? customRoom!.topicAr : customRoom!.topic) : ""
  );
  const roomName = lang === "ar" ? room.nameAr : room.name;

  // Seats
  const [seats, setSeats] = useState<(SeatUser | undefined)[]>(() => {
    const arr: (SeatUser | undefined)[] = [...SAMPLE_SPEAKERS];
    while (arr.length < 8) arr.push(undefined);
    return arr;
  });

  // Speaker timer (persisted per room)
  const TIMER_KEY = `lingvoice.roomTimer.${room.key}`;
  const restored = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(TIMER_KEY);
      return raw ? (JSON.parse(raw) as { turnLength: number; timeLeft: number }) : null;
    } catch {
      return null;
    }
  })();
  const [turnLength, setTurnLength] = useState(restored?.turnLength ?? 180);
  const [timeLeft, setTimeLeft] = useState(restored?.timeLeft ?? restored?.turnLength ?? 180);
  const activeSpeakerIdx = useMemo(() => seats.findIndex((s) => s?.speaking), [seats]);

  // Persist timer
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify({ turnLength, timeLeft }));
    } catch {}
  }, [turnLength, timeLeft, TIMER_KEY]);

  const [topicIdx, setTopicIdx] = useState(0);
  const [topicTime, setTopicTime] = useState(TOPIC_INTERVAL);

  const [requests, setRequests] = useState<SpeakRequest[]>(isAdmin ? INITIAL_REQUESTS : []);
  const [listeners, setListeners] = useState(INITIAL_LISTENERS);

  const [sessionExtraMin, setSessionExtraMin] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState(customTopic);
  const [newPasswordInput, setNewPasswordInput] = useState(customRoom?.password || "");

  // === NEW: Timer Engine, AI noise, rating, recorder ===
  const TIMER_CFG_KEY = `lingvoice.timerCfg.${room.key}`;
  const [timerCfg, setTimerCfg] = useState<TimerConfig>(() => {
    try {
      const raw = localStorage.getItem(TIMER_CFG_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { mode: "off", speakerSec: 180, sessionMin: 45 };
  });
  useEffect(() => {
    try { localStorage.setItem(TIMER_CFG_KEY, JSON.stringify(timerCfg)); } catch {}
  }, [timerCfg, TIMER_CFG_KEY]);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [aiNoise, setAiNoise] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [tutorDownloadOpen, setTutorDownloadOpen] = useState(false);

  const recorder = useTutorRecorder();

  // Tutor entry fee: charge listener 10 LP once per room visit
  useEffect(() => {
    if (!isTutorRoom || isCustom === false) return;
    const paidKey = `lingvoice.tutorPaid.${room.key}`;
    if (sessionStorage.getItem(paidKey)) return;
    if (isAdmin) { sessionStorage.setItem(paidKey, "1"); return; }
    if (!spendLp(10)) {
      toast.error(lang === "ar" ? "تحتاج 10 LP لدخول جلسة المرشد" : "Need 10 LP to enter tutor session");
      navigate("/");
      return;
    }
    sessionStorage.setItem(paidKey, "1");
    // 7 LP to tutor balance (tracked separately), 3 LP platform commission
    try {
      const tk = `lingvoice.tutorEarnings.${room.key}`;
      const cur = Number(localStorage.getItem(tk) || 0);
      localStorage.setItem(tk, String(cur + 7));
      const pk = "lingvoice.platformCommission";
      localStorage.setItem(pk, String(Number(localStorage.getItem(pk) || 0) + 3));
    } catch {}
    toast.success(lang === "ar" ? "-10 LP · أهلاً في الجلسة" : "-10 LP · Welcome to session");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tutor: auto-start recording on enter (admin only)
  useEffect(() => {
    if (!isTutorRoom || !isAdmin) return;
    recorder.start().catch(() => {
      toast.error(lang === "ar" ? "تعذّر بدء التسجيل" : "Recording unavailable");
    });
    return () => {
      if (recorder.recording) recorder.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeaveRoom = async () => {
    if (isTutorRoom && isAdmin && recorder.recording) {
      await recorder.stop();
      setTutorDownloadOpen(true);
    } else {
      setRatingOpen(true);
    }
  };

  // Stage mode + floating reactions + session clock
  const [stageMode, setStageMode] = useState(false);
  const [reactionTargetIdx, setReactionTargetIdx] = useState<number | null>(null);
  const [seatReactionCounts, setSeatReactionCounts] = useState<Record<number, number>>({});
  const [flyingReactions, setFlyingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const flyingIdRef = useRef(0);
  const longPressRef = useRef<number | null>(null);
  const [miniUser, setMiniUser] = useState<MiniProfileUser | null>(null);

  const SESSION_KEY = `lingvoice.session.${room.key}`;
  const sessionRestored = (() => {
    if (typeof window === "undefined") return 0;
    try { return Number(localStorage.getItem(SESSION_KEY) || 0); } catch { return 0; }
  })();
  const [sessionElapsed, setSessionElapsed] = useState(sessionRestored);
  const sessionRemaining = Math.max(0, SESSION_TOTAL + sessionExtraMin * 60 - sessionElapsed);
  const sessionLow = sessionRemaining < 5 * 60;
  useEffect(() => {
    const tk = setInterval(() => setSessionElapsed((s) => s + 1), 1000);
    return () => clearInterval(tk);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(SESSION_KEY, String(sessionElapsed)); } catch {}
  }, [sessionElapsed, SESSION_KEY]);

  const fireReaction = (idx: number, emoji: string) => {
    const id = ++flyingIdRef.current;
    const x = (Math.random() - 0.5) * 40;
    setFlyingReactions((r) => [...r, { id, emoji, x }]);
    setSeatReactionCounts((c) => ({ ...c, [idx]: (c[idx] || 0) + 1 }));
    setTimeout(() => setFlyingReactions((r) => r.filter((x) => x.id !== id)), 1500);
    setReactionTargetIdx(null);
  };

  const handleSeatPress = (i: number) => {
    const u = seats[i];
    if (!u) return;
    if (isAdmin) setSeatMenuIdx(i);
    else setMiniUser({ id: u.id, name: u.name, flag: u.flag, level: u.level });
  };
  const startLongPress = (i: number) => {
    if (!seats[i]) return;
    longPressRef.current = window.setTimeout(() => {
      setReactionTargetIdx(i);
      longPressRef.current = null;
    }, 450);
  };
  const cancelLongPress = () => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  };

  // Sync turnLength with timer engine config
  useEffect(() => {
    if ((timerCfg.mode === "single" || timerCfg.mode === "cyclic") && timerCfg.speakerSec) {
      setTurnLength(timerCfg.speakerSec);
      setTimeLeft(timerCfg.speakerSec);
    }
  }, [timerCfg.mode, timerCfg.speakerSec]);

  // Speaker rotation timer — respects timer engine mode
  useEffect(() => {
    if (timerCfg.mode === "off" || timerCfg.mode === "session") return;
    const tk = setInterval(() => {
      setTimeLeft((s) => {
        if (s > 1) return s - 1;
        setSeats((prev) => {
          const idx = prev.findIndex((u) => u?.speaking);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...(next[idx] as SeatUser), speaking: false };
          // Cyclic: auto-pass to next; Single: just mute
          if (timerCfg.mode === "cyclic") {
            for (let i = 1; i <= prev.length; i++) {
              const j = (idx + i) % prev.length;
              if (next[j]) {
                next[j] = { ...(next[j] as SeatUser), speaking: true };
                break;
              }
            }
          }
          return next;
        });
        return turnLength;
      });
    }, 1000);
    return () => clearInterval(tk);
  }, [turnLength, timerCfg.mode]);

  // Session total timer — graceful close at zero
  const sessionTotalSec = timerCfg.mode === "session" && timerCfg.sessionMin
    ? timerCfg.sessionMin * 60
    : SESSION_TOTAL;
  useEffect(() => {
    if (timerCfg.mode !== "session") return;
    const remaining = sessionTotalSec + sessionExtraMin * 60 - sessionElapsed;
    if (remaining <= 0) {
      toast.info(lang === "ar" ? "انتهت الجلسة" : "Session ended");
      const tk = setTimeout(() => handleLeaveRoom(), 1500);
      return () => clearTimeout(tk);
    }
  }, [sessionElapsed, timerCfg.mode, sessionTotalSec, sessionExtraMin, lang]);

  // Topic rotation (only if no fixed custom topic)
  useEffect(() => {
    if (isCustom && customTopic) return; // custom room keeps its set topic
    const tk = setInterval(() => {
      setTopicTime((s) => {
        if (s > 1) return s - 1;
        setTopicIdx((i) => (i + 1) % TOPICS.length);
        return TOPIC_INTERVAL;
      });
    }, 1000);
    return () => clearInterval(tk);
  }, [TOPICS.length, isCustom, customTopic]);

  const [translation, setTranslation] = useState<string | null>(null);
  const phrases = [
    { src: "Have you ever tried something unusual?", tr: "هل سبق وجربت شيئاً غير معتاد؟" },
    { src: "I think this dish tastes amazing.", tr: "أعتقد أن هذا الطبق طعمه رائع." },
    { src: "It reminds me of my hometown.", tr: "إنه يذكرني بمسقط رأسي." },
  ];

  // Seat actions (admin)
  const [seatMenuIdx, setSeatMenuIdx] = useState<number | null>(null);
  const muteSeat = (i: number) => {
    setSeats((prev) => {
      const next = [...prev];
      if (next[i]) next[i] = { ...(next[i] as SeatUser), speaking: false };
      return next;
    });
    toast.success(lang === "ar" ? "تم الكتم" : "Muted");
    setSeatMenuIdx(null);
  };
  const demoteSeat = (i: number) => {
    setSeats((prev) => {
      const next = [...prev];
      const u = next[i];
      if (u) {
        setListeners((ls) => [...ls, { id: u.id, flag: u.flag, name: u.name }]);
        next[i] = undefined;
      }
      return next;
    });
    setSeatMenuIdx(null);
  };
  const kickSeat = (i: number) => {
    setSeats((prev) => {
      const next = [...prev];
      next[i] = undefined;
      return next;
    });
    toast.error(lang === "ar" ? "تم الطرد" : "Kicked");
    setSeatMenuIdx(null);
  };

  const approveRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setSeats((prev) => {
      const empty = prev.findIndex((s) => !s);
      if (empty === -1) {
        toast.error(lang === "ar" ? "لا توجد مقاعد متاحة" : "No seats available");
        return prev;
      }
      const next = [...prev];
      next[empty] = {
        id: req.id, name: req.name, flag: req.flag,
        level: Math.max(1, Math.min(5, req.level)) as 1 | 2 | 3 | 4 | 5,
      };
      return next;
    });
    setRequests((rs) => rs.filter((r) => r.id !== id));
    setListeners((ls) => ls.filter((l) => l.id !== id));
  };
  const rejectRequest = (id: string) => setRequests((rs) => rs.filter((r) => r.id !== id));

  const requestSeat = () => {
    const myId = `me-${Date.now()}`;
    if (isAdmin) {
      // creator can take a seat directly
      setSeats((prev) => {
        const empty = prev.findIndex((s) => !s);
        if (empty === -1) return prev;
        const next = [...prev];
        next[empty] = { id: myId, name: "You", flag: "🌟", level: 3 };
        return next;
      });
      return;
    }
    setRequests((rs) => [...rs, { id: myId, name: "You", flag: "🌟", level: 3 }]);
    toast.success(lang === "ar" ? "أُرسل الطلب للمشرف" : "Request sent to admin");
  };

  // password gate
  if (requiresPassword && !unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-room p-6">
        <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gold" />
            <h1 className="text-lg font-bold">
              {lang === "ar" ? "غرفة خاصة" : "Private room"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "ar" ? "أدخل كلمة المرور للانضمام" : "Enter the password to join"}
          </p>
          <Input
            className="mt-4"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            placeholder="••••"
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
          />
          <div className="mt-4 flex gap-2">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </Link>
            <Button className="flex-1 bg-gradient-primary" onClick={tryUnlock}>
              {lang === "ar" ? "دخول" : "Enter"}
            </Button>
          </div>
        </div>
      </div>
    );

    function tryUnlock() {
      if (pwInput === customRoom?.password) {
        setUnlocked(true);
        toast.success(lang === "ar" ? "أهلاً بك" : "Welcome!");
      } else {
        toast.error(lang === "ar" ? "كلمة مرور خاطئة" : "Wrong password");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-room pb-32">
      {/* Header */}
      <header className={cn("bg-gradient-to-br px-5 pb-8 pt-12 text-primary-foreground", room.accent)}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-white/25">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70 flex items-center justify-center gap-1">
              {isAdmin && <Crown className="h-3 w-3 text-gold" />}
              {t("room.live")}
              {sessionExtraMin > 0 && (
                <span className="ml-1 rounded-full bg-gold/30 px-1.5 text-[10px]">+{sessionExtraMin}m</span>
              )}
            </p>
            <h1 className="text-lg font-bold flex items-center justify-center gap-1">
              {room.flag} {roomName}
              {requiresPassword && <Lock className="h-3.5 w-3.5 text-gold" />}
            </h1>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-destructive">
            <Flag className="h-4 w-4" />
          </button>
        </div>

        {/* Topic card */}
        <div className="mt-5 rounded-2xl bg-white/95 p-4 text-foreground shadow-elegant">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-foreground">
              <Sparkles className="h-3 w-3" /> {t("room.topic")}
            </span>
            {!(isCustom && customTopic) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Timer className="h-3 w-3" />
                {Math.floor(topicTime / 60)}:{(topicTime % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
          <p className="mt-2 text-base font-semibold">
            {isCustom && customTopic ? customTopic : TOPICS[topicIdx]}
          </p>
        </div>

      </header>

      <main className="mx-auto max-w-2xl px-5 -mt-4">
        {/* Session progress bar */}
        <div className="mb-3 rounded-2xl bg-card p-3 shadow-soft">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-3 w-3" /> {lang === "ar" ? "الجلسة" : "Session"}
            </span>
            <span className={cn("tabular-nums", sessionLow && "text-destructive")}>
              {Math.floor(sessionRemaining / 60)}:{(sessionRemaining % 60).toString().padStart(2, "0")} {t("room.left")}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all", sessionLow ? "animate-session-blink" : "bg-gradient-gold")}
              style={{ width: `${Math.max(0, (sessionRemaining / (SESSION_TOTAL + sessionExtraMin * 60)) * 100)}%` }}
            />
          </div>
          {sessionLow && !isAdmin && (
            <p className="mt-1 text-[10px] text-destructive">
              {lang === "ar" ? "اقتراض الوقت متاح قريباً…" : "Borrow time available soon…"}
            </p>
          )}
        </div>

        {/* Speakers grid — compact card */}
        <section className="rounded-3xl bg-card p-4 shadow-elegant">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Mic className="h-3.5 w-3.5" /> {t("room.speakers")} · {seats.filter(Boolean).length}/8
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStageMode((v) => !v)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-smooth",
                  stageMode
                    ? "bg-gradient-gold text-gold-foreground shadow-gold"
                    : "bg-secondary text-muted-foreground hover:bg-primary-soft hover:text-primary"
                )}
              >
                <Sparkles className="h-3 w-3" /> {lang === "ar" ? "وضع المسرح" : "Stage"}
              </button>
              {activeSpeakerIdx !== -1 && (
                <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-gold-foreground tabular-nums">
                  <Timer className="h-3 w-3" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              )}
              {isAdmin && (
                <button
                  onClick={() => setAdminOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
                >
                  <Crown className="h-3 w-3 text-gold" />
                  {lang === "ar" ? "تحكم" : "Controls"}
                  {adminOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>

          {stageMode ? (
            <div className="flex flex-col items-center gap-4 py-3">
              {(() => {
                const starIdx = activeSpeakerIdx !== -1 ? activeSpeakerIdx : seats.findIndex(Boolean);
                const star = starIdx !== -1 ? seats[starIdx] : undefined;
                if (!star) return <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا يوجد متحدث" : "No speaker"}</p>;
                return (
                  <button
                    onMouseDown={() => startLongPress(starIdx)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={() => startLongPress(starIdx)}
                    onTouchEnd={cancelLongPress}
                    onClick={() => handleSeatPress(starIdx)}
                    className="relative flex flex-col items-center"
                  >
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary text-3xl font-bold text-primary-foreground speaker-ring speaker-ring-active">
                        {star.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -top-2 -end-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-base shadow-gold">🌟</span>
                    </div>
                    <p className="mt-2 font-bold text-sm">{star.name} {star.flag}</p>
                    {seatReactionCounts[starIdx] ? (
                      <span className="text-[11px] text-muted-foreground">❤️ {seatReactionCounts[starIdx]}</span>
                    ) : null}
                  </button>
                );
              })()}
              <div className="flex gap-3">
                {seats.filter(Boolean).slice(0, 3).map((u) => (
                  <div key={u!.id} className="flex flex-col items-center">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                        {u!.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-1 -end-1 text-xs">👔</span>
                    </div>
                    <p className="text-[10px] mt-0.5">{u!.name}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {listeners.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setMiniUser({ id: l.id, name: l.name, flag: l.flag })}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs"
                    title={l.name}
                  >
                    {l.flag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-y-3 gap-x-1">
              {seats.map((u, i) => (
                <div key={i} className="relative">
                  <button
                    type="button"
                    onClick={() => handleSeatPress(i)}
                    onMouseDown={() => startLongPress(i)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={() => startLongPress(i)}
                    onTouchEnd={cancelLongPress}
                    className={cn("w-full rounded-xl p-1", u && "transition-smooth hover:bg-secondary cursor-pointer")}
                  >
                    <Seat user={u} index={i} timeLeft={u?.speaking ? timeLeft : undefined} />
                  </button>
                  {seatReactionCounts[i] ? (
                    <span className="absolute top-0 end-0 rounded-full bg-card px-1.5 text-[10px] font-bold shadow-soft">
                      ❤️{seatReactionCounts[i]}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {isAdmin && adminOpen && (
            <div className="mt-3 animate-fade-in">
              <AdminPanel
                turnLength={turnLength}
                onTurnLengthChange={(s) => {
                  setTurnLength(s);
                  setTimeLeft(s);
                  toast.success(lang === "ar" ? `مدة التحدث: ${s / 60} د` : `Turn: ${s / 60} min`);
                }}
                onResetTimer={() => setTimeLeft(turnLength)}
                onExtendTimer={() => setTimeLeft((s) => s + 30)}
                onMuteAll={() => {
                  setSeats((prev) => prev.map((u) => (u ? { ...u, speaking: false } : u)));
                  toast.success(lang === "ar" ? "تم كتم الجميع" : "All muted");
                }}
                onWatchAd={() => {
                  toast.loading(lang === "ar" ? "جارٍ تشغيل الإعلان…" : "Playing ad…", { id: "ad" });
                  setTimeout(() => {
                    setSessionExtraMin((m) => m + 15);
                    toast.success(lang === "ar" ? "+15 دقيقة للجلسة!" : "+15 min added!", { id: "ad" });
                  }, 1500);
                }}
                onOpenSettings={() => setSettingsOpen(true)}
              />
              {requests.length > 0 && (
                <RequestQueue requests={requests} onApprove={approveRequest} onReject={rejectRequest} />
              )}
            </div>
          )}
        </section>

        {/* Compact tabbed interaction panel directly under seats */}
        <Tabs defaultValue="chat" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 rounded-full bg-card shadow-soft p-1 h-auto">
            <TabsTrigger value="chat" className="rounded-full text-xs gap-1 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> {lang === "ar" ? "دردشة" : "Chat"}
            </TabsTrigger>
            <TabsTrigger value="people" className="rounded-full text-xs gap-1 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Users className="h-3.5 w-3.5" /> {listeners.length}
            </TabsTrigger>
            <TabsTrigger value="translate" className="rounded-full text-xs gap-1 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Languages className="h-3.5 w-3.5" /> {lang === "ar" ? "ترجمة" : "Translate"}
            </TabsTrigger>
            <TabsTrigger value="tools" className="rounded-full text-xs gap-1 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Wand2 className="h-3.5 w-3.5" /> {lang === "ar" ? "أدوات" : "Tools"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-3">
            <ChatBox isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="people" className="mt-3">
            <section className="rounded-3xl bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("room.listeners")} · {listeners.length}
                </h2>
                <button
                  onClick={requestSeat}
                  className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
                >
                  <Hand className="h-3.5 w-3.5" /> {t("room.raise")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {listeners.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs">
                    <span>{l.flag}</span>
                    <span className="font-medium">{l.name}</span>
                  </div>
                ))}
                <button className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-smooth hover:border-primary hover:text-primary">
                  <Plus className="h-3 w-3" /> {t("room.invite")}
                </button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="translate" className="mt-3">
            <section className="rounded-3xl bg-card p-4 shadow-soft">
              <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Languages className="h-3.5 w-3.5" /> {t("room.silent")}
              </h2>
              <p className="text-[11px] text-muted-foreground">{t("room.silentHint")}</p>
              <ul className="mt-2 space-y-1.5">
                {phrases.map((p) => (
                  <li key={p.src}>
                    <button
                      onClick={() => setTranslation(p.tr)}
                      className="flex w-full items-center justify-between rounded-2xl bg-secondary/60 p-2.5 text-start text-sm transition-smooth hover:bg-primary-soft"
                    >
                      <span className="font-medium">{p.src}</span>
                      <Languages className="h-4 w-4 text-primary" />
                    </button>
                  </li>
                ))}
              </ul>
              {translation && (
                <div className="mt-2 animate-fade-in rounded-2xl border border-gold/40 bg-gold-soft/50 p-2.5 font-arabic text-sm">
                  {translation}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="tools" className="mt-3">
            <section className="overflow-hidden rounded-3xl bg-gradient-hero p-4 text-primary-foreground shadow-elegant">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gold" />
                    <h2 className="text-sm font-bold">{t("room.challenge")}</h2>
                  </div>
                  <p className="mt-1 text-xs text-primary-foreground/80">{t("room.challengeHint")}</p>
                </div>
                <button className="rounded-full bg-gradient-gold px-3 py-1.5 text-xs font-bold text-gold-foreground shadow-gold transition-spring hover:scale-105">
                  {t("room.send")}
                </button>
              </div>
            </section>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ShareButton roomKey={room.key} password={customRoom?.password} />
              <GiftButton />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-3">
          <button
            onClick={requestSeat}
            className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold transition-smooth hover:bg-primary-soft"
          >
            <Hand className="h-4 w-4" /> {t("room.requestSeat")}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant transition-spring hover:scale-[1.02]">
            <Mic className="h-4 w-4" /> {t("room.tapSpeak")}
          </button>
        </div>
      </div>

      {/* Seat action menu (admin) */}
      <Dialog open={seatMenuIdx !== null} onOpenChange={(o) => !o && setSeatMenuIdx(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>
              {seatMenuIdx !== null && seats[seatMenuIdx]?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => seatMenuIdx !== null && muteSeat(seatMenuIdx)}
            >
              <MicOff className="mr-2 h-4 w-4" /> {lang === "ar" ? "كتم" : "Mute"}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => seatMenuIdx !== null && demoteSeat(seatMenuIdx)}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              {lang === "ar" ? "نقل إلى المستمعين" : "Move to listeners"}
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => seatMenuIdx !== null && kickSeat(seatMenuIdx)}
            >
              <X className="mr-2 h-4 w-4" /> {lang === "ar" ? "طرد" : "Kick"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Settings (admin) */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "إعدادات الغرفة" : "Room Settings"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{lang === "ar" ? "الموضوع" : "Topic"}</Label>
              <Input
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                maxLength={120}
              />
            </div>
            {requiresPassword && (
              <div className="space-y-2">
                <Label>{lang === "ar" ? "كلمة المرور" : "Password"}</Label>
                <Input
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  maxLength={32}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              className="bg-gradient-primary"
              onClick={() => {
                setCustomTopic(newTopicInput.trim());
                setSettingsOpen(false);
                toast.success(lang === "ar" ? "تم التحديث" : "Updated");
              }}
            >
              {lang === "ar" ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mini profile sheet */}
      <MiniProfileSheet user={miniUser} onClose={() => setMiniUser(null)} />

      {/* Floating reactions picker (long-press) */}
      {reactionTargetIdx !== null && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-foreground/30 pb-32"
          onClick={() => setReactionTargetIdx(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 rounded-full bg-card px-4 py-3 shadow-elegant animate-scale-in"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => fireReaction(reactionTargetIdx, emoji)}
                className="text-2xl transition-spring hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flying reactions */}
      <div className="pointer-events-none fixed bottom-32 left-1/2 z-[80] -translate-x-1/2">
        {flyingReactions.map((f) => (
          <span
            key={f.id}
            className="absolute bottom-0 text-3xl animate-float-up"
            style={{ ["--rx" as any]: `${f.x}px` }}
          >
            {f.emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Room;
