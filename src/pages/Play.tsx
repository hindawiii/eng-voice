import { useEffect, useState } from "react";
import { Gamepad2, Sparkles, Trophy, Wallet, BookMarked, Store, Settings2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { GAMES, GameDef } from "@/data/games";
import { GameModeDialog, GameMode, getGameMode, getGameConfig, setGameConfig } from "@/components/GameModeDialog";
import { WordChallengeGame } from "@/components/WordChallengeGame";
import { VaultPanel } from "@/components/VaultPanel";
import { RewardsStore } from "@/components/RewardsStore";
import { useWallet } from "@/hooks/useWallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOTTOS = [
  { en: "Play. Learn. Conquer.", ar: "العب. تعلم. انتصر." },
  { en: "Every round teaches a word.", ar: "كل جولة تعلمك كلمة." },
  { en: "Speed builds fluency.", ar: "السرعة تبني الطلاقة." },
];

const LEADERS = [
  { n: "Layla", flag: "🇸🇦", lp: 2840 },
  { n: "Marco", flag: "🇮🇹", lp: 2110 },
  { n: "Aiko", flag: "🇯🇵", lp: 1980 },
];

const Play = () => {
  const { lang } = useI18n();
  const { lp } = useWallet();
  const [modeOpen, setModeOpen] = useState(false);
  const [pendingGame, setPendingGame] = useState<GameDef | null>(null);
  const [wcOpen, setWcOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameMode>(getGameMode());
  const [cardOverride, setCardOverride] = useState<Record<string, GameMode>>({});
  const motto = MOTTOS[new Date().getDate() % MOTTOS.length];

  useEffect(() => {
    // resync overrides whenever global mode changes
    setCardOverride({});
  }, [currentMode]);

  const launchGame = (game: GameDef) => {
    setPendingGame(game);
    setModeOpen(true);
  };

  const onConfigured = (m: GameMode) => {
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

  const toggleCardMode = (id: string, current: GameMode) => {
    const next: GameMode = current === "linguistic" ? "casual" : "linguistic";
    setCardOverride((o) => ({ ...o, [id]: next }));
    setGameConfig({ ...getGameConfig(), mode: next });
    setCurrentMode(next);
    toast.success(
      (lang === "ar" ? "تم تبديل وضع " : "Switched mode for ") +
        (lang === "ar" ? "اللعبة" : "the game")
    );
  };

  return (
    <AppShell>
      <header className="bg-gradient-hero px-6 pb-8 pt-12 text-foreground relative overflow-hidden border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-gold" /> {lang === "ar" ? "العب وتعلم" : "Play & Learn"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{lang === "ar" ? motto.ar : motto.en}</p>
          </div>
          <div className="rounded-2xl bg-card border border-gold/40 px-3 py-2 text-center">
            <div className="text-[10px] font-bold uppercase text-gold flex items-center gap-1 justify-center">
              <Wallet className="h-3 w-3" /> {lang === "ar" ? "رصيدك" : "Wallet"}
            </div>
            <div className="text-lg font-black text-gold">{lp} LP</div>
          </div>
        </div>
        <button
          onClick={() => { setPendingGame(null); setModeOpen(true); }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground hover:bg-card transition-smooth border border-border"
        >
          <Settings2 className="h-3 w-3" />
          {lang === "ar" ? "الوضع:" : "Mode:"} {currentMode === "linguistic" ? (lang === "ar" ? "لغوي" : "Linguistic") : (lang === "ar" ? "عادي" : "Casual")}
        </button>
      </header>

      <section className="px-5 pt-4">
        <Tabs defaultValue="games" className="w-full">
          {/* Tabs sit just below header, never clipped */}
          <TabsList className="sticky top-2 z-20 grid w-full grid-cols-3 rounded-2xl bg-card p-1 shadow-soft border border-border">
            <TabsTrigger value="games" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-gold-foreground">
              <Trophy className="h-4 w-4 mr-1" /> {lang === "ar" ? "الألعاب" : "Games"}
            </TabsTrigger>
            <TabsTrigger value="vault" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-gold-foreground">
              <BookMarked className="h-4 w-4 mr-1" /> {lang === "ar" ? "تعلم" : "Learn"}
            </TabsTrigger>
            <TabsTrigger value="store" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-gold-foreground">
              <Store className="h-4 w-4 mr-1" /> {lang === "ar" ? "المتجر" : "Store"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="mt-4 space-y-4">
            {/* HERO Leaderboard pinned at top */}
            <div className="rounded-3xl bg-card p-5 shadow-elegant border border-gold/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  <h2 className="font-bold text-foreground">{lang === "ar" ? "لوحة الأبطال" : "Leaderboard"}</h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">{lang === "ar" ? "هذا الأسبوع" : "This week"}</span>
              </div>
              <ul className="space-y-2 text-sm">
                {LEADERS.map((u, i) => (
                  <li key={u.n} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 border border-border">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className={`font-black w-5 ${i === 0 ? "text-gold" : ""}`}>{i + 1}.</span>
                      <span>{u.flag}</span>
                      <span>{u.n}</span>
                      {i === 0 && <span className="text-gold">👑</span>}
                    </span>
                    <span className="font-bold tabular-nums flex items-center gap-1 text-gold">
                      <Sparkles className="h-3 w-3" /> {u.lp}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {GAMES.map((g) => {
                const effective = cardOverride[g.id] ?? currentMode;
                const isHybrid = !!g.hybrid;
                return (
                  <div
                    key={g.id}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.theme} p-4 text-start text-white shadow-soft transition-spring hover:-translate-y-1 hover:shadow-elegant border border-border`}
                  >
                    <button onClick={() => launchGame(g)} className="block w-full text-start">
                      <div className="text-3xl mb-1">{g.emoji}</div>
                      <p className="font-bold text-sm leading-tight">{lang === "ar" ? g.ar : g.en}</p>
                      <p className="text-[10px] opacity-90 mt-1 line-clamp-2">{lang === "ar" ? g.desc.ar : g.desc.en}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                        <span className="rounded-full bg-black/35 px-2 py-0.5">{g.players}👤</span>
                        <span className="rounded-full bg-gold/95 text-gold-foreground px-2 py-0.5 flex items-center gap-0.5">
                          <Sparkles className="h-3 w-3" />+{g.prize}
                        </span>
                      </div>
                    </button>
                    {isHybrid && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCardMode(g.id, effective); }}
                        className="mt-2 w-full rounded-full bg-black/40 backdrop-blur px-2 py-1 text-[10px] font-bold flex items-center justify-center gap-1 border border-white/20"
                        title={lang === "ar" ? "بدّل وضع اللعب" : "Toggle mode"}
                      >
                        <Settings2 className="h-3 w-3" />
                        {effective === "linguistic"
                          ? (lang === "ar" ? "لغوي" : "Linguistic")
                          : (lang === "ar" ? "عادي" : "Casual")}
                      </button>
                    )}
                  </div>
                );
              })}
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
        onConfirm={onConfigured}
        gameTitle={pendingGame ? (lang === "ar" ? pendingGame.ar : pendingGame.en) : undefined}
        showAdvanced={!pendingGame || pendingGame.id !== ""}
      />
      <WordChallengeGame open={wcOpen} onOpenChange={setWcOpen} mode={currentMode} />
    </AppShell>
  );
};

export default Play;
