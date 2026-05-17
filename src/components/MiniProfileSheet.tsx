import { Link } from "react-router-dom";
import { ExternalLink, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nProvider";

export interface MiniProfileUser {
  id: string;
  name: string;
  flag: string;
  gender?: "male" | "female" | "other";
  country?: string;
  city?: string;
  level?: number;
}

interface Props {
  user: MiniProfileUser | null;
  onClose: () => void;
}

export const MiniProfileSheet = ({ user, onClose }: Props) => {
  const { lang } = useI18n();
  if (!user) return null;
  const genderIcon = user.gender === "female" ? "♀️" : user.gender === "male" ? "♂️" : "⚧️";
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{user.flag}</span> {user.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-base">{genderIcon}</span>
            <span>
              {user.city || (lang === "ar" ? "غير معروف" : "Unknown")}
              {user.country ? ` · ${user.country}` : ""}
            </span>
            <MapPin className="h-3.5 w-3.5 ms-auto" />
          </div>
          {user.level !== undefined && (
            <div className="rounded-xl bg-primary-soft px-3 py-2 text-xs text-primary font-semibold">
              {lang === "ar" ? "المستوى" : "Level"} {user.level}
            </div>
          )}
          <Link
            to="/profile"
            onClick={onClose}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2 text-sm font-bold text-primary-foreground transition-spring hover:scale-[1.02]"
          >
            <ExternalLink className="h-4 w-4" />
            {lang === "ar" ? "عرض الملف الكامل" : "View full profile"}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
