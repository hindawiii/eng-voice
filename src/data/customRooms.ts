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

const STORAGE_KEY = "engvoice.customRooms";

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

export const addCustomRoom = (room: CustomRoom) =>
  write([{ ...room, status: room.status ?? "active" }, ...read()]);

export const getCustomRoom = (key: string) =>
  read().find((r) => r.key === key);

export const getActiveRoomByCreator = (creatorId: string) =>
  read().find((r) => r.creatorId === creatorId && (r.status ?? "active") === "active");

export const closeRoom = (key: string) => {
  write(read().map((r) => (r.key === key ? { ...r, status: "closed" } : r)));
};

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
