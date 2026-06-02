export interface GameDef {
  id: string;
  en: string;
  ar: string;
  emoji: string;
  entry: number;
  prize: number;
  players: string;
  theme: string; // tailwind gradient classes
  desc: { en: string; ar: string };
  /** Hybrid board games where Linguistic/Casual toggle is meaningful */
  hybrid?: boolean;
}

export const GAMES: GameDef[] = [
  {
    id: "ludo-linguo",
    en: "Ludo Linguo",
    ar: "ليدو لغوي",
    emoji: "🎲",
    entry: 20,
    prize: 50,
    players: "2-4",
    theme: "from-red-500 to-amber-400",
    hybrid: true,
    desc: { en: "Roll dice after answering. Ladders read sentences, snakes repeat words.", ar: "أجب قبل رمي النرد. السلالم تقرأ جملاً والثعابين تكرر كلمات." },
  },
  {
    id: "snake-ladder",
    en: "Snake & Ladder",
    ar: "السلم والثعبان",
    emoji: "🐍",
    entry: 20,
    prize: 50,
    players: "2-4",
    theme: "from-emerald-500 to-amber-800",
    hybrid: true,
    desc: { en: "Translation on ladders, pronunciation on snakes.", ar: "ترجمة على السلالم، نطق على الثعابين." },
  },
  {
    id: "word-challenge",
    en: "Word Challenge",
    ar: "تحدي الكلمات",
    emoji: "⚡",
    entry: 15,
    prize: 40,
    players: "2-6",
    theme: "from-blue-500 to-sky-700",
    desc: { en: "Infinite rounds · 7s · pick the right translation fastest.", ar: "جولات لا نهائية · ٧ ثوان · اختر الترجمة الصحيحة أسرع." },
  },
  {
    id: "sentence-builder",
    en: "Sentence Builder",
    ar: "ترتيب الكلمات",
    emoji: "🧩",
    entry: 15,
    prize: 45,
    players: "1-4",
    theme: "from-purple-500 to-amber-400",
    desc: { en: "Drag tokens to build a perfect sentence in 30s.", ar: "اسحب الكلمات لبناء جملة صحيحة في ٣٠ ثانية." },
  },
  {
    id: "describe-guess",
    en: "Describe & Guess",
    ar: "تخمين الشيء",
    emoji: "🔮",
    entry: 10,
    prize: 35,
    players: "1",
    theme: "from-orange-500 to-zinc-900",
    desc: { en: "Listen to clues — guess before the helper card slides up.", ar: "استمع للوصف وخمّن قبل ظهور بطاقة المساعدة." },
  },
  {
    id: "translation-race",
    en: "Translation Race",
    ar: "سباق الترجمة",
    emoji: "🏁",
    entry: 20,
    prize: 60,
    players: "2-6",
    theme: "from-cyan-600 to-blue-900",
    desc: { en: "Infinite race — fastest wins each phrase.", ar: "سباق لا نهائي — الأسرع يفوز في كل عبارة." },
  },
  {
    id: "missing-dialogue",
    en: "Missing Dialogue",
    ar: "المحادثة المفقودة",
    emoji: "💬",
    entry: 10,
    prize: 30,
    players: "1",
    theme: "from-pink-500 to-rose-900",
    desc: { en: "Fill the missing line in a chat in 20s.", ar: "اختر السطر المفقود في محادثة خلال ٢٠ ثانية." },
  },
  {
    id: "quick-pronunciation",
    en: "Quick Pronunciation",
    ar: "النطق السريع",
    emoji: "🎤",
    entry: 10,
    prize: 35,
    players: "1",
    theme: "from-yellow-500 to-zinc-900",
    desc: { en: "Hear native audio, type or speak it back in 10s.", ar: "اسمع الصوت واكتبه أو انطقه في ١٠ ثوان." },
  },
  {
    id: "world-culture",
    en: "World Culture",
    ar: "ثقافات العالم",
    emoji: "🌍",
    entry: 10,
    prize: 30,
    players: "1",
    theme: "from-sky-600 to-emerald-700",
    desc: { en: "Trivia about idioms & customs. 10s + hint midway.", ar: "ثقافات وأمثال وعادات. ١٠ ثوان مع تلميح." },
  },
];

// ── Infinite question pool with topical categories ─────────────────────────
export type Topic = "random" | "travel" | "business" | "medical" | "everyday";

export interface WordPair {
  src: string;
  /** translation keyed by language code */
  translations: Record<string, string>;
  /** option pools keyed by language code */
  optionPool: Record<string, string[]>;
  topic: Exclude<Topic, "random">;
}

export const TOPICS: { id: Topic; en: string; ar: string; emoji: string }[] = [
  { id: "random", en: "Random Mix", ar: "أسئلة عشوائية", emoji: "🎲" },
  { id: "travel", en: "Travel", ar: "السفر", emoji: "✈️" },
  { id: "business", en: "Business", ar: "الأعمال", emoji: "💼" },
  { id: "medical", en: "Medical", ar: "طبي", emoji: "🩺" },
  { id: "everyday", en: "Everyday Phrases", ar: "حياة يومية", emoji: "🏠" },
];

