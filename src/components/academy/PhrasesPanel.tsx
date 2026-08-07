import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SCENARIOS, generateRandomPhrase, type VocabItem } from "@/data/academy";
import { TTSButton } from "./TTSButton";

interface Props { langKey: string; bcp47: string }

export const PhrasesPanel = ({ langKey, bcp47 }: Props) => {
  const [extra, setExtra] = useState<Record<string, VocabItem[]>>({});

  return (
    <div className="space-y-3">
      <Accordion type="single" collapsible className="space-y-2">
        {SCENARIOS.map((s) => {
          const items = [...(extra[s.id] || []), ...(s.phrases[langKey] || [])];
          return (
            <AccordionItem key={s.id} value={s.id} className="rounded-2xl border border-[#1F2937] bg-surface-2 px-4">
              <AccordionTrigger className="text-right font-bold text-white hover:no-underline">
                {s.titleAr}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4">
                <Button
                  size="sm"
                  onClick={() => setExtra((e) => ({ ...e, [s.id]: [generateRandomPhrase(langKey), ...(e[s.id] || [])] }))}
                  className="gap-1 bg-gold text-black hover:bg-gold-hover"
                >
                  <Sparkles className="h-3 w-3" /> توليد جمل جديدة ⚡
                </Button>
                {items.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-[#1F2937] bg-background p-3">
                    <div>
                      <p className="font-semibold text-white">{p.text}</p>
                      <p className="text-xs text-white/60">{p.ar}</p>
                    </div>
                    <TTSButton text={p.text} lang={bcp47} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
