import { useState } from "react";
import { cn } from "@/lib/utils";

/** Categorized emoji + sticker picker — RTL-safe, dark theme. */
const CATEGORIES: { id: string; label: string; icon: string; items: string[] }[] = [
  {
    id: "smileys",
    label: "وجوه",
    icon: "😀",
    items: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😘","😗","😋","😜","🤪","🤗","🤔","🤨","😐","😴","🤤","😪","😵","🥳","😎","🤓","🧐","😕","🙁","😢","😭","😤","😠","🤬","🥵","🥶","😱","🤯","😳","🥺"],
  },
  {
    id: "gestures",
    label: "إيماءات",
    icon: "👍",
    items: ["👍","👎","👏","🙌","🙏","🤝","✌️","🤞","🤟","🤘","👌","🤌","👈","👉","👆","👇","✋","🖐️","🖖","💪","🦾","👀","🫶","🤲","☝️","👋"],
  },
  {
    id: "hearts",
    label: "قلوب",
    icon: "❤️",
    items: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️"],
  },
  {
    id: "learn",
    label: "تعلّم",
    icon: "📚",
    items: ["📚","📖","✏️","📝","🎓","🧠","💡","🗣️","👂","🎙️","🎧","🔤","🔡","🌐","🗺️","⏱️","🏆","🥇","⭐","✨","🔥","💯","🎯","📈"],
  },
  {
    id: "flags",
    label: "أعلام",
    icon: "🏳️",
    items: ["🇸🇦","🇦🇪","🇪🇬","🇸🇩","🇹🇷","🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇪🇸","🇯🇵","🇰🇷","🇨🇳","🇷🇺","🇮🇳","🇧🇷","🇮🇹","🇨🇦","🇦🇺","🇲🇦"],
  },
  {
    id: "objects",
    label: "أشياء",
    icon: "🎁",
    items: ["🎁","🌹","💐","👑","💎","💍","🍀","🌈","🎉","🎊","🍕","☕","🍰","⚽","🎮","🚀","🌙","☀️","⚡","🎵"],
  },
];

const STICKERS = ["🐱‍👤","🦊","🐼","🐨","🐵","🦁","🐸","🐧","🦄","🐝","🐳","🦋","🌻","🍩","🍿","🧁","🎈","🪄","🛸","🏰","🎸","🥁","🧩","🪩"];

interface Props {
  onSelect: (value: string) => void;
  className?: string;
}

export const EmojiStickerPicker = ({ onSelect, className }: Props) => {
  const [tab, setTab] = useState<string>(CATEGORIES[0].id);
  const isStickers = tab === "stickers";
  const items = isStickers ? STICKERS : CATEGORIES.find((c) => c.id === tab)!.items;

  return (
    <div dir="rtl" className={cn("rounded-2xl border border-slate-800 bg-card p-2", className)}>
      {/* Category strip */}
      <div className="no-scrollbar mb-2 flex gap-1 overflow-x-auto border-b border-slate-800 pb-2">
        {[...CATEGORIES, { id: "stickers", label: "ملصقات", icon: "🪄", items: STICKERS }].map((c) => (
          <button
            key={c.id}
            onClick={() => setTab(c.id)}
            title={c.label}
            className={cn(
              "shrink-0 rounded-xl px-2.5 py-1 text-base transition-colors",
              tab === c.id ? "bg-gold/15 ring-1 ring-gold/50" : "hover:bg-slate-800/60"
            )}
          >
            {c.icon}
          </button>
        ))}
      </div>

      <div className={cn("no-scrollbar max-h-44 overflow-y-auto", isStickers ? "grid grid-cols-6 gap-1.5" : "grid grid-cols-8 gap-1")}>
        {items.map((e, i) => (
          <button
            key={`${e}-${i}`}
            onClick={() => onSelect(e)}
            className={cn(
              "rounded-lg hover:bg-slate-800 active:scale-90 transition-transform",
              isStickers ? "p-1.5 text-3xl" : "p-1 text-xl"
            )}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};
