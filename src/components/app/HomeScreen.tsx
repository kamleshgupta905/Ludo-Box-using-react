import {
  Bell,
  Flame,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Dice5,
  Zap,
  Flag,
  Trophy,
  Users,
  Gift,
  Sparkles,
  BadgeCheck,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { useApp, selectTotalBalance } from "@/lib/store";
import { gameModes, liveTicker } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const modeIcon: Record<string, LucideIcon> = {
  practice: Dice5,
  quick: Zap,
  classic: Flag,
  tournament: Trophy,
  private: Users,
};

const quickLinks = [
  { id: "refer", Icon: Gift, label: "Refer" },
  { id: "spin", Icon: Sparkles, label: "Daily Spin" },
  { id: "kyc", Icon: BadgeCheck, label: "KYC" },
  { id: "support", Icon: MessageCircle, label: "Support" },
] as const;

export function HomeScreen() {
  const setScreen = useApp((s) => s.setScreen);
  const user = useApp((s) => s.user);
  const balance = useApp((s) => s.balance);
  const stats = useApp((s) => s.stats);
  const total = useApp(selectTotalBalance);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto pb-8 stagger-children">
      <header className="flex items-center justify-between px-5 pt-5">
        <button onClick={() => setScreen("profile")} className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card font-display text-sm text-primary">
            {initials}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">Welcome back</p>
            <p className="flex items-center gap-1.5 truncate font-display text-sm text-foreground">
              {user.name}
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                <Flame className="h-2.5 w-2.5" /> {stats.streak}
              </span>
            </p>
          </div>
        </button>
        <button className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
        </button>
      </header>

      <section className="relative mx-5 mt-5 overflow-hidden rounded-3xl border border-primary/25 gradient-surface p-5 shadow-card surface-noise">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Total Balance</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Demo</span>
        </div>
        <p className="font-numeric relative mt-2 text-[44px] font-bold leading-none text-foreground">
          <span className="text-primary">₹</span>
          {total.toLocaleString("en-IN")}
        </p>

        <div className="relative mt-4 grid grid-cols-3 gap-2 text-[10px]">
          {[
            { label: "Deposit", value: balance.deposit },
            { label: "Winning", value: balance.winning },
            { label: "Bonus", value: balance.bonus },
          ].map((b) => (
            <div key={b.label} className="rounded-xl border border-border bg-background/40 px-3 py-2">
              <div className="uppercase tracking-wider text-muted-foreground">{b.label}</div>
              <div className="mt-0.5 font-numeric text-sm font-semibold text-foreground">₹{b.value.toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setScreen("deposit")}
            className="inline-flex items-center justify-center gap-1.5 rounded-full gradient-gold py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Money
          </button>
          <button
            onClick={() => setScreen("withdraw")}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card py-2.5 text-sm font-semibold text-foreground"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} /> Withdraw
          </button>
        </div>
      </section>

      <div className="mx-5 mt-4 flex items-center gap-3 rounded-full border border-border bg-card/60 py-2 pl-2 pr-3">
        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-foreground">Live</span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-10 whitespace-nowrap animate-ticker">
            {[...liveTicker, ...liveTicker].map((t, i) => (
              <span key={i} className="text-[11px] text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-7 px-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Game modes</p>
            <h2 className="mt-0.5 font-display text-xl text-foreground">Play now</h2>
          </div>
          <button onClick={() => setScreen("play")} className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary">
            All tables <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-6 gap-2.5">
          {gameModes.map((m, i) => {
            const Icon = modeIcon[m.id] ?? Dice5;
            const span = ["col-span-6", "col-span-4", "col-span-2", "col-span-3", "col-span-3"][i] ?? "col-span-3";
            const isHero = i === 0;
            const isEmber = i === 1;
            return (
              <button
                key={m.id}
                onClick={() => setScreen(m.id === "tournament" ? "tournaments" : "play")}
                className={cn(
                  "group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all active:scale-[0.98]",
                  span,
                  isHero ? "min-h-[130px] border-primary/30 gradient-surface shadow-card" : isEmber ? "border-transparent gradient-ember shadow-ember" : "border-border bg-card hover:border-primary/30",
                )}
              >
                {isHero && <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />}
                <div className="relative flex w-full items-start justify-between">
                  <div className={cn("grid h-10 w-10 place-items-center rounded-xl border", isEmber ? "border-white/25 bg-white/10 text-white" : "border-border bg-background/50 text-primary")}>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  {m.tag && (
                    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", m.tag === "FREE" ? "bg-success/20 text-success" : m.tag === "HOT" ? "bg-white/20 text-white" : "bg-primary/15 text-primary")}>
                      {m.tag}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <p className={cn("font-display text-base", isEmber ? "text-white" : "text-foreground")}>{m.title}</p>
                  <p className={cn("mt-0.5 text-[11px]", isEmber ? "text-white/80" : "text-muted-foreground")}>{m.subtitle}</p>
                </div>
                {isHero && (
                  <div className="relative mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Start practicing <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7 px-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Shortcuts</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {quickLinks.map((q) => {
            const Icon = q.Icon;
            return (
              <button
                key={q.id}
                onClick={() => setScreen(q.id as never)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-background/60 text-primary">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-semibold text-foreground">{q.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
