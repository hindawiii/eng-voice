import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GRAMMAR, type GrammarRule } from "@/data/academy";
import { TTSButton } from "./TTSButton";
import { cn } from "@/lib/utils";

const TIERS: { id: GrammarRule["tier"]; ar: string }[] = [
  { id: "beginner", ar: "مبتدئ" },
  { id: "intermediate", ar: "متوسط" },
  { id: "advanced", ar: "متقدم" },
];

interface Props { langKey: string; bcp47: string }

export const GrammarPanel = ({ langKey, bcp47 }: Props) => {
  const [tier, setTier] = useState<GrammarRule["tier"]>("beginner");
  const [open, setOpen] = useState<string | null>(null);
  const rules = (GRAMMAR[langKey] || []).filter((r) => r.tier === tier);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl bg-[#111827] p-1 border border-[#1F2937]">
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTier(t.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors",
              tier === t.id ? "bg-[#FBBF24] text-black" : "text-white/70 hover:text-white"
            )}
          >
            {t.ar}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.id} className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
            <button
              onClick={() => setOpen(open === r.id ? null : r.id)}
              className="flex w-full items-center justify-between p-4 text-right text-white font-bold"
            >
              <span>{r.titleAr}</span>
              <ChevronDown className={cn("h-4 w-4 text-[#FBBF24] transition-transform", open === r.id && "rotate-180")} />
            </button>
            {open === r.id && (
              <div className="space-y-2 border-t border-[#1F2937] bg-[#070A13] p-4">
                <p className="text-white/80 text-sm">{r.explanation}</p>
                <div className="flex items-center justify-between rounded-lg bg-[#111827] border border-[#1F2937] p-3">
                  <code className="text-[#FBBF24]">{r.example}</code>
                  <TTSButton text={r.example} lang={bcp47} />
                </div>
              </div>
            )}
          </div>
        ))}
        {rules.length === 0 && <p className="text-center text-white/50 py-4">لا توجد قواعد بعد لهذا المستوى.</p>}
      </div>
    </div>
  );
};
