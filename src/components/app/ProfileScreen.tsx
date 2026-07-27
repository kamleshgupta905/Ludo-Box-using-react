import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import {
  ChevronRight,
  Shield,
  Bell,
  Globe,
  Palette,
  HelpCircle,
  Gift,
  LogOut,
  BadgeCheck,
  History,
  Award,
} from "lucide-react";
import { toast } from "sonner";

const rows = [
  { icon: BadgeCheck, label: "KYC Verification", to: "kyc" as const },
  { icon: Gift, label: "Refer & Earn", to: "refer" as const },
  { icon: Award, label: "Leaderboard", to: "leaderboard" as const },
  { icon: History, label: "Match History", to: "history" as const },
  { icon: Shield, label: "Security & PIN", to: "settings" as const },
  { icon: Bell, label: "Notifications", to: "settings" as const },
  { icon: Globe, label: "Language", to: "settings" as const },
  { icon: Palette, label: "Theme", to: "settings" as const },
  { icon: HelpCircle, label: "Help & Support", to: "support" as const },
];

export function ProfileScreen() {
  const setScreen = useApp((s) => s.setScreen);
  const user = useApp((s) => s.user);
  const stats = useApp((s) => s.stats);
  const kycStatus = useApp((s) => s.kycStatus);
  const resetDemo = useApp((s) => s.resetDemo);
  const initials = user.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Profile" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-background font-display text-xl text-primary shadow-glow">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.username}</p>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full gradient-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
                {user.level} Member • {kycStatus === "verified" ? "KYC ✓" : "KYC pending"}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-2xl bg-background/50 py-3 text-center">
            <div>
              <p className="font-display text-lg">{stats.games}</p>
              <p className="text-[10px] text-muted-foreground">Games</p>
            </div>
            <div>
              <p className="font-display text-lg text-success">{stats.wins}</p>
              <p className="text-[10px] text-muted-foreground">Wins</p>
            </div>
            <div>
              <p className="font-display text-lg text-[oklch(0.87_0.17_90)]">
                ₹{(stats.earned / 1000).toFixed(1)}K
              </p>
              <p className="text-[10px] text-muted-foreground">Earned</p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
          {rows.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={i}
                onClick={() => setScreen(r.to)}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border p-4 text-left last:border-b-0 active:bg-accent/20"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="min-w-0 truncate text-sm font-semibold">{r.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            resetDemo();
            toast.success("Demo reset");
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/50 py-3 text-sm font-bold text-destructive"
        >
          <LogOut className="h-4 w-4" /> Reset Demo Data
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Ludo Feel • v1.0.0 • Demo Mode
        </p>
      </div>
    </div>
  );
}
