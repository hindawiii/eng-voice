import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (rating: number) => void;
}

export const SessionRatingModal = ({ open, onOpenChange, onSubmit }: Props) => {
  const { lang } = useI18n();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{lang === "ar" ? "كيف كانت الجلسة؟" : "How was the session?"}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-1.5 py-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="transition-spring hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8",
                  (hover || rating) >= n ? "fill-gold text-gold" : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {lang === "ar" ? "تخطي" : "Skip"}
          </Button>
          <Button
            disabled={!rating}
            className="bg-gradient-primary"
            onClick={() => {
              onSubmit(rating);
              onOpenChange(false);
            }}
          >
            {lang === "ar" ? "إرسال" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
