import { Home, Gamepad2, Trophy, Wallet, User } from "lucide-react";
import { useApp, type Screen } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs: { id: Screen; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "play", label: "Play", Icon: Gamepad2 },
  { id: "tournaments", label: "Tourneys", Icon: Trophy },
  { id: "wallet", label: "Wallet", Icon: Wallet },
  { id: "profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const { screen, setScreen } = useApp();
  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
      <div className="grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ id, label, Icon }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className="relative flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold transition-colors"
            >
              {active && (
                <span className="absolute -top-2 h-[3px] w-8 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
