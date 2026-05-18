import { useState } from "react";
import { Gamepad2, Sparkles, Trophy, Wallet, BookMarked, Store, Settings2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { GAMES, GameDef } from "@/data/games";
import { GameModeDialog, GameMode, getGameMode, setGameMode } from "@/components/GameModeDialog";
import { WordChallengeGame } from "@/components/WordChallengeGame";
import { VaultPanel } from "@/components/VaultPanel";
import { RewardsStore } from "@/components/RewardsStore";
import { useWallet } from "@/hooks/useWallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const MOTTOS = [
  { en: "Play. Learn. Conquer.", ar: "العب. تعلم. انتصر." },
  { en: "Every round teaches a word.", ar: "كل جولة تعلمك كلمة." },
  { en: "Speed builds fluency.", ar: "السرعة تبني الطلاقة." },
];

const Play = () => {
  const { lang } = useI18n();
  const { lp } = useWallet();
  const [modeOpen, setModeOpen] = useState(false);
  const [pendingGame, setPendingGame] = useState<GameDef | null>(null);
  const [wcOpen, setWcOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameMode>(getGameMode());
  const motto = MOTTOS[new Date().getDate() % MOTTOS.length];

  const launchGame = (game: GameDef) => {
    setPendingGame(game);
    setModeOpen(true);
  };

  const onModePicked = (m: GameMode) => {
    setCurrentMode(m);
    if (!pendingGame) return;
    if (pendingGame.id === "word-challenge") {
      setWcOpen(true);
    } else {
      toast.success(
        (lang === "ar" ? "قريباً: " : "Coming soon: ") + (lang === "ar" ? pendingGame.ar : pendingGame.en)
      );
    }
  };

  return (
    <AppShell>
      <header className="bg-gradient-hero px-6 pb-10 pt-12 text-primary-foreground relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-gold" /> {lang === "ar" ? "العب وتعلم" : "Play & Learn"}
            </h1>
            <p className="mt-1 text-sm text-primary-foreground/80">{lang === "ar" ? motto.ar : motto.en}</p>
          </div>
          <div className="rounded-2xl bg-gold/20 border border-gold/40 px-3 py-2 text-center backdrop-blur">
            <div className="text-[10px] font-bold uppercase text-gold flex items-center gap-1 justify-center">
              <Wallet className="h-3 w-3" /> {lang === "ar" ? "رصيدك" : "Wallet"}
            </div>
            <div className="text-lg font-black text-gold">{lp} LP</div>
          </div>
        </div>
        <button
          onClick={() => { setPendingGame(null); setModeOpen(true); }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur hover:bg-white/25 transition-smooth"
        >
          <Settings2 className="h-3 w-3" />
          {lang === "ar" ? "الوضع:" : "Mode:"} {currentMode === "linguistic" ? (lang === "ar" ? "لغوي" : "Linguistic") : (lang === "ar" ? "عادي" : "Casual")}
        </button>
      </header>

      <section className="px-5 -mt-6">
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-card p-1 shadow-soft">
            <TabsTrigger value="games" className="rounded-xl"><Trophy className="h-4 w-4" /> {lang === "ar" ? "الألعاب" : "Games"}</TabsTrigger>
            <TabsTrigger value="vault" className="rounded-xl"><BookMarked className="h-4 w-4" /> {lang === "ar" ? "خزنتي" : "Vault"}</TabsTrigger>
            <TabsTrigger value="store" className="rounded-xl"><Store className="h-4 w-4" /> {lang === "ar" ? "المتجر" : "Store"}</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => launchGame(g)}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.theme} p-4 text-start text-white shadow-soft transition-spring hover:-translate-y-1 hover:shadow-elegant`}
                >
                  <div className="text-3xl mb-1">{g.emoji}</div>
                  <p className="font-bold text-sm leading-tight">{lang === "ar" ? g.ar : g.en}</p>
                  <p className="text-[10px] opacity-90 mt-1 line-clamp-2">{lang === "ar" ? g.desc.ar : g.desc.en}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                    <span className="rounded-full bg-black/25 px-2 py-0.5">{g.players}👤</span>
                    <span className="rounded-full bg-white/25 px-2 py-0.5 flex items-center gap-0.5">
                      <Sparkles className="h-3 w-3" />+{g.prize}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-elegant">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-gold" />
                <h2 className="font-bold">{lang === "ar" ? "لوحة الأبطال" : "Leaderboard"}</h2>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  { n: "Layla", flag: "🇸🇦", lp: 2840 },
                  { n: "Marco", flag: "🇮🇹", lp: 2110 },
                  { n: "Aiko", flag: "🇯🇵", lp: 1980 },
                ].map((u, i) => (
                  <li key={u.n} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="font-bold w-5">{i + 1}.</span>
                      <span>{u.flag}</span>
                      <span>{u.n}</span>
                      {i === 0 && <span className="text-gold">👑</span>}
                    </span>
                    <span className="font-bold tabular-nums flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-gold" /> {u.lp}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="vault" className="mt-4">
            <VaultPanel />
          </TabsContent>

          <TabsContent value="store" className="mt-4">
            <RewardsStore />
          </TabsContent>
        </Tabs>
      </section>

      <GameModeDialog
        open={modeOpen}
        onOpenChange={setModeOpen}
        onPick={onModePicked}
        gameTitle={pendingGame ? (lang === "ar" ? pendingGame.ar : pendingGame.en) : undefined}
      />
      <WordChallengeGame open={wcOpen} onOpenChange={setWcOpen} mode={currentMode} />
    </AppShell>
  );
};

export default Play;
