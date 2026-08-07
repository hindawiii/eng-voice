import { useCallback, useEffect, useState } from "react";

export interface VaultCard {
  id: string;
  word: string;
  translation: string;
  context?: string;
  addedAt: number;
  reviewedAt?: number;
  strength: number; // 0..5 spaced-rep
}

const KEY = "engvoice.vault.cards";

const read = (): VaultCard[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const useVault = () => {
  const [cards, setCards] = useState<VaultCard[]>(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cards));
  }, [cards]);

  const add = useCallback((card: Omit<VaultCard, "id" | "addedAt" | "strength">) => {
    setCards((cs) => {
      if (cs.some((c) => c.word.toLowerCase() === card.word.toLowerCase())) return cs;
      return [
        { ...card, id: crypto.randomUUID(), addedAt: Date.now(), strength: 0 },
        ...cs,
      ];
    });
  }, []);

  const review = useCallback((id: string, correct: boolean) => {
    setCards((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, strength: Math.max(0, Math.min(5, c.strength + (correct ? 1 : -1))), reviewedAt: Date.now() }
          : c
      )
    );
  }, []);

  const remove = useCallback((id: string) => setCards((cs) => cs.filter((c) => c.id !== id)), []);

  return { cards, add, review, remove };
};
