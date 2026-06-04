import { useCallback, useEffect, useState } from "react";

export interface DictEntry { id: string; source: string; translation: string; from: string; to: string; addedAt: number }

const KEY = "engvoice.dictionary";

const read = (): DictEntry[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const useDictionary = () => {
  const [entries, setEntries] = useState<DictEntry[]>(read);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(entries)); }, [entries]);

  const add = useCallback((e: Omit<DictEntry, "id" | "addedAt">) =>
    setEntries((es) => [{ ...e, id: crypto.randomUUID(), addedAt: Date.now() }, ...es]), []);
  const remove = useCallback((id: string) => setEntries((es) => es.filter((e) => e.id !== id)), []);
  const clear = useCallback(() => setEntries([]), []);

  return { entries, add, remove, clear };
};

export const detectIsArabic = (s: string) => /[\u0600-\u06FF]/.test(s);

export const translateText = async (text: string, from: string, to: string): Promise<string> => {
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const data = await r.json();
    return data?.responseData?.translatedText || "";
  } catch {
    return "";
  }
};
