import { useEffect, useState } from "react";
import { Eye, EyeOff, Globe, MapPin, Navigation, Users } from "lucide-react";
import { toast } from "sonner";
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

const KEY = "lingvoice.location.v1";

const defaults: LocationState = {
  country: "",
  city: "",
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
  // Public reverse geocoder; falls back gracefully if blocked.
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

export const GpsLocationCard = () => {
  const { lang } = useI18n();
  const { completeMission } = useOnboarding();
  const [loc, setLoc] = useState<LocationState>(read);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(loc));
  }, [loc]);

  const detect = () => {
    if (!navigator.geolocation) {
      toast.error(lang === "ar" ? "GPS غير متاح" : "GPS unavailable");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { country, city } = await reverseGeocode(coords.latitude, coords.longitude);
        setLoc((prev) => ({
          ...prev,
          country,
          city,
          lat: coords.latitude,
          lng: coords.longitude,
          updatedAt: Date.now(),
        }));
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

  const visOptions: { id: Visibility; ar: string; en: string; Icon: typeof Globe }[] = [
    { id: "public", ar: "عام", en: "Public", Icon: Globe },
    { id: "friends", ar: "الأصدقاء", en: "Friends", Icon: Users },
    { id: "hidden", ar: "مخفي", en: "Hidden", Icon: EyeOff },
  ];

  const hasLoc = loc.country || loc.city;
  const display = hasLoc
    ? lang === "ar"
      ? `من: ${loc.country || "—"}${loc.city ? `، ${loc.city}` : ""}`
      : `From: ${loc.city ? `${loc.city}, ` : ""}${loc.country || "—"}`
    : lang === "ar"
      ? "حدّد موقعك لتظهر في الخريطة والغرف القريبة"
      : "Set your location to appear on the map & nearby rooms";

  return (
    <section className="rounded-3xl border border-gold/30 bg-[hsl(220_39%_11%)] p-5 shadow-elegant">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-500 text-gold-foreground shadow-gold">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
              {lang === "ar" ? "موقعك" : "GPS Location"}
            </p>
            <p className="text-sm font-bold text-white">{display}</p>
          </div>
        </div>
        <button
          onClick={detect}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-gold-foreground shadow-gold transition-spring hover:scale-105 disabled:opacity-60"
        >
          <Navigation className={cn("h-3.5 w-3.5", busy && "animate-spin")} />
          {busy
            ? lang === "ar" ? "جارٍ..." : "Detecting..."
            : hasLoc ? (lang === "ar" ? "تحديث" : "Refresh") : (lang === "ar" ? "تحديد" : "Detect")}
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/70">
          {lang === "ar" ? "خصوصية الموقع" : "Visibility"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {visOptions.map(({ id, ar, en, Icon }) => {
            const active = loc.visibility === id;
            return (
              <button
                key={id}
                onClick={() => setVisibility(id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-semibold transition-smooth",
                  active
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-border bg-card text-muted-foreground hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {lang === "ar" ? ar : en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hooks for Otaku Map & Nearby Rooms */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled
          className="rounded-xl border border-dashed border-border bg-card/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground"
          title="coming soon"
        >
          🗺️ {lang === "ar" ? "خريطة أوتاكو (قريباً)" : "Otaku Map (soon)"}
        </button>
        <button
          disabled
          className="rounded-xl border border-dashed border-border bg-card/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground"
          title="coming soon"
        >
          📍 {lang === "ar" ? "غرف قريبة (قريباً)" : "Nearby Rooms (soon)"}
        </button>
      </div>

      {loc.visibility === "hidden" && (
        <p className="mt-3 flex items-center gap-1 text-[11px] text-white/60">
          <Eye className="h-3 w-3" /> {lang === "ar" ? "موقعك مخفي تماماً" : "Your location is fully hidden"}
        </p>
      )}
    </section>
  );
};
