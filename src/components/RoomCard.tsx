import { Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { Room } from "@/data/rooms";
import { ProBadge } from "./ProBadge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

interface RoomCardProps {
  room: Room;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  const { lang } = useI18n();
  const title = lang === "ar" ? room.nameAr : room.name;
  const subtitle = lang === "ar" ? room.name : room.nameAr;
  const topic = lang === "ar" ? room.topicAr : room.topic;
  return (
    <Link
      to={`/room/${room.key}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-card p-5 shadow-soft transition-spring hover:-translate-y-1 hover:shadow-elegant border border-border"
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", room.accent)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-2xl">
            {room.flag}
          </div>
          <div>
            <h3 className="font-bold leading-tight text-foreground">{title}</h3>
            <p className={cn("text-sm text-muted-foreground", lang === "en" && "font-arabic")}>{subtitle}</p>
          </div>
        </div>
        {room.pro && <ProBadge />}
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-foreground/80">
        <span className="mx-1.5 inline-flex h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-gold align-middle" />
        {topic}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="font-medium text-foreground">{room.liveUsers}</span> {lang === "ar" ? "مباشر" : "live"}
          </span>
          <span className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{room.speakers}</span>/8
          </span>
        </div>
        <span className="text-xs font-semibold text-primary opacity-0 transition-smooth group-hover:opacity-100">
          {lang === "ar" ? "← انضم" : "Join →"}
        </span>
      </div>
    </Link>
  );
};
