import { Check, Hand, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export interface SpeakRequest {
  id: string;
  name: string;
  flag: string;
  level: number;
}

interface Props {
  requests: SpeakRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const RequestQueue = ({ requests, onApprove, onReject }: Props) => {
  const { lang } = useI18n();
  if (requests.length === 0) return null;

  return (
    <section className="mt-5 rounded-3xl border border-gold/40 bg-gold-soft/40 p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-foreground">
        <Hand className="h-4 w-4" /> {lang === "ar" ? "طلبات التحدث" : "Speak Requests"} · {requests.length}
      </h2>
      <ul className="space-y-2">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-base">
                {r.flag}
              </span>
              <div>
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "المستوى" : "Level"} {r.level}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(r.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-success-foreground transition-spring hover:scale-110"
                aria-label="Approve"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => onReject(r.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive transition-spring hover:scale-110 hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Reject"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
