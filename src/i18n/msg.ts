import { useI18n, Lang } from "@/i18n/I18nProvider";

type Pair = { ar: string; en: string };

export const MSG = {
  title: { ar: "الرسائل", en: "Messages" },
  searchInbox: { ar: "ابحث بالاسم أو @المعرّف", en: "Search by name or @handle" },
  searchChat: { ar: "ابحث في المحادثة…", en: "Search in conversation…" },
  noThreads: { ar: "لا توجد محادثات مطابقة.", en: "No matching conversations." },
  folderAll: { ar: "الكل", en: "All" },
  folderFriends: { ar: "الأصدقاء", en: "Friends" },
  folderRooms: { ar: "الغرف المشترك بها", en: "Joined rooms" },

  saved: { ar: "الرسائل المحفوظة", en: "Saved Messages" },
  savedFull: { ar: "الرسائل المحفوظة الشخصية", en: "Your Saved Messages" },
  savedPreview: { ar: "احفظ كلماتك ومقاطعك الصوتية هنا", en: "Save your words and voice notes here" },
  savedIntro: {
    ar: "📌 مساحة شخصية — أرسل هنا الكلمات، العبارات، والمقاطع الصوتية لتراجعها لاحقاً.",
    en: "📌 Personal space — send words, phrases and voice notes here to review later.",
  },
  now: { ar: "الآن", en: "now" },
  yesterday: { ar: "أمس", en: "Yesterday" },
  min10: { ar: "منذ ١٠ د", en: "10 min ago" },
  hour1: { ar: "منذ ساعة", en: "1 hour ago" },
  roomEnglish: { ar: "غرفة English Café", en: "English Café Room" },
  roomFrench: { ar: "غرفة Français Élite", en: "Français Élite Room" },
  seedFine: { ar: "أنا بخير، شكراً!", en: "I'm fine, thanks!" },
  seedRoomWelcome: { ar: "أهلاً بكم في غرفة الممارسة اليومية.", en: "Welcome to the daily practice room." },
  seedRoomTopic: { ar: "أحمد: النقاش الليلة عن السفر ✈️", en: "Ahmed: tonight's topic is travel ✈️" },

  // status
  blockedUser: { ar: "المستخدم محظور", en: "User blocked" },
  recordingNow: { ar: "جاري تسجيل رسالة صوتية... 🎙️", en: "Recording a voice message... 🎙️" },
  recordingNowShort: { ar: "جاري تسجيل رسالة صوتية… 🎙️", en: "Recording a voice message… 🎙️" },
  typingNow: { ar: "جاري الكتابة...", en: "Typing..." },
  onlineNow: { ar: "نشط الآن", en: "Active now" },
  lastSeen: { ar: "آخر ظهور", en: "Last seen" },
  soon: { ar: "قريباً", en: "recently" },

  // grammar hints
  gDoubleSpace: { ar: "تجنّب المسافات المزدوجة.", en: "Avoid double spaces." },
  gRepeated: { ar: "حروف مكررة قد تكون خطأً مطبعياً.", en: "Repeated letters may be a typo." },
  gCapital: { ar: "ابدأ الجملة بحرف كبير (Capital).", en: "Start the sentence with a capital letter." },
  gPunct: { ar: "أضف علامة ترقيم في النهاية.", en: "Add punctuation at the end." },
  gCapitalI: { ar: 'اكتب "I" بحرف كبير.', en: 'Write "I" in uppercase.' },

  // actions / labels
  reply: { ar: "رد", en: "Reply" },
  replyTo: { ar: "رد على", en: "Reply to" },
  you: { ar: "أنت", en: "You" },
  copyMsg: { ar: "نسخ الرسالة", en: "Copy message" },
  editMsg: { ar: "تعديل الرسالة", en: "Edit message" },
  translateMsg: { ar: "ترجمة الرسالة", en: "Translate message" },
  deleteMsg: { ar: "حذف الرسالة", en: "Delete message" },
  translate: { ar: "ترجمة", en: "Translate" },
  edited: { ar: "(معدّلة)", en: "(edited)" },
  editingPrefix: { ar: "تعديل: ", en: "Editing: " },
  replyPrefix: { ar: "رد على: ", en: "Replying to: " },
  send: { ar: "إرسال", en: "Send" },
  delete: { ar: "حذف", en: "Delete" },
  back: { ar: "رجوع", en: "Back" },
  search: { ar: "بحث", en: "Search" },
  call: { ar: "مكالمة", en: "Call" },
  profile: { ar: "الملف", en: "Profile" },
  viewProfile: { ar: "عرض الملف", en: "View profile" },
  image: { ar: "صورة", en: "Image" },
  video: { ar: "فيديو", en: "Video" },
  emoji: { ar: "إيموجي", en: "Emoji" },
  instantTranslate: { ar: "ترجمة فورية", en: "Instant translation" },
  voiceRecord: { ar: "تسجيل صوتي", en: "Voice note" },
  stop: { ar: "إيقاف", en: "Stop" },
  audioPreview: { ar: "معاينة الصوت — استمع قبل الإرسال", en: "Audio preview — listen before sending" },
  download: { ar: "تحميل المرفق", en: "Download attachment" },
  viewOnce: { ar: "عرض لمرة واحدة", en: "View once" },
  viewOnceBanner: { ar: "الوسائط التالية للعرض لمرة واحدة فقط", en: "Next media will be view-once only" },
  viewOnceOpen: { ar: "فتح لمرة واحدة", en: "Open once" },
  viewOnceBurned: { ar: "تم فتح الوسائط وتدميرها تلقائياً 🔒", en: "Media was opened and destroyed 🔒" },
  writeMsg: { ar: "اكتب رسالة…", en: "Type a message…" },
  writeNote: { ar: "اكتب ملاحظة شخصية…", en: "Write a personal note…" },
  photoMsg: { ar: "📷 صورة", en: "📷 Photo" },
  videoMsg: { ar: "🎬 فيديو", en: "🎬 Video" },
  voiceMsg: { ar: "🎙️ رسالة صوتية", en: "🎙️ Voice message" },

  // dialogs
  deleteScope: { ar: "اختر نطاق الحذف. لا يمكن التراجع.", en: "Choose delete scope. This cannot be undone." },
  deleteForMe: { ar: "حذف من طرفي فقط 🗑️", en: "Delete for me only 🗑️" },
  deleteForAll: { ar: "حذف من الجميع للطرفين 💥", en: "Delete for everyone 💥" },
  clearHistory: { ar: "مسح سجل المحادثة", en: "Clear chat history" },
  irreversible: { ar: "هذا الإجراء غير قابل للاسترجاع.", en: "This action is irreversible." },
  clearForMe: { ar: "مسح من طرفي فقط", en: "Clear for me only" },
  clearForAll: { ar: "مسح من الطرفين", en: "Clear for both sides" },

  // sidebar / row menu
  chatDetails: { ar: "تفاصيل المحادثة", en: "Chat details" },
  muteNotifs: { ar: "كتم الإشعارات", en: "Mute notifications" },
  on: { ar: "مفعل", en: "On" },
  off: { ar: "معطل", en: "Off" },
  block: { ar: "حظر المستخدم ⛔", en: "Block user ⛔" },
  unblock: { ar: "إلغاء الحظر", en: "Unblock" },
  pinTop: { ar: "تثبيت في الأعلى", en: "Pin to top" },
  mute: { ar: "عمل ميوت", en: "Mute" },
  unmute: { ar: "إلغاء الكتم", en: "Unmute" },
  archive: { ar: "أرشفة", en: "Archive" },
  close: { ar: "إغلاق", en: "Close" },
} satisfies Record<string, Pair>;

export type MsgKey = keyof typeof MSG;

export const tm = (lang: Lang, key: MsgKey) => MSG[key][lang];

export const useMsg = () => {
  const { lang, dir } = useI18n();
  return { lang, dir, tm: (key: MsgKey) => MSG[key][lang] };
};
