import { Search, Sparkles, Coins, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { CreateRoomDialog } from "@/components/CreateRoomDialog";
import { useCustomRooms } from "@/data/customRooms";
import { useI18n } from "@/i18n/I18nProvider";
import { AcademyHub } from "@/components/academy/AcademyHub";

const Index = () => {
  const { t, lang } = useI18n();
  const customRooms = useCustomRooms().filter((r) => (r.status ?? "active") === "active");

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-gradient-hero px-6 pb-10 pt-12 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Engvoice</h1>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/70">{lang === "ar" ? "محادثات حية" : "Live voice rooms"}</p>
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

        <div className="mt-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span className="text-primary-foreground/90">680 {t("lounge.live")}</span>
          </div>
          <CreateRoomDialog />
        </div>
      </header>

      {/* Custom rooms */}
      {customRooms.length > 0 && (
        <section className="px-5 -mt-6">
          <div className="rounded-3xl bg-card p-4 shadow-elegant">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 className="text-lg font-bold">
                {lang === "ar" ? "غرفك المُنشأة" : "Your rooms"}
              </h2>
              <span className="text-xs text-muted-foreground">
                {customRooms.length} {lang === "ar" ? "غرفة" : "rooms"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {customRooms.map((r) => (
                <Link
                  key={r.key}
                  to={`/room/${r.key}`}
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-spring hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-2xl">
                        {r.flag}
                      </div>
                      <div>
                        <h3 className="font-bold leading-tight text-foreground">{r.language}</h3>
                        <p className="text-xs text-muted-foreground">
                          {lang === "ar" ? "أنشأتها أنت" : "Created by you"}
                        </p>
                      </div>
                    </div>
                    {r.isPrivate && (
                      <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-1 text-[10px] font-bold text-gold-foreground">
                        <Lock className="h-3 w-3" /> {lang === "ar" ? "خاصة" : "Private"}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{r.topic}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Public rooms */}
      <section className={customRooms.length > 0 ? "px-5 mt-5" : "px-5 -mt-6"}>
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
