import { useEffect, useState } from "react";

export type MissionId =
  | "profile"
  | "location"
  | "listen5"
  | "pronounce5"
  | "addWord"
  | "placement"
  | "tipRead"
  | "dailyQuestion"
  | "playGame"
  | "follow";

export const MISSION_IDS: MissionId[] = [
  "profile",
  "location",
  "listen5",
  "pronounce5",
  "addWord",
  "placement",
  "tipRead",
  "dailyQuestion",
  "playGame",
  "follow",
];

export const MISSION_LABELS: Record<MissionId, { ar: string; en: string }> = {
  profile: { ar: "تعديل الملف الشخصي (الاسم والصورة)", en: "Update your profile (name & photo)" },
  location: { ar: "تحديد الموقع الجغرافي وضبط خصوصيته", en: "Set your location & privacy" },
  listen5: { ar: "دخول غرفة مبتدئ والاستماع لمدة 5 دقائق", en: "Listen 5 min in a beginner room" },
  pronounce5: { ar: "استخدام ميزة النطق الصوتي لـ 5 كلمات", en: "Pronounce 5 words with voice tool" },
  addWord: { ar: "إضافة كلمة جديدة وحفظها في قاموسك الخاص", en: "Add a word to your personal dictionary" },
  placement: { ar: "إجراء اختبار تحديد المستوى لأي لغة", en: "Take a language placement test" },
  tipRead: { ar: "قراءة نصيحة اليوم في قسم النشاط", en: "Read today's tip in Activity" },
  dailyQuestion: { ar: "الإجابة على سؤال الجماعة اليومي", en: "Answer the daily community question" },
  playGame: { ar: "لعب مباراة واحدة في الألعاب اللغوية", en: "Play one language game" },
  follow: { ar: "متابعة صديق أو مستخدم آخر", en: "Follow another user" },
};

const KEY = "lingvoice.onboarding.v1";

type State = Record<MissionId, boolean>;

const empty: State = MISSION_IDS.reduce((acc, id) => {
  acc[id] = false;
  return acc;
}, {} as State);

const read = (): State => {
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return empty;
  }
};

const listeners = new Set<() => void>();

export const useOnboarding = () => {
  const [state, setState] = useState<State>(read);

  useEffect(() => {
    const update = () => setState(read());
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const completeMission = (id: MissionId) => {
    const next = { ...read(), [id]: true };
    localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  };

  const resetMission = (id: MissionId) => {
    const next = { ...read(), [id]: false };
    localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  };

  const completed = MISSION_IDS.filter((id) => state[id]).length;
  const total = MISSION_IDS.length;
  // Unlocks "Seedling" (نبتة) once all 10 missions are completed.
  const isSeedling = completed >= total;
  const canHost = isSeedling;

  return { state, completed, total, isSeedling, canHost, completeMission, resetMission };
};
