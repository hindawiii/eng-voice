import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export type GameMode = "linguistic" | "casual";
const KEY = "lingvoice.gameMode";

export const getGameMode = (): GameMode =>
  (typeof window !== "undefined" && (localStorage.getItem(KEY) as GameMode)) || "linguistic";
export const setGameMode = (m: GameMode) => localStorage.setItem(KEY, m);

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (mode: GameMode) => void;
  gameTitle?: string;
}

export const GameModeDialog = ({ open, onOpenChange, onPick, gameTitle }: Props) => {
  const { lang } = useI18n();
  const pick = (m: GameMode) => {
    setGameMode(m);
    onPick(m);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {lang === "ar" ? "اختر وضع اللعب" : "Choose Game Mode"}
            {gameTitle ? ` · ${gameTitle}` : ""}
          </DialogTitle>
          <DialogDescription>
            {lang === "ar"
              ? "يمكنك تغييره لاحقاً من إعدادات اللعب."
              : "You can change this later from Play settings."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <button
            onClick={() => pick("linguistic")}
            className="group flex items-start gap-3 rounded-2xl border-2 border-border p-4 text-start transition-spring hover:border-gold hover:bg-gold-soft/40"
          >
            <div className="rounded-xl bg-gradient-gold p-2.5 text-gold-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">{lang === "ar" ? "وضع لغوي" : "Linguistic Mode"}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "أسئلة لغوية، تدريبات نطق، مكافآت LP مضاعفة."
                  : "Language questions, speech drills, higher LP rewards."}
              </p>
            </div>
          </button>
          <button
            onClick={() => pick("casual")}
            className="group flex items-start gap-3 rounded-2xl border-2 border-border p-4 text-start transition-spring hover:border-primary hover:bg-primary-soft"
          >
            <div className="rounded-xl bg-gradient-primary p-2.5 text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">{lang === "ar" ? "وضع عادي" : "Casual Mode"}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "بدون أسئلة — منافسة سرعة خالصة."
                  : "No questions — pure speed competition."}
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
