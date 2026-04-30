import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  label?: string;
}

export const ProBadge = ({ className, label = "PRO" }: ProBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-foreground shadow-gold",
      className
    )}
  >
    <Crown className="h-3 w-3" strokeWidth={2.5} />
    {label}
  </span>
);
