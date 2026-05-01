import { useState } from "react";
import { Gift } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

const GIFTS = [
  { id: "rose", emoji: "🌹", name: "Rose", nameAr: "وردة", cost: 10 },
  { id: "star", emoji: "⭐", name: "Star", nameAr: "نجمة", cost: 25 },
  { id: "crown", emoji: "👑", name: "Crown", nameAr: "تاج", cost: 100 },
  { id: "diamond", emoji: "💎", name: "Diamond", nameAr: "ألماسة", cost: 250 },
];

export const GiftButton = () => {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);

  const send = (g: typeof GIFTS[number]) => {
    toast.success(`${g.emoji} ${lang === "ar" ? "أُرسلت!" : "Sent!"}`, {
      description: lang === "ar" ? `أنفقت ${g.cost} ن.ت` : `Spent ${g.cost} LP`,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-xs font-bold text-gold-foreground transition-smooth hover:bg-gold hover:text-primary-foreground">
          <Gift className="h-3.5 w-3.5" /> {lang === "ar" ? "هدية" : "Gift"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {lang === "ar" ? "أرسل هدية" : "Send a Gift"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GIFTS.map((g) => (
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
  );
};
