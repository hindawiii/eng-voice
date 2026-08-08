import { Link } from "react-router-dom";
import { Lock, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface QuickRoomItem {
  key: string;
  /** short label under the icon */
  label: string;
  /** emoji / avatar shown inside the icon */
  icon: string;
  /** small country flag badge */
  flag?: string;
  /** tooltip description (topic) */
  desc?: string;
  live?: number;
  locked?: boolean;
  owner?: string;
}

interface ColumnProps {
  title: string;
  items: QuickRoomItem[];
  empty: string;
  accent: "gold" | "emerald";
}

const RoomIcon = ({ r, accent }: { r: QuickRoomItem; accent: "gold" | "emerald" }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        to={`/room/${r.key}`}
        className="group flex w-[54px] shrink-0 flex-col items-center gap-1 outline-none"
      >
        <div className="relative">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-lg ring-1 transition-all group-hover:-translate-y-0.5 group-hover:brightness-110",
              accent === "gold"
                ? "ring-gold/50 shadow-gold"
                : "ring-emerald-500/40 shadow-[0_0_10px_hsl(var(--background))]"
            )}
          >
            {r.icon}
          </div>
          {r.flag && (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background text-[9px] leading-none">
              {r.flag}
            </span>
          )}
          {r.locked && (
            <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-gold">
              <Lock className="h-2.5 w-2.5" />
            </span>
          )}
          {!!r.live && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          )}
        </div>
        <span className="max-w-[54px] truncate text-[10px] font-semibold text-foreground/80">
          {r.label}
        </span>
      </Link>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[190px] font-arabic">
      <p className="text-xs font-bold">{r.label}</p>
      {r.owner && <p className="text-[10px] text-muted-foreground">{r.owner}</p>}
      {r.desc && <p className="mt-0.5 text-[10px] leading-snug text-foreground/80">{r.desc}</p>}
      {!!r.live && <p className="mt-0.5 text-[10px] text-gold">{r.live} مباشر</p>}
    </TooltipContent>
  </Tooltip>
);

const Column = ({ title, items, empty, accent }: ColumnProps) => (
  <div className="min-w-0 flex-1">
    <div className="mb-2 flex items-baseline justify-between gap-1 px-0.5">
      <h3 className="truncate text-[11px] font-bold uppercase tracking-wider text-foreground/70">
        {title}
      </h3>
      <span className="text-[10px] tabular-nums text-muted-foreground">{items.length}</span>
    </div>
    {items.length === 0 ? (
      <p className="py-3 text-center text-[10px] text-muted-foreground">{empty}</p>
    ) : (
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex min-w-max items-start gap-2 pb-1">
          {items.map((r) => (
            <RoomIcon key={r.key} r={r} accent={accent} />
          ))}
        </div>
      </div>
    )}
  </div>
);

interface Props {
  mine: QuickRoomItem[];
  friends: QuickRoomItem[];
  labels: { mine: string; friends: string; emptyMine: string; emptyFriends: string };
}

export const RoomsQuickBar = ({ mine, friends, labels }: Props) => (
  <TooltipProvider delayDuration={120}>
    <div className="rounded-3xl border border-border/60 bg-card p-3 shadow-elegant">
      <div className="flex items-stretch gap-3">
        <Column title={labels.mine} items={mine} empty={labels.emptyMine} accent="gold" />
        <div className="w-px shrink-0 bg-border/70" />
        <Column
          title={labels.friends}
          items={friends}
          empty={labels.emptyFriends}
          accent="emerald"
        />
      </div>
    </div>
  </TooltipProvider>
);

export { Plus };
