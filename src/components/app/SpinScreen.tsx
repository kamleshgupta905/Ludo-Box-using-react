import { useMemo, useState } from "react";
import { ScreenHeader } from "./ScreenHeader";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

type Segment = { label: string; kind: "cash" | "bonus" | "none"; amount: number };
const segments: Segment[] = [
  { label: "₹5", kind: "cash", amount: 5 },
  { label: "₹10", kind: "cash", amount: 10 },
  { label: "₹20 Bonus", kind: "bonus", amount: 20 },
  { label: "₹50", kind: "cash", amount: 50 },
  { label: "₹100 Bonus", kind: "bonus", amount: 100 },
  { label: "Try again", kind: "none", amount: 0 },
  { label: "Retry", kind: "none", amount: 0 },
  { label: "₹200", kind: "cash", amount: 200 },
];

function nextSpinIn(last: number | null) {
  if (!last) return null;
  const ms = 20 * 60 * 60 * 1000 - (Date.now() - last);
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function SpinScreen() {
  const canSpin = useApp((s) => s.canSpin);
  const claim = useApp((s) => s.claimSpinReward);
  const spinLastAt = useApp((s) => s.spinLastAt);

  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Segment | null>(null);
  const eligible = canSpin();
  const waitStr = useMemo(() => nextSpinIn(spinLastAt), [spinLastAt]);

  const spin = () => {
    if (spinning || !eligible) return;
    setResult(null);
    setSpinning(true);
    const idx = Math.floor(Math.random() * segments.length);
    const per = 360 / segments.length;
    const target = 360 * 6 + (360 - idx * per) - per / 2;
    setRot((prev) => prev + target);
    setTimeout(() => {
      const won = segments[idx];
      setResult(won);
      setSpinning(false);
      claim(won);
      if (won.kind === "none") toast("Better luck next time");
      else toast.success(`You won ${won.label}!`);
    }, 3500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Daily Spin" back="home" />
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">One free spin per day</p>
        <div className="relative mt-4">
          <div className="absolute -top-2 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[16px] border-x-transparent border-t-primary" />
          <div
            className="relative h-72 w-72 overflow-hidden rounded-full border-8 border-primary shadow-glow transition-transform"
            style={{
              transitionDuration: "3.4s",
              transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              transform: `rotate(${rot}deg)`,
            }}
          >
            {segments.map((p, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-start justify-center pt-4"
                style={{ transform: `rotate(${i * (360 / segments.length)}deg)` }}
              >
                <div
                  className={cn("absolute inset-0", i % 2 === 0 ? "bg-card" : "bg-accent/30")}
                  style={{ clipPath: "polygon(50% 50%, 30% 0%, 70% 0%)" }}
                />
                <span className="relative font-display text-[11px] text-foreground">{p.label}</span>
              </div>
            ))}
            <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full gradient-gold text-2xl shadow-card">
              🎡
            </div>
          </div>
        </div>

        {result && !spinning && (
          <div className="animate-pop mt-6 rounded-2xl gradient-primary px-6 py-3 font-display text-primary-foreground shadow-glow">
            {result.kind === "none" ? "No luck this time 😅" : `You won ${result.label}!`}
          </div>
        )}

        <button
          onClick={spin}
          disabled={spinning || !eligible}
          className="mt-6 w-full max-w-xs rounded-full gradient-primary py-4 font-display text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {spinning ? "Spinning..." : eligible ? "Spin Now" : `Next spin in ${waitStr}`}
        </button>
      </div>
    </div>
  );
}
