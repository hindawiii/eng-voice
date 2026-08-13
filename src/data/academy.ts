export interface AcademyLang {
  key: string;
  labelAr: string;
  flag: string;
  bcp47: string;
  code: string; // ISO 2-letter for translation
  name: string;
}

export const ACADEMY_LANGS: AcademyLang[] = [
  { key: "tr", labelAr: "التركية", flag: "🇹🇷", bcp47: "tr-TR", code: "tr", name: "Türkçe" },
  { key: "ar", labelAr: "العربية", flag: "🇸🇦", bcp47: "ar-SA", code: "ar", name: "العربية" },
  { key: "es", labelAr: "الإسبانية", flag: "🇪🇸", bcp47: "es-ES", code: "es", name: "Español" },
  { key: "fr", labelAr: "الفرنسية", flag: "🇫🇷", bcp47: "fr-FR", code: "fr", name: "Français" },
  { key: "en", labelAr: "الإنجليزية (بريطانيا)", flag: "🇬🇧", bcp47: "en-GB", code: "en", name: "English (UK)" },
  { key: "de", labelAr: "الألمانية", flag: "🇩🇪", bcp47: "de-DE", code: "de", name: "Deutsch" },
  { key: "ja", labelAr: "اليابانية", flag: "🇯🇵", bcp47: "ja-JP", code: "ja", name: "日本語" },
  { key: "ko", labelAr: "الكورية", flag: "🇰🇷", bcp47: "ko-KR", code: "ko", name: "한국어" },
  { key: "zh", labelAr: "الصينية", flag: "🇨🇳", bcp47: "zh-CN", code: "zh", name: "中文" },
];

// Live online counts per corner (deterministic mock — replace with realtime later)
export const LANG_ONLINE: Record<string, number> = {
  all: 680, en: 142, fr: 88, es: 64, de: 45, ja: 32,
  ar: 120, ko: 28, zh: 56, tr: 38,
};

export interface VocabItem { text: string; ar: string }

export const LETTERS: Record<string, VocabItem[]> = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({ text: c, ar: c })),
  fr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({ text: c, ar: c })),
  es: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").map((c) => ({ text: c, ar: c })),
  ar: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("").map((c) => ({ text: c, ar: c })),
  de: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß".split("").map((c) => ({ text: c, ar: c })),
  zh: "一二三四五六七八九十百千万人大小上下中".split("").map((c) => ({ text: c, ar: c })),
  ja: "あいうえおかきくけこさしすせそたちつてとなにぬねの".split("").map((c) => ({ text: c, ar: c })),
};

export const VOCAB: Record<string, VocabItem[]> = {
  en: [
    { text: "Hello", ar: "مرحبا" }, { text: "Thank you", ar: "شكرا" }, { text: "Please", ar: "من فضلك" },
    { text: "Yes", ar: "نعم" }, { text: "No", ar: "لا" }, { text: "Water", ar: "ماء" },
    { text: "Food", ar: "طعام" }, { text: "Friend", ar: "صديق" }, { text: "Family", ar: "عائلة" },
    { text: "Book", ar: "كتاب" }, { text: "School", ar: "مدرسة" }, { text: "House", ar: "منزل" },
  ],
  fr: [
    { text: "Bonjour", ar: "مرحبا" }, { text: "Merci", ar: "شكرا" }, { text: "S'il vous plaît", ar: "من فضلك" },
    { text: "Oui", ar: "نعم" }, { text: "Non", ar: "لا" }, { text: "Eau", ar: "ماء" },
    { text: "Nourriture", ar: "طعام" }, { text: "Ami", ar: "صديق" }, { text: "Famille", ar: "عائلة" },
  ],
  es: [
    { text: "Hola", ar: "مرحبا" }, { text: "Gracias", ar: "شكرا" }, { text: "Por favor", ar: "من فضلك" },
    { text: "Sí", ar: "نعم" }, { text: "No", ar: "لا" }, { text: "Agua", ar: "ماء" },
    { text: "Comida", ar: "طعام" }, { text: "Amigo", ar: "صديق" }, { text: "Familia", ar: "عائلة" },
  ],
  ar: [
    { text: "مرحبا", ar: "تحية" }, { text: "شكرا", ar: "امتنان" }, { text: "ماء", ar: "سائل" },
    { text: "طعام", ar: "غذاء" }, { text: "كتاب", ar: "قراءة" }, { text: "صديق", ar: "رفيق" },
  ],
  de: [
    { text: "Hallo", ar: "مرحبا" }, { text: "Danke", ar: "شكرا" }, { text: "Bitte", ar: "من فضلك" },
    { text: "Ja", ar: "نعم" }, { text: "Nein", ar: "لا" }, { text: "Wasser", ar: "ماء" },
    { text: "Essen", ar: "طعام" }, { text: "Freund", ar: "صديق" }, { text: "Familie", ar: "عائلة" },
  ],
  zh: [
    { text: "你好", ar: "مرحبا" }, { text: "谢谢", ar: "شكرا" }, { text: "请", ar: "من فضلك" },
    { text: "是", ar: "نعم" }, { text: "不", ar: "لا" }, { text: "水", ar: "ماء" },
    { text: "食物", ar: "طعام" }, { text: "朋友", ar: "صديق" }, { text: "家庭", ar: "عائلة" },
  ],
  ja: [
    { text: "こんにちは", ar: "مرحبا" }, { text: "ありがとう", ar: "شكرا" }, { text: "お願いします", ar: "من فضلك" },
    { text: "はい", ar: "نعم" }, { text: "いいえ", ar: "لا" }, { text: "水", ar: "ماء" },
    { text: "食べ物", ar: "طعام" }, { text: "友達", ar: "صديق" }, { text: "家族", ar: "عائلة" },
  ],
};

