import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { text: string; lang: string }

export const speak = (text: string, lang: string) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  const match = window.speechSynthesis.getVoices().find((v) => v.lang === lang)
    || window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.split("-")[0]));
  if (match) u.voice = match;
  window.speechSynthesis.speak(u);
};

export const TTSButton = ({ text, lang }: Props) => (
  <Button
    type="button"
    size="icon"
    variant="ghost"
    onClick={(e) => { e.stopPropagation(); speak(text, lang); }}
    className="h-8 w-8 rounded-full bg-[#1F2937] text-[#FBBF24] hover:bg-[#FBBF24]/15 hover:text-[#FBBF24]"
    aria-label="Speak"
  >
    <Mic className="h-4 w-4" />
  </Button>
);
