import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Flag, Hand, Languages, Mic, Sparkles, Timer, Zap, Plus,
} from "lucide-react";
import { ROOMS, SAMPLE_SPEAKERS, SeatUser } from "@/data/rooms";
import { Seat } from "@/components/Seat";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

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

const LISTENERS = [
  { id: "l1", flag: "🇩🇪", name: "Hans" },
  { id: "l2", flag: "🇧🇷", name: "Lucas" },
  { id: "l3", flag: "🇰🇷", name: "Min" },
  { id: "l4", flag: "🇲🇦", name: "Salma" },
  { id: "l5", flag: "🇫🇷", name: "Léa" },
  { id: "l6", flag: "🇮🇩", name: "Putri" },
  { id: "l7", flag: "🇹🇷", name: "Emir" },
  { id: "l8", flag: "🇮🇳", name: "Aria" },
];

const SPEAKER_TURN = 180; // 3 min
const TOPIC_INTERVAL = 300; // 5 min

const Room = () => {
  const { key } = useParams();
  const { t, lang } = useI18n();
  const room = ROOMS.find((r) => r.key === key) ?? ROOMS[0];
  const TOPICS = lang === "ar" ? TOPICS_AR : TOPICS_EN;
  const roomName = lang === "ar" ? room.nameAr : room.name;

  // Seats: 8 slots
  const [seats, setSeats] = useState<(SeatUser | undefined)[]>(() => {
    const arr: (SeatUser | undefined)[] = [...SAMPLE_SPEAKERS];
    while (arr.length < 8) arr.push(undefined);
    return arr;
  });

  const activeSpeakerIdx = useMemo(() => seats.findIndex((s) => s?.speaking), [seats]);
  const [timeLeft, setTimeLeft] = useState(SPEAKER_TURN);
  const [topicIdx, setTopicIdx] = useState(0);
  const [topicTime, setTopicTime] = useState(TOPIC_INTERVAL);

  // Speaker timer: rotates active speaker when it hits 0
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s > 1) return s - 1;
        // rotate
        setSeats((prev) => {
          const idx = prev.findIndex((u) => u?.speaking);
          if (idx === -1) return prev;
          const next = [...prev];
          // mute current
          next[idx] = { ...(next[idx] as SeatUser), speaking: false };
          // promote next non-empty seat
          for (let i = 1; i <= prev.length; i++) {
            const j = (idx + i) % prev.length;
            if (next[j]) {
              next[j] = { ...(next[j] as SeatUser), speaking: true };
              break;
            }
          }
          return next;
        });
        return SPEAKER_TURN;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Topic rotation
  useEffect(() => {
    const t = setInterval(() => {
      setTopicTime((s) => {
        if (s > 1) return s - 1;
        setTopicIdx((i) => (i + 1) % TOPICS.length);
        return TOPIC_INTERVAL;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const [translation, setTranslation] = useState<string | null>(null);
  const phrases = [
    { src: "Have you ever tried something unusual?", tr: "هل سبق وجربت شيئاً غير معتاد؟" },
    { src: "I think this dish tastes amazing.", tr: "أعتقد أن هذا الطبق طعمه رائع." },
    { src: "It reminds me of my hometown.", tr: "إنه يذكرني بمسقط رأسي." },
  ];

  return (
    <div className="min-h-screen bg-gradient-room pb-32">
      {/* Header */}
      <header className={cn("bg-gradient-to-br px-5 pb-8 pt-12 text-primary-foreground", room.accent)}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-white/25">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">Live Room</p>
            <h1 className="text-lg font-bold">{room.flag} {room.name}</h1>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-destructive">
            <Flag className="h-4 w-4" />
          </button>
        </div>

        {/* Topic card */}
        <div className="mt-5 rounded-2xl bg-white/95 p-4 text-foreground shadow-elegant">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-foreground">
              <Sparkles className="h-3 w-3" /> Topic
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <Timer className="h-3 w-3" />
              {Math.floor(topicTime / 60)}:{(topicTime % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <p className="mt-2 text-base font-semibold">{TOPICS[topicIdx]}</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5">
        {/* Speakers grid */}
        <section className="-mt-4 rounded-3xl bg-card p-5 shadow-elegant">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <Mic className="h-4 w-4" /> Speakers · {seats.filter(Boolean).length}/8
            </h2>
            {activeSpeakerIdx !== -1 && (
              <span className="flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold-foreground tabular-nums">
                <Timer className="h-3 w-3" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} left
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {seats.map((u, i) => (
              <Seat key={i} user={u} index={i} timeLeft={u?.speaking ? timeLeft : undefined} />
            ))}
          </div>
        </section>

        {/* Listeners */}
        <section className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Listeners · {LISTENERS.length}
            </h2>
            <button className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary transition-smooth hover:bg-primary hover:text-primary-foreground">
              <Hand className="h-3.5 w-3.5" /> Raise hand
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {LISTENERS.map((l) => (
              <div key={l.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs">
                <span>{l.flag}</span>
                <span className="font-medium">{l.name}</span>
              </div>
            ))}
            <button className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-smooth hover:border-primary hover:text-primary">
              <Plus className="h-3 w-3" /> Invite
            </button>
          </div>
        </section>

        {/* Silent translation */}
        <section className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Languages className="h-4 w-4" /> Silent Translation
          </h2>
          <p className="text-xs text-muted-foreground">Tap a phrase to translate it instantly without interrupting the speaker.</p>
          <ul className="mt-3 space-y-2">
            {phrases.map((p) => (
              <li key={p.src}>
                <button
                  onClick={() => setTranslation(p.tr)}
                  className="flex w-full items-center justify-between rounded-2xl bg-secondary/60 p-3 text-start text-sm transition-smooth hover:bg-primary-soft"
                >
                  <span className="font-medium">{p.src}</span>
                  <Languages className="h-4 w-4 text-primary" />
                </button>
              </li>
            ))}
          </ul>
          {translation && (
            <div className="mt-3 animate-fade-in rounded-2xl border border-gold/40 bg-gold-soft/50 p-3 font-arabic text-base">
              {translation}
            </div>
          )}
        </section>

        {/* Challenge */}
        <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-elegant">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold" />
                <h2 className="text-base font-bold">30-second Challenge</h2>
              </div>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Send a tongue twister to a speaker — 50 LP if they nail it.
              </p>
            </div>
            <button className="rounded-full bg-gradient-gold px-4 py-2 text-sm font-bold text-gold-foreground shadow-gold transition-spring hover:scale-105">
              Send
            </button>
          </div>
        </section>
      </main>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-3">
          <button className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold transition-smooth hover:bg-primary-soft">
            <Hand className="h-4 w-4" /> Request seat
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant transition-spring hover:scale-[1.02]">
            <Mic className="h-4 w-4" /> Tap to speak
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
