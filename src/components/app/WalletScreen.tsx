import { ScreenHeader } from "./ScreenHeader";
import { useApp, type Transaction } from "@/lib/store";
import { ArrowDownLeft, ArrowUpRight, Gift, Trophy, Coins, History } from "lucide-react";
import { cn } from "@/lib/utils";

const iconFor = {
  won: Trophy,
  entry: Coins,
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
  bonus: Gift,
} as const;

const colorFor = {
  won: "text-success",
  entry: "text-muted-foreground",
  deposit: "text-primary",
  withdraw: "text-destructive",
  bonus: "text-[oklch(0.87_0.17_90)]",
} as const;

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function WalletScreen() {
  const setScreen = useApp((s) => s.setScreen);
  const b = useApp((s) => s.balance);
  const transactions = useApp((s) => s.transactions);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader
        title="Wallet"
        right={
          <button
            onClick={() => setScreen("history")}
            className="grid h-10 w-10 place-items-center rounded-full bg-card"
            aria-label="Match history"
          >
            <History className="h-4 w-4" />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {[
            { label: "Deposit Balance", value: b.deposit, sub: "Your deposited money", action: "Add Money", to: "deposit" as const, grad: true },
            { label: "Winning Balance", value: b.winning, sub: "Withdrawable earnings", action: "Withdraw", to: "withdraw" as const },
            { label: "Bonus Balance", value: b.bonus, sub: "Playable, non-withdrawable" },
          ].map((c) => (
            <div key={c.label} className={cn("min-w-[260px] snap-start rounded-3xl border border-border p-5 shadow-card", c.grad ? "gradient-primary" : "bg-card")}>
              <p className={cn("text-[11px] font-bold uppercase tracking-wider", c.grad ? "text-primary-foreground/80" : "text-muted-foreground")}>{c.label}</p>
              <p className={cn("mt-1 font-display text-4xl", c.grad ? "text-primary-foreground" : "")}>₹{c.value.toLocaleString("en-IN")}</p>
              <p className={cn("mt-1 text-[11px]", c.grad ? "text-primary-foreground/80" : "text-muted-foreground")}>{c.sub}</p>
              {c.action && c.to && (
                <button
                  onClick={() => setScreen(c.to)}
                  className={cn("mt-3 rounded-full px-4 py-1.5 text-xs font-bold", c.grad ? "bg-background text-foreground" : "gradient-primary text-primary-foreground")}
                >
                  {c.action}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-xl">Transactions</h2>
          <button onClick={() => setScreen("history")} className="text-xs text-primary">Match history →</button>
        </div>

        <div className="mt-3 space-y-2">
          {transactions.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
              No transactions yet.
            </p>
          )}
          {transactions.map((t: Transaction) => {
            const Icon = iconFor[t.type];
            const sign = t.type === "entry" || t.type === "withdraw" ? "-" : "+";
            return (
              <div key={t.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background">
                  <Icon className={cn("h-4 w-4", colorFor[t.type])} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground">{timeAgo(t.time)}</p>
                </div>
                <p className={cn("shrink-0 font-display text-sm", colorFor[t.type])}>{sign}₹{t.amount.toLocaleString("en-IN")}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
