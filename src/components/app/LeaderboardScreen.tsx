import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { baseLeaderboard, type LeaderboardEntry } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function LeaderboardScreen() {
  const stats = useApp((s) => s.stats);
  const user = useApp((s) => s.user);
  const myEntry: LeaderboardEntry = {
    rank: 0,
    name: `${user.name} (You)`,
    avatar: "🎮",
    earnings: stats.earned,
    wins: stats.wins,
    isYou: true,
  };
  const combined = [...baseLeaderboard, myEntry]
    .sort((a, b) => b.earnings - a.earnings)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Leaderboard" back="profile" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className="grid grid-cols-3 gap-2">
          {combined.slice(0, 3).map((e, i) => (
            <div
              key={e.name}
              className={cn(
                "rounded-3xl border p-3 text-center",
                i === 0 ? "border-primary/50 gradient-surface shadow-glow" : "border-border bg-card",
              )}
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-background text-2xl">{e.avatar}</div>
              <p className="mt-2 truncate font-display text-sm">{e.name}</p>
              <p className="text-[10px] text-muted-foreground">Rank #{e.rank}</p>
              <p className="mt-1 font-display text-sm text-[oklch(0.87_0.17_90)]">₹{e.earnings.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-display text-lg">All players</h2>
        <div className="mt-3 space-y-2">
          {combined.map((e) => (
            <div
              key={e.name}
              className={cn(
                "grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3",
                e.isYou ? "border-primary bg-primary/10" : "border-border bg-card",
              )}
            >
              <span className="w-6 text-center font-display text-sm text-muted-foreground">#{e.rank}</span>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-background text-lg">{e.avatar}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{e.name}</p>
                <p className="text-[10px] text-muted-foreground">{e.wins} wins</p>
              </div>
              <p className="shrink-0 font-display text-sm text-[oklch(0.87_0.17_90)]">₹{e.earnings.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
