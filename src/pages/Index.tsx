import { Search, Sparkles, Coins } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RoomCard } from "@/components/RoomCard";
import { ROOMS } from "@/data/rooms";
import { useI18n } from "@/i18n/I18nProvider";

const Index = () => {
  const { t } = useI18n();
  return (
    <AppShell>
      {/* Header */}
      <header className="bg-gradient-hero px-6 pb-10 pt-12 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-arabic text-3xl font-black tracking-tight">حِوار</h1>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/70">LingVoice</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
            <Coins className="h-4 w-4 text-gold" />
            <span className="text-sm font-bold">1,240 {t("lounge.lp")}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-1 backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-foreground">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder={t("lounge.search")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-sm">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span className="text-primary-foreground/90">680 {t("lounge.live")}</span>
        </div>
      </header>

      {/* Rooms grid */}
      <section className="px-5 -mt-6">
        <div className="rounded-3xl bg-card p-4 shadow-elegant">
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 className="text-lg font-bold">{t("lounge.title")}</h2>
            <span className="text-xs text-muted-foreground">{t("lounge.subtitle")}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ROOMS.map((room) => (
              <RoomCard key={room.key} room={room} />
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
