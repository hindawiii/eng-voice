import { useState } from "react";
import { Calendar, Bell, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

interface Scheduled {
  id: string;
  title: string;
  whenISO: string;
  notify: boolean;
}

const KEY = "engvoice.scheduledRooms";
const read = (): Scheduled[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const RoomScheduler = () => {
  const { lang } = useI18n();
  const [items, setItems] = useState<Scheduled[]>(read);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [notify, setNotify] = useState(true);

  const save = (next: Scheduled[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = () => {
    if (!title.trim() || !when) {
      toast.error(lang === "ar" ? "أكمل الحقول" : "Fill all fields");
      return;
    }
    save([{ id: `s-${Date.now()}`, title: title.trim(), whenISO: when, notify }, ...items]);
    setTitle(""); setWhen("");
    toast.success(lang === "ar" ? "تمت الجدولة" : "Scheduled");
  };

  const remove = (id: string) => save(items.filter((i) => i.id !== id));

  return (
    <section className="rounded-3xl bg-card p-4 shadow-soft">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        {lang === "ar" ? "جدولة الغرف" : "Room Scheduler"}
      </h3>

      <div className="space-y-2">
        <Input
          placeholder={lang === "ar" ? "عنوان الغرفة" : "Room title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
        />
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
          <span className="flex items-center gap-2 text-xs">
            <Bell className="h-3.5 w-3.5" /> {lang === "ar" ? "تنبيه قبل البدء" : "Notify me before"}
          </span>
          <Switch checked={notify} onCheckedChange={setNotify} />
        </div>
        <Button onClick={add} className="w-full bg-gradient-primary">
          <Plus className="mr-1 h-4 w-4" /> {lang === "ar" ? "إضافة" : "Add"}
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between rounded-xl bg-secondary/40 p-2.5 text-xs">
              <div>
                <p className="font-semibold">{it.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(it.whenISO).toLocaleString(lang === "ar" ? "ar" : "en")}
                  {it.notify && <span className="ml-2 text-primary">🔔</span>}
                </p>
              </div>
              <button onClick={() => remove(it.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
