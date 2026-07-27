import { ScreenHeader } from "./ScreenHeader";
import { useApp, type KycStatus } from "@/lib/store";
import { Check, Camera, FileText, Landmark, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const docs = [
  { id: "pan", label: "PAN Card", icon: FileText },
  { id: "aadhar", label: "Aadhar (Front & Back)", icon: FileText },
  { id: "selfie", label: "Selfie / Liveness Check", icon: Camera },
  { id: "bank", label: "Bank Account", icon: Landmark },
];

const meta: Record<KycStatus, { label: string; color: string; ring: string; icon: typeof Check; desc: string }> = {
  verified: {
    label: "KYC Verified",
    color: "text-success",
    ring: "border-success/40 bg-success/10",
    icon: Check,
    desc: "Your identity is fully verified. All withdrawal limits unlocked.",
  },
  pending: {
    label: "KYC Under Review",
    color: "text-primary",
    ring: "border-primary/40 bg-primary/10",
    icon: Clock,
    desc: "We're verifying your documents. Usually done within 24 hours.",
  },
  rejected: {
    label: "KYC Rejected",
    color: "text-destructive",
    ring: "border-destructive/40 bg-destructive/10",
    icon: AlertCircle,
    desc: "Some documents were unclear. Please re-submit.",
  },
  not_started: {
    label: "KYC Not Started",
    color: "text-muted-foreground",
    ring: "border-border bg-card",
    icon: AlertCircle,
    desc: "Complete KYC to enable withdrawals.",
  },
};

export function KycScreen() {
  const kycStatus = useApp((s) => s.kycStatus);
  const submitKyc = useApp((s) => s.submitKyc);
  const setKycStatus = useApp((s) => s.setKycStatus);
  const m = meta[kycStatus];
  const Icon = m.icon;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="KYC Verification" back="profile" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <div className={cn("rounded-3xl border p-5", m.ring)}>
          <div className={cn("grid h-14 w-14 place-items-center rounded-full", kycStatus === "verified" ? "bg-success text-success-foreground" : "bg-card text-primary")}>
            <Icon className="h-7 w-7" strokeWidth={3} />
          </div>
          <p className={cn("mt-3 font-display text-xl", m.color)}>{m.label}</p>
          <p className="text-xs text-muted-foreground">{m.desc}</p>
        </div>

        <div className="mt-4 space-y-2">
          {docs.map((d) => {
            const DIcon = d.icon;
            const status = kycStatus === "verified" ? "verified" : kycStatus === "pending" ? "pending" : "todo";
            return (
              <div
                key={d.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background">
                  <DIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="min-w-0 truncate text-sm font-semibold">{d.label}</span>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                    status === "verified"
                      ? "bg-success/20 text-success"
                      : status === "pending"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {status === "verified" && <Check className="h-3 w-3" />}
                  {status === "verified" ? "Verified" : status === "pending" ? "Reviewing" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        {kycStatus !== "verified" && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {kycStatus === "not_started" || kycStatus === "rejected" ? (
              <button
                onClick={() => {
                  submitKyc();
                  toast.success("Documents submitted for review");
                }}
                className="col-span-2 rounded-full gradient-primary py-3 text-sm font-display text-primary-foreground shadow-glow"
              >
                Submit Documents
              </button>
            ) : null}
            {kycStatus === "pending" && (
              <button
                onClick={() => {
                  setKycStatus("verified");
                  toast.success("Demo: KYC approved");
                }}
                className="col-span-2 rounded-full gradient-gold py-3 text-sm font-display text-gold-foreground shadow-glow"
              >
                Demo: Approve KYC now
              </button>
            )}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <p className="mb-1 font-bold text-foreground">Why KYC?</p>
          Identity verification protects you and enables secure withdrawals. Your data is encrypted end-to-end. Demo — no real documents are collected.
        </div>
      </div>
    </div>
  );
}
