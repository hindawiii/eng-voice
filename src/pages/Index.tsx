import { Search, Sparkles, Coins, Lock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { CreateRoomDialog } from "@/components/CreateRoomDialog";
import { useCustomRooms } from "@/data/customRooms";
import { useI18n } from "@/i18n/I18nProvider";
import { AcademyHub } from "@/components/academy/AcademyHub";

const FRIEND_ROOMS = [
  { key: "friend-1", friend: "سارة", friendEn: "Sara", avatar: "🌸", room: "دردشة الجمعة", roomEn: "Friday Chat", flag: "🇸🇦", live: 12 },
  { key: "friend-2", friend: "Ahmad", friendEn: "Ahmad", avatar: "⚡", room: "English Practice", roomEn: "English Practice", flag: "🇬🇧", live: 8 },
  { key: "friend-3", friend: "Yuki", friendEn: "Yuki", avatar: "🌙", room: "日本語 Café", roomEn: "Japanese Café", flag: "🇯🇵", live: 5 },
];

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

      {/* Your rooms + Active friends' rooms */}
      <section className="px-5 -mt-6 space-y-4">
        {customRooms.length > 0 && (
          <div className="rounded-3xl bg-card p-4 shadow-elegant">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 className="text-lg font-bold">
                {lang === "ar" ? "غرفك المُنشأة" : "Your rooms"}
              </h2>
              <span className="text-xs text-muted-foreground">
                {customRooms.length} {lang === "ar" ? "غرفة" : "rooms"}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
              {customRooms.map((r) => (
                <Link
                  key={r.key}
                  to={`/room/${r.key}`}
                  style={{ width: 160 }}
                  className="group relative shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-soft transition-spring hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-lg">
                      {r.flag}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-foreground">{r.language}</h3>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {lang === "ar" ? "أنشأتها أنت" : "By you"}
                      </p>
                    </div>
                    {r.isPrivate && <Lock className="h-3 w-3 text-gold" />}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] text-foreground/80 min-h-[28px]">{r.topic}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-card p-4 shadow-elegant">
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 className="text-lg font-bold">
              {lang === "ar" ? "غرف الأصدقاء النشطة" : "Active friends' rooms"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {FRIEND_ROOMS.length} {lang === "ar" ? "نشطة" : "live"}
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
            {FRIEND_ROOMS.map((f) => (
              <Link
                key={f.key}
                to={`/room/${f.key}`}
                style={{ width: 180 }}
                className="group relative shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-soft transition-spring hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-xl">
                    {f.avatar}
                    <span className="absolute -bottom-0.5 -right-0.5 text-sm">{f.flag}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-foreground">
                      {lang === "ar" ? f.room : f.roomEn}
                    </h3>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {lang === "ar" ? f.friend : f.friendEn}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="h-3 w-3" /> {f.live}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500">
                      {lang === "ar" ? "مباشر" : "LIVE"}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Academy Hub */}
      <section className="mt-5">
        <div className="rounded-3xl bg-[#070A13] pb-2 shadow-elegant">
          <AcademyHub />
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
