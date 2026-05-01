import { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export interface ChatMessage {
  id: string;
  user: string;
  flag: string;
  text: string;
  time: number;
}

interface Props {
  isAdmin: boolean;
}

const SEED: ChatMessage[] = [
  { id: "c1", user: "Hans", flag: "🇩🇪", text: "Greetings from Berlin 👋", time: Date.now() - 120000 },
  { id: "c2", user: "Léa", flag: "🇫🇷", text: "I love this topic!", time: Date.now() - 60000 },
];

export const ChatBox = ({ isAdmin }: Props) => {
  const { lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(SEED);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim().slice(0, 200);
    if (!trimmed) return;
    setMessages((m) => [
      ...m,
      { id: `c${Date.now()}`, user: "You", flag: "🌟", text: trimmed, time: Date.now() },
    ]);
    setText("");
  };

  return (
    <section className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {lang === "ar" ? "الدردشة" : "Chat"}
        </h2>
        {isAdmin && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive transition-smooth hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3 w-3" /> {lang === "ar" ? "مسح" : "Clear"}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="max-h-48 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2 rounded-2xl bg-secondary/60 p-2.5">
            <span className="text-base">{m.flag}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold">{m.user}</p>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={200}
          placeholder={lang === "ar" ? "اكتب رسالة…" : "Type a message…"}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={send}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground transition-spring hover:scale-105"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};
