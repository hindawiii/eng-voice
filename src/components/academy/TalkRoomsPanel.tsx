import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import { generateTalkRooms } from "@/data/academy";

const LEVEL_STYLE: Record<string, { ar: string; color: string }> = {
  beginner: { ar: "المستوى المبتدئ", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  intermediate: { ar: "المستوى المتوسط", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  advanced: { ar: "المستوى المتقدم", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
};

interface Props { langKey: string }

export const TalkRoomsPanel = ({ langKey }: Props) => {
  const rooms = generateTalkRooms(langKey);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rooms.map((r) => {
        const meta = LEVEL_STYLE[r.level];
        return (
          <Link
            key={r.id}
            to={`/room/${r.id}`}
            className="block rounded-2xl border border-[#1F2937] bg-[#111827] p-4 hover:border-[#FBBF24]/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-white">{r.titleAr}</h4>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.color}`}>
                {meta.ar}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-white/70">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[#FBBF24] font-bold">{r.live}</span> مباشر
              </span>
              <span className="flex items-center gap-1 text-white/70"><Mic className="h-3 w-3" /> صوتي</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
