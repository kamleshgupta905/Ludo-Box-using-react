import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { referralCode } from "@/lib/demo-data";
import { Copy, Share2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export function ReferScreen() {
  const invited = useApp((s) => s.referralInvited);
  const bonusClaimed = useApp((s) => s.referralBonusClaimed);
  const claim = useApp((s) => s.claimReferralBonus);
  const simulate = useApp((s) => s.simulateReferralJoin);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Code copied to clipboard");
    } catch {
      toast("Copy failed — long press to copy");
    }
  };

  const share = async () => {
    const text = `Play Ludo Feel with my code ${referralCode} and get ₹25 bonus!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ludo Feel", text });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Share text copied");
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Refer & Earn" back="profile" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className="rounded-3xl gradient-primary p-6 text-center text-primary-foreground shadow-glow">
          <div className="text-4xl">🎁</div>
          <h2 className="mt-2 font-display text-2xl">Invite friends, earn ₹50</h2>
          <p className="mt-1 text-xs opacity-80">
            Your friend gets ₹25 welcome bonus. You get ₹50 on first deposit.
          </p>

          <div className="mt-4 rounded-2xl bg-background/95 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your code</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-display text-2xl text-foreground">{referralCode}</p>
              <button
                onClick={copyCode}
                className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background"
                aria-label="Copy"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={share}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-background/95 py-3 text-sm font-bold text-foreground"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Invited" value={invited} />
          <Stat label="Bonus" value={bonusClaimed ? "Claimed" : "₹50"} highlight={!bonusClaimed} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const r = claim();
              if (r.ok) toast.success("₹50 bonus credited");
              else toast.error(r.message ?? "Failed");
            }}
            disabled={bonusClaimed}
            className="rounded-full gradient-gold py-3 font-display text-sm text-gold-foreground shadow-glow disabled:opacity-50"
          >
            Claim ₹50 bonus
          </button>
          <button
            onClick={() => {
              simulate();
              toast.success("Demo: friend joined, +₹25 bonus");
            }}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-border bg-card py-3 text-sm font-bold"
          >
            <UserPlus className="h-4 w-4" /> Simulate join
          </button>
        </div>

        <h3 className="mt-6 font-display text-lg">How it works</h3>
        <div className="mt-2 space-y-3">
          {[
            "Share your code with friends",
            "They sign up using your code",
            "They make their first deposit",
            "You both get bonus credited instantly",
          ].map((t, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary font-display text-primary-foreground">
                {i + 1}
              </div>
              <p className="self-center text-sm">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl ${highlight ? "text-[oklch(0.87_0.17_90)]" : ""}`}>{value}</p>
    </div>
  );
}
