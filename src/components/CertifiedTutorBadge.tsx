import { GraduationCap } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export const CertifiedTutorBadge = ({ className }: { className?: string }) => {
  const { lang } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-950 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse",
        className
      )}
    >
      <GraduationCap className="h-3 w-3" />
      {lang === "ar" ? "مرشد معتمد" : "Certified Tutor"}
    </span>
  );
};
