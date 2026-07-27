import { ScreenHeader } from "./ScreenHeader";
import { MessageCircle, FileQuestion, BookOpen, Scale, ShieldCheck, RefreshCcw, Phone } from "lucide-react";

const rows = [
  { icon: MessageCircle, label: "Chat with Support", sub: "Avg reply 5 min" },
  { icon: FileQuestion, label: "FAQs", sub: "Deposits, KYC, gameplay" },
  { icon: BookOpen, label: "How to Play", sub: "Learn Ludo rules" },
  { icon: Scale, label: "Fair Play Policy", sub: "RNG & dispute policy" },
  { icon: ShieldCheck, label: "Responsible Gaming", sub: "Set limits, self-exclude" },
  { icon: RefreshCcw, label: "Refund Policy", sub: "How refunds work" },
];

export function SupportScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Help & Support" back="profile" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className="rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
          <p className="font-display text-lg">Need help?</p>
          <p className="mt-1 text-xs opacity-80">
            Our team is available 24/7. Chat, email, or call — we're here.
          </p>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-background/95 py-2.5 text-sm font-bold text-foreground">
            <MessageCircle className="h-4 w-4" /> Start Chat
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
          {rows.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={i}
                className="grid w-full grid-cols-[auto_1fr] items-center gap-3 border-b border-border p-4 text-left last:border-b-0 active:bg-accent"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{r.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{r.sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/15">
            <Phone className="h-4 w-4 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Gambling Helpline</p>
            <p className="truncate text-[11px] text-muted-foreground">Free & confidential — 1800-XXX-XXXX</p>
          </div>
        </div>
      </div>
    </div>
  );
}
