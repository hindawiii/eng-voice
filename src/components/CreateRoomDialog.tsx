import { useState } from "react";
import { GraduationCap, Lock, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { addCustomRoom, FLAGS_BY_LANG } from "@/data/customRooms";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const LANGS = Object.keys(FLAGS_BY_LANG);

// In a real app, read from auth profile. Level >= 3 ('Tree') unlocks Tutor Mode.
const CURRENT_USER_LEVEL = 3;
const TUTOR_MIN_LEVEL = 3;

type Difficulty = "beginner" | "intermediate" | "advanced";

export const CreateRoomDialog = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [topic, setTopic] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [tutorMode, setTutorMode] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");

  const canTutor = CURRENT_USER_LEVEL >= TUTOR_MIN_LEVEL;

  const reset = () => {
    setLanguage("English");
    setTopic("");
    setIsPrivate(false);
    setPassword("");
    setTutorMode(false);
    setDifficulty("beginner");
  };

  const handleCreate = () => {
    if (!topic.trim()) {
      toast.error(lang === "ar" ? "أدخل موضوعاً" : "Enter a topic");
      return;
    }
    if (isPrivate && password.trim().length < 4) {
      toast.error(lang === "ar" ? "كلمة المرور ٤ أحرف على الأقل" : "Password must be 4+ chars");
      return;
    }
    const key = `custom-${Date.now()}`;
    const trimmedTopic = topic.trim().slice(0, 120);
    addCustomRoom({
      key,
      name: `${language} Room`,
      nameAr: `غرفة ${language}`,
      flag: FLAGS_BY_LANG[language] || "🌍",
      language,
      topic: trimmedTopic,
      topicAr: trimmedTopic,
      password: isPrivate ? password.trim() : undefined,
      isPrivate,
      creatorId: "me",
      liveUsers: 1,
      speakers: 1,
      createdAt: Date.now(),
      accent: tutorMode ? "from-emerald-700 to-[#D4AF37]" : "from-[#1E3A5F] to-[#D4AF37]",
      tutorMode: tutorMode && canTutor,
      difficulty: tutorMode && canTutor ? difficulty : undefined,
    });
    toast.success(lang === "ar" ? "تم إنشاء الغرفة" : "Room created");
    setOpen(false);
    reset();
    navigate(`/room/${key}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm font-bold text-gold-foreground shadow-gold transition-spring hover:scale-105">
          <Plus className="h-4 w-4" />
          {lang === "ar" ? "إنشاء غرفة" : "Create Room"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            {lang === "ar" ? "غرفة جديدة" : "New Room"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{lang === "ar" ? "اللغة" : "Language"}</Label>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-smooth ${
                    language === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary"
                  }`}
                >
                  <span>{FLAGS_BY_LANG[l]}</span> {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">{lang === "ar" ? "الموضوع" : "Topic"}</Label>
            <Input
              id="topic"
              maxLength={120}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={lang === "ar" ? "عن ماذا ستتحدثون؟" : "What will you talk about?"}
            />
            <p className="text-xs text-muted-foreground">
              {topic.length}/120 · {lang === "ar" ? "٨ مقاعد متحدث + مستمعون غير محدودين" : "8 speaker seats + unlimited listeners"}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border p-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">{lang === "ar" ? "غرفة خاصة" : "Private room"}</p>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "محمية بكلمة مرور" : "Password protected"}
                </p>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="pw">{lang === "ar" ? "كلمة المرور" : "Password"}</Label>
              <Input
                id="pw"
                type="text"
                maxLength={32}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleCreate} className="bg-gradient-primary">
            {lang === "ar" ? "إنشاء" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
