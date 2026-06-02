import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Sparkles, Repeat2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { getQuestionPool, LANGUAGES, WordPair } from "@/data/games";
import { GameMode, getGameConfig } from "./GameModeDialog";
import { useWallet } from "@/hooks/useWallet";
import { useVault } from "@/hooks/useVault";
import { toast } from "sonner";

const ROUND_TIME = 7;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: GameMode;
}

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

export const WordChallengeGame = ({ open, onOpenChange, mode }: Props) => {
  const { lang } = useI18n();
  const { add: addLp, spend } = useWallet();
  const { add: addVault } = useVault();

  // Read fresh per open
  const cfg = useMemo(() => getGameConfig(), [open]);
  const [flipped, setFlipped] = useState(false);

  // Infinite pool: lazy refill from topic
  const pool = useMemo(() => shuffle(getQuestionPool(cfg.topic)), [cfg.topic, open]);
  const [queue, setQueue] = useState<WordPair[]>([]);
  useEffect(() => { setQueue(pool.length ? pool : []); }, [pool]);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(ROUND_TIME);
  const [picked, setPicked] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setRound(0); setScore(0); setTime(ROUND_TIME); setPicked(null); setFlipped(false); startedRef.current = false;
      return;
    }
    if (!startedRef.current) {
      startedRef.current = true;
      if (!spend(15)) {
        toast.error(lang === "ar" ? "رصيد غير كاف" : "Not enough LP");
        onOpenChange(false);
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open || picked) return;
    if (time <= 0) { next(false); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, open, picked]);

  const current = queue[round];

  // Pick which language is "question side" vs "answer side"
  const questionLang = flipped ? cfg.target : cfg.native;
  const answerLang = flipped ? cfg.native : cfg.target;
  // Hybrid mix override: instructions native, options target — irrespective of flip
  const instructionLang = cfg.hybridMix ? cfg.native : questionLang;
  const optionsLang = cfg.hybridMix ? cfg.target : answerLang;

  const questionText = current
    ? (current.translations[instructionLang] ?? current.src)
    : "";
  const correctText = current ? current.translations[optionsLang] ?? current.src : "";
  const options = current
    ? shuffle([
        correctText,
        ...(current.optionPool[optionsLang] || [])
          .filter((o) => o !== correctText)
          .slice(0, 3),
      ])
    : [];
  // memoize options per round
  const optionsMemo = useMemo(() => options, [round, optionsLang, current?.src]);

  const pick = (opt: string) => {
    if (picked || !current) return;
    setPicked(opt);
    const correct = opt === correctText;
    if (correct) {
      const pts = time >= 4 ? 15 : 10;
      const lpGain = mode === "linguistic" ? pts : Math.round(pts * 0.6);
      setScore((s) => s + pts);
      addLp(lpGain);
    } else {
      setScore((s) => Math.max(0, s - 5));
      setShake(true);
      setTimeout(() => setShake(false), 400);
      addVault({ word: current.src, translation: correctText, context: "Word Challenge" });
    }
    setTimeout(() => next(correct), 700);
  };

  const next = (_correct: boolean) => {
    setPicked(null);
    // Infinite: when reaching end, reshuffle and continue
    setRound((r) => {
      const nxt = r + 1;
      if (nxt >= queue.length) {
        setQueue((q) => shuffle(q));
        return 0;
      }
      return nxt;
    });
    setTime(ROUND_TIME);
  };

  const flipName = (code: string) => LANGUAGES.find((l) => l.code === code)?.flag ?? "🌐";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md bg-card border-border text-foreground ${shake ? "animate-gift-shake" : ""}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <span>⚡ {lang === "ar" ? "تحدي الكلمات" : "Word Challenge"}</span>
            <span className="text-xs font-mono bg-secondary border border-border rounded-full px-2 py-0.5 text-gold">
              ∞ · #{round + 1}
            </span>
          </DialogTitle>
        </DialogHeader>

        <>
          <Progress value={(time / ROUND_TIME) * 100} className="bg-secondary" />

          <div className="text-center py-4 relative">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {flipName(instructionLang)} {lang === "ar" ? "ترجم إلى" : "Translate to"} {flipName(optionsLang)}
              {cfg.hybridMix && <span className="ml-1 text-gold">· MIX</span>}
            </p>
            <p className="text-3xl font-black mt-2 text-foreground" dir="auto">{questionText}</p>

            <button
              onClick={() => setFlipped((f) => !f)}
              title={lang === "ar" ? "بدّل اتجاه الأسئلة" : "Flip question direction"}
              className="absolute top-0 right-0 rounded-full bg-gradient-gold text-gold-foreground p-2 shadow-gold hover:scale-110 transition-spring ring-2 ring-gold/40"
            >
              <Repeat2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {optionsMemo.map((opt) => {
              const isPicked = picked === opt;
              const isCorrect = opt === correctText;
              const cls = picked
                ? isCorrect
                  ? "bg-success text-success-foreground border-success"
                  : isPicked
                    ? "bg-destructive text-destructive-foreground border-destructive"
                    : "bg-secondary text-muted-foreground border-border"
                : "bg-secondary text-foreground border-border hover:border-gold";
              return (
                <button
                  key={opt}
                  onClick={() => pick(opt)}
                  dir="auto"
                  className={`rounded-xl border-2 p-3 font-bold transition-spring ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-sm font-bold pt-2 text-foreground">
            <span>⏱ {time}s</span>
            <span className="text-gold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {score}
            </span>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              {lang === "ar" ? "إنهاء" : "End"}
            </Button>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};
