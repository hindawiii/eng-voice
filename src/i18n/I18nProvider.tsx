import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

// Central translation dictionary. Keys are stable identifiers.
const DICT: Dict = {
  // Nav
  "nav.lounge": { en: "Rooms", ar: "غرف" },
  "nav.activity": { en: "Activity", ar: "النشاط" },
  "nav.play": { en: "Play", ar: "العب" },
  "nav.profile": { en: "Profile", ar: "الملف" },

  // Lounge
  "lounge.search": { en: "Search rooms, languages, topics…", ar: "ابحث عن غرف، لغات، مواضيع…" },
  "lounge.live": { en: "speakers practicing right now", ar: "متحدثاً يتدربون الآن" },
  "lounge.title": { en: "Rooms", ar: "غرف" },
  "lounge.subtitle": { en: "8 rooms · live", ar: "٨ غرف · مباشر" },
  "lounge.lp": { en: "LP", ar: "ن.ت" },

  // Activity
  "activity.title": { en: "Activity", ar: "النشاط" },
  "activity.subtitle": { en: "Verified facts wall & your notifications", ar: "حائط الحقائق الموثّقة وإشعاراتك" },
  "activity.notifications": { en: "Notifications", ar: "الإشعارات" },
  "activity.facts": { en: "Facts Wall", ar: "حائط الحقائق" },

  // Profile
  "profile.title": { en: "Profile", ar: "الملف الشخصي" },
  "profile.streak": { en: "day streak", ar: "يوم متتالٍ" },
  "profile.next": { en: "Next", ar: "التالي" },
  "profile.in": { en: "in", ar: "بعد" },
  "profile.xp": { en: "XP", ar: "خبرة" },
  "profile.lp": { en: "LP", ar: "ن.ت" },
  "profile.journey": { en: "Journey", ar: "الرحلة" },
  "profile.earnLp": { en: "Earn LP", ar: "اكسب نقاط التعلم" },
  "profile.watchAd": { en: "Watch a rewarded ad", ar: "شاهد إعلاناً مكافأ" },
  "profile.adSub": { en: "~30s · Earn 25 LP", ar: "~٣٠ ث · اكسب ٢٥ ن.ت" },
  "profile.goPro": { en: "Go Pro", ar: "اشترك Pro" },
  "profile.proPerks": { en: "Unlimited rooms · Gold badge · AI translation tools", ar: "غرف غير محدودة · شارة ذهبية · أدوات ترجمة ذكية" },
  "profile.upgrade": { en: "Upgrade — $2.99 / month", ar: "ترقية — ٢٫٩٩ $ / شهر" },

  // Room
  "room.live": { en: "Live Room", ar: "غرفة مباشرة" },
  "room.speakers": { en: "Speakers", ar: "المتحدثون" },
  "room.left": { en: "left", ar: "متبقٍ" },
  "room.listeners": { en: "Listeners", ar: "المستمعون" },
  "room.raise": { en: "Raise hand", ar: "ارفع يدك" },
  "room.invite": { en: "Invite", ar: "دعوة" },
  "room.silent": { en: "Silent Translation", ar: "الترجمة الصامتة" },
  "room.silentHint": { en: "Tap a phrase to translate it instantly without interrupting the speaker.", ar: "اضغط على عبارة لترجمتها فوراً دون مقاطعة المتحدث." },
  "room.challenge": { en: "30-second Challenge", ar: "تحدي ٣٠ ثانية" },
  "room.challengeHint": { en: "Send a tongue twister to a speaker — 50 LP if they nail it.", ar: "أرسل عبارة صعبة لمتحدث — ٥٠ ن.ت إن نجح." },
  "room.send": { en: "Send", ar: "إرسال" },
  "room.requestSeat": { en: "Request seat", ar: "اطلب مقعداً" },
  "room.tapSpeak": { en: "Tap to speak", ar: "اضغط للتحدث" },
  "room.topic": { en: "Topic", ar: "موضوع" },

  // Settings
  "settings.account": { en: "Account", ar: "الحساب" },
  "settings.title": { en: "Settings", ar: "الإعدادات" },
  "settings.editProfile": { en: "Edit Profile", ar: "تعديل الملف الشخصي" },
  "settings.editProfileSub": { en: "Name, avatar, languages", ar: "الاسم، الصورة، اللغات" },
  "settings.preferences": { en: "Preferences", ar: "التفضيلات" },
  "settings.dark": { en: "Dark Mode", ar: "الوضع الليلي" },
  "settings.darkSub": { en: "Easier on the eyes at night", ar: "أسهل على العين في الليل" },
  "settings.language": { en: "Language", ar: "اللغة" },
  "settings.languageSub": { en: "Interface language", ar: "لغة الواجهة" },
  "settings.support": { en: "Support", ar: "الدعم" },
  "settings.privacy": { en: "Privacy and Safety", ar: "الخصوصية والأمان" },
  "settings.privacySub": { en: "Blocked users, reports, data", ar: "المحظورون، البلاغات، البيانات" },
  "settings.about": { en: "About the App", ar: "حول التطبيق" },
  "settings.aboutSub": { en: "Engvoice · v1.0.0", ar: "Engvoice · الإصدار ١٫٠٫٠" },
  "settings.logout": { en: "Log Out", ar: "تسجيل الخروج" },
  "settings.logoutSub": { en: "Sign out of this device", ar: "تسجيل الخروج من هذا الجهاز" },
  "settings.comingSoon": { en: "Coming soon", ar: "قريباً" },
  "settings.loggedOut": { en: "Logged out", ar: "تم تسجيل الخروج" },
  "settings.seeYou": { en: "See you soon!", ar: "إلى اللقاء قريباً!" },
  "settings.aboutBody": { en: "A language exchange community built for connection.", ar: "مجتمع لتبادل اللغات صُمم للتواصل." },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT | string) => string;
  dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "engvoice.lang";

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem(STORAGE_KEY) as Lang) || "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: (key: string) => DICT[key]?.[lang] ?? key,
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};
