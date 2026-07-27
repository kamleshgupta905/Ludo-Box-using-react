import { useState } from "react";
import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function WithdrawScreen() {
  const setScreen = useApp((s) => s.setScreen);
  const balance = useApp((s) => s.balance);
  const kycStatus = useApp((s) => s.kycStatus);
  const withdrawWinning = useApp((s) => s.withdrawWinning);

  const [amount, setAmount] = useState<number>(Math.min(balance.winning, 200));
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [done, setDone] = useState(false);
  const tds = Math.round(amount * 0.3);
  const receive = Math.max(amount - tds, 0);

  const submit = () => {
    const r = withdrawWinning(amount, method);
    if (!r.ok) {
      toast.error(r.message ?? "Withdrawal failed");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="Withdraw" back="wallet" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="animate-pop grid h-24 w-24 place-items-center rounded-full bg-success text-success-foreground">
            <Check className="h-12 w-12" strokeWidth={3} />
          </div>
          <h2 className="mt-6 font-display text-2xl">Withdrawal initiated</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ₹{receive} will reach you via {method === "upi" ? "UPI (instant)" : "bank (1–3 days)"}. Demo transaction.
          </p>
          <button
            onClick={() => setScreen("wallet")}
            className="mt-8 w-full rounded-full gradient-primary py-3.5 font-display text-primary-foreground shadow-glow"
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Withdraw" back="wallet" />
      <div className="flex-1 overflow-y-auto p-4 pb-32 stagger-children">
        <div className="rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Available (Winning)</p>
          <p className="mt-1 font-display text-4xl">₹{balance.winning.toLocaleString("en-IN")}</p>
          <p className="text-[11px] opacity-80">Min withdrawal ₹100</p>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter amount</p>
        <div className="mt-2 flex items-baseline gap-1 rounded-3xl border border-border bg-card p-5">
          <span className="font-display text-3xl text-muted-foreground">₹</span>
          <input
            type="number"
            value={amount}
            max={balance.winning}
            onChange={(e) => setAmount(Math.max(0, Math.min(Number(e.target.value) || 0, balance.winning)))}
            className="w-full bg-transparent font-display text-4xl outline-none"
          />
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Withdrawal amount</span>
            <span className="font-semibold">₹{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TDS @ 30%</span>
            <span className="font-semibold text-destructive">−₹{tds}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold">You'll receive</span>
            <span className="font-display text-lg text-success">₹{receive}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Demo TDS calculation shown for reference.</p>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Method</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { id: "upi" as const, label: "UPI", sub: "Instant", icon: "⚡" },
            { id: "bank" as const, label: "Bank", sub: "1–3 days", icon: "🏦" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                "rounded-2xl border p-4 text-left",
                method === m.id ? "border-primary bg-primary/10" : "border-border bg-card",
              )}
            >
              <div className="text-2xl">{m.icon}</div>
              <p className="mt-1 font-bold text-sm">{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.sub}</p>
            </button>
          ))}
        </div>

        {kycStatus !== "verified" && (
          <button
            onClick={() => setScreen("kyc")}
            className="mt-4 w-full rounded-2xl bg-destructive/15 p-3 text-left text-xs text-destructive"
          >
            Complete your KYC to enable withdrawals →
          </button>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <button
          onClick={submit}
          disabled={kycStatus !== "verified" || amount < 100 || amount > balance.winning}
          className="w-full rounded-full gradient-primary py-3.5 font-display text-primary-foreground shadow-glow active:scale-95 disabled:opacity-50"
        >
          Withdraw ₹{amount}
        </button>
      </div>
    </div>
  );
}
