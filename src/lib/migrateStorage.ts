// One-time migration: unify legacy `lingvoice.*` localStorage keys under `engvoice.*`.
const FLAG = "engvoice.storageMigrated.v1";

export const migrateStorage = () => {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(FLAG)) return;
    const legacy = Object.keys(localStorage).filter((k) => k.startsWith("lingvoice."));
    for (const key of legacy) {
      const next = `engvoice.${key.slice("lingvoice.".length)}`;
      const value = localStorage.getItem(key);
      if (value !== null && localStorage.getItem(next) === null) {
        localStorage.setItem(next, value);
      }
      localStorage.removeItem(key);
    }
    localStorage.setItem(FLAG, "1");
  } catch {
    // storage unavailable — ignore
  }
};
