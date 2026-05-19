import { useEffect, useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const SAMPLE_AR = [
  "صباح الخير جميعاً، أهلاً بكم في الجلسة…",
  "اليوم سنتحدث عن العادات الصغيرة المفيدة.",
  "من يحب أن يبدأ مشاركته؟",
  "تذكر أن تتحدث ببطء كي يفهمك الجميع.",
];
const SAMPLE_EN = [
  "Good morning everyone, welcome to the session…",
  "Today we'll discuss small useful habits.",
  "Who would like to start?",
  "Remember to speak slowly so everyone can follow.",
];

export const LiveTranscriptionDrawer = () => {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const src = lang === "ar" ? SAMPLE_AR : SAMPLE_EN;
    let i = 0;
    setLines([]);
    const id = setInterval(() => {
      setLines((ls) => [...ls, src[i % src.length]]);
      i += 1;
    }, 1800);
    return () => clearInterval(id);
  }, [open, lang]);

  return (
    <section className="mt-3 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-smooth hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          {lang === "ar" ? "الترجمة الحية" : "Live Transcription"}
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-48" : "max-h-0"
        )}
      >
        <div className="max-h-48 overflow-y-auto px-4 pb-3 space-y-1.5">
          {lines.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">
              {lang === "ar" ? "بانتظار الصوت…" : "Listening…"}
            </p>
          ) : (
            lines.map((l, i) => (
              <p key={i} className="text-xs leading-relaxed animate-fade-in">
                <span className="text-muted-foreground/60">›</span> {l}
              </p>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
