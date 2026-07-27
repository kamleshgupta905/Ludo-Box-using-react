import { useState } from "react";
import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const quick = [50, 100, 200, 500, 1000, 2000];
const methods = [
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm", icon: "⚡", tag: "Recommended" },
  { id: "card", label: "Debit / Credit Card", sub: "Visa, Mastercard, Rupay", icon: "💳" },
  { id: "nb", label: "Net Banking", sub: "All major banks", icon: "🏦" },
  { id: "wallet", label: "Wallet", sub: "Paytm, Mobikwik", icon: "👛" },
];

export function DepositScreen() {
  const setScreen = useApp((s) => s.setScreen);
  const addDeposit = useApp((s) => s.addDeposit);
  const [amount, setAmount] = useState<number>(100);
  const [method, setMethod] = useState("upi");
  const [done, setDone] = useState(false);
  const bonus = Math.round(amount * 0.2);

  const submit = () => {
    if (amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    addDeposit(amount, `Added via ${method.toUpperCase()}`);
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="Deposit" back="wallet" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="animate-pop grid h-24 w-24 place-items-center rounded-full bg-success text-success-foreground shadow-glow">
            <Check className="h-12 w-12" strokeWidth={3} />
          </div>
          <h2 className="mt-6 font-display text-2xl">₹{amount} added!</h2>
          <p className="mt-1 text-sm text-muted-foreground">+₹{bonus} bonus credited. Demo transaction — no real money moved.</p>
          <button
            onClick={() => setScreen("home")}
            className="mt-8 w-full rounded-full gradient-primary py-3.5 font-display text-primary-foreground shadow-glow"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Add Money" back="wallet" />
      <div className="flex-1 overflow-y-auto p-4 pb-32 stagger-children">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter amount</p>
        <div className="mt-2 flex items-baseline gap-1 rounded-3xl border border-border bg-card p-5">
          <span className="font-display text-3xl text-muted-foreground">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            className="w-full bg-transparent font-display text-4xl outline-none"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {quick.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className={cn(
                "rounded-full py-2 text-sm font-bold",
                amount === q ? "gradient-primary text-primary-foreground" : "bg-card text-foreground",
              )}
            >
              ₹{q}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-[oklch(0.87_0.17_90/0.15)] p-3 text-xs">
          🎁 Get ₹{bonus} bonus (20%) on ₹{amount}
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment method</p>
        <div className="mt-2 space-y-2">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 text-left",
                method === m.id ? "border-primary bg-primary/10" : "border-border bg-card",
              )}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-xl">{m.icon}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold">{m.label}</span>
                  {m.tag && (
                    <span className="rounded-full bg-success px-2 py-0.5 text-[9px] font-bold uppercase text-success-foreground">
                      {m.tag}
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{m.sub}</p>
              </div>
              <div
                className={cn(
                  "h-5 w-5 shrink-0 rounded-full border-2",
                  method === m.id ? "border-primary bg-primary" : "border-border",
                )}
              />
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          SSL Secured • Demo mode
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <button
          onClick={submit}
          className="w-full rounded-full gradient-primary py-3.5 font-display text-primary-foreground shadow-glow active:scale-95"
        >
          Add ₹{amount} to Wallet
        </button>
      </div>
    </div>
  );
}
