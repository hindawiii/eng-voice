import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Globe2, Shuffle, Layers } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { LANGUAGES, TOPICS, Topic } from "@/data/games";

export type GameMode = "linguistic" | "casual";

export interface GameConfig {
  mode: GameMode;
  /** language code being learned (target) */
  target: string;
  /** native language code for hybrid mix */
  native: string;
  /** infinite content scope */
  topic: Topic;
  /** when true: instructions in native, options in target */
  hybridMix: boolean;
}

const KEY = "engvoice.gameConfig";
const DEFAULT: GameConfig = {
  mode: "linguistic",
  target: "en",
  native: "ar",
  topic: "random",
  hybridMix: false,
};

export const getGameConfig = (): GameConfig => {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) } as GameConfig;
  } catch {
    return DEFAULT;
  }
};
export const setGameConfig = (cfg: GameConfig) => {
  localStorage.setItem(KEY, JSON.stringify(cfg));
};
export const getGameMode = (): GameMode => getGameConfig().mode;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (mode: GameMode) => void;
  gameTitle?: string;
  /** Show language/topic/mix advanced controls (default true) */
  showAdvanced?: boolean;
}

export const GameModeDialog = ({ open, onOpenChange, onConfirm, gameTitle, showAdvanced = true }: Props) => {
  const { lang } = useI18n();
  const [cfg, setCfg] = useState<GameConfig>(getGameConfig());

  const update = (patch: Partial<GameConfig>) => setCfg((c) => ({ ...c, ...patch }));

  const confirm = () => {
    setGameConfig(cfg);
    onConfirm(cfg.mode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            {lang === "ar" ? "إعداد اللعبة" : "Game Setup"}
            {gameTitle ? ` · ${gameTitle}` : ""}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {lang === "ar" ? "اختر الوضع واللغة والموضوع." : "Pick mode, language and topic."}
          </DialogDescription>
        </DialogHeader>

        {/* Mode picker */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => update({ mode: "linguistic" })}
            className={`group flex items-start gap-2 rounded-2xl border-2 p-3 text-start transition-spring ${cfg.mode === "linguistic" ? "border-gold bg-secondary" : "border-border bg-secondary/60 hover:border-gold/50"}`}
          >
            <div className="rounded-xl bg-gradient-gold p-2 text-gold-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">{lang === "ar" ? "وضع لغوي" : "Linguistic"}</p>
              <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "أسئلة + LP أعلى" : "Q&A + higher LP"}</p>
            </div>
          </button>
          <button
            onClick={() => update({ mode: "casual" })}
            className={`group flex items-start gap-2 rounded-2xl border-2 p-3 text-start transition-spring ${cfg.mode === "casual" ? "border-primary bg-secondary" : "border-border bg-secondary/60 hover:border-primary/50"}`}
          >
            <div className="rounded-xl bg-gradient-primary p-2 text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">{lang === "ar" ? "وضع عادي" : "Casual"}</p>
              <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "سرعة فقط" : "Pure speed"}</p>
            </div>
          </button>
        </div>

        {showAdvanced && (
          <>
            {/* Target language */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-gold mb-2">
                <Globe2 className="h-3 w-3" /> {lang === "ar" ? "لغة الهدف" : "Target language"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => update({ target: l.code })}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${cfg.target === l.code ? "bg-gold text-gold-foreground border-gold" : "bg-secondary border-border text-foreground"}`}
                  >
                    {l.flag} {lang === "ar" ? l.ar : l.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Hybrid mix */}
            <button
              onClick={() => update({ hybridMix: !cfg.hybridMix })}
              className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-start ${cfg.hybridMix ? "border-gold bg-secondary" : "border-border bg-secondary/60"}`}
            >
              <Layers className="h-4 w-4 text-gold" />
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">{lang === "ar" ? "نظام المكس" : "Hybrid Mix"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {lang === "ar" ? "تعليمات بلغتك الأم، إجابات بلغة الهدف" : "Instructions in native, answers in target"}
                </p>
              </div>
              <span className={`h-5 w-9 rounded-full transition-colors ${cfg.hybridMix ? "bg-gold" : "bg-muted"} relative`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-card transition-all ${cfg.hybridMix ? "left-4" : "left-0.5"}`} />
              </span>
            </button>

            {/* Topic / scope */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-gold mb-2">
                <Shuffle className="h-3 w-3" /> {lang === "ar" ? "نطاق الأسئلة (لا نهائي)" : "Question scope (infinite)"}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {TOPICS.map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => update({ topic: tp.id })}
                    className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold border ${cfg.topic === tp.id ? "bg-gold text-gold-foreground border-gold" : "bg-secondary border-border text-foreground"}`}
                  >
                    <span>{tp.emoji}</span>
                    <span>{lang === "ar" ? tp.ar : tp.en}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Button onClick={confirm} className="w-full bg-gradient-gold text-gold-foreground hover:opacity-90 font-bold">
          {lang === "ar" ? "ابدأ" : "Start"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
