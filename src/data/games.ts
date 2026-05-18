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
    theme: "from-blue-500 to-sky-200",
    desc: { en: "10 rounds · 7s · pick the right translation fastest.", ar: "١٠ جولات · ٧ ثوان · اختر الترجمة الصحيحة أسرع." },
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
    theme: "from-cyan-500 to-white",
    desc: { en: "10 rounds, complex phrases, 7s each — fastest wins.", ar: "١٠ جولات لعبارات معقدة، ٧ ثوان — الأسرع يفوز." },
  },
  {
    id: "missing-dialogue",
    en: "Missing Dialogue",
    ar: "المحادثة المفقودة",
    emoji: "💬",
    entry: 10,
    prize: 30,
    players: "1",
    theme: "from-pink-500 to-white",
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
    theme: "from-yellow-400 to-zinc-900",
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
    theme: "from-sky-600 to-emerald-500",
    desc: { en: "Trivia about idioms & customs. 10s + hint midway.", ar: "ثقافات وأمثال وعادات. ١٠ ثوان مع تلميح." },
  },
];

// Sample Word Challenge data
export const WORD_PAIRS = [
  { src: "hello", correct: "مرحبا", options: ["مرحبا", "وداعا", "شكرا", "نعم"] },
  { src: "book", correct: "كتاب", options: ["قلم", "كتاب", "باب", "ماء"] },
  { src: "friend", correct: "صديق", options: ["عدو", "أخ", "صديق", "جار"] },
  { src: "water", correct: "ماء", options: ["ماء", "نار", "هواء", "تراب"] },
  { src: "house", correct: "بيت", options: ["شارع", "بيت", "مدرسة", "حديقة"] },
  { src: "sun", correct: "شمس", options: ["قمر", "نجم", "شمس", "سحاب"] },
  { src: "love", correct: "حب", options: ["حب", "كره", "خوف", "فرح"] },
  { src: "time", correct: "وقت", options: ["مكان", "وقت", "يوم", "ساعة"] },
  { src: "food", correct: "طعام", options: ["شراب", "طعام", "نوم", "عمل"] },
  { src: "language", correct: "لغة", options: ["كلمة", "حرف", "لغة", "صوت"] },
];
