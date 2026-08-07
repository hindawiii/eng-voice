import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Flag, Hand, Languages, Lock, Mic, Sparkles, Timer, Zap, Plus, Crown, MicOff, UserMinus, X,
  MessageSquare, Wand2, ChevronDown, ChevronUp, Settings as Cog, Users, Download, GraduationCap, LogOut,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ROOMS, SAMPLE_SPEAKERS, SeatUser } from "@/data/rooms";
import { getCustomRoom, CustomRoom } from "@/data/customRooms";
import { Seat } from "@/components/Seat";
import { ListenersBar } from "@/components/ListenersBar";
import { ChatBox } from "@/components/ChatBox";
import { RequestQueue, SpeakRequest } from "@/components/RequestQueue";
import { AdminPanel } from "@/components/AdminPanel";
import { GiftButton } from "@/components/GiftButton";
import { ShareButton } from "@/components/ShareButton";
import { MiniProfileSheet, MiniProfileUser } from "@/components/MiniProfileSheet";
import { TimerEngineDialog, TimerConfig } from "@/components/TimerEngineDialog";
import { SpeakerCountdown } from "@/components/SpeakerCountdown";
import { LiveTranscriptionDrawer } from "@/components/LiveTranscriptionDrawer";
import { SessionSummaryModal, SessionSummary } from "@/components/SessionSummaryModal";
import { SmartMirrorCard } from "@/components/SmartMirrorCard";
import { AINoiseToggle } from "@/components/AINoiseToggle";
import { CertifiedTutorBadge } from "@/components/CertifiedTutorBadge";
import { useTutorRecorder } from "@/hooks/useTutorRecorder";
import { useWallet } from "@/hooks/useWallet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { playCasinoSpin } from "@/lib/casinoSpin";
import { setMinimizedRoom } from "@/components/MinimizedRoomBar";

const REACTION_EMOJIS = ["👏", "❤️", "🔥", "😂", "👍"] as const;
const SESSION_TOTAL = 90 * 60; // 90 minutes (extended ceiling)
const MAX_SESSION_MIN = 90;

