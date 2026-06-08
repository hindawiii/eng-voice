import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, User, Palette, Bell, Shield, Volume2, Database, HelpCircle, LogOut,
  Eye, EyeOff, Phone, Camera, Moon, Languages, Type, Mic, Music, Trash2,
  Wifi, HardDrive, Bug, Star, FileText, Users, ChevronDown, AlertTriangle,
  CircleDot, Circle, EyeOff as Hidden, Loader2, Upload,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nProvider";

type SectionKey =
  | "account" | "appearance" | "notifications" | "privacy"
  | "audio" | "data" | "support" | "session";

const STORAGE = "lingvoice.settings.v2";

interface SettingsState {
  darkMode: boolean;
  fontSize: "sm" | "md" | "lg";
  notifyRooms: boolean;
  notifyLease: boolean;
  notifyEmail: boolean;
  presence: "online" | "offline" | "hidden";
  roomVolume: number;
  micQuality: "low" | "med" | "high";
  ambientMusic: boolean;
  dataSaver: "wifi" | "all";
}

const DEFAULT_STATE: SettingsState = {
  darkMode: true,
  fontSize: "md",
  notifyRooms: true,
  notifyLease: true,
  notifyEmail: false,
  presence: "online",
  roomVolume: 70,
  micQuality: "med",
  ambientMusic: false,
  dataSaver: "all",
};

const FONT_SCALE: Record<SettingsState["fontSize"], string> = {
  sm: "93.75%", md: "100%", lg: "112.5%",
};

const Settings = () => {
  const { lang, setLang } = useI18n();
  const isAr = lang === "ar";

  const [state, setState] = useState<SettingsState>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE) : null;
      return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
    } catch { return DEFAULT_STATE; }
  });
  const [open, setOpen] = useState<SectionKey | null>("account");

  const update = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SCALE[state.fontSize];
    return () => { document.documentElement.style.fontSize = ""; };
  }, [state.fontSize]);

  const tx = (en: string, ar: string) => (isAr ? ar : en);

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-gradient-hero px-5 pb-12 pt-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-smooth hover:bg-white/25"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">
              {tx("App Settings", "إعدادات التطبيق")}
            </p>
            <h1 className="text-2xl font-bold">{tx("Settings", "الإعدادات")}</h1>
          </div>
        </div>
      </header>

      <div className="space-y-3 px-4 -mt-7 pb-6">
        <Section
          k="account" openKey={open} setOpen={setOpen}
          icon={<User className="h-5 w-5" />}
          title={tx("Account Settings", "الحساب")}
          subtitle={tx("Profile, password, phone", "الملف، كلمة المرور، الهاتف")}
          tone="primary"
        >
          <AccountPanel tx={tx} />
        </Section>

        <Section
          k="appearance" openKey={open} setOpen={setOpen}
          icon={<Palette className="h-5 w-5" />}
          title={tx("Appearance", "المظهر")}
          subtitle={tx("Theme, language, font size", "السمة، اللغة، حجم الخط")}
          tone="gold"
        >
          <AppearancePanel
            tx={tx} state={state} update={update} lang={lang} setLang={setLang}
          />
        </Section>

        <Section
          k="notifications" openKey={open} setOpen={setOpen}
          icon={<Bell className="h-5 w-5" />}
          title={tx("Notifications", "الإشعارات")}
          subtitle={tx("Rooms, time loans, email", "الغرف، المنح، البريد")}
          tone="primary"
        >
          <NotificationsPanel tx={tx} state={state} update={update} />
        </Section>

        <Section
          k="privacy" openKey={open} setOpen={setOpen}
          icon={<Shield className="h-5 w-5" />}
          title={tx("Privacy & Security", "الخصوصية")}
          subtitle={tx("Presence, blocks, history", "الحالة، المحظورون، السجل")}
          tone="primary"
        >
          <PrivacyPanel tx={tx} state={state} update={update} />
        </Section>

        <Section
          k="audio" openKey={open} setOpen={setOpen}
          icon={<Volume2 className="h-5 w-5" />}
          title={tx("Audio & Voice Config", "الصوت")}
          subtitle={tx("Volume, mic, ambient", "المستوى، المايك، الخلفية")}
          tone="gold"
        >
          <AudioPanel tx={tx} state={state} update={update} />
        </Section>

        <Section
          k="data" openKey={open} setOpen={setOpen}
          icon={<Database className="h-5 w-5" />}
          title={tx("Data & Storage", "البيانات")}
          subtitle={tx("Cache, data saver", "الذاكرة، حفظ البيانات")}
          tone="primary"
        >
          <DataPanel tx={tx} state={state} update={update} />
        </Section>

        <Section
          k="support" openKey={open} setOpen={setOpen}
          icon={<HelpCircle className="h-5 w-5" />}
          title={tx("Support & Compliance", "الدعم / حول")}
          subtitle={tx("Help, bugs, legal", "المساعدة، البلاغات، القانون")}
          tone="primary"
        >
          <SupportPanel tx={tx} />
        </Section>

        <Section
          k="session" openKey={open} setOpen={setOpen}
          icon={<LogOut className="h-5 w-5" />}
          title={tx("Session Termination", "الخروج")}
          subtitle={tx("Logout or delete account", "تسجيل الخروج أو الحذف")}
          tone="danger"
        >
          <SessionPanel tx={tx} />
        </Section>

        <p className="pt-2 text-center text-[11px] text-muted-foreground">
          Engvoice © {new Date().getFullYear()} · v1.0.0
        </p>
      </div>
    </AppShell>
  );
};

