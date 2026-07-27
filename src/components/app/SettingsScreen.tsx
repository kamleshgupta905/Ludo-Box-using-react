import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { Fingerprint, Lock, Bell, Globe, Palette, Timer, Volume2 } from "lucide-react";
import { toast } from "sonner";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-background shadow transition-transform ${on ? "translate-x-6" : "translate-x-0.5"} mt-0.5`}
      />
    </button>
  );
}

export function SettingsScreen() {
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const language = useApp((s) => s.language);
  const setLanguage = useApp((s) => s.setLanguage);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Settings" back="profile" />
      <div className="flex-1 overflow-y-auto p-4 stagger-children">
        <Section title="Security">
          <Row
            icon={Lock}
            label="Change PIN"
            trailing={<span className="text-xs text-muted-foreground">4-digit</span>}
            onClick={() => toast("PIN change coming soon (demo)")}
          />
          <Row
            icon={Fingerprint}
            label="Biometric login"
            trailing={<Toggle on={settings.biometric} onChange={(v) => update({ biometric: v })} />}
          />
        </Section>

        <Section title="Preferences">
          <Row
            icon={Bell}
            label="Notifications"
            trailing={<Toggle on={settings.notif} onChange={(v) => update({ notif: v })} />}
          />
          <Row
            icon={Globe}
            label="Language"
            trailing={
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="text-xs font-semibold text-primary"
              >
                {language === "en" ? "English" : "हिंदी"}
              </button>
            }
          />
          <Row
            icon={Palette}
            label="Dark theme"
            trailing={<Toggle on={settings.dark} onChange={(v) => update({ dark: v })} />}
          />
          <Row
            icon={Volume2}
            label="Sound & vibration"
            trailing={<Toggle on={settings.sound} onChange={(v) => update({ sound: v })} />}
          />
        </Section>

        <Section title="Responsible Gaming">
          <Row
            icon={Timer}
            label="Daily deposit limit"
            trailing={<span className="text-xs font-numeric">₹{settings.dailyDepositLimit.toLocaleString("en-IN")}</span>}
          />
          <Row
            icon={Timer}
            label="Daily play time"
            trailing={<span className="text-xs font-numeric">{Math.round(settings.dailyPlayMinutes / 60)} hours</span>}
          />
          <Row icon={Timer} label="Self-exclusion" trailing={<span className="text-xs text-destructive">Off</span>} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  trailing,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  trailing: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border p-4 text-left last:border-b-0 active:bg-accent/20"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="min-w-0 truncate text-sm font-semibold">{label}</span>
      {trailing}
    </button>
  );
}
