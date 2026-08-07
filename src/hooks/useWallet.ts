import { useCallback, useEffect, useState } from "react";

const KEY = "lingvoice.wallet.lp";
const EVENT = "lingvoice:wallet";
const DEFAULT = 150;

const read = () => {
  if (typeof window === "undefined") return DEFAULT;
  const raw = localStorage.getItem(KEY);
  return raw ? Number(raw) || DEFAULT : DEFAULT;
};

const write = (v: number) => {
  localStorage.setItem(KEY, String(v));
  window.dispatchEvent(new CustomEvent<number>(EVENT, { detail: v }));
};

export const useWallet = () => {
  const [lp, setLpState] = useState<number>(read);

  // Sync across components in the same tab + across tabs.
  useEffect(() => {
    const onLocal = (e: Event) => setLpState((e as CustomEvent<number>).detail);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setLpState(Number(e.newValue));
    };
    window.addEventListener(EVENT, onLocal as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onLocal as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLp = useCallback((next: number | ((v: number) => number)) => {
    const current = read();
    const value = typeof next === "function" ? (next as (v: number) => number)(current) : next;
    const safe = Math.max(0, Math.round(value));
    write(safe);
    setLpState(safe);
  }, []);

  const add = useCallback((n: number) => setLp((v) => v + n), [setLp]);

  const spend = useCallback(
    (n: number) => {
      const current = read();
      if (current < n) return false;
      setLp(current - n);
      return true;
    },
    [setLp]
  );

  return { lp, add, spend, setLp };
};
