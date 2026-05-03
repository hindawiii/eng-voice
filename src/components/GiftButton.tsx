import { useState } from "react";
import { Gift } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

interface GiftItem {
  id: string;
  emoji: string;
  name: string;
  nameAr: string;
  cost: number;
}

const COLLECTIONS: { id: string; label: string; labelAr: string; items: GiftItem[] }[] = [
  {
    id: "roses",
    label: "Roses & Crowns",
    labelAr: "ورود وتيجان",
    items: [
      { id: "rose", emoji: "🌹", name: "Rose", nameAr: "وردة", cost: 10 },
      { id: "bouquet", emoji: "💐", name: "Bouquet", nameAr: "باقة", cost: 40 },
      { id: "crown", emoji: "👑", name: "Crown", nameAr: "تاج", cost: 100 },
      { id: "heart", emoji: "💖", name: "Heart", nameAr: "قلب", cost: 25 },
    ],
  },
  {
    id: "luxury",
    label: "Luxury",
    labelAr: "فاخرة",
    items: [
      { id: "diamond", emoji: "💎", name: "Diamond", nameAr: "ألماسة", cost: 250 },
      { id: "ring", emoji: "💍", name: "Ring", nameAr: "خاتم", cost: 500 },
      { id: "yacht", emoji: "🛥️", name: "Yacht", nameAr: "يخت", cost: 1500 },
      { id: "sports-car", emoji: "🏎️", name: "Sports Car", nameAr: "سيارة", cost: 1000 },
    ],
  },
  {
    id: "luck",
    label: "Good Luck",
    labelAr: "حظ سعيد",
    items: [
      { id: "clover", emoji: "🍀", name: "Clover", nameAr: "برسيم", cost: 15 },
      { id: "star", emoji: "⭐", name: "Star", nameAr: "نجمة", cost: 25 },
      { id: "rainbow", emoji: "🌈", name: "Rainbow", nameAr: "قوس قزح", cost: 60 },
      { id: "fire", emoji: "🔥", name: "Fire", nameAr: "نار", cost: 35 },
    ],
  },
];

export const GiftButton = () => {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(COLLECTIONS[0].id);
  const [reveal, setReveal] = useState<GiftItem | null>(null);

  const send = (g: GiftItem) => {
    setOpen(false);
    setReveal(g);
    setTimeout(() => {
      setReveal(null);
      toast.success(`${g.emoji} ${lang === "ar" ? "أُرسلت!" : "Sent!"}`, {
        description: lang === "ar" ? `أنفقت ${g.cost} ن.ت` : `Spent ${g.cost} LP`,
      });
    }, 1800);
  };

  const active = COLLECTIONS.find((c) => c.id === tab)!;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-xs font-bold text-gold-foreground transition-smooth hover:bg-gold hover:text-primary-foreground">
            <Gift className="h-3.5 w-3.5" /> {lang === "ar" ? "هدية" : "Gift"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "ar" ? "أرسل هدية" : "Send a Gift"}
          </p>
          <div className="mb-3 flex gap-1 rounded-full bg-secondary p-1">
            {COLLECTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setTab(c.id)}
                className={`flex-1 rounded-full px-2 py-1 text-[10px] font-bold transition-smooth ${
                  tab === c.id ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
                }`}
              >
                {lang === "ar" ? c.labelAr : c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {active.items.map((g) => (
              <button
                key={g.id}
                onClick={() => send(g)}
                className="flex flex-col items-center gap-1 rounded-2xl border border-border p-3 transition-spring hover:scale-105 hover:border-gold hover:bg-gold-soft"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs font-semibold">{lang === "ar" ? g.nameAr : g.name}</span>
                <span className="text-[10px] text-gold-foreground">{g.cost} LP</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {reveal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="relative flex flex-col items-center">
            <div className="text-7xl animate-gift-shake" style={{ animationIterationCount: 1 }}>
              🎁
            </div>
            <div
              className="absolute text-7xl animate-gift-pop"
              style={{ animationDelay: "0.55s", opacity: 0 }}
            >
              {reveal.emoji}
            </div>
            <p
              className="mt-6 rounded-full bg-gradient-gold px-4 py-1.5 text-sm font-bold text-gold-foreground opacity-0 shadow-gold animate-fade-in"
              style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
            >
              {lang === "ar" ? reveal.nameAr : reveal.name} · {reveal.cost} LP
            </p>
          </div>
        </div>
      )}
    </>
  );
};
