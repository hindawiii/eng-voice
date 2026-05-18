import { useCallback, useEffect, useState } from "react";

const KEY = "lingvoice.wallet.lp";
const DEFAULT = 150;

const read = () => {
  if (typeof window === "undefined") return DEFAULT;
  const raw = localStorage.getItem(KEY);
  return raw ? Number(raw) || DEFAULT : DEFAULT;
};

export const useWallet = () => {
  const [lp, setLp] = useState<number>(read);

  useEffect(() => {
    localStorage.setItem(KEY, String(lp));
  }, [lp]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setLp(Number(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((n: number) => setLp((v) => Math.max(0, v + n)), []);
  const spend = useCallback(
    (n: number) => {
      if (lp < n) return false;
      setLp((v) => v - n);
      return true;
    },
    [lp]
  );
  return { lp, add, spend, setLp };
};
