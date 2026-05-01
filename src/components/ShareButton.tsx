import { Share2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

interface Props {
  roomKey: string;
  password?: string;
}

export const ShareButton = ({ roomKey, password }: Props) => {
  const { lang } = useI18n();

  const share = async () => {
    const base = `${window.location.origin}/room/${roomKey}`;
    const url = password ? `${base}?pw=${encodeURIComponent(password)}` : base;
    const text = lang === "ar" ? "انضم إلى غرفة حِوار" : "Join my LingVoice room";
    try {
      if (navigator.share) {
        await navigator.share({ title: "حِوار", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(lang === "ar" ? "تم نسخ الرابط" : "Link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <button
      onClick={share}
      className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold transition-smooth hover:bg-primary-soft"
    >
      <Share2 className="h-3.5 w-3.5" />
      {lang === "ar" ? "مشاركة" : "Share"}
    </button>
  );
};