export const LANGUAGES = [
  { code: "ar", en: "Arabic", ar: "العربية", flag: "🇸🇦" },
  { code: "en", en: "English", ar: "الإنجليزية", flag: "🇬🇧" },
  { code: "fr", en: "French", ar: "الفرنسية", flag: "🇫🇷" },
  { code: "es", en: "Spanish", ar: "الإسبانية", flag: "🇪🇸" },
  { code: "de", en: "German", ar: "الألمانية", flag: "🇩🇪" },
];

const PAIRS_RAW: WordPair[] = [
  // Everyday
  { src: "hello", topic: "everyday",
    translations: { ar: "مرحبا", fr: "bonjour", es: "hola", de: "hallo", en: "hello" },
    optionPool: { ar: ["مرحبا","وداعا","شكرا","نعم"], fr: ["bonjour","au revoir","merci","oui"], es: ["hola","adiós","gracias","sí"], de: ["hallo","tschüss","danke","ja"], en: ["hello","bye","thanks","yes"] } },
  { src: "water", topic: "everyday",
    translations: { ar: "ماء", fr: "eau", es: "agua", de: "wasser", en: "water" },
    optionPool: { ar: ["ماء","نار","هواء","تراب"], fr: ["eau","feu","air","terre"], es: ["agua","fuego","aire","tierra"], de: ["wasser","feuer","luft","erde"], en: ["water","fire","air","earth"] } },
  { src: "house", topic: "everyday",
    translations: { ar: "بيت", fr: "maison", es: "casa", de: "haus", en: "house" },
    optionPool: { ar: ["بيت","شارع","مدرسة","حديقة"], fr: ["maison","rue","école","jardin"], es: ["casa","calle","escuela","jardín"], de: ["haus","straße","schule","garten"], en: ["house","street","school","garden"] } },
  // Travel
  { src: "airport", topic: "travel",
    translations: { ar: "مطار", fr: "aéroport", es: "aeropuerto", de: "flughafen", en: "airport" },
    optionPool: { ar: ["مطار","فندق","ميناء","محطة"], fr: ["aéroport","hôtel","port","gare"], es: ["aeropuerto","hotel","puerto","estación"], de: ["flughafen","hotel","hafen","bahnhof"], en: ["airport","hotel","port","station"] } },
  { src: "passport", topic: "travel",
    translations: { ar: "جواز سفر", fr: "passeport", es: "pasaporte", de: "reisepass", en: "passport" },
    optionPool: { ar: ["جواز سفر","تذكرة","حقيبة","بطاقة"], fr: ["passeport","billet","valise","carte"], es: ["pasaporte","billete","maleta","tarjeta"], de: ["reisepass","ticket","koffer","karte"], en: ["passport","ticket","suitcase","card"] } },
  // Business
  { src: "meeting", topic: "business",
    translations: { ar: "اجتماع", fr: "réunion", es: "reunión", de: "besprechung", en: "meeting" },
    optionPool: { ar: ["اجتماع","تقرير","عقد","سوق"], fr: ["réunion","rapport","contrat","marché"], es: ["reunión","informe","contrato","mercado"], de: ["besprechung","bericht","vertrag","markt"], en: ["meeting","report","contract","market"] } },
  { src: "invoice", topic: "business",
    translations: { ar: "فاتورة", fr: "facture", es: "factura", de: "rechnung", en: "invoice" },
    optionPool: { ar: ["فاتورة","ميزانية","ربح","خسارة"], fr: ["facture","budget","profit","perte"], es: ["factura","presupuesto","ganancia","pérdida"], de: ["rechnung","budget","gewinn","verlust"], en: ["invoice","budget","profit","loss"] } },
  // Medical
  { src: "doctor", topic: "medical",
    translations: { ar: "طبيب", fr: "médecin", es: "médico", de: "arzt", en: "doctor" },
    optionPool: { ar: ["طبيب","ممرض","صيدلي","مريض"], fr: ["médecin","infirmier","pharmacien","patient"], es: ["médico","enfermero","farmacéutico","paciente"], de: ["arzt","krankenpfleger","apotheker","patient"], en: ["doctor","nurse","pharmacist","patient"] } },
  { src: "fever", topic: "medical",
    translations: { ar: "حُمّى", fr: "fièvre", es: "fiebre", de: "fieber", en: "fever" },
    optionPool: { ar: ["حُمّى","سعال","صداع","ألم"], fr: ["fièvre","toux","mal de tête","douleur"], es: ["fiebre","tos","dolor de cabeza","dolor"], de: ["fieber","husten","kopfschmerzen","schmerz"], en: ["fever","cough","headache","pain"] } },
];

export const getQuestionPool = (topic: Topic): WordPair[] =>
  topic === "random" ? PAIRS_RAW : PAIRS_RAW.filter((p) => p.topic === topic);
