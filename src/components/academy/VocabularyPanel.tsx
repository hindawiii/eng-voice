import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LETTERS, VOCAB, generateRandomPhrase, type VocabItem } from "@/data/academy";
import { TTSButton } from "./TTSButton";

interface Props { langKey: string; bcp47: string }

export const VocabularyPanel = ({ langKey, bcp47 }: Props) => {
  const [extra, setExtra] = useState<VocabItem[]>([]);
  const letters = LETTERS[langKey] || [];
  const vocab = VOCAB[langKey] || [];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4">
        <h3 className="mb-3 text-base font-bold text-[#FBBF24]">الأحرف الأساسية</h3>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {letters.map((l, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-lg bg-[#070A13] p-2 border border-[#1F2937]">
              <span className="text-xl font-bold text-white">{l.text}</span>
              <TTSButton text={l.text} lang={bcp47} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#FBBF24]">المفردات الأساسية</h3>
          <Button
            size="sm"
            onClick={() => setExtra((e) => [generateRandomPhrase(langKey), ...e])}
            className="gap-1 bg-[#FBBF24] text-black hover:bg-[#F59E0B]"
          >
            <Sparkles className="h-3 w-3" /> توليد جمل جديدة ⚡
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[...extra, ...vocab].map((v, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-[#1F2937] bg-[#070A13] p-3">
              <div>
                <p className="font-semibold text-white">{v.text}</p>
                <p className="text-xs text-white/60">{v.ar}</p>
              </div>
              <TTSButton text={v.text} lang={bcp47} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
