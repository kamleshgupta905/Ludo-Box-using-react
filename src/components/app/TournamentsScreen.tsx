import { ScreenHeader } from "./ScreenHeader";
import { tournaments } from "@/lib/demo-data";
import { useApp } from "@/lib/store";
import { Users, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TournamentsScreen() {
  const joinTournament = useApp((s) => s.joinTournament);
  const registered = useApp((s) => s.registeredTournaments);
  const setScreen = useApp((s) => s.setScreen);

  const join = (id: string, entry: number, name: string) => {
    const r = joinTournament(id, entry, name);
    if (!r.ok) {
      toast.error(r.message ?? "Cannot join");
      if (r.message === "Add money to play") setScreen("deposit");
      return;
    }
    toast.success(`Registered for ${name}!`);
  };

  const featured = tournaments[0];
  const isRegisteredFeatured = registered.includes(featured.id);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Tournaments" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className="overflow-hidden rounded-3xl gradient-primary p-5 shadow-glow">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary-foreground/80">
            🏆 {featured.name}
          </div>
          <p className="mt-1 font-display text-4xl text-primary-foreground">
            ₹{featured.prize.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-primary-foreground/80">Total prize pool</p>
          <div className="mt-3 flex items-center justify-between text-xs text-primary-foreground">
            <span>Entry ₹{featured.entry}</span>
            <span>{featured.players}/{featured.maxPlayers} players</span>
            <span>Starts in {featured.startsIn}</span>
          </div>
          <button
            onClick={() => !isRegisteredFeatured && join(featured.id, featured.entry, featured.name)}
            disabled={isRegisteredFeatured}
            className="mt-4 w-full rounded-full bg-background py-2.5 text-sm font-bold text-foreground disabled:opacity-70"
          >
            {isRegisteredFeatured ? "✓ Registered" : "Register Now"}
          </button>
        </div>

        <h2 className="mt-6 font-display text-xl">All Tournaments</h2>
        <div className="mt-3 space-y-3">
          {tournaments.map((t) => {
            const isReg = registered.includes(t.id);
            return (
              <div key={t.id} className="rounded-3xl border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          t.status === "live"
                            ? "bg-destructive text-destructive-foreground"
                            : t.status === "registering"
                              ? "bg-success text-success-foreground"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {t.status}
                      </span>
                      <h3 className="truncate font-display text-base">{t.name}</h3>
                    </div>
                    <p className="mt-2 font-display text-2xl text-[oklch(0.87_0.17_90)]">
                      ₹{t.prize.toLocaleString("en-IN")}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {t.players}/{t.maxPlayers}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {t.startsIn}
                      </span>
                      <span>Entry ₹{t.entry}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => !isReg && join(t.id, t.entry, t.name)}
                    disabled={isReg}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-xs font-bold",
                      isReg
                        ? "border border-success/40 bg-success/10 text-success"
                        : "gradient-primary text-primary-foreground shadow-glow",
                    )}
                  >
                    {isReg ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3 w-3" /> Joined
                      </span>
                    ) : (
                      "Join"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
