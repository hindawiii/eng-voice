import { Link } from "react-router-dom";
import { Lock, Mic, Headphones, GraduationCap, Users } from "lucide-react";
import { CustomRoom } from "@/data/customRooms";
import { cn } from "@/lib/utils";

const AVATAR_EMOJI = ["🦊", "🐼", "🦉", "🐬", "🦁", "🐨", "🐯", "🦄"];

/** deterministic pseudo-random from a string key */
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export const ActiveRoomCard = ({ room }: { room: CustomRoom }) => {
  const h = hash(room.key);
  const speakers = Math.max(1, room.speakers || (h % 6) + 2);
  const listeners = Math.max(0, room.liveUsers - speakers);
  const girls = Math.round((speakers + listeners) * (((h >> 3) % 40) + 30) / 100);
  const boys = Math.max(0, speakers + listeners - girls);
  const shown = Array.from({ length: Math.min(5, speakers) }, (_, i) => AVATAR_EMOJI[(h + i * 7) % AVATAR_EMOJI.length]);
  const extra = Math.max(0, speakers - shown.length);

  const type = room.tutorMode
    ? { label: "تعليمية", icon: GraduationCap, cls: "bg-gold/15 text-gold border-gold/40" }
    : room.isPrivate
      ? { label: "خاصة", icon: Lock, cls: "bg-secondary text-foreground/80 border-border" }
      : { label: "عامة", icon: Users, cls: "bg-emerald-500/12 text-emerald-400 border-emerald-500/35" };
  const TypeIcon = type.icon;

  return (
    <Link
      to={`/room/${room.key}`}
      className="group relative block overflow-hidden rounded-2xl border border-border/70 bg-card p-3 shadow-elegant transition-all hover:-translate-y-0.5 hover:border-gold/50"
    >
      {/* subtle accent glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative flex items-center gap-2">
        <span className="text-lg leading-none">{room.flag}</span>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-foreground/75">
          {room.language}
        </span>
        <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold", type.cls)}>
          <TypeIcon className="h-3 w-3" />
          {type.label}
        </span>
        <span className="ms-auto flex items-center gap-1 text-[10px] font-bold text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          مباشر
        </span>
      </div>

      <p className="relative mt-2 line-clamp-1 font-arabic text-sm font-bold text-foreground">
        {room.topic || room.nameAr || room.name}
      </p>

      <div className="relative mt-2.5 flex items-center gap-2">
        <div className="flex -space-x-2 rtl:space-x-reverse">
          {shown.map((e, i) => (
            <span
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-sm ring-1 ring-background"
            >
              {e}
            </span>
          ))}
          {extra > 0 && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-[10px] font-black tabular-nums text-foreground/80">
              +{extra}
            </span>
          )}
        </div>

        <div className="ms-auto flex items-center gap-1.5" dir="ltr">
          <Stat icon={<Mic className="h-3 w-3" />} value={speakers} cls="text-gold" />
          <Stat icon={<Headphones className="h-3 w-3" />} value={listeners} cls="text-foreground/75" />
          <Stat icon={<span className="text-[10px]">♀</span>} value={girls} cls="text-pink-400" />
          <Stat icon={<span className="text-[10px]">♂</span>} value={boys} cls="text-sky-400" />
        </div>
      </div>
    </Link>
  );
};

const Stat = ({ icon, value, cls }: { icon: React.ReactNode; value: number; cls: string }) => (
  <span className={cn("inline-flex items-center gap-0.5 rounded-md bg-secondary/70 px-1.5 py-1 text-[10px] font-black tabular-nums", cls)}>
    {icon}
    {value}
  </span>
);
