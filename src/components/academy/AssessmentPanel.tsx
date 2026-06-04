import { useMemo, useState } from "react";
import { Award, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUIZZES } from "@/data/academy";
import { cn } from "@/lib/utils";

const PROFILE_KEY = "engvoice.proficiency";

interface Props { langKey: string }

export const AssessmentPanel = ({ langKey }: Props) => {
  const questions = useMemo(() => QUIZZES[langKey] || [], [langKey]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const handle = (opt: number) => {
    const next = [...answers, opt];
    setAnswers(next);
    if (idx + 1 >= questions.length) {
      const correct = next.filter((a, i) => a === questions[i].answer).length;
      const ratio = correct / questions.length;
      const level = ratio >= 0.8 ? "متقدم" : ratio >= 0.5 ? "متوسط" : "مبتدئ";
      try {
        const prev = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...prev, [langKey]: level }));
      } catch {}
      setDone(true);
    } else {
      setIdx(idx + 1);
    }
  };

  const reset = () => { setIdx(0); setAnswers([]); setDone(false); };

  if (questions.length === 0) {
    return <p className="text-center text-white/50 py-6">لا يوجد اختبار متاح لهذه اللغة.</p>;
  }

  if (done) {
    const correct = answers.filter((a, i) => a === questions[i].answer).length;
    const ratio = correct / questions.length;
    const level = ratio >= 0.8 ? "متقدم" : ratio >= 0.5 ? "متوسط" : "مبتدئ";
    return (
      <div className="rounded-2xl border border-[#FBBF24]/40 bg-[#111827] p-6 text-center space-y-4">
        <Award className="mx-auto h-12 w-12 text-[#FBBF24]" />
        <h3 className="text-2xl font-black text-white">مستواك: <span className="text-[#FBBF24]">{level}</span></h3>
        <p className="text-white/70">{correct} / {questions.length} إجابات صحيحة</p>
        <p className="text-xs text-white/50">تم تحديث ملفك الشخصي بهذه الحالة.</p>
        <Button onClick={reset} className="gap-2 bg-[#FBBF24] text-black hover:bg-[#F59E0B]">
          <RotateCcw className="h-4 w-4" /> إعادة الاختبار
        </Button>
      </div>
    );
  }

  const q = questions[idx];
  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/60">سؤال {idx + 1} / {questions.length}</span>
        <span className="text-[#FBBF24] font-bold">اختبار المستوى</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#070A13]">
        <div className="h-full bg-[#FBBF24] transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
      </div>
      <h3 className="text-lg font-bold text-white">{q.q}</h3>
      <div className="grid gap-2">
        {q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => handle(i)}
            className={cn(
              "rounded-lg border border-[#1F2937] bg-[#070A13] p-3 text-right text-white font-medium",
              "hover:border-[#FBBF24] hover:bg-[#FBBF24]/10 transition-colors"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
};
