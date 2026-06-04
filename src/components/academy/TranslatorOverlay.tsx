import { useState } from "react";
import { Languages, Save, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDictionary, detectIsArabic, translateText } from "@/hooks/useDictionary";
import { TTSButton } from "./TTSButton";
import { toast } from "sonner";

interface Props { targetLang: string; targetBcp47: string }

export const TranslatorOverlay = ({ targetLang, targetBcp47 }: Props) => {
  const { entries, add, remove } = useDictionary();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [from, setFrom] = useState("ar");
  const [to, setTo] = useState(targetLang);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    const isAr = detectIsArabic(input);
    const f = isAr ? "ar" : targetLang;
    const t = isAr ? targetLang : "ar";
    setFrom(f); setTo(t);
    setLoading(true);
    const res = await translateText(input.trim(), f, t);
    setOutput(res || "—");
    setLoading(false);
  };

  const handleSave = () => {
    if (!input.trim() || !output.trim()) return;
    add({ source: input.trim(), translation: output.trim(), from, to });
    toast.success("تم حفظ الكلمة في قاموسك");
    setInput(""); setOutput("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-[#FBBF24]/40 bg-[#111827] text-[#FBBF24] hover:bg-[#FBBF24]/10">
          <Languages className="h-4 w-4" /> قاموسي الخاص
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-[#0B0F1A] text-white border-[#1F2937]">
        <DialogHeader><DialogTitle className="text-[#FBBF24]">المترجم الذكي</DialogTitle></DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب بالعربية أو بلغة الهدف..."
            className="min-h-[80px] bg-[#111827] border-[#1F2937] text-white placeholder:text-white/40"
          />
          <div className="flex gap-2">
            <Button onClick={handleTranslate} disabled={loading} className="flex-1 bg-[#FBBF24] text-black hover:bg-[#F59E0B]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ترجم الآن"}
            </Button>
            <Button onClick={() => { setInput(""); setOutput(""); }} variant="ghost" className="text-white/70">
              <Trash2 className="h-4 w-4" /> حذف
            </Button>
          </div>

          {output && (
            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-white font-medium">{output}</p>
                <TTSButton text={output} lang={to === "ar" ? "ar-SA" : targetBcp47} />
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={handleSave} className="bg-[#FBBF24] text-black hover:bg-[#F59E0B]">
                  <Save className="h-3 w-3 ml-1" /> حفظ الكلمة 💾
                </Button>
              </div>
            </div>
          )}

          {entries.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#FBBF24] mb-1">مفضلتي ({entries.length})</p>
              <ScrollArea className="h-40 rounded-lg border border-[#1F2937] bg-[#070A13] p-2">
                <div className="space-y-2">
                  {entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-2 rounded bg-[#111827] p-2 text-sm">
                      <div className="flex-1">
                        <p className="text-white">{e.source}</p>
                        <p className="text-[#FBBF24] text-xs">{e.translation}</p>
                      </div>
                      <TTSButton text={e.translation} lang={e.to === "ar" ? "ar-SA" : targetBcp47} />
                      <Button size="icon" variant="ghost" onClick={() => remove(e.id)} className="h-7 w-7 text-red-400">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
