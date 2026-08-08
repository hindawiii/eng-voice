import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Radio } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/**
 * Smart Mirror — live self-check of your mic input.
 * Shows an animated waveform + peak level meter so the speaker
 * can verify they are being heard before/while speaking.
 */
const BARS = 24;

export const SmartMirrorCard = () => {
  const { lang } = useI18n();
  const [on, setOn] = useState(false);
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
  const [peak, setPeak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
    setLevels(Array(BARS).fill(0));
    setPeak(0);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AC();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyserRef.current = analyser;

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const step = Math.max(1, Math.floor(buf.length / BARS));
        const next: number[] = [];
        let localPeak = 0;
        for (let i = 0; i < BARS; i++) {
          const v = buf[i * step] ?? 0;
          const norm = v / 255;
          next.push(norm);
          if (norm > localPeak) localPeak = norm;
        }
        setLevels(next);
        setPeak(localPeak);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setError(null);
    } catch (e) {
      setError(lang === "ar" ? "تعذّر الوصول للميكروفون" : "Mic access denied");
      setOn(false);
    }
  };

  useEffect(() => {
    if (on) start();
    else stop();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const peakPct = Math.round(peak * 100);
  const peakColor =
    peakPct > 75 ? "bg-emerald-400" : peakPct > 30 ? "bg-gold" : peakPct > 5 ? "bg-white/60" : "bg-white/25";

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card p-4 text-white shadow-elegant">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={cn("h-4 w-4", on ? "text-emerald-400 animate-pulse" : "text-white/50")} />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gold">
              {lang === "ar" ? "مرآة ذكية" : "Smart Mirror"}
            </p>
            <p className="text-[10px] text-white/60">
              {lang === "ar" ? "افحص صوتك قبل التحدث" : "Check your mic before you speak"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOn((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black transition",
            on
              ? "bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.55)]"
              : "bg-surface-2 text-white/85 border border-border hover:border-gold"
          )}
        >
          {on ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {on ? (lang === "ar" ? "إيقاف" : "Stop") : (lang === "ar" ? "تشغيل" : "Test")}
        </button>
      </div>

      {/* Waveform */}
      <div className="flex h-16 items-end justify-between gap-0.5 rounded-2xl bg-background px-2 py-2">
        {levels.map((v, i) => {
          const h = on ? Math.max(6, v * 100) : 8;
          const active = v > 0.1;
          return (
            <span
              key={i}
              className={cn(
                "w-full rounded-full transition-all",
                active ? "bg-gradient-to-t from-gold-hover to-gold" : "bg-white/15"
              )}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>

      {/* Peak meter */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase text-white/60 w-10" dir="ltr">
          Peak
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
          <div className={cn("h-full transition-all", peakColor)} style={{ width: `${peakPct}%` }} />
        </div>
        <span className="w-9 text-end text-[10px] font-black text-white tabular-nums" dir="ltr">
          {peakPct}%
        </span>
      </div>

      {error && <p className="mt-2 text-[10px] text-destructive">{error}</p>}
      {!error && on && peakPct < 5 && (
        <p className="mt-2 text-[10px] text-white/60">
          {lang === "ar" ? "لا نلتقط أي صوت — تحدث بصوت أعلى" : "No signal — try speaking louder"}
        </p>
      )}
    </section>
  );
};
