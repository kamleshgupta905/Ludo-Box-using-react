import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { Trophy, Frown } from "lucide-react";

export function GameResultScreen() {
  const setScreen = useApp((s) => s.setScreen);
  const g = useApp((s) => s.lastGame);

  if (!g) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="Result" back="home" />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No match to show.
        </div>
      </div>
    );
  }

  const mm = Math.floor(g.durationSec / 60);
  const ss = (g.durationSec % 60).toString().padStart(2, "0");

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Match Result" back="home" />
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {g.won ? (
          <div className="animate-pop animate-float grid h-32 w-32 place-items-center rounded-full gradient-gold shadow-glow">
            <Trophy className="h-16 w-16 text-gold-foreground" />
          </div>
        ) : (
          <div className="animate-pop grid h-32 w-32 place-items-center rounded-full bg-muted">
            <Frown className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <h2 className="mt-6 font-display text-3xl">{g.won ? "You Won! 🎉" : "You Lost"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{g.mode} • vs {g.opponent}</p>

        <div className="mt-6 w-full rounded-3xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{g.won ? "Winnings credited" : "Entry fee"}</p>
          <p className={`mt-1 font-display text-4xl ${g.won ? "text-success" : "text-destructive"}`}>
            {g.won ? `+₹${g.prize}` : `−₹${g.entry}`}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <Stat label="Your score" value={g.myScore} />
            <Stat label="AI score" value={g.aiScore} />
            <Stat label="Duration" value={`${mm}:${ss}`} />
          </div>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-2">
          <button
            onClick={() => setScreen("home")}
            className="rounded-full border border-border py-3 text-sm font-bold"
          >
            Home
          </button>
          <button
            onClick={() => setScreen("play")}
            className="rounded-full gradient-primary py-3 text-sm font-display text-primary-foreground shadow-glow"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-background/50 p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-display text-base">{value}</p>
    </div>
  );
}