export interface PhraseScenario { id: string; titleAr: string; phrases: Record<string, VocabItem[]> }

export const SCENARIOS: PhraseScenario[] = [
  {
    id: "market", titleAr: "جمل السوبرماركت والأسواق", phrases: {
      en: [
        { text: "How much does this cost?", ar: "كم سعر هذا؟" },
        { text: "Do you have a discount?", ar: "هل لديك خصم؟" },
        { text: "Where is the milk section?", ar: "أين قسم الحليب؟" },
      ],
      fr: [{ text: "Combien ça coûte ?", ar: "كم سعره؟" }, { text: "Avez-vous une réduction ?", ar: "هل لديك خصم؟" }],
      es: [{ text: "¿Cuánto cuesta esto?", ar: "كم سعره؟" }, { text: "¿Tiene descuento?", ar: "هل لديك خصم؟" }],
      ar: [{ text: "كم سعر هذا المنتج؟", ar: "—" }],
      de: [{ text: "Wie viel kostet das?", ar: "كم سعره؟" }],
      zh: [{ text: "这个多少钱？", ar: "كم سعره؟" }],
      ja: [{ text: "これはいくらですか？", ar: "كم سعره؟" }],
    },
  },
  {
    id: "airport", titleAr: "جمل المطار والطيران", phrases: {
      en: [
        { text: "Where is gate 12?", ar: "أين البوابة 12؟" },
        { text: "I'd like a window seat.", ar: "أريد مقعدًا بجانب النافذة." },
      ],
      fr: [{ text: "Où est la porte 12 ?", ar: "أين البوابة؟" }],
      es: [{ text: "¿Dónde está la puerta 12?", ar: "أين البوابة؟" }],
      ar: [{ text: "أين بوابة الصعود؟", ar: "—" }],
      de: [{ text: "Wo ist Gate 12?", ar: "أين البوابة؟" }],
      zh: [{ text: "12号登机口在哪里？", ar: "أين البوابة؟" }],
      ja: [{ text: "12番ゲートはどこですか？", ar: "أين البوابة؟" }],
    },
  },
  {
    id: "interview", titleAr: "جمل مقابلة العمل والشركات", phrases: {
      en: [
        { text: "Tell me about yourself.", ar: "حدثني عن نفسك." },
        { text: "What are your strengths?", ar: "ما نقاط قوتك؟" },
      ],
      fr: [{ text: "Parlez-moi de vous.", ar: "حدثني عن نفسك." }],
      es: [{ text: "Háblame de ti.", ar: "حدثني عن نفسك." }],
      ar: [{ text: "حدثني عن خبراتك.", ar: "—" }],
      de: [{ text: "Erzählen Sie mir von sich.", ar: "حدثني عن نفسك." }],
      zh: [{ text: "请介绍一下自己。", ar: "حدثني عن نفسك." }],
      ja: [{ text: "自己紹介をお願いします。", ar: "حدثني عن نفسك." }],
    },
  },
  {
    id: "hotel", titleAr: "جمل الفندق والحجوزات", phrases: {
      en: [
        { text: "I have a reservation.", ar: "لدي حجز." },
        { text: "What time is breakfast?", ar: "متى الإفطار؟" },
      ],
      fr: [{ text: "J'ai une réservation.", ar: "لدي حجز." }],
      es: [{ text: "Tengo una reserva.", ar: "لدي حجز." }],
      ar: [{ text: "لدي حجز باسمي.", ar: "—" }],
      de: [{ text: "Ich habe eine Reservierung.", ar: "لدي حجز." }],
      zh: [{ text: "我有预订。", ar: "لدي حجز." }],
      ja: [{ text: "予約があります。", ar: "لدي حجز." }],
    },
  },
  {
    id: "emergency", titleAr: "جمل الطوارئ والمستشفى", phrases: {
      en: [
        { text: "Call an ambulance!", ar: "اتصل بسيارة الإسعاف!" },
        { text: "I need a doctor.", ar: "أحتاج طبيبًا." },
      ],
      fr: [{ text: "Appelez une ambulance !", ar: "اتصل بالإسعاف!" }],
      es: [{ text: "¡Llame una ambulancia!", ar: "اتصل بالإسعاف!" }],
      ar: [{ text: "أحتاج إلى طبيب الآن.", ar: "—" }],
      de: [{ text: "Rufen Sie einen Krankenwagen!", ar: "اتصل بالإسعاف!" }],
      zh: [{ text: "请叫救护车！", ar: "اتصل بالإسعاف!" }],
      ja: [{ text: "救急車を呼んでください！", ar: "اتصل بالإسعاف!" }],
    },
  },
];

