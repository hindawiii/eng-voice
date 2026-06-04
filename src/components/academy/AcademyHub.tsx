import { useState } from "react";
import { ACADEMY_LANGS } from "@/data/academy";
import { cn } from "@/lib/utils";
import { LanguageCorner } from "./LanguageCorner";
import { RoomCard } from "@/components/RoomCard";
import { ROOMS } from "@/data/rooms";

const ALL = { key: "all", labelAr: "الكل" };

export const AcademyHub = () => {
  const [active, setActive] = useState<string>("all");
  const lang = ACADEMY_LANGS.find((l) => l.key === active);

  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {[ALL, ...ACADEMY_LANGS].map((l) => (
            <button
              key={l.key}
              onClick={() => setActive(l.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap border transition-all",
                active === l.key
                  ? "bg-[#FBBF24] text-black border-[#FBBF24] shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                  : "bg-[#111827] text-white/80 border-[#1F2937] hover:border-[#FBBF24]/40"
              )}
            >
              {l.labelAr}
            </button>
          ))}
        </div>
      </div>

      {lang ? (
        <LanguageCorner lang={lang} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ROOMS.map((r) => (<RoomCard key={r.key} room={r} />))}
        </div>
      )}
    </div>
  );
};
