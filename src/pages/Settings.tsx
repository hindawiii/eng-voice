import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Globe, Info, LogOut, Moon, Shield, UserCog,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Lang = "ar" | "en";

const Settings = () => {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [lang, setLang] = useState<Lang>(() =>
    typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "ar" : "en"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-gradient-hero px-5 pb-10 pt-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-white/25"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">
              {t("Account", "الحساب")}
            </p>
            <h1 className="text-2xl font-bold">{t("Settings", "الإعدادات")}</h1>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 -mt-6">
        {/* Account section */}
        <section className="overflow-hidden rounded-3xl bg-card shadow-elegant">
          <SettingsHeader label={t("Account", "الحساب")} />
          <SettingsRow
            icon={<UserCog className="h-5 w-5" />}
            title={t("Edit Profile", "تعديل الملف الشخصي")}
            subtitle={t("Name, avatar, languages", "الاسم، الصورة، اللغات")}
            onClick={() =>
              toast({ title: t("Edit Profile", "تعديل الملف الشخصي"), description: t("Coming soon", "قريباً") })
            }
          />
        </section>

        {/* Preferences */}
        <section className="overflow-hidden rounded-3xl bg-card shadow-soft">
          <SettingsHeader label={t("Preferences", "التفضيلات")} />

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Moon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{t("Dark Mode", "الوضع الليلي")}</p>
              <p className="text-xs text-muted-foreground">
                {t("Easier on the eyes at night", "أسهل على العين في الليل")}
              </p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>

          <Divider />

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-soft text-gold-foreground">
              <Globe className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{t("Language", "اللغة")}</p>
              <p className="text-xs text-muted-foreground">
                {t("Interface language", "لغة الواجهة")}
              </p>
            </div>
            <div className="flex rounded-full bg-secondary p-1">
              <LangPill active={lang === "en"} onClick={() => setLang("en")}>EN</LangPill>
              <LangPill active={lang === "ar"} onClick={() => setLang("ar")}>عربي</LangPill>
            </div>
          </div>
        </section>

        {/* Privacy & About */}
        <section className="overflow-hidden rounded-3xl bg-card shadow-soft">
          <SettingsHeader label={t("Support", "الدعم")} />
          <SettingsRow
            icon={<Shield className="h-5 w-5" />}
            title={t("Privacy and Safety", "الخصوصية والأمان")}
            subtitle={t("Blocked users, reports, data", "المحظورون، البلاغات، البيانات")}
            onClick={() =>
              toast({ title: t("Privacy and Safety", "الخصوصية والأمان"), description: t("Coming soon", "قريباً") })
            }
          />
          <Divider />
          <SettingsRow
            icon={<Info className="h-5 w-5" />}
            title={t("About the App", "حول التطبيق")}
            subtitle={t("LingVoice · v1.0.0", "حِوار · الإصدار ١٫٠٫٠")}
            onClick={() =>
              toast({
                title: t("LingVoice (حِوار)", "حِوار (LingVoice)"),
                description: t(
                  "A language exchange community built for connection.",
                  "مجتمع لتبادل اللغات صُمم للتواصل."
                ),
              })
            }
          />
        </section>

        {/* Logout */}
        <section className="overflow-hidden rounded-3xl bg-card shadow-soft">
          <button
            onClick={() =>
              toast({
                title: t("Logged out", "تم تسجيل الخروج"),
                description: t("See you soon!", "إلى اللقاء قريباً!"),
              })
            }
            className="flex w-full items-center gap-4 px-5 py-4 text-start transition-smooth hover:bg-destructive/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-destructive">{t("Log Out", "تسجيل الخروج")}</p>
              <p className="text-xs text-muted-foreground">
                {t("Sign out of this device", "تسجيل الخروج من هذا الجهاز")}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-destructive/70 rtl:rotate-180" />
          </button>
        </section>

        <p className="pb-4 text-center text-[11px] text-muted-foreground">
          حِوار · LingVoice © {new Date().getFullYear()}
        </p>
      </div>
    </AppShell>
  );
};

const SettingsHeader = ({ label }: { label: string }) => (
  <div className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
    {label}
  </div>
);

const Divider = () => <div className="mx-5 h-px bg-border" />;

interface RowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}
const SettingsRow = ({ icon, title, subtitle, onClick }: RowProps) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-4 px-5 py-4 text-start transition-smooth hover:bg-secondary/60"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-semibold">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
  </button>
);

const LangPill = ({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={cn(
      "rounded-full px-3 py-1 text-xs font-bold transition-smooth",
      active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
    )}
  >
    {children}
  </button>
);

export default Settings;
