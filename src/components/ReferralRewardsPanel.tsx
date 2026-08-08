import { useMemo, useState } from "react";
import { Copy, Check, Users, Gift } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const TIERS = [
  { invites: 3, days: 4 },
  { invites: 5, days: 7 },
  { invites: 7, days: 10 },
  { invites: 10, days: 14 },
];

export const ReferralRewardsPanel = ({ invitedCount = 0 }: { invitedCount?: number }) => {
  const { lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const link = useMemo(
    () => `${typeof window !== "undefined" ? window.location.origin : "https://engvoice.app"}/?ref=yusuf`,
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <section className="rounded-3xl border border-border bg-surface-2 p-5 shadow-elegant">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground shadow-gold">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">
            {lang === "ar" ? "رابط دعوة الأصدقاء والمكافآت 👥" : "Invite Friends & Rewards 👥"}
          </h3>
          <p className="text-[11px] text-white/60">
            {lang === "ar"
              ? "شارك رابطك واحصل على ساعات إضافية في الغرف"
              : "Share your link and earn bonus room hours"}
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-background p-2">
        <input
          readOnly
          value={link}
          dir="ltr"
          className="flex-1 truncate bg-transparent px-2 text-xs font-semibold text-white outline-none"
        />
        <button
          onClick={copy}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-spring",
            copied
              ? "bg-emerald-500 text-white"
              : "bg-gradient-gold text-gold-foreground hover:scale-[1.03]"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied
            ? lang === "ar" ? "تم النسخ" : "Copied"
            : lang === "ar" ? "نسخ" : "Copy"}
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-background p-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
          {lang === "ar" ? "أصدقاؤك المدعوّون" : "Friends Invited"}
        </span>
        <span className="text-xl font-black text-gold" dir="ltr">{invitedCount}</span>
      </div>

      <ul className="space-y-2">
        {TIERS.map((t) => {
          const reached = invitedCount >= t.invites;
          return (
            <li
              key={t.invites}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3 transition-smooth",
                reached
                  ? "border-emerald-500/60 bg-emerald-950/40"
                  : "border-border bg-background"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black",
                  reached ? "bg-emerald-500 text-white" : "bg-slate-900 text-gold"
                )}
              >
                {reached ? <Check className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white" dir={lang === "ar" ? "rtl" : "ltr"}>
                  {lang === "ar"
                    ? `ادعُ ${t.invites} أصدقاء`
                    : `Invite ${t.invites} friends`}
                </p>
                <p className="text-[11px] font-semibold text-white/70">
                  {lang === "ar"
                    ? `احصل على ساعة إضافية يومياً لمدة ${t.days} ${t.days >= 11 ? "يوماً" : "أيام"}`
                    : `Get +1 bonus hour/day for ${t.days} days`}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-black",
                  reached
                    ? "bg-emerald-500 text-white"
                    : "bg-gold/20 text-gold"
                )}
                dir="ltr"
              >
                +{t.days}d
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
