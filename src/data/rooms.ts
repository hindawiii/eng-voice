export type RoomKey =
  | "english" | "french" | "spanish" | "arabic-foreign"
  | "dialect-sudanese" | "dialect-egyptian" | "german" | "japanese";

export interface Room {
  key: RoomKey;
  name: string;
  nameAr: string;
  flag: string;
  liveUsers: number;
  speakers: number;
  topic: string;
  topicAr: string;
  pro?: boolean;
  accent: string; // tailwind gradient stops
}

export const ROOMS: Room[] = [
  { key: "english", name: "English Lounge", nameAr: "صالون الإنجليزية", flag: "🇬🇧", liveUsers: 142, speakers: 7, topic: "Tell us about a weird food you've tried", topicAr: "أخبرنا عن طعام غريب جربته", accent: "from-primary-soft to-[#2c5282]" },
  { key: "french", name: "Salon Français", nameAr: "صالون الفرنسية", flag: "🇫🇷", liveUsers: 88, speakers: 6, topic: "Describe your perfect Sunday morning", topicAr: "صف صباح الأحد المثالي", accent: "from-primary-soft to-[#3b4a8a]" },
  { key: "spanish", name: "Sala Española", nameAr: "صالون الإسبانية", flag: "🇪🇸", liveUsers: 67, speakers: 5, topic: "What song reminds you of childhood?", topicAr: "أي أغنية تذكرك بطفولتك؟", accent: "from-[#7a3b2e] to-gold" },
  { key: "arabic-foreign", name: "Arabic for Foreigners", nameAr: "العربية للناطقين بغيرها", flag: "🌍", liveUsers: 121, speakers: 8, topic: "تحدث عن طبق من بلدك", topicAr: "تحدث عن طبق من بلدك", accent: "from-primary-soft to-gold" },
  { key: "dialect-sudanese", name: "Sudanese Dialect", nameAr: "ركن اللهجة السودانية", flag: "🇸🇩", liveUsers: 54, speakers: 4, topic: "احكي عن أحلى مكان في بلدك", topicAr: "احكي عن أحلى مكان في بلدك", accent: "from-[#0a3d2e] to-gold" },
  { key: "dialect-egyptian", name: "Egyptian Dialect", nameAr: "ركن اللهجة المصرية", flag: "🇪🇬", liveUsers: 96, speakers: 6, topic: "إيه أكتر فيلم بتحبه ليه؟", topicAr: "إيه أكتر فيلم بتحبه ليه؟", accent: "from-primary-soft to-[#c9a227]" },
  { key: "german", name: "Deutsch Zimmer", nameAr: "صالون الألمانية", flag: "🇩🇪", liveUsers: 39, speakers: 3, topic: "A small habit that changed your life", topicAr: "عادة صغيرة غيّرت حياتك", pro: true, accent: "from-primary-soft to-surface-3" },
  { key: "japanese", name: "日本語ラウンジ", nameAr: "صالون اليابانية", flag: "🇯🇵", liveUsers: 73, speakers: 5, topic: "Your favorite city to walk in", topicAr: "مدينتك المفضلة للمشي", pro: true, accent: "from-[#7a1e2e] to-gold" },
];

export interface SeatUser {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  pro?: boolean;
  flag: string;
  speaking?: boolean;
}

export const LEVELS = [
  { id: 1, name: "Seed", nameAr: "بذرة", emoji: "🌱", min: 0 },
  { id: 2, name: "Nettle", nameAr: "نبتة", emoji: "🌿", min: 200 },
  { id: 3, name: "Tree", nameAr: "شجرة", emoji: "🌳", min: 800 },
  { id: 4, name: "Guide", nameAr: "مرشد", emoji: "🧭", min: 2000 },
  { id: 5, name: "Ambassador", nameAr: "سفير", emoji: "👑", min: 5000 },
] as const;

export const SAMPLE_SPEAKERS: SeatUser[] = [
  { id: "u1", name: "Layla", level: 5, pro: true, flag: "🇸🇦", speaking: true },
  { id: "u2", name: "Marco", level: 3, flag: "🇮🇹" },
  { id: "u3", name: "Aiko", level: 4, pro: true, flag: "🇯🇵" },
  { id: "u4", name: "Omar", level: 2, flag: "🇸🇩" },
  { id: "u5", name: "Sofia", level: 3, flag: "🇪🇸" },
  { id: "u6", name: "Yuki", level: 1, flag: "🇯🇵" },
  { id: "u7", name: "Hassan", level: 4, flag: "🇪🇬" },
];

export interface FactItem {
  id: string;
  user: string;
  flag: string;
  level: number;
  language: string;
  fact: string;
  translation?: string;
  upvotes: number;
}

export const FACTS: FactItem[] = [
  { id: "f1", user: "Layla", flag: "🇸🇦", level: 5, language: "Arabic", fact: "في اللهجة المصرية، 'إزيك' تعني 'كيف حالك'", translation: "In Egyptian dialect, 'Ezayak' means 'How are you'", upvotes: 142 },
  { id: "f2", user: "Marco", flag: "🇮🇹", level: 3, language: "English", fact: "'Break a leg' is a way to say 'good luck' in theater.", upvotes: 98 },
  { id: "f3", user: "Aiko", flag: "🇯🇵", level: 4, language: "Japanese", fact: "「お疲れ様」 is said to acknowledge someone's hard work.", translation: "'Otsukaresama' acknowledges someone's effort.", upvotes: 76 },
  { id: "f4", user: "Sofia", flag: "🇪🇸", level: 3, language: "Spanish", fact: "'Sobremesa' — the time spent chatting after a meal.", upvotes: 211 },
];
