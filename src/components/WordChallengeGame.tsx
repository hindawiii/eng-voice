import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { WORD_PAIRS } from "@/data/games";
import { GameMode } from "./GameModeDialog";
import { useWallet } from "@/hooks/useWallet";
import { useVault } from "@/hooks/useVault";
import { toast } from "sonner";

const ROUND_TIME = 7;
const TOTAL = 10;

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
  const rounds = useMemo(() => shuffle(WORD_PAIRS).slice(0, TOTAL), [open]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(ROUND_TIME);
  const [picked, setPicked] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setRound(0); setScore(0); setTime(ROUND_TIME); setPicked(null); setDone(false); startedRef.current = false;
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
    if (!open || done || picked) return;
    if (time <= 0) { next(false); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, open, done, picked]);

  const current = rounds[round];

  const pick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const correct = opt === current.correct;
    if (correct) {
      const pts = time >= 4 ? 15 : 10;
      const lpGain = mode === "linguistic" ? pts : Math.round(pts * 0.6);
      setScore((s) => s + pts);
      addLp(lpGain);
    } else {
      setScore((s) => Math.max(0, s - 5));
      setShake(true);
      setTimeout(() => setShake(false), 400);
      addVault({ word: current.src, translation: current.correct, context: "Word Challenge" });
    }
    setTimeout(() => next(correct), 700);
  };

  const next = (_correct: boolean) => {
    setPicked(null);
    if (round + 1 >= rounds.length) {
      setDone(true);
      const bonus = score >= 100 ? 40 : score >= 60 ? 20 : 0;
      if (bonus) addLp(bonus);
      return;
    }
    setRound((r) => r + 1);
    setTime(ROUND_TIME);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md bg-gradient-to-br from-blue-500 to-sky-200 text-white ${shake ? "animate-gift-shake" : ""}`}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>⚡ {lang === "ar" ? "تحدي الكلمات" : "Word Challenge"}</span>
            <span className="text-sm font-mono bg-white/20 rounded-full px-2 py-0.5">
              {round + 1}/{rounds.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center space-y-3">
            <Crown className="h-12 w-12 mx-auto text-gold animate-gift-pop" />
            <p className="text-3xl font-black">{score} pts</p>
            <p className="text-sm opacity-90 flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4" /> {lang === "ar" ? "تمت إضافة LP إلى محفظتك" : "LP added to your wallet"}
            </p>
            <Button onClick={() => onOpenChange(false)} className="bg-white text-blue-700 hover:bg-white/90 mt-2">
              {lang === "ar" ? "إنهاء" : "Finish"}
            </Button>
          </div>
        ) : (
          <>
            <Progress value={(time / ROUND_TIME) * 100} className="bg-white/20" />
            <div className="text-center py-4">
              <p className="text-xs uppercase opacity-75">{lang === "ar" ? "ترجم" : "Translate"}</p>
              <p className="text-4xl font-black mt-2 font-arabic">{current?.src}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {current?.options.map((opt) => {
                const isPicked = picked === opt;
                const isCorrect = opt === current.correct;
                const cls = picked
                  ? isCorrect
                    ? "bg-success text-white border-success"
                    : isPicked
                      ? "bg-destructive text-white border-destructive"
                      : "bg-white/80 text-foreground"
                  : "bg-white text-foreground hover:bg-white/90";
                return (
                  <button
                    key={opt}
                    onClick={() => pick(opt)}
                    className={`rounded-xl border-2 border-transparent p-3 font-bold transition-spring ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-sm font-bold pt-2">
              <span>⏱ {time}s</span>
              <span>{lang === "ar" ? "نقاط:" : "Score:"} {score}</span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