export interface GrammarRule { id: string; tier: "beginner" | "intermediate" | "advanced"; titleAr: string; explanation: string; example: string }

export const GRAMMAR: Record<string, GrammarRule[]> = {
  en: [
    { id: "g1", tier: "beginner", titleAr: "ضمائر الفاعل", explanation: "I, You, He, She, It, We, They — basic subject pronouns.", example: "I am a student." },
    { id: "g2", tier: "beginner", titleAr: "زمن المضارع البسيط", explanation: "Used for habits and facts.", example: "She works every day." },
    { id: "g3", tier: "intermediate", titleAr: "المضارع المستمر", explanation: "am/is/are + verb-ing for ongoing actions.", example: "They are studying now." },
    { id: "g4", tier: "intermediate", titleAr: "المضارع التام", explanation: "have/has + past participle.", example: "I have finished my work." },
    { id: "g5", tier: "advanced", titleAr: "الجمل الشرطية الثالثة", explanation: "If + past perfect, would have + past participle.", example: "If I had known, I would have helped." },
  ],
  fr: [
    { id: "g1", tier: "beginner", titleAr: "أدوات التعريف", explanation: "le, la, les, un, une, des.", example: "Le livre est sur la table." },
    { id: "g2", tier: "intermediate", titleAr: "الماضي المركب", explanation: "avoir/être + participe passé.", example: "J'ai mangé." },
    { id: "g3", tier: "advanced", titleAr: "الصيغة الشرطية", explanation: "Conditionnel passé.", example: "J'aurais aimé venir." },
  ],
  es: [
    { id: "g1", tier: "beginner", titleAr: "تصريف ser/estar", explanation: "Both mean 'to be'.", example: "Soy estudiante. Estoy cansado." },
    { id: "g2", tier: "intermediate", titleAr: "الماضي المطلق", explanation: "Pretérito indefinido.", example: "Comí pizza ayer." },
    { id: "g3", tier: "advanced", titleAr: "الصيغة الشرطية", explanation: "Subjuntivo.", example: "Espero que vengas." },
  ],
  ar: [
    { id: "g1", tier: "beginner", titleAr: "المبتدأ والخبر", explanation: "اسمان مرفوعان تتألف منهما الجملة الاسمية.", example: "الطالبُ مجتهدٌ." },
    { id: "g2", tier: "intermediate", titleAr: "كان وأخواتها", explanation: "ترفع الاسم وتنصب الخبر.", example: "كان الطالبُ مجتهدًا." },
    { id: "g3", tier: "advanced", titleAr: "إعراب الفعل المضارع", explanation: "يُرفع وينصب ويجزم بحسب العامل.", example: "لن يذهبَ. لم يذهبْ." },
  ],
  de: [
    { id: "g1", tier: "beginner", titleAr: "أدوات التعريف", explanation: "der, die, das.", example: "Der Mann ist hier." },
    { id: "g2", tier: "intermediate", titleAr: "حالة الـ Akkusativ", explanation: "للمفعول به المباشر.", example: "Ich sehe den Mann." },
    { id: "g3", tier: "advanced", titleAr: "الجملة الفرعية", explanation: "Nebensätze with verb at end.", example: "Ich weiß, dass er kommt." },
  ],
  zh: [
    { id: "g1", tier: "beginner", titleAr: "بنية الجملة الأساسية", explanation: "Subject + Verb + Object.", example: "我 吃 饭。" },
    { id: "g2", tier: "intermediate", titleAr: "الجسيم 了", explanation: "يدل على اكتمال الفعل.", example: "我吃了饭。" },
    { id: "g3", tier: "advanced", titleAr: "الجملة الـ 把", explanation: "يقدم المفعول قبل الفعل.", example: "我把书放在桌上。" },
  ],
  ja: [
    { id: "g1", tier: "beginner", titleAr: "الجسيمات は و が", explanation: "علامات الموضوع والفاعل.", example: "私は学生です。" },
    { id: "g2", tier: "intermediate", titleAr: "صيغة て", explanation: "تستخدم للربط والطلب.", example: "食べてください。" },
    { id: "g3", tier: "advanced", titleAr: "الصيغة المحترمة", explanation: "敬語 keigo.", example: "いらっしゃいませ。" },
  ],
};