const TOPIC_SEEDS_EN = [
  "Tell us about a weird food you've tried",
  "Describe your perfect Sunday morning",
  "A small habit that changed your life",
  "Your favorite city to walk in",
  "What song reminds you of childhood?",
  "A book that shifted how you think",
  "The best advice you ignored",
  "An app you can't live without",
  "Your dream language to master next",
  "A skill you'd teach in 60 seconds",
];
const TOPIC_SEEDS_AR = [
  "أخبرنا عن طعام غريب جربته",
  "صف صباح الأحد المثالي",
  "عادة صغيرة غيّرت حياتك",
  "مدينتك المفضلة للمشي",
  "أي أغنية تذكرك بطفولتك؟",
  "كتاب غيّر طريقة تفكيرك",
  "أفضل نصيحة تجاهلتها",
  "تطبيق لا يمكنك العيش بدونه",
  "اللغة التي تحلم بإتقانها",
  "مهارة تعلّمها في ٦٠ ثانية",
];
const TOPIC_VERBS_EN = ["Share", "Explain", "Compare", "Debate", "Imagine", "Describe"];
const TOPIC_VERBS_AR = ["شارك", "اشرح", "قارن", "ناقش", "تخيّل", "صف"];
const TOPIC_NOUNS_EN = ["a memory", "a turning point", "a daily ritual", "a guilty pleasure", "a future plan", "a cultural quirk"];
const TOPIC_NOUNS_AR = ["ذكرى", "نقطة تحوّل", "طقساً يومياً", "متعة سرية", "خطة مستقبلية", "غرابة ثقافية"];
const generateTopic = (lang: "en" | "ar") => {
  const verbs = lang === "ar" ? TOPIC_VERBS_AR : TOPIC_VERBS_EN;
  const nouns = lang === "ar" ? TOPIC_NOUNS_AR : TOPIC_NOUNS_EN;
  const v = verbs[Math.floor(Math.random() * verbs.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return lang === "ar" ? `${v} ${n} غيّرتك` : `${v} ${n} that changed you`;
};
const TOPICS_EN = TOPIC_SEEDS_EN;
const TOPICS_AR = TOPIC_SEEDS_AR;

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
  const { spend: spendLp } = useWallet();

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
  const LOCK_KEY = `engvoice.roomLock.${room.key}`;
  const readLock = () => {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY) || "null") as { attempts: number; lockUntil: number } | null; }
    catch { return null; }
  };
  const [pwAttempts, setPwAttempts] = useState<number>(() => readLock()?.attempts ?? 0);
  const [lockUntil, setLockUntil] = useState<number>(() => readLock()?.lockUntil ?? 0);
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    if (!requiresPassword || unlocked) return;
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [requiresPassword, unlocked]);
  const isLocked = lockUntil > nowTs;
  const lockSecondsLeft = Math.max(0, Math.ceil((lockUntil - nowTs) / 1000));

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
  const TIMER_KEY = `engvoice.roomTimer.${room.key}`;
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
  const [generatedTopic, setGeneratedTopic] = useState<string | null>(null);
  

  const [requests, setRequests] = useState<SpeakRequest[]>(isAdmin ? INITIAL_REQUESTS : []);
  const [listeners, setListeners] = useState(INITIAL_LISTENERS);

  const [sessionExtraMin, setSessionExtraMin] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState(customTopic);
  const [newPasswordInput, setNewPasswordInput] = useState(customRoom?.password || "");

  // === NEW: Timer Engine, AI noise, rating, recorder ===
  const TIMER_CFG_KEY = `engvoice.timerCfg.${room.key}`;
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
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [giftCount, setGiftCount] = useState(0);
  const [tutorDownloadOpen, setTutorDownloadOpen] = useState(false);

  const recorder = useTutorRecorder();

  // Tutor entry fee: charge listener 10 LP once per room visit
  useEffect(() => {
    if (!isTutorRoom) return;
    const paidKey = `engvoice.tutorPaid.${room.key}`;
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
      const tk = `engvoice.tutorEarnings.${room.key}`;
      const cur = Number(localStorage.getItem(tk) || 0);
      localStorage.setItem(tk, String(cur + 7));
      const pk = "engvoice.platformCommission";
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
    setMinimizedRoom(null);
    const reactions = Object.values(seatReactionCounts).reduce((a, b) => a + b, 0);
    const xpGain = Math.round(sessionElapsed / 6);
    const lpGain = Math.round(sessionElapsed / 12);
    setSummary({
      roomName,
      flag: room.flag,
      elapsedSec: sessionElapsed,
      reactions,
      gifts: giftCount,
      xpGain,
      lpGain,
    });
    if (isTutorRoom && isAdmin && recorder.recording) {
      await recorder.stop();
      setTutorDownloadOpen(true);
    } else {
      setRatingOpen(true);
    }
  };

  // Always points at the latest handler so timers never fire a stale closure.
  const leaveRoomRef = useRef(handleLeaveRoom);
  leaveRoomRef.current = handleLeaveRoom;


  // Stage mode + floating reactions + session clock
  const [stageMode, setStageMode] = useState(false);
  const [reactionTargetIdx, setReactionTargetIdx] = useState<number | null>(null);
  const [seatReactionCounts, setSeatReactionCounts] = useState<Record<number, number>>({});
  const [flyingReactions, setFlyingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const flyingIdRef = useRef(0);
  const longPressRef = useRef<number | null>(null);
  const [miniUser, setMiniUser] = useState<MiniProfileUser | null>(null);

  const SESSION_KEY = `engvoice.session.${room.key}`;
  const sessionRestored = (() => {
    if (typeof window === "undefined") return 0;
    try { return Number(localStorage.getItem(SESSION_KEY) || 0); } catch { return 0; }
  })();
  const [sessionElapsed, setSessionElapsed] = useState(sessionRestored);
  const _baseSessionTotal = timerCfg.mode === "session" && timerCfg.sessionMin
    ? timerCfg.sessionMin * 60
    : SESSION_TOTAL;
  const sessionRemaining = Math.max(0, _baseSessionTotal + sessionExtraMin * 60 - sessionElapsed);
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
  useEffect(() => {
    if (timerCfg.mode !== "session") return;
    const remaining = _baseSessionTotal + sessionExtraMin * 60 - sessionElapsed;
    if (remaining <= 0) {
      toast.info(lang === "ar" ? "انتهت الجلسة" : "Session ended");
      const tk = setTimeout(() => leaveRoomRef.current(), 1500);
      return () => clearTimeout(tk);
    }
  }, [sessionElapsed, timerCfg.mode, _baseSessionTotal, sessionExtraMin, lang]);

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
    const pwLen = Math.min(Math.max(customRoom?.password?.length ?? 6, 4), 6);
    const attempt = (val: string) => {
      if (val === customRoom?.password) {
        setUnlocked(true);
        localStorage.removeItem(LOCK_KEY);
        toast.success(lang === "ar" ? "أهلاً بك" : "Welcome!");
      } else {
        const next = pwAttempts + 1;
        setPwAttempts(next);
        setPwInput("");
        if (next >= 3) {
          const until = Date.now() + 5 * 60 * 1000;
          setLockUntil(until);
          localStorage.setItem(LOCK_KEY, JSON.stringify({ attempts: next, lockUntil: until }));
          toast.error(lang === "ar" ? "تم قفل الدخول لمدة 5 دقائق" : "Locked for 5 minutes");
        } else {
          localStorage.setItem(LOCK_KEY, JSON.stringify({ attempts: next, lockUntil: 0 }));
          toast.error(
            lang === "ar"
              ? `كلمة مرور خاطئة (${next}/3)`
              : `Wrong password (${next}/3)`
          );
        }
      }
    };
    const mm = String(Math.floor(lockSecondsLeft / 60)).padStart(2, "0");
    const ss = String(lockSecondsLeft % 60).padStart(2, "0");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-room p-6">
        <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gold" />
            <h1 className="text-lg font-bold">
              {lang === "ar" ? "غرفة خاصة" : "Private room"}
            </h1>
          </div>
          {isLocked ? (
            <>
              <p className="mt-3 text-sm text-destructive font-semibold">
                {lang === "ar"
                  ? "لن تستطيع الدخول إلا إذا تمت دعوتك مرة أخرى"
                  : "You can only re-enter if invited again"}
              </p>
              <div className="mt-4 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-6 text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {lang === "ar" ? "المتبقي" : "Unlocks in"}
                </p>
                <p className="text-3xl font-black tabular-nums text-destructive">{mm}:{ss}</p>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "ar" ? `أدخل ${pwLen} أرقام للدخول` : `Enter ${pwLen} digits to join`}
              </p>
              <div className="mt-4 flex justify-center" dir="ltr">
                <InputOTP
                  maxLength={pwLen}
                  value={pwInput}
                  onChange={(v) => {
                    setPwInput(v);
                    if (v.length === pwLen) attempt(v);
                  }}
                >
                  <InputOTPGroup>
                    {Array.from({ length: pwLen }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg font-bold" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {pwAttempts > 0 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {lang === "ar" ? `محاولات: ${pwAttempts}/3` : `Attempts: ${pwAttempts}/3`}
                </p>
              )}
            </>
          )}
          <div className="mt-5 flex gap-2">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                {lang === "ar" ? "رجوع" : "Back"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-room pb-32">
      {/* Header */}
      <header className={cn("bg-gradient-to-br px-5 pb-8 pt-12 text-primary-foreground", room.accent)}>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setMinimizedRoom({ key: room.key, name: roomName, flag: room.flag });
              toast.success(lang === "ar" ? "تم تصغير الغرفة" : "Room minimized");
              navigate("/");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-white/25"
            aria-label="Minimize"
            title={lang === "ar" ? "تصغير" : "Minimize"}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <div className="text-center flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70 flex items-center justify-center gap-1">
              {isAdmin && <Crown className="h-3 w-3 text-gold" />}
              {t("room.live")}
              {sessionExtraMin > 0 && (
                <span className="ml-1 rounded-full bg-gold/30 px-1.5 text-[10px]">+{sessionExtraMin}m</span>
              )}
            </p>
            <h1 className="text-lg font-bold flex items-center justify-center gap-1 flex-wrap">
              {room.flag} {roomName}
              {requiresPassword && <Lock className="h-3.5 w-3.5 text-gold" />}
              {isTutorRoom && <CertifiedTutorBadge />}
            </h1>
            {isTutorRoom && tutorDifficulty && (
              <p className="mt-1 text-[10px] uppercase tracking-wider text-primary-foreground/70">
                {lang === "ar" ? "المستوى: " : "Level: "}
                <span className="font-bold">{tutorDifficulty}</span>
                {isAdmin && recorder.recording && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-destructive/30 px-1.5 text-[9px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                    REC
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                onClick={() => setAdminOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-white/25"
                aria-label={lang === "ar" ? "تحكم" : "Controls"}
                title={lang === "ar" ? "تحكم" : "Controls"}
              >
                <Cog className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleLeaveRoom}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-destructive"
              aria-label={lang === "ar" ? "خروج" : "Exit"}
              title={lang === "ar" ? "خروج" : "Exit"}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Topic card */}
        <div className="mt-5 rounded-2xl bg-white/95 p-4 text-foreground shadow-elegant">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-foreground">
              <Sparkles className="h-3 w-3" /> {t("room.topic")}
            </span>
            {!(isCustom && customTopic) && !generatedTopic && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Timer className="h-3 w-3" />
                {Math.floor(topicTime / 60)}:{(topicTime % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
          <p className="mt-2 text-base font-semibold text-foreground leading-relaxed break-words">
            {generatedTopic ?? (isCustom && customTopic ? customTopic : TOPICS[topicIdx])}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => { playCasinoSpin(); setGeneratedTopic(generateTopic(lang)); toast.success(lang === "ar" ? "موضوع جديد ⚡" : "New topic ⚡"); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-gold-hover px-3 py-1.5 text-[11px] font-extrabold text-gold-foreground shadow-[0_0_14px_rgba(251,191,36,0.45)] transition hover:scale-105"
            >
              <Sparkles className="h-3.5 w-3.5" /> {lang === "ar" ? "توليد موضوع ⚡" : "Generate topic ⚡"}
            </button>
            {generatedTopic && (
              <button
                onClick={() => setGeneratedTopic(null)}
                className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary/70"
              >
                {lang === "ar" ? "إعادة للموضوع الأصلي" : "Reset"}
              </button>
            )}
          </div>
        </div>

      </header>

      <main className="mx-auto max-w-2xl px-5 -mt-4">
        {/* Session progress bar */}
        <div className="mb-3 rounded-2xl bg-card p-3 shadow-soft">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-3 w-3" /> {lang === "ar" ? "الجلسة" : "Session"}
              <span className="ml-1 rounded-full bg-secondary px-1.5 text-[9px] uppercase">
                {timerCfg.mode === "off" ? "∞" : timerCfg.mode}
              </span>
            </span>
            <span className={cn("tabular-nums", sessionLow && "text-destructive")}>
              {Math.floor(sessionRemaining / 60)}:{(sessionRemaining % 60).toString().padStart(2, "0")} {t("room.left")}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all", sessionLow ? "animate-session-blink" : "bg-gradient-gold")}
              style={{ width: `${Math.max(0, (sessionRemaining / (_baseSessionTotal + sessionExtraMin * 60)) * 100)}%` }}
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
              {/* Speaker-only countdown: visible to active speaker (id starts with "me-") */}
              {activeSpeakerIdx !== -1 &&
                timerCfg.mode !== "off" && timerCfg.mode !== "session" &&
                (seats[activeSpeakerIdx]?.id?.startsWith("me-") || isAdmin) && (
                  <SpeakerCountdown seconds={timeLeft} />
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

        </section>

        {/* Listeners bar — directly under speakers */}
        <div className="mt-3">
          <ListenersBar
            listeners={listeners.map((l, i) => ({
              id: l.id,
              name: l.name,
              flag: l.flag,
              premium: i % 4 === 0,
              muted: i === 2,
            }))}
            onSelect={(l) => setMiniUser({ id: l.id, name: l.name, flag: l.flag })}
            onInvite={() => toast.success(lang === "ar" ? "أُرسلت دعوة" : "Invite sent")}
          />
        </div>

        {/* Live transcription drawer */}
        <LiveTranscriptionDrawer />




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
              <div onClickCapture={() => setGiftCount((c) => c + 1)}>
                <GiftButton />
              </div>
            </div>
            <div className="mt-3">
              <SmartMirrorCard />
            </div>
            <div className="mt-3">
              <AINoiseToggle enabled={aiNoise} onChange={setAiNoise} />
            </div>
            {isAdmin && (
              <button
                onClick={() => setTimerDialogOpen(true)}
                className="mt-3 flex w-full items-center justify-between rounded-2xl border border-gold/40 bg-[#0F1524] px-4 py-3 text-start text-white transition hover:border-gold"
              >
                <span className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gold" />
                  <span className="text-sm font-extrabold">
                    {lang === "ar" ? "محرك المؤقت" : "Timer Engine"}
                  </span>
                </span>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gold">
                  {timerCfg.mode === "off" ? (lang === "ar" ? "مفتوح" : "Open") : timerCfg.mode}
                </span>
              </button>
            )}
          </TabsContent>
        </Tabs>
      </main>


      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-5 py-3">
          <button
            onClick={requestSeat}
            className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold transition-smooth hover:bg-primary-soft"
          >
            <Hand className="h-4 w-4" /> {t("room.requestSeat")}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant transition-spring hover:scale-[1.02]">
            <Mic className="h-4 w-4" /> {t("room.tapSpeak")}
          </button>
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-2.5 text-xs font-bold text-destructive transition-smooth hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4" />
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

      {/* Timer engine dialog (admin) */}
      <TimerEngineDialog
        open={timerDialogOpen}
        onOpenChange={setTimerDialogOpen}
        config={timerCfg}
        onSave={(c) => {
          setTimerCfg(c);
          toast.success(lang === "ar" ? "تم تحديث المؤقت" : "Timer updated");
        }}
      />

      {/* Session summary + rating modal — on leave */}
      <SessionSummaryModal
        open={ratingOpen}
        summary={summary}
        onOpenChange={(o) => {
          setRatingOpen(o);
          if (!o) navigate("/");
        }}
        onSubmit={(r) => {
          toast.success(lang === "ar" ? `شكراً! (${r}★)` : `Thanks! (${r}★)`);
          navigate("/");
        }}
      />

      {/* Tutor session: audio archive download */}
      <Dialog open={tutorDownloadOpen} onOpenChange={(o) => {
        setTutorDownloadOpen(o);
        if (!o) { recorder.reset(); navigate("/"); }
      }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              {lang === "ar" ? "احفظ الجلسة" : "Save Session"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? "تم تسجيل الجلسة محلياً على جهازك. حملها الآن قبل المغادرة."
              : "The session was recorded locally on your device. Download it now before you leave."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { recorder.reset(); setTutorDownloadOpen(false); navigate("/"); }}>
              {lang === "ar" ? "تخطي" : "Skip"}
            </Button>
            {recorder.downloadUrl && (
              <a
                href={recorder.downloadUrl}
                download={`tutor-session-${room.key}.webm`}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                <Download className="h-4 w-4" />
                {lang === "ar" ? "تحميل .webm" : "Download .webm"}
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Controls Sheet (slide-out drawer) */}
      <Sheet open={adminOpen && isAdmin} onOpenChange={setAdminOpen}>
        <SheetContent side={lang === "ar" ? "right" : "left"} className="w-[88vw] sm:w-[420px] overflow-y-auto bg-surface-2 text-white border-l border-slate-800">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-gold">
              <Crown className="h-4 w-4" /> {lang === "ar" ? "تحكم الغرفة" : "Room Controls"}
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              {lang === "ar" ? "إدارة المتحدثين، المؤقت، والمشرفين." : "Manage speakers, timer, and moderators."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <AdminPanel
              turnLength={turnLength}
              onTurnLengthChange={(s) => { setTurnLength(s); setTimeLeft(s); toast.success(lang === "ar" ? `مدة التحدث: ${s / 60} د` : `Turn: ${s / 60} min`); }}
              onResetTimer={() => setTimeLeft(turnLength)}
              onExtendTimer={() => setTimeLeft((s) => s + 30)}
              onMuteAll={() => { setSeats((prev) => prev.map((u) => (u ? { ...u, speaking: false } : u))); toast.success(lang === "ar" ? "تم كتم الجميع" : "All muted"); }}
              onWatchAd={() => {
                toast.loading(lang === "ar" ? "جارٍ تشغيل الإعلان…" : "Playing ad…", { id: "ad" });
                setTimeout(() => {
                  setSessionExtraMin((m) => Math.min(MAX_SESSION_MIN, m + 15));
                  toast.success(lang === "ar" ? "+15 دقيقة!" : "+15 min!", { id: "ad" });
                }, 1500);
              }}
              onOpenSettings={() => setSettingsOpen(true)}
            />
            {requests.length > 0 && (
              <RequestQueue requests={requests} onApprove={approveRequest} onReject={rejectRequest} />
            )}

            {/* Host migration */}
            <div className="rounded-2xl border border-gold/30 bg-card p-3">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gold">
                <Crown className="h-3.5 w-3.5" /> {lang === "ar" ? "تفويض الإدارة" : "Transfer host"}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {lang === "ar" ? "اختر مشاركاً لتسليمه حقوق المشرف قبل المغادرة." : "Pick a participant to receive admin rights before you leave."}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {[...seats.filter(Boolean).map((u) => ({ id: u!.id, name: u!.name, flag: u!.flag })), ...listeners].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { toast.success(lang === "ar" ? `تم تفويض ${p.name} كمشرف` : `${p.name} is now host`); setAdminOpen(false); }}
                    className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
                  >
                    <span>{p.flag}</span><span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};


export default Room;
