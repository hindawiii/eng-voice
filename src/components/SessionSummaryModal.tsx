import { useState } from "react";
import { Star, Clock, Sparkles, Heart, Gift, TrendingUp, Coins, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface SessionSummary {
  roomName: string;
  flag: string;
  elapsedSec: number;
  reactions: number;
  gifts: number;
  xpGain: number;
  lpGain: number;
}

interface Props {
  open: boolean;
  summary: SessionSummary | null;
  onOpenChange: (o: boolean) => void;
  onSubmit: (rating: number) => void;
}

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const mmss = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

export const SessionSummaryModal = ({ open, summary, onOpenChange, onSubmit }: Props) => {
  const { lang } = useI18n();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const stats = summary
    ? [
        { Icon: Clock, label: lang === "ar" ? "المدة" : "Duration", value: mmss(summary.elapsedSec), tone: "text-white" },
        { Icon: Heart, label: lang === "ar" ? "تفاعلات" : "Reactions", value: fmt(summary.reactions), tone: "text-rose-400" },
        { Icon: Gift, label: lang === "ar" ? "هدايا" : "Gifts", value: fmt(summary.gifts), tone: "text-pink-400" },
        { Icon: TrendingUp, label: "XP", value: `+${fmt(summary.xpGain)}`, tone: "text-emerald-400" },
        { Icon: Coins, label: "LP", value: `+${fmt(summary.lpGain)}`, tone: "text-[#FBBF24]" },
      ]
    : [];

  // Save the summary as a PNG card to the device
  const saveToDevice = () => {
    if (!summary) return;
    const W = 720, H = 900;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    if (!g) return;

    g.fillStyle = "#070A13"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#0B101D"; g.fillRect(40, 40, W - 80, H - 80);
    g.strokeStyle = "#FBBF24"; g.lineWidth = 3; g.strokeRect(40, 40, W - 80, H - 80);

    g.textAlign = "center";
    g.fillStyle = "#FBBF24"; g.font = "bold 44px Inter, Tajawal, sans-serif";
    g.fillText("Engvoice", W / 2, 130);
    g.fillStyle = "#FFFFFF"; g.font = "bold 34px Inter, Tajawal, sans-serif";
    g.fillText(lang === "ar" ? "ملخّص الجلسة" : "Session Summary", W / 2, 190);
    g.font = "30px Inter, Tajawal, sans-serif";
    g.fillText(`${summary.flag} ${summary.roomName}`, W / 2, 250);

    const rows: [string, string][] = [
      [lang === "ar" ? "المدة" : "Duration", mmss(summary.elapsedSec)],
      [lang === "ar" ? "تفاعلات" : "Reactions", fmt(summary.reactions)],
      [lang === "ar" ? "هدايا" : "Gifts", fmt(summary.gifts)],
      ["XP", `+${fmt(summary.xpGain)}`],
      ["LP", `+${fmt(summary.lpGain)}`],
    ];
    rows.forEach(([k, v], i) => {
      const y = 340 + i * 82;
      g.fillStyle = "#111827"; g.fillRect(90, y - 44, W - 180, 66);
      g.textAlign = "left"; g.fillStyle = "#B8C4D0"; g.font = "26px Inter, Tajawal, sans-serif";
      g.fillText(k, 120, y);
      g.textAlign = "right"; g.fillStyle = "#FBBF24"; g.font = "bold 30px Inter, sans-serif";
      g.fillText(v, W - 120, y);
    });

    g.textAlign = "center"; g.fillStyle = "#5E6D80"; g.font = "22px Inter, sans-serif";
    g.fillText(new Date().toLocaleString("en-GB"), W / 2, H - 90);

    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `engvoice-session-${Date.now()}.png`;
    a.click();
    toast.success(lang === "ar" ? "تم حفظ الملخّص في جهازك 📥" : "Summary saved to your device 📥");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-[#1F2937] bg-[#0B101D] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FBBF24]" />
            {lang === "ar" ? "ملخّص الجلسة" : "Session Summary"}
          </DialogTitle>
        </DialogHeader>

        {summary && (
          <>
            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wider text-white/60">
                {lang === "ar" ? "غادرت" : "You left"}
              </p>
              <p className="mt-1 text-base font-black">
                {summary.flag} {summary.roomName}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {stats.map(({ Icon, label, value, tone }) => (
                <div key={label} className="rounded-2xl border border-[#1F2937] bg-[#070A13] p-2 text-center">
                  <Icon className={cn("mx-auto h-4 w-4", tone)} />
                  <p className={cn("mt-1 text-sm font-black tabular-nums", tone)} dir="ltr">{value}</p>
                  <p className="text-[9px] font-semibold text-white/60">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-3">
              <p className="text-center text-xs font-bold text-white/80">
                {lang === "ar" ? "قيّم تجربتك" : "Rate your experience"}
              </p>
              <div className="mt-2 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="transition-spring hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-7 w-7",
                        (hover || rating) >= n ? "fill-[#FBBF24] text-[#FBBF24]" : "text-white/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="border-[#1F2937] bg-transparent text-white hover:bg-[#111827]" onClick={() => onOpenChange(false)}>
            {lang === "ar" ? "تخطي" : "Skip"}
          </Button>
          <Button
            variant="outline"
            disabled={!summary}
            onClick={saveToDevice}
            className="gap-1.5 border-[#FBBF24]/50 bg-transparent text-[#FBBF24] hover:bg-[#FBBF24]/10 hover:text-[#FBBF24]"
          >
            <Download className="h-4 w-4" />
            {lang === "ar" ? "حفظ" : "Save"}
          </Button>
          <Button
            disabled={!rating}
            className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#111827] font-black hover:opacity-90"
            onClick={() => {
              onSubmit(rating);
              onOpenChange(false);
              setRating(0);
            }}
          >
            {lang === "ar" ? "إرسال" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
