import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

interface Item {
  id: string;
  emoji: string;
  en: string;
  ar: string;
  cost: number;
  kind: "frame" | "chime" | "gift";
  preview?: string; // tailwind class
}

const ITEMS: Item[] = [
  { id: "frame-neon-blue", emoji: "🟦", en: "Neon Blue Frame", ar: "إطار أزرق نيون", cost: 200, kind: "frame", preview: "ring-4 ring-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]" },
  { id: "frame-gold-royal", emoji: "👑", en: "Royal Gold Frame", ar: "إطار ذهبي ملكي", cost: 400, kind: "frame", preview: "ring-4 ring-gold shadow-gold" },
  { id: "frame-pink-pulse", emoji: "💗", en: "Pink Pulse Frame", ar: "إطار وردي نابض", cost: 250, kind: "frame" },
  { id: "chime-bell", emoji: "🔔", en: "Bell Entry Chime", ar: "رنين دخول", cost: 120, kind: "chime" },
  { id: "chime-fanfare", emoji: "🎺", en: "Fanfare Chime", ar: "نفير ملكي", cost: 300, kind: "chime" },
  { id: "gift-crown-premium", emoji: "👑", en: "Premium Crown Gift", ar: "هدية تاج مميزة", cost: 500, kind: "gift" },
  { id: "gift-rocket-premium", emoji: "🚀", en: "Premium Rocket Gift", ar: "هدية صاروخ", cost: 350, kind: "gift" },
];

const OWN_KEY = "lingvoice.store.owned";

export const RewardsStore = () => {
  const { lang } = useI18n();
  const { lp, spend } = useWallet();
  const [owned, setOwned] = useState<string[]>([]);

  useEffect(() => {
    try { setOwned(JSON.parse(localStorage.getItem(OWN_KEY) || "[]")); } catch { /* */ }
  }, []);

  const buy = (item: Item) => {
    if (owned.includes(item.id)) return;
    if (!spend(item.cost)) {
      toast.error(lang === "ar" ? "رصيد LP غير كافٍ" : "Not enough LP");
      return;
    }
    const next = [...owned, item.id];
    setOwned(next);
    localStorage.setItem(OWN_KEY, JSON.stringify(next));
    toast.success(lang === "ar" ? "تم الشراء!" : "Unlocked!");
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {ITEMS.map((item) => {
        const has = owned.includes(item.id);
        const can = lp >= item.cost;
        return (
          <div key={item.id} className="rounded-2xl bg-card p-3 shadow-soft flex flex-col items-center gap-2">
            <div className={`h-14 w-14 rounded-full bg-gradient-room flex items-center justify-center text-3xl ${item.preview || ""}`}>
              {item.emoji}
            </div>
            <p className="text-sm font-bold text-center">{lang === "ar" ? item.ar : item.en}</p>
            <Button
              size="sm"
              variant={has ? "secondary" : can ? "default" : "outline"}
              disabled={has}
              onClick={() => buy(item)}
              className="w-full"
            >
              {has ? <><Check className="h-3 w-3" /> {lang === "ar" ? "مملوك" : "Owned"}</>
                : !can ? <><Lock className="h-3 w-3" /> {item.cost} LP</>
                : <>{item.cost} LP</>}
            </Button>
          </div>
        );
      })}
    </div>
  );
};