export interface QuizQuestion { q: string; options: string[]; answer: number }
export const QUIZZES: Record<string, QuizQuestion[]> = {
  en: [
    { q: "Choose the correct: She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1 },
    { q: "Past tense of 'eat'?", options: ["eated", "ate", "eaten", "eats"], answer: 1 },
    { q: "Which is a pronoun?", options: ["run", "happy", "they", "quickly"], answer: 2 },
    { q: "I ___ been to Paris.", options: ["has", "have", "having", "had"], answer: 1 },
    { q: "Opposite of 'cold'?", options: ["wet", "hot", "soft", "loud"], answer: 1 },
  ],
  fr: [
    { q: "Conjugue: Je ___ (être)", options: ["es", "est", "suis", "sont"], answer: 2 },
    { q: "Article correct: ___ pomme", options: ["le", "la", "les", "un"], answer: 1 },
    { q: "Past of 'manger': J'ai ___", options: ["mangé", "manger", "mange", "mangerai"], answer: 0 },
  ],
  es: [
    { q: "Yo ___ estudiante.", options: ["es", "soy", "está", "eres"], answer: 1 },
    { q: "Past of comer: Yo ___", options: ["como", "comí", "comer", "comiendo"], answer: 1 },
  ],
  ar: [
    { q: "إعراب: جاءَ الطالبُ — كلمة الطالب:", options: ["مفعول به", "فاعل مرفوع", "مبتدأ", "خبر"], answer: 1 },
    { q: "كان وأخواتها ترفع:", options: ["الخبر", "الاسم", "الفعل", "الحرف"], answer: 1 },
  ],
  de: [
    { q: "Ich ___ Student.", options: ["bin", "bist", "ist", "sind"], answer: 0 },
    { q: "Akkusativ: Ich sehe ___ Mann.", options: ["der", "den", "dem", "des"], answer: 1 },
  ],
  zh: [
    { q: "你好 means?", options: ["شكرا", "مرحبا", "وداعا", "نعم"], answer: 1 },
    { q: "我 ___ 饭。 (already ate)", options: ["吃", "吃了", "吃过", "在吃"], answer: 1 },
  ],
  ja: [
    { q: "こんにちは means?", options: ["وداعا", "شكرا", "مرحبا", "آسف"], answer: 2 },
    { q: "Subject particle:", options: ["を", "に", "は", "で"], answer: 2 },
  ],
};

export interface TalkRoom { id: string; titleAr: string; level: "beginner" | "intermediate" | "advanced"; live: number }
export const generateTalkRooms = (langKey: string): TalkRoom[] => {
  const mk = (i: number, level: TalkRoom["level"], titleAr: string): TalkRoom => ({
    id: `${langKey}-${level}-${i}`, level, titleAr, live: 5 + ((i * 7 + langKey.length * 3) % 40),
  });
  return [
    mk(1, "beginner", "غرفة المحادثة للمبتدئين"),
    mk(2, "beginner", "ركن النطق الأول"),
    mk(3, "beginner", "كلمات يومية للمبتدئين"),
    mk(1, "intermediate", "حوار متوسط حر"),
    mk(2, "intermediate", "نقاش يومي عام"),
    mk(3, "intermediate", "تدريبات قواعد متوسطة"),
    mk(1, "advanced", "نقاشات معمقة"),
    mk(2, "advanced", "مناظرات للمتقدمين"),
  ];
};

// Infinite generator pool
const TEMPLATES: Record<string, { en: string; ar: string }[]> = {
  en: [
    { en: "Could you help me with this?", ar: "هل يمكنك مساعدتي في هذا؟" },
    { en: "I really enjoyed our conversation.", ar: "استمتعت حقًا بحديثنا." },
    { en: "What time does the store open?", ar: "متى يفتح المتجر؟" },
    { en: "I'd like to learn more about this topic.", ar: "أود أن أتعلم المزيد عن هذا الموضوع." },
    { en: "It's a beautiful day outside.", ar: "إنه يوم جميل في الخارج." },
    { en: "Can you repeat that, please?", ar: "هل يمكنك تكرار ذلك من فضلك؟" },
    { en: "I completely agree with you.", ar: "أتفق معك تمامًا." },
    { en: "Let me think about it.", ar: "دعني أفكر في الأمر." },
  ],
  fr: [
    { en: "Pouvez-vous m'aider ?", ar: "هل يمكنك مساعدتي؟" },
    { en: "Quelle belle journée !", ar: "يا له من يوم جميل!" },
    { en: "Je ne comprends pas.", ar: "لا أفهم." },
  ],
  es: [
    { en: "¿Puedes ayudarme?", ar: "هل يمكنك مساعدتي؟" },
    { en: "Me encanta este lugar.", ar: "أحب هذا المكان." },
  ],
  ar: [{ en: "هل يمكنك مساعدتي؟", ar: "طلب مساعدة" }, { en: "كيف حالك اليوم؟", ar: "سؤال عن الحال" }],
  de: [{ en: "Können Sie mir helfen?", ar: "هل يمكنك مساعدتي؟" }, { en: "Schönes Wetter heute!", ar: "طقس جميل اليوم!" }],
  zh: [{ en: "你能帮我吗？", ar: "هل يمكنك مساعدتي؟" }, { en: "今天天气真好。", ar: "الطقس جميل اليوم." }],
  ja: [{ en: "手伝ってくれますか？", ar: "هل يمكنك مساعدتي؟" }, { en: "今日はいい天気ですね。", ar: "طقس جميل اليوم." }],
};

export const generateRandomPhrase = (langKey: string): VocabItem => {
  const pool = TEMPLATES[langKey] || TEMPLATES.en;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { text: pick.en, ar: pick.ar };
};

// Fallback data for corners without dedicated content — mirror English until localized content lands
["tr", "ko"].forEach((k) => {
  if (!LETTERS[k]) LETTERS[k] = LETTERS.en;
  if (!VOCAB[k]) VOCAB[k] = VOCAB.en;
  if (!GRAMMAR[k]) GRAMMAR[k] = GRAMMAR.en;
  if (!QUIZZES[k]) QUIZZES[k] = QUIZZES.en;
  if (!TEMPLATES[k]) TEMPLATES[k] = TEMPLATES.en;
});
