import { useState } from "react";
import { Users, Info, Dice5, Zap, Flag, Trophy, type LucideIcon } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { tables, gameModes } from "@/lib/demo-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const modeIcon: Record<string, LucideIcon> = {
  practice: Dice5,
  quick: Zap,
  classic: Flag,
  tournament: Trophy,
  private: Users,
};

const filters = [0, 10, 50, 100, 500, 1000];

export function PlayScreen() {
  const [filter, setFilter] = useState<number>(0);
  const setScreen = useApp((s) => s.setScreen);
  const startTable = useApp((s) => s.startTable);
  const list = filter === 0 ? tables : tables.filter((t) => t.entry === filter);

  const join = (t: (typeof tables)[number]) => {
    const label = t.entry === 0 ? "Practice" : `Cash ₹${t.entry}`;
    const res = startTable({ entry: t.entry, prize: t.prize, label });
    if (!res.ok) {
      toast.error(res.message ?? "Cannot join");
      if (res.message === "Add money to play") setScreen("deposit");
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Game Lobby" />

      <div className="no-scrollbar overflow-x-auto border-b border-border">
        <div className="flex gap-2 px-4 py-3">
          {gameModes.slice(0, 4).map((m, i) => {
            const Icon = modeIcon[m.id] ?? Dice5;
            return (
              <button
                key={m.id}
                onClick={() => m.id === "tournament" && setScreen("tournaments")}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
                  i === 1
                    ? "border-transparent gradient-gold text-primary-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {m.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <div className="flex gap-2 px-4 py-3">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold",
                filter === f ? "bg-foreground text-background" : "bg-card text-muted-foreground",
              )}
            >
              {f === 0 ? "All" : `₹${f}${f === 1000 ? "+" : ""}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 stagger-children">
        <div className="space-y-3">
          {list.map((t) => {
            const isFree = t.entry === 0;
            return (
              <div key={t.id} className="rounded-3xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {isFree ? "Practice vs AI" : "1 vs AI • Ludo Supreme"}
                    </div>
                    <p className="mt-1 font-display text-2xl">
                      {isFree ? "FREE" : `₹${t.entry}`}
                      <span className="text-xs font-normal text-muted-foreground"> entry</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                      Prize <Info className="h-3 w-3" />
                    </div>
                    <p className="font-display text-xl text-[oklch(0.87_0.17_90)]">
                      {isFree ? "—" : `₹${t.prize}`}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  1 vs Smart AI • 2 min match • {t.commission}% commission
                </div>

                <button
                  onClick={() => join(t)}
                  className="mt-3 w-full rounded-full gradient-primary py-3 font-display text-sm text-primary-foreground shadow-glow active:scale-95"
                >
                  {isFree ? "Play Free →" : `Join for ₹${t.entry} →`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
