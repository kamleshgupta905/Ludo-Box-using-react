import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Dice5, ShieldCheck, Zap, Trophy, ArrowRight, type LucideIcon } from "lucide-react";

type Slide = { Icon: LucideIcon; title: string; body: string; kicker: string };
const slides: Slide[] = [
  { Icon: Dice5, kicker: "01 · Play", title: "Skill meets stakes.", body: "Real-money Ludo tables and daily tournaments — decided by strategy, not luck." },
  { Icon: ShieldCheck, kicker: "02 · Safe", title: "Bank-grade security.", body: "256-bit encryption. KYC-verified withdrawals. Certified RNG on every dice roll." },
  { Icon: Zap, kicker: "03 · Fast", title: "Instant payouts.", body: "UPI withdrawals settle in minutes. Bank transfers within 24 hours, every time." },
  { Icon: Trophy, kicker: "04 · Community", title: "One crore+ players.", body: "Compete against India's sharpest Ludo players. Climb leagues. Take home the prize." },
];

export function Onboarding() {
  const [idx, setIdx] = useState(0);
  const finish = useApp((s) => s.finishOnboarding);
  const isLast = idx === slides.length - 1;
  const slide = slides[idx];
  const Icon = slide.Icon;

  return (
    <div className="relative flex h-full flex-col gradient-board surface-noise">
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="font-display text-lg text-foreground">
          Ludo<span className="text-primary">.</span>
        </span>
        <button
          onClick={finish}
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center px-8">
        <div key={idx} className="animate-fade-up">
          <div className="relative mb-10 h-40 w-40">
            <div className="absolute inset-0 rounded-[2rem] bg-primary/15 blur-2xl" />
            <div className="relative grid h-full w-full place-items-center rounded-[2rem] border border-primary/30 gradient-surface shadow-card">
              <Icon className="h-16 w-16 text-primary" strokeWidth={1.6} />
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-primary">{slide.kicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] text-foreground">
            {slide.title}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {slide.body}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 pb-8">
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[3px] rounded-full transition-all",
                i === idx ? "w-8 bg-primary" : "w-4 bg-muted",
              )}
            />
          ))}
        </div>
        <button
          onClick={() => (isLast ? finish() : setIdx(idx + 1))}
          className="inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3 font-display text-sm text-primary-foreground shadow-glow transition-transform active:scale-95"
        >
          {isLast ? "Enter Lobby" : "Next"}
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
