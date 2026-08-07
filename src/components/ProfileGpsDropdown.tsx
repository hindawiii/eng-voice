import { useEffect, useState } from "react";
import { Eye, EyeOff, Globe, MapPin, Navigation, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/i18n/I18nProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { cn } from "@/lib/utils";

export type Visibility = "public" | "friends" | "hidden";

interface LocationState {
  country: string;
  city: string;
  lat?: number;
  lng?: number;
  visibility: Visibility;
  updatedAt: number;
}

// Persisted location state shared across views.
const KEY = "engvoice.location.v1";

const defaults: LocationState = {
  country: "Sudan",
  city: "Port Sudan",
  visibility: "public",
  updatedAt: 0,
};

const read = (): LocationState => {
  if (typeof window === "undefined") return defaults;
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults;
  }
};

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en`
    );
    const j = await res.json();
    return {
      country: j.address?.country || "",
      city: j.address?.city || j.address?.town || j.address?.village || j.address?.state || "",
    };
  } catch {
    return { country: "", city: "" };
  }
};

interface Props {
  onLocationChange?: (loc: { country: string; city: string; visibility: Visibility }) => void;
}

export const ProfileGpsDropdown = ({ onLocationChange }: Props) => {
  const { lang } = useI18n();
  const { completeMission } = useOnboarding();
  const [loc, setLoc] = useState<LocationState>(read);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(loc));
    onLocationChange?.({ country: loc.country, city: loc.city, visibility: loc.visibility });
  }, [loc, onLocationChange]);

  const detect = () => {
    if (!navigator.geolocation) {
      toast.error(lang === "ar" ? "GPS غير متاح" : "GPS unavailable");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { country, city } = await reverseGeocode(coords.latitude, coords.longitude);
        setLoc((p) => ({ ...p, country, city, lat: coords.latitude, lng: coords.longitude, updatedAt: Date.now() }));
        completeMission("location");
        toast.success(lang === "ar" ? "تم تحديث موقعك" : "Location updated");
        setBusy(false);
      },
      () => {
        toast.error(lang === "ar" ? "تعذّر الوصول للموقع" : "Couldn't access location");
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const setVisibility = (v: Visibility) => {
    setLoc((p) => ({ ...p, visibility: v }));
    completeMission("location");
  };

  const options: { id: Visibility; ar: string; en: string; Icon: typeof Globe; tone: string }[] = [
    { id: "public", ar: "عام (الجميع يرى)", en: "Public (everyone)", Icon: Globe, tone: "text-gold" },
    { id: "friends", ar: "الأصدقاء فقط", en: "Friends only", Icon: Users, tone: "text-white" },
    { id: "hidden", ar: "مخفي تماماً", en: "Fully hidden", Icon: EyeOff, tone: "text-white" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="GPS visibility"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-slate-950/70 text-gold shadow-gold transition-spring hover:scale-105"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/30 opacity-60" />
          <MapPin className="relative h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-72 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 text-white shadow-elegant backdrop-blur"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            {lang === "ar" ? "خصوصية الموقع" : "Location visibility"}
          </p>
          <button
            onClick={detect}
            disabled={busy}
            className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-gold-foreground disabled:opacity-60"
          >
            <Navigation className={cn("h-3 w-3", busy && "animate-spin")} />
            {busy ? (lang === "ar" ? "..." : "...") : (lang === "ar" ? "تحديد" : "Detect")}
          </button>
        </div>
        <ul className="space-y-1">
          {options.map(({ id, ar, en, Icon, tone }) => {
            const active = loc.visibility === id;
            return (
              <li key={id}>
                <button
                  onClick={() => setVisibility(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-start text-sm font-semibold transition-smooth",
                    active
                      ? "border-gold/60 bg-gold/10 text-white"
                      : "border-slate-800 bg-slate-900/60 text-white/80 hover:border-gold/30 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4", tone)} />
                  <span className="flex-1">{lang === "ar" ? ar : en}</span>
                  {active && <Check className="h-4 w-4 text-gold" />}
                </button>
              </li>
            );
          })}
        </ul>
        {loc.visibility === "hidden" && (
          <p className="mt-2 flex items-center gap-1 text-[10px] text-white/60">
            <Eye className="h-3 w-3" /> {lang === "ar" ? "موقعك مخفي تماماً" : "Your location is fully hidden"}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};
