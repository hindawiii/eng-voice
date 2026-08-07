import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nProvider";

export interface MinimizedRoomState {
  key: string;
  name: string;
  flag: string;
}

const STORAGE_KEY = "engvoice.minimizedRoom";
const EVENT = "engvoice:minimizedRoomChange";

export const setMinimizedRoom = (state: MinimizedRoomState | null) => {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
};

export const getMinimizedRoom = (): MinimizedRoomState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MinimizedRoomState) : null;
  } catch {
    return null;
  }
};

export const MinimizedRoomBar = () => {
  const { lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<MinimizedRoomState | null>(() => getMinimizedRoom());
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const sync = () => setState(getMinimizedRoom());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!state) return null;
  // Hide when already inside a room screen
  if (location.pathname.startsWith("/room/")) return null;

  const open = () => navigate(`/room/${state.key}`);
  const close = () => {
    setMinimizedRoom(null);
    toast.info(lang === "ar" ? "غادرت الغرفة" : "Left the room");
  };

  return (
    <div
      className="fixed inset-x-3 z-[70] mx-auto max-w-[320px] rounded-[28px] border border-gold/40 bg-[#0F1524]/95 px-3 py-2 shadow-[0_10px_36px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      style={{ bottom: "80px" }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={open}
          className="flex flex-1 items-center gap-2 rounded-full text-start"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-base leading-none">{state.flag}</span>
          <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-white">
            {state.name}
          </span>
        </button>
        <button
          onClick={() => {
            setMuted((m) => !m);
            toast.success(
              !muted
                ? lang === "ar" ? "تم كتم صوت الغرفة" : "Room muted"
                : lang === "ar" ? "تم تشغيل الصوت" : "Room unmuted"
            );
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          onClick={close}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
