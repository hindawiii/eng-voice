import { useState } from "react";
import { BookOpen, MessageSquare, GraduationCap, ClipboardCheck, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademyLang } from "@/data/academy";
import { VocabularyPanel } from "./VocabularyPanel";
import { PhrasesPanel } from "./PhrasesPanel";
import { GrammarPanel } from "./GrammarPanel";
import { AssessmentPanel } from "./AssessmentPanel";
import { TalkRoomsPanel } from "./TalkRoomsPanel";
import { TranslatorOverlay } from "./TranslatorOverlay";

type SubKey = "vocab" | "phrases" | "grammar" | "test" | "rooms";

const SUBS: { id: SubKey; ar: string; Icon: typeof BookOpen }[] = [
  { id: "vocab", ar: "الأحرف والكلمات", Icon: BookOpen },
  { id: "phrases", ar: "الجمل الشائعة", Icon: MessageSquare },
  { id: "grammar", ar: "قواعد اللغة", Icon: GraduationCap },
  { id: "test", ar: "اختبار المستوى", Icon: ClipboardCheck },
  { id: "rooms", ar: "غرف التحدث", Icon: Mic },
];

export const LanguageCorner = ({ lang }: { lang: AcademyLang }) => {
  const [sub, setSub] = useState<SubKey>("vocab");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{lang.flag}</span>
          <div>
            <h2 className="text-lg font-black text-white">{lang.labelAr}</h2>
            <p className="text-xs text-gold">{lang.name}</p>
          </div>
        </div>
        <TranslatorOverlay targetLang={lang.code} targetBcp47={lang.bcp47} />
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {SUBS.map(({ id, ar, Icon }) => (
            <button
              key={id}
              onClick={() => setSub(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap border transition-colors",
                sub === id
                  ? "bg-gold text-black border-gold"
                  : "bg-surface-2 text-white/80 border-border hover:border-gold/40"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {ar}
            </button>
          ))}
        </div>
      </div>

      <div>
        {sub === "vocab" && <VocabularyPanel langKey={lang.code} bcp47={lang.bcp47} />}
        {sub === "phrases" && <PhrasesPanel langKey={lang.code} bcp47={lang.bcp47} />}
        {sub === "grammar" && <GrammarPanel langKey={lang.code} bcp47={lang.bcp47} />}
        {sub === "test" && <AssessmentPanel langKey={lang.code} />}
        {sub === "rooms" && <TalkRoomsPanel langKey={lang.code} />}
      </div>
    </div>
  );
};
