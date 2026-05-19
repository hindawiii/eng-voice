import { Sparkles, Mic } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n/I18nProvider";

interface Props {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

export const AINoiseToggle = ({ enabled, onChange }: Props) => {
  const { lang } = useI18n();
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary-soft/60 to-card p-3 shadow-soft">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Mic className="h-4 w-4 text-primary" />
          <Sparkles className="absolute -top-1 -end-1 h-2.5 w-2.5 text-gold" />
        </div>
        <div>
          <p className="text-xs font-bold">
            {lang === "ar" ? "🎙️ جودة صوت AI" : "AI Noise Suppression"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {lang === "ar" ? "تنقية الضوضاء بالذكاء" : "Premium clarity boost"}
          </p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
};
