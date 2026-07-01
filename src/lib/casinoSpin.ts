// Lightweight WebAudio "casino slot / roulette spin" SFX generator.
// Zero assets, zero network. Safe to call on user gesture.
let ctx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
};

export const playCasinoSpin = () => {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const now = ac.currentTime;

  // Rapid ticking wheel: series of short blips descending in rate
  const master = ac.createGain();
  master.gain.value = 0.0001;
  master.connect(ac.destination);
  master.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  const ticks = 22;
  for (let i = 0; i < ticks; i++) {
    const t = now + Math.pow(i / ticks, 1.6) * 0.85;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(880 - i * 12, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.06);
  }

  // Final "ding" chime
  const dingT = now + 0.92;
  [1319, 1760].forEach((f, k) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, dingT);
    g.gain.exponentialRampToValueAtTime(0.35, dingT + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, dingT + 0.45 + k * 0.05);
    o.connect(g).connect(ac.destination);
    o.start(dingT);
    o.stop(dingT + 0.55);
  });
};
