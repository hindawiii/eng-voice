import { useCallback, useEffect, useState } from "react";

const KEY = "lingvoice.dailyAllowance";
export const BASE_MIN = 90;
export const AD_BONUS_MIN = 15;
export const MAX_ADS = 5;
export const CAP_MIN = 165;

interface State {
  date: string; // YYYY-MM-DD
  usedSec: number;
  adsWatched: number;
}

const today = () => new Date().toISOString().slice(0, 10);

const read = (): State => {
  if (typeof window === "undefined") return { date: today(), usedSec: 0, adsWatched: 0 };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as State | null;
    if (!raw || raw.date !== today()) return { date: today(), usedSec: 0, adsWatched: 0 };
    return raw;
  } catch {
    return { date: today(), usedSec: 0, adsWatched: 0 };
  }
};

export const useDailyAllowance = () => {
  const [state, setState] = useState<State>(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  // midnight rollover check every minute
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => (s.date !== today() ? { date: today(), usedSec: 0, adsWatched: 0 } : s));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const totalAllowedMin = Math.min(CAP_MIN, BASE_MIN + state.adsWatched * AD_BONUS_MIN);
  const remainingSec = Math.max(0, totalAllowedMin * 60 - state.usedSec);

  const consume = useCallback((sec: number) => {
    setState((s) => ({ ...s, usedSec: s.usedSec + sec }));
  }, []);

  const watchAd = useCallback(() => {
    let added = false;
    setState((s) => {
      if (s.adsWatched >= MAX_ADS) return s;
      added = true;
      return { ...s, adsWatched: s.adsWatched + 1 };
    });
    return added;
  }, []);

  return {
    ...state,
    totalAllowedMin,
    remainingSec,
    canWatchAd: state.adsWatched < MAX_ADS,
    consume,
    watchAd,
  };
};
