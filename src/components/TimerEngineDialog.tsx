import { useState } from "react";
import { Timer, Infinity as InfinityIcon, RotateCw, Hourglass, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export type TimerMode = "off" | "single" | "cyclic" | "session";

export interface TimerConfig {
  mode: TimerMode;
  speakerSec?: number; // for single/cyclic
  sessionMin?: number; // for session
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  config: TimerConfig;
  onSave: (c: TimerConfig) => void;
}

const SPEAKER_OPTS = [180, 240, 300]; // 3, 4, 5 min
const SESSION_OPTS = [30, 45, 60];

export const TimerEngineDialog = ({ open, onOpenChange, config, onSave }: Props) => {
  const { lang } = useI18n();
  const [mode, setMode] = useState<TimerMode>(config.mode);
  const [speakerSec, setSpeakerSec] = useState(config.speakerSec ?? 180);
  const [sessionMin, setSessionMin] = useState(config.sessionMin ?? 45);

  const tx = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const modes: { id: TimerMode; icon: any; en: string; ar: string; desc: { en: string; ar: string } }[] = [
    { id: "off", icon: InfinityIcon, en: "Open Discussion", ar: "نقاش مفتوح", desc: { en: "No timer", ar: "بدون مؤقت" } },
    { id: "single", icon: User, en: "Single Speaker", ar: "متحدث واحد", desc: { en: "Auto-mute after limit", ar: "كتم تلقائي" } },
    { id: "cyclic", icon: RotateCw, en: "Cyclic Rotation", ar: "دورة متعاقبة", desc: { en: "Pass token sequentially", ar: "تمرير الدور" } },
    { id: "session", icon: Hourglass, en: "Session Timer", ar: "مؤقت الجلسة", desc: { en: "Global countdown", ar: "عد تنازلي للجلسة" } },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-gold" />
            {tx("Timer Engine", "محرك المؤقت")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "rounded-2xl border p-3 text-start transition-smooth",
                    active
                      ? "border-primary bg-primary-soft shadow-soft"
                      : "border-border bg-card hover:border-primary"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                  <p className="mt-1 text-sm font-bold">{lang === "ar" ? m.ar : m.en}</p>
                  <p className="text-[10px] text-muted-foreground">{m.desc[lang]}</p>
                </button>
              );
            })}
          </div>

          {(mode === "single" || mode === "cyclic") && (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {tx("Per speaker window", "نافذة كل متحدث")}
              </p>
              <div className="flex gap-2">
                {SPEAKER_OPTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeakerSec(s)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-smooth",
                      speakerSec === s ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"
                    )}
                  >
                    {s / 60} {tx("min", "د")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "session" && (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {tx("Total session length", "مدة الجلسة الكلية")}
              </p>
              <div className="flex gap-2">
                {SESSION_OPTS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSessionMin(m)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-smooth",
                      sessionMin === m ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"
                    )}
                  >
                    {m} {tx("min", "د")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tx("Cancel", "إلغاء")}
          </Button>
          <Button
            className="bg-gradient-primary"
            onClick={() => {
              onSave({ mode, speakerSec, sessionMin });
              onOpenChange(false);
            }}
          >
            {tx("Apply", "تطبيق")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
