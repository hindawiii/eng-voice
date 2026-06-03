import { useEffect, useState } from "react";

export interface CustomRoom {
  key: string;
  name: string;
  nameAr: string;
  flag: string;
  language: string;
  topic: string;
  topicAr: string;
  password?: string;
  isPrivate: boolean;
  creatorId: string;
  liveUsers: number;
  speakers: number;
  createdAt: number;
  accent: string;
  tutorMode?: boolean;
  difficulty?: "beginner" | "intermediate" | "advanced";
  status?: "active" | "closed";
}

const STORAGE_KEY = "lingvoice.customRooms";

const listeners = new Set<() => void>();

const read = (): CustomRoom[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const write = (rooms: CustomRoom[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  listeners.forEach((l) => l());
};

export const addCustomRoom = (room: CustomRoom) => write([room, ...read()]);

export const getCustomRoom = (key: string) =>
  read().find((r) => r.key === key);

export const useCustomRooms = () => {
  const [rooms, setRooms] = useState<CustomRoom[]>(read);
  useEffect(() => {
    const update = () => setRooms(read());
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return rooms;
};

export const FLAGS_BY_LANG: Record<string, string> = {
  English: "🇬🇧",
  French: "🇫🇷",
  Spanish: "🇪🇸",
  Arabic: "🇸🇦",
  German: "🇩🇪",
  Japanese: "🇯🇵",
  Italian: "🇮🇹",
  Portuguese: "🇵🇹",
  Korean: "🇰🇷",
  Other: "🌍",
};
