import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, Award, Flame, Trophy, Sparkles, Crown, Star, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nProvider";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface MiniProfileUser {
  id: string;
  name: string;
  flag: string;
  gender?: "male" | "female" | "other";
  country?: string;
  city?: string;
  level?: number;
}

interface Props {
  user: MiniProfileUser | null;
  onClose: () => void;
}

// Deterministic pseudo stats derived from the user id, so the sheet feels stable.
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
};

const REWARDS = [
  { Icon: Flame, ar: "متألق", en: "Streaker", tone: "text-orange-400 bg-orange-500/15 border-orange-500/40" },
  { Icon: Trophy, ar: "بطل الغرفة", en: "Room Champ", tone: "text-[#FBBF24] bg-[#FBBF24]/15 border-[#FBBF24]/40" },
  { Icon: Sparkles, ar: "متحدث ذهبي", en: "Golden Voice", tone: "text-amber-300 bg-amber-500/15 border-amber-400/40" },
  { Icon: Crown, ar: "ملكي", en: "Royal", tone: "text-purple-300 bg-purple-500/15 border-purple-400/40" },
  { Icon: Award, ar: "موثّق", en: "Verified", tone: "text-sky-300 bg-sky-500/15 border-sky-400/40" },
] as const;

const QUICK_GIFTS = [
  { emoji: "🌹", ar: "وردة", en: "Rose", cost: 10 },
  { emoji: "💖", ar: "قلب", en: "Heart", cost: 25 },
  { emoji: "🔥", ar: "نار", en: "Fire", cost: 35 },
  { emoji: "👑", ar: "تاج", en: "Crown", cost: 100 },
  { emoji: "💎", ar: "ألماسة", en: "Diamond", cost: 250 },
] as const;

export const MiniProfileSheet = ({ user, onClose }: Props) => {
  const { lang } = useI18n();
  const { lp, spend } = useWallet();
  const [sent, setSent] = useState<string | null>(null);

  if (!user) return null;

  const h = hash(user.id);
  const followers = 40 + (h % 4200);
  const roomsHosted = 1 + (h % 24);
  const rating = 3.5 + ((h % 15) / 10); // 3.5–5.0
  // Pick 3 rewards deterministically
  const owned = [0, 1, 2].map((i) => REWARDS[(h + i * 7) % REWARDS.length]);

  const genderIcon = user.gender === "female" ? "♀️" : user.gender === "male" ? "♂️" : "⚧️";

  const sendGift = (g: (typeof QUICK_GIFTS)[number]) => {
    if (!spend(g.cost)) {
      toast.error(lang === "ar" ? "رصيد LP غير كافٍ" : "Not enough LP");
      return;
    }
    setSent(g.emoji);
    setTimeout(() => setSent(null), 900);
    toast.success(
      lang === "ar"
        ? `أرسلت ${g.ar} ${g.emoji} إلى ${user.name}`
        : `Sent ${g.en} ${g.emoji} to ${user.name}`
    );
  };


  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm border border-[#1F2937] bg-[#0B101D] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span className="text-2xl">{user.flag}</span> {user.name}
            {user.level !== undefined && (
              <span className="ms-auto rounded-full bg-[#FBBF24]/15 px-2 py-0.5 text-[10px] font-black text-[#FBBF24]" dir="ltr">
                Lv {user.level}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Location + gender */}
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="text-base">{genderIcon}</span>
            <span>
              {user.city || (lang === "ar" ? "غير معروف" : "Unknown")}
              {user.country ? ` · ${user.country}` : ""}
            </span>
            <MapPin className="h-3.5 w-3.5 ms-auto text-white/40" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#1F2937]">
            {[
              { v: followers.toLocaleString("en-US"), l: lang === "ar" ? "متابعون" : "Followers", tone: "text-white" },
              { v: String(roomsHosted), l: lang === "ar" ? "غرف" : "Rooms", tone: "text-[#FBBF24]" },
              { v: rating.toFixed(1), l: lang === "ar" ? "تقييم" : "Rating", tone: "text-amber-300" },
            ].map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center gap-0.5 bg-[#070A13] p-2.5",
                  i !== 2 && "border-e border-[#1F2937]"
                )}
              >
                <p className={cn("text-base font-black tabular-nums", s.tone)} dir="ltr">
                  {s.v}
                  {i === 2 && <Star className="ms-1 inline h-3 w-3 fill-amber-300 text-amber-300" />}
                </p>
                <p className="text-[10px] font-semibold text-white/60">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Rewards / achievements */}
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#FBBF24]">
              <Award className="h-3 w-3" /> {lang === "ar" ? "المكافآت" : "Rewards"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {owned.map(({ Icon, ar, en, tone }, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black",
                    tone
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {lang === "ar" ? ar : en}
                </span>
              ))}
            </div>
          </div>

          <Link
            to="/profile"
            onClick={onClose}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] py-2 text-sm font-black text-[#111827] transition-spring hover:scale-[1.02]"
          >
            <ExternalLink className="h-4 w-4" />
            {lang === "ar" ? "عرض الملف الكامل" : "View full profile"}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
