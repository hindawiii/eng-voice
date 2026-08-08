import { Search, Sparkles, Coins } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CreateRoomDialog } from "@/components/CreateRoomDialog";
import { useCustomRooms } from "@/data/customRooms";
import { useI18n } from "@/i18n/I18nProvider";
import { AcademyHub } from "@/components/academy/AcademyHub";
import { RoomsQuickBar } from "@/components/RoomsQuickBar";


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

      {/* Merged compact rooms bar: your rooms | friends' rooms */}
      <section className="px-5 -mt-6">
        <RoomsQuickBar
          labels={{
            mine: lang === "ar" ? "غرفك" : "Your rooms",
            friends: lang === "ar" ? "غرف الأصدقاء" : "Friends",
            emptyMine: lang === "ar" ? "لا توجد غرفة" : "No room yet",
            emptyFriends: lang === "ar" ? "لا يوجد نشاط" : "No activity",
          }}
          mine={customRooms.map((r) => ({
            key: r.key,
            label: r.language,
            icon: r.flag,
            desc: r.topic,
            locked: r.isPrivate,
            live: r.liveUsers,
            owner: lang === "ar" ? "أنشأتها أنت" : "By you",
          }))}
          friends={FRIEND_ROOMS.map((f) => ({
            key: f.key,
            label: lang === "ar" ? f.room : f.roomEn,
            icon: f.avatar,
            flag: f.flag,
            live: f.live,
            owner: lang === "ar" ? f.friend : f.friendEn,
            desc: lang === "ar" ? "غرفة صوتية مباشرة" : "Live voice room",
          }))}
        />
      </section>



      {/* Academy Hub */}
      <section className="mt-5">
        <div className="rounded-3xl bg-background pb-2 shadow-elegant">
          <AcademyHub />
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
