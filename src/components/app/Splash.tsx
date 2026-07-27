import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { Dice5 } from "lucide-react";

export function Splash() {
  const setScreen = useApp((s) => s.setScreen);
  const onboarded = useApp((s) => s.onboarded);

  useEffect(() => {
    const t = setTimeout(() => {
      setScreen(onboarded ? "home" : "onboarding");
    }, 2200);
    return () => clearTimeout(t);
  }, [setScreen, onboarded]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center gradient-board surface-noise px-8 text-center">
      <div className="animate-pop flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative grid h-24 w-24 place-items-center rounded-3xl gradient-gold shadow-glow animate-float">
            <Dice5 className="h-12 w-12 text-gold-foreground" strokeWidth={2.2} />
          </div>
        </div>
        <h1 className="mt-8 font-display text-5xl tracking-tight text-foreground">
          Ludo <span className="italic text-primary">Feel</span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Feel the game
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3">
        <div className="h-[3px] w-32 overflow-hidden rounded-full bg-card">
          <div className="h-full w-1/3 rounded-full gradient-gold animate-ticker" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          v1.0 · Demo Mode
        </span>
      </div>
    </div>
  );
}
