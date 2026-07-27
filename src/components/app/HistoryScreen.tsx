import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { Trophy, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

function fmtDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function HistoryScreen() {
  const matches = useApp((s) => s.matches);
  const stats = useApp((s) => s.stats);
  const winRate = stats.games ? Math.round((stats.wins / stats.games) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Match History" back="profile" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Games" value={stats.games} />
          <Stat label="Wins" value={stats.wins} accent="text-success" />
          <Stat label="Win rate" value={`${winRate}%`} accent="text-primary" />
        </div>

        <h2 className="mt-6 font-display text-lg">Recent matches</h2>
        <div className="mt-3 space-y-2">
          {matches.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
              No matches yet. Play your first game!
            </p>
          )}
          {matches.map((m) => {
            const mm = Math.floor(m.durationSec / 60);
            const ss = (m.durationSec % 60).toString().padStart(2, "0");
            return (
              <div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className={cn("grid h-10 w-10 place-items-center rounded-full", m.won ? "bg-success/20 text-success" : "bg-destructive/15 text-destructive")}>
                  {m.won ? <Trophy className="h-5 w-5" /> : <Frown className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.mode}</p>
                  <p className="text-[11px] text-muted-foreground">
                    vs {m.opponent} • {m.myScore}–{m.aiScore} • {mm}:{ss} • {fmtDate(m.time)}
                  </p>
                </div>
                <p className={cn("shrink-0 font-display text-sm", m.won ? "text-success" : "text-destructive")}>
                  {m.won ? `+₹${m.prize}` : `−₹${m.entry}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-xl", accent)}>{value}</p>
    </div>
  );
}
