import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import { Button } from "@/components/ui/button";
import { BookMarked, Trash2, Check, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export const VaultPanel = () => {
  const { lang } = useI18n();
  const { cards, review, remove } = useVault();
  const [reveal, setReveal] = useState<string | null>(null);

  if (!cards.length)
    return (
      <div className="rounded-3xl bg-card p-8 text-center shadow-soft">
        <BookMarked className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {lang === "ar"
            ? "خزنتك فارغة. الإجابات الخاطئة في الألعاب ستُحفظ هنا تلقائياً."
            : "Your vault is empty. Wrong answers from games are saved here for review."}
        </p>
      </div>
    );

  return (
    <div className="space-y-2">
      {cards.map((c) => {
        const isOpen = reveal === c.id;
        return (
          <div key={c.id} className="rounded-2xl bg-card p-4 shadow-soft flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{c.word}</p>
              <p className="text-sm text-muted-foreground truncate">
                {isOpen ? c.translation : "•••••"}
              </p>
              {c.context && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{c.context}</p>}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[10px] font-bold text-gold mr-1">{"★".repeat(c.strength)}</div>
              {isOpen ? (
                <>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={() => { review(c.id, true); setReveal(null); }}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { review(c.id, false); setReveal(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setReveal(c.id)}>
                  {lang === "ar" ? "اكشف" : "Reveal"}
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => remove(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