/* ===================== Section Wrapper ===================== */

const TONE: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  gold: "bg-gold-soft text-gold-foreground",
  danger: "bg-destructive/10 text-destructive",
};

interface SectionProps {
  k: SectionKey;
  openKey: SectionKey | null;
  setOpen: (k: SectionKey | null) => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone?: keyof typeof TONE;
  children: React.ReactNode;
}
const Section = ({ k, openKey, setOpen, icon, title, subtitle, tone = "primary", children }: SectionProps) => {
  const isOpen = openKey === k;
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-soft backdrop-blur transition-smooth">
      <button
        onClick={() => setOpen(isOpen ? null : k)}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-start transition-smooth hover:bg-secondary/40"
      >
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", TONE[tone])}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-tight">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/50 px-4 py-4 space-y-4 animate-fade-in">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

const Row = ({
  icon, title, subtitle, action,
}: { icon: React.ReactNode; title: string; subtitle?: string; action: React.ReactNode }) => (
  <div className="flex items-center gap-3 rounded-xl bg-secondary/40 px-3 py-2.5">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold leading-tight">{title}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
    </div>
    <div className="shrink-0">{action}</div>
  </div>
);

const Segmented = <T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) => (
  <div className="inline-flex rounded-full bg-secondary p-1">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-bold transition-smooth",
          value === o.value ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/* ===================== Panels ===================== */

type TX = (en: string, ar: string) => string;

const PROFILE_KEY = "engvoice.profile.v1";

const AccountPanel = ({ tx }: { tx: TX }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const initial = (() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(PROFILE_KEY) : null;
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();
  const [name, setName] = useState<string>(initial?.name ?? "Yusuf");
  const [bio, setBio] = useState<string>(initial?.bio ?? "");
  const [preferred, setPreferred] = useState<"ar" | "en">(initial?.preferred ?? "ar");
  const [avatar, setAvatar] = useState<string | null>(initial?.avatar ?? null);
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [cf, setCf] = useState("");
  const [showCur, setShowCur] = useState(false); const [showNw, setShowNw] = useState(false); const [showCf, setShowCf] = useState(false);
  const [phone, setPhone] = useState<string>(initial?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(f);
  };

  const saveProfile = async () => {
    setSaving(true);
    const payload = { name, bio, preferred, avatar, phone, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
      // Cloud sync is wired through Lovable Cloud once enabled; persisted locally for now.
      toast({ title: tx("Profile saved", "تم حفظ الملف") });
    } catch {
      toast({ title: tx("Save failed", "فشل الحفظ"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 text-foreground dark:text-slate-100">
      {/* Edit Profile */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {tx("Edit Profile", "تعديل الملف الشخصي")}
        </p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-hero ring-2 ring-border">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary-foreground font-bold">
                  {name[0] ?? "?"}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft hover:scale-105 transition-smooth"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-xs text-foreground dark:text-slate-100">{tx("Name", "الاسم")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="text-foreground dark:text-slate-100" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-foreground dark:text-slate-100">{tx("Bio", "نبذة")}</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={2}
            className="text-foreground dark:text-slate-100" placeholder={tx("A few words about you…", "نبذة قصيرة…")} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-foreground dark:text-slate-100">{tx("Preferred Language", "اللغة المفضلة")}</Label>
          <Segmented
            value={preferred}
            onChange={(v) => setPreferred(v)}
            options={[{ value: "ar", label: "العربية" }, { value: "en", label: "English" }]}
          />
        </div>
        <Button size="sm" disabled={saving} onClick={saveProfile}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : tx("Save Profile", "حفظ الملف")}
        </Button>
      </div>

      {/* Change Password */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {tx("Change Password", "تغيير كلمة المرور")}
        </p>
        <PwField label={tx("Current password", "كلمة المرور الحالية")} val={cur} setVal={setCur} show={showCur} setShow={setShowCur} />
        <PwField label={tx("New password", "كلمة المرور الجديدة")} val={nw} setVal={setNw} show={showNw} setShow={setShowNw} />
        <PwField label={tx("Confirm new password", "تأكيد كلمة المرور")} val={cf} setVal={setCf} show={showCf} setShow={setShowCf} />
        <Button
          size="sm"
          onClick={() => {
            if (!cur || !nw || nw !== cf) {
              toast({ title: tx("Check inputs", "تحقق من الإدخال"), variant: "destructive" });
              return;
            }
            toast({ title: tx("Password updated", "تم تحديث كلمة المرور") });
            setCur(""); setNw(""); setCf("");
          }}
        >
          {tx("Update Password", "تحديث كلمة المرور")}
        </Button>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {tx("Phone Number", "رقم الهاتف")}
        </p>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <input
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 5x xxx xxxx"
              className="h-10 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Button
            size="sm"
            onClick={() => toast({ title: tx("Verification code sent", "تم إرسال رمز التحقق") })}
          >
            {tx("Verify", "تحقق")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PwField = ({
  label, val, setVal, show, setShow,
}: { label: string; val: string; setVal: (s: string) => void; show: boolean; setShow: (b: boolean) => void }) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <div className="relative">
      <Input type={show ? "text" : "password"} value={val} onChange={(e) => setVal(e.target.value)} className="pe-10" />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

const AppearancePanel = ({
  tx, state, update, lang, setLang,
}: { tx: TX; state: SettingsState; update: <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => void; lang: "ar" | "en"; setLang: (l: "ar" | "en") => void }) => (
  <>
    <Row
      icon={<Moon className="h-4 w-4" />}
      title={tx("Dark Mode", "الوضع الداكن")}
      subtitle={tx("Easier on the eyes at night", "أسهل على العين في الليل")}
      action={<Switch checked={state.darkMode} onCheckedChange={(v) => update("darkMode", v)} />}
    />
    <Row
      icon={<Languages className="h-4 w-4" />}
      title={tx("App Language", "لغة التطبيق")}
      subtitle={tx("Switches layout direction", "يبدّل اتجاه التخطيط")}
      action={
        <Segmented
          value={lang}
          onChange={(v) => setLang(v)}
          options={[{ value: "ar", label: "العربية" }, { value: "en", label: "English" }]}
        />
      }
    />
    <Row
      icon={<Type className="h-4 w-4" />}
      title={tx("Font Size", "حجم الخط")}
      subtitle={tx("Scales typography across the app", "يضبط أحجام النصوص")}
      action={
        <Segmented
          value={state.fontSize}
          onChange={(v) => update("fontSize", v)}
          options={[
            { value: "sm", label: tx("Sm", "صغير") },
            { value: "md", label: tx("Md", "متوسط") },
            { value: "lg", label: tx("Lg", "كبير") },
          ]}
        />
      }
    />
  </>
);

const NotificationsPanel = ({
  tx, state, update,
}: { tx: TX; state: SettingsState; update: <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => void }) => (
  <>
    <Row
      icon={<Bell className="h-4 w-4" />}
      title={tx("Room Alerts", "إشعارات الغرف")}
      subtitle={tx("Notify when favorite rooms go live", "نبّهني عندما تبدأ غرفي المفضلة")}
      action={<Switch checked={state.notifyRooms} onCheckedChange={(v) => update("notifyRooms", v)} />}
    />
    <Row
      icon={<Bell className="h-4 w-4" />}
      title={tx("Time Loan Alerts", "إشعارات المنح · سلفني وقت")}
      subtitle={tx("Friends sending or asking for time credits", "عند إرسال الأصدقاء وقتاً أو طلبه")}
      action={<Switch checked={state.notifyLease} onCheckedChange={(v) => update("notifyLease", v)} />}
    />
    <Row
      icon={<Bell className="h-4 w-4" />}
      title={tx("Email Updates", "إشعارات البريد")}
      subtitle={tx("Marketing & system newsletters", "تحديثات تسويقية ونشرات النظام")}
      action={<Switch checked={state.notifyEmail} onCheckedChange={(v) => update("notifyEmail", v)} />}
    />
  </>
);

const BLOCKED_SEED = [
  { id: "1", name: "Khaled M.", flag: "🇸🇦" },
  { id: "2", name: "Sara A.", flag: "🇪🇬" },
  { id: "3", name: "John D.", flag: "🇺🇸" },
];

const PrivacyPanel = ({
  tx, state, update,
}: { tx: TX; state: SettingsState; update: <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => void }) => {
  const [blocked, setBlocked] = useState(BLOCKED_SEED);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showWipe, setShowWipe] = useState(false);

  const presence = [
    { value: "online" as const, label: tx("Online", "متصل"), icon: <CircleDot className="h-3 w-3" />, color: "text-emerald-500" },
    { value: "offline" as const, label: tx("Offline", "غير متصل"), icon: <Circle className="h-3 w-3" />, color: "text-muted-foreground" },
    { value: "hidden" as const, label: tx("Hidden", "مخفي"), icon: <Hidden className="h-3 w-3" />, color: "text-amber-500" },
  ];

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {tx("Connection Status", "الحالة")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {presence.map((p) => {
            const active = state.presence === p.value;
            return (
              <button
                key={p.value}
                onClick={() => update("presence", p.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition-smooth",
                  active ? "border-primary bg-primary-soft" : "border-border bg-secondary/40 hover:bg-secondary"
                )}
              >
                <span className={p.color}>{p.icon}</span>
                <span className="text-xs font-semibold">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Row
        icon={<Users className="h-4 w-4" />}
        title={tx("Blocked List", "قائمة المحظورين")}
        subtitle={`${blocked.length} ${tx("users", "مستخدم")}`}
        action={
          <Button size="sm" variant="outline" onClick={() => setShowBlocked(true)}>
            {tx("Manage", "إدارة")}
          </Button>
        }
      />

      <Row
        icon={<Trash2 className="h-4 w-4" />}
        title={tx("Wipe Chat History", "حذف سجل المحادثات")}
        subtitle={tx("Clears all messages and room text", "يحذف كل الرسائل والنصوص")}
        action={
          <Button size="sm" variant="destructive" onClick={() => setShowWipe(true)}>
            {tx("Wipe", "حذف")}
          </Button>
        }
      />

      {/* Blocked dialog */}
      <Dialog open={showBlocked} onOpenChange={setShowBlocked}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("Blocked Users", "المحظورون")}</DialogTitle>
            <DialogDescription>
              {tx("Manage profiles you've blocked", "إدارة المستخدمين المحظورين")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {blocked.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {tx("No blocked users", "لا يوجد محظورون")}
              </p>
            )}
            {blocked.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground font-bold">
                  {u.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.flag}</p>
                </div>
                <Button
                  size="sm" variant="outline"
                  onClick={() => {
                    setBlocked((b) => b.filter((x) => x.id !== u.id));
                    toast({ title: tx("Unblocked", "تم إلغاء الحظر") });
                  }}
                >
                  {tx("Unban", "إلغاء الحظر")}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Wipe dialog */}
      <Dialog open={showWipe} onOpenChange={setShowWipe}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {tx("Wipe Chat History?", "حذف سجل المحادثات؟")}
            </DialogTitle>
            <DialogDescription>
              {tx("This permanently removes all messages and room text records on this device.",
                  "سيؤدي ذلك إلى حذف جميع الرسائل والنصوص نهائياً من هذا الجهاز.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWipe(false)}>
              {tx("Cancel", "إلغاء")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowWipe(false);
                toast({ title: tx("Chat history wiped", "تم حذف سجل المحادثات") });
              }}
            >
              {tx("Confirm Wipe", "تأكيد الحذف")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AudioPanel = ({
  tx, state, update,
}: { tx: TX; state: SettingsState; update: <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => void }) => (
  <>
    <div className="rounded-xl bg-secondary/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold flex-1">{tx("Room Volume", "مستوى الصوت")}</p>
        <span className="text-xs font-bold tabular-nums text-muted-foreground">{state.roomVolume}%</span>
      </div>
      <Slider
        value={[state.roomVolume]} min={0} max={100} step={1}
        onValueChange={(v) => update("roomVolume", v[0])}
      />
    </div>

    <Row
      icon={<Mic className="h-4 w-4" />}
      title={tx("Microphone Quality", "جودة المايك")}
      subtitle={tx("Lower bitrate helps weak networks", "البتريت المنخفض للشبكات الضعيفة")}
      action={
        <Segmented
          value={state.micQuality}
          onChange={(v) => update("micQuality", v)}
          options={[
            { value: "high", label: tx("Hi", "عالية") },
            { value: "med", label: tx("Med", "متوسطة") },
            { value: "low", label: tx("Lo", "منخفضة") },
          ]}
        />
      }
    />

    <Row
      icon={<Music className="h-4 w-4" />}
      title={tx("Ambient Background Music", "موسيقى خلفية")}
      subtitle={tx("Soft instrumental during silences", "موسيقى هادئة أثناء الصمت")}
      action={<Switch checked={state.ambientMusic} onCheckedChange={(v) => update("ambientMusic", v)} />}
    />
  </>
);

const DataPanel = ({
  tx, state, update,
}: { tx: TX; state: SettingsState; update: <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => void }) => {
  const [clearing, setClearing] = useState(false);
  const [cacheMb, setCacheMb] = useState(184);

  const clear = async () => {
    setClearing(true);
    await new Promise((r) => setTimeout(r, 800));
    setCacheMb(0);
    setClearing(false);
    toast({ title: tx("Cache cleared", "تم مسح الذاكرة المؤقتة") });
  };

  return (
    <>
      <div className="rounded-xl bg-secondary/40 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-primary">
            <HardDrive className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{tx("Storage Tracker", "استخدام التخزين")}</p>
            <p className="text-xs text-muted-foreground">
              {cacheMb} MB · {tx("cached audio & images", "صوت وصور مخزّنة")}
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={clearing || cacheMb === 0} onClick={clear}>
            {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : tx("Clear Cache", "مسح الذاكرة")}
          </Button>
        </div>
      </div>

      <Row
        icon={<Wifi className="h-4 w-4" />}
        title={tx("Network Data Saver", "استخدام البيانات")}
        subtitle={tx("Choose how audio syncs", "اختر طريقة مزامنة الصوت")}
        action={
          <Segmented
            value={state.dataSaver}
            onChange={(v) => update("dataSaver", v)}
            options={[
              { value: "wifi", label: tx("Wi-Fi", "واي فاي") },
              { value: "all", label: tx("All", "الكل") },
            ]}
          />
        }
      />
    </>
  );
};

const TEAM = [
  { name: "Yusuf", role: tx0("Founder", "المؤسس") },
  { name: "Layla", role: tx0("Design Lead", "قيادة التصميم") },
  { name: "Omar", role: tx0("Engineering", "الهندسة") },
  { name: "Hana", role: tx0("Community", "المجتمع") },
];
function tx0(en: string, ar: string) { return { en, ar }; }

const SupportPanel = ({ tx }: { tx: TX }) => {
  const [bugOpen, setBugOpen] = useState(false);
  const [bugText, setBugText] = useState("");
  const [bugFile, setBugFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Row
        icon={<HelpCircle className="h-4 w-4" />}
        title={tx("Help Center", "مركز المساعدة")}
        subtitle={tx("FAQs and user manuals", "الأسئلة الشائعة والأدلة")}
        action={
          <Button size="sm" variant="outline" onClick={() => toast({ title: tx("Opening Help", "فتح المساعدة") })}>
            {tx("Open", "فتح")}
          </Button>
        }
      />

      <Row
        icon={<Bug className="h-4 w-4" />}
        title={tx("Bug Reporter", "الإبلاغ عن مشكلة")}
        subtitle={tx("Send a description and screenshot", "أرسل وصفاً ولقطة شاشة")}
        action={
          <Button size="sm" variant="outline" onClick={() => setBugOpen(true)}>
            {tx("Report", "إبلاغ")}
          </Button>
        }
      />

      <Row
        icon={<Star className="h-4 w-4" />}
        title={tx("Rate the App", "تقييم التطبيق")}
        subtitle={tx("Google Play / App Store", "متجر جوجل / آبل")}
        action={
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Google Play" })}>Play</Button>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "App Store" })}>iOS</Button>
          </div>
        }
      />

      {/* Legal */}
      <div className="space-y-2 rounded-xl bg-secondary/40 p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {tx("Legal & Corporate", "القانوني والمؤسسي")}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <LegalLink icon={<FileText className="h-3.5 w-3.5" />} label={tx("About", "حول التطبيق")} note="v1.0.0"
            body={tx(
              "Engvoice is a premium voice-first language exchange community built to connect learners worldwide through live rooms, AI translation, tutor sessions and gamified learning. Version 1.0.0.",
              "Engvoice مجتمع متميّز لتبادل اللغات صوتياً، يربط المتعلمين حول العالم عبر غرف مباشرة، ترجمة ذكية، جلسات مرشدين، وتعلّم تفاعلي. الإصدار ١٫٠٫٠."
            )} />
          <LegalLink icon={<Shield className="h-3.5 w-3.5" />} label={tx("Privacy Policy", "سياسة الخصوصية")}
            body={tx(
              "We respect your privacy. Engvoice stores your profile and learning data securely and never sells personal information. Voice sessions are processed only to enable conversation; transcripts may be cached on-device for translation. You can wipe your data at any time from Settings → Wipe Chat History.",
              "نحترم خصوصيتك. يحفظ Engvoice ملفك الشخصي وبيانات التعلّم بشكل آمن ولا يبيع أي معلومات شخصية. تُعالَج جلسات الصوت فقط لتمكين المحادثة، وقد تُخزَّن النصوص محلياً للترجمة. يمكنك حذف بياناتك في أي وقت من الإعدادات → حذف سجل المحادثات."
            )} />
          <LegalLink icon={<FileText className="h-3.5 w-3.5" />} label={tx("Terms of Service", "شروط الاستخدام")}
            body={tx(
              "By using Engvoice you agree to interact respectfully, avoid hate speech, harassment or illegal content, and respect copyright. Voice rooms may be moderated; violating community rules can result in suspension. Engvoice is provided as-is without warranty.",
              "باستخدامك Engvoice فإنك توافق على التعامل باحترام، وتجنّب خطاب الكراهية، التحرش، أو المحتوى غير القانوني، واحترام حقوق النشر. قد تخضع الغرف للإشراف، وانتهاك قواعد المجتمع قد يؤدي إلى الإيقاف. يُقدَّم Engvoice كما هو دون أي ضمان."
            )} />
          <LegalLink icon={<Users className="h-3.5 w-3.5" />} label={tx("Credits", "الفريق")}
            body={tx(
              "Engvoice is crafted by a small team passionate about languages and human connection. Special thanks to our beta community, native-speaker tutors, and open-source contributors.",
              "صُمّم Engvoice على يد فريق صغير شغوف باللغات والتواصل الإنساني. شكر خاص لمجتمعنا التجريبي، المرشدين الناطقين الأصليين، والمساهمين في المصادر المفتوحة."
            )} />
        </div>

        <div className="pt-2">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {tx("Core Team", "فريق العمل")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TEAM.map((m) => (
              <div key={m.name} className="rounded-lg bg-background p-2 text-center">
                <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground text-sm font-bold">
                  {m.name[0]}
                </div>
                <p className="text-[11px] font-semibold leading-tight">{m.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{tx(m.role.en, m.role.ar)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={bugOpen} onOpenChange={setBugOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("Report a Bug", "الإبلاغ عن مشكلة")}</DialogTitle>
            <DialogDescription>
              {tx("Describe what happened — screenshots help.", "صف ما حدث — اللقطات تساعد كثيراً.")}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={bugText} onChange={(e) => setBugText(e.target.value)}
            placeholder={tx("What went wrong?", "ما الذي حدث؟")} rows={5} maxLength={1000}
          />
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" hidden
                   onChange={(e) => setBugFile(e.target.files?.[0] ?? null)} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {tx("Attach", "إرفاق")}
            </Button>
            {bugFile && <span className="text-xs text-muted-foreground truncate">{bugFile.name}</span>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBugOpen(false)}>{tx("Cancel", "إلغاء")}</Button>
            <Button
              disabled={!bugText.trim()}
              onClick={() => {
                setBugOpen(false); setBugText(""); setBugFile(null);
                toast({ title: tx("Bug report sent", "تم إرسال البلاغ") });
              }}
            >
              {tx("Send", "إرسال")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const LegalLink = ({ icon, label, note }: { icon: React.ReactNode; label: string; note?: string }) => (
  <button
    onClick={() => toast({ title: label })}
    className="flex items-center gap-2 rounded-lg bg-background px-2 py-2 text-start transition-smooth hover:bg-primary-soft"
  >
    <span className="text-primary">{icon}</span>
    <span className="flex-1 truncate font-semibold">{label}</span>
    {note && <span className="text-[10px] text-muted-foreground">{note}</span>}
  </button>
);

const SessionPanel = ({ tx }: { tx: TX }) => {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delEmail, setDelEmail] = useState("");
  const [delConfirm, setDelConfirm] = useState("");
  const expected = "DELETE";

  return (
    <>
      <Row
        icon={<LogOut className="h-4 w-4" />}
        title={tx("Secure Logout", "تسجيل الخروج")}
        subtitle={tx("Sign out of this device", "تسجيل الخروج من هذا الجهاز")}
        action={<Button size="sm" variant="outline" onClick={() => setLogoutOpen(true)}>{tx("Logout", "خروج")}</Button>}
      />

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-destructive">{tx("Delete Account", "حذف الحساب")}</p>
            <p className="text-[11px] text-destructive/80">
              {tx("Permanently wipes your profile and data.", "حذف نهائي لملفك وبياناتك.")}
            </p>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setDelOpen(true)}>
            {tx("Delete", "حذف")}
          </Button>
        </div>
      </div>

      {/* Logout dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("Log out?", "تسجيل الخروج؟")}</DialogTitle>
            <DialogDescription>
              {tx("You can sign back in any time.", "يمكنك العودة في أي وقت.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>{tx("Cancel", "إلغاء")}</Button>
            <Button
              onClick={() => {
                setLogoutOpen(false);
                toast({ title: tx("Logged out", "تم تسجيل الخروج") });
              }}
            >
              {tx("Confirm", "تأكيد")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {tx("Delete account permanently?", "حذف الحساب نهائياً؟")}
            </DialogTitle>
            <DialogDescription>
              {tx("This action cannot be undone. Please confirm twice.",
                  "لا يمكن التراجع عن هذا الإجراء. الرجاء التأكيد مرتين.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">{tx("Your email", "بريدك الإلكتروني")}</Label>
            <Input value={delEmail} onChange={(e) => setDelEmail(e.target.value)} placeholder="you@example.com" />
            <Label className="text-xs">
              {tx('Type "DELETE" to confirm', 'اكتب "DELETE" للتأكيد')}
            </Label>
            <Input value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>{tx("Cancel", "إلغاء")}</Button>
            <Button
              variant="destructive"
              disabled={!delEmail.includes("@") || delConfirm !== expected}
              onClick={() => {
                setDelOpen(false); setDelEmail(""); setDelConfirm("");
                toast({ title: tx("Account deletion scheduled", "تم جدولة حذف الحساب"), variant: "destructive" });
              }}
            >
              {tx("Delete Forever", "حذف نهائي")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;
