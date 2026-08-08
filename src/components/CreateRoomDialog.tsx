import { useState } from "react";
import { GraduationCap, Lock, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { addCustomRoom, closeRoom, FLAGS_BY_LANG, getActiveRoomByCreator } from "@/data/customRooms";
import { useI18n } from "@/i18n/I18nProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const LANGS = Object.keys(FLAGS_BY_LANG);

// Demo: tutor mode requires "Tree" tier (level 3).
const CURRENT_USER_LEVEL = 3;
const TUTOR_MIN_LEVEL = 3;
const CURRENT_USER_ID = "me";

type Difficulty = "beginner" | "intermediate" | "advanced";

export const CreateRoomDialog = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { canHost, completed, total } = useOnboarding();

  const [open, setOpen] = useState(false);
  const [conflictKey, setConflictKey] = useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = useState(false);

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

  const handleTriggerClick = () => {
    if (!canHost) {
      toast.error(
        lang === "ar"
          ? `أكمل مهام البداية أولاً (${completed}/${total}) للوصول لمستوى نبتة 🌿`
          : `Finish beginner missions first (${completed}/${total}) to reach Seedling 🌿`
      );
      return;
    }
    const existing = getActiveRoomByCreator(CURRENT_USER_ID);
    if (existing) {
      setConflictKey(existing.key);
      return;
    }
    setOpen(true);
  };

  const instantiateRoom = () => {
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
      creatorId: CURRENT_USER_ID,
      liveUsers: 1,
      speakers: 1,
      createdAt: Date.now(),
      accent: tutorMode ? "from-emerald-700 to-gold" : "from-primary-soft to-gold",
      tutorMode: tutorMode && canTutor,
      difficulty: tutorMode && canTutor ? difficulty : undefined,
      status: "active",
    });
    toast.success(lang === "ar" ? "تم إنشاء الغرفة" : "Room created");
    setOpen(false);
    reset();
    navigate(`/room/${key}`);
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
    // Re-check inside create flow too.
    const existing = getActiveRoomByCreator(CURRENT_USER_ID);
    if (existing) {
      setPendingCreate(true);
      setConflictKey(existing.key);
      setOpen(false);
      return;
    }
    instantiateRoom();
  };

  const resumeExisting = () => {
    if (!conflictKey) return;
    const k = conflictKey;
    setConflictKey(null);
    setPendingCreate(false);
    navigate(`/room/${k}`);
  };

  const closeAndOpenNew = () => {
    if (conflictKey) closeRoom(conflictKey);
    setConflictKey(null);
    if (pendingCreate) {
      setPendingCreate(false);
      instantiateRoom();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleTriggerClick}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-gold transition-spring",
          canHost
            ? "bg-gradient-gold text-gold-foreground hover:scale-105"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {canHost ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {lang === "ar" ? "إنشاء غرفة" : "Create Room"}
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md max-h-[85vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              {lang === "ar" ? "غرفة جديدة" : "New Room"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-32 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
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

            <div className={cn(
              "rounded-2xl border p-3 space-y-3",
              canTutor ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-muted/30 opacity-70"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold">
                      {lang === "ar" ? "وضع المرشد" : "Tutor Mode"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {canTutor
                        ? (lang === "ar" ? "جلسة تعليمية معتمدة" : "Certified learning session")
                        : (lang === "ar" ? "يتطلب مستوى شجرة 🌳" : "Requires Tree 🌳 level")}
                    </p>
                  </div>
                </div>
                <Switch
                  disabled={!canTutor}
                  checked={tutorMode}
                  onCheckedChange={setTutorMode}
                />
              </div>
              {tutorMode && canTutor && (
                <div className="flex gap-2">
                  {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "flex-1 rounded-full px-2 py-1.5 text-[11px] font-bold capitalize transition-smooth",
                        difficulty === d
                          ? "bg-emerald-500 text-white"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {lang === "ar"
                        ? d === "beginner" ? "مبتدئ" : d === "intermediate" ? "متوسط" : "متقدم"
                        : d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border/60 bg-card/95 backdrop-blur px-6 py-3 gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleCreate} className="bg-gradient-gold text-gold-foreground font-bold">
              {lang === "ar" ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single-active-room conflict modal */}
      <Dialog
        open={!!conflictKey}
        onOpenChange={(o) => {
          if (!o) {
            setConflictKey(null);
            setPendingCreate(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              {lang === "ar" ? "لديك غرفة نشطة" : "You have an active room"}
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              {lang === "ar"
                ? "لديك غرفة مفتوحة بالفعل! هل تريد العودة إليها أم إغلاقها تماماً وفتح غرفة جديدة؟"
                : "You already have an open room. Resume it, or close it and start a new one?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeAndOpenNew} className="border-destructive/40 text-destructive">
              {lang === "ar" ? "أغلق وافتح جديدة" : "Close & open new"}
            </Button>
            <Button onClick={resumeExisting} className="bg-gradient-primary">
              {lang === "ar" ? "العودة للغرفة" : "Resume room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
