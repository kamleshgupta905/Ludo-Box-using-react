import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { BottomNav } from "@/components/app/BottomNav";
import { DepositScreen } from "@/components/app/DepositScreen";
import { GameResultScreen } from "@/components/app/GameResultScreen";
import { GameRoomScreen } from "@/components/app/GameRoomScreen";
import { HistoryScreen } from "@/components/app/HistoryScreen";
import { HomeScreen } from "@/components/app/HomeScreen";
import { KycScreen } from "@/components/app/KycScreen";
import { LeaderboardScreen } from "@/components/app/LeaderboardScreen";
import { Onboarding } from "@/components/app/Onboarding";
import { PlayScreen } from "@/components/app/PlayScreen";
import { ProfileScreen } from "@/components/app/ProfileScreen";
import { ReferScreen } from "@/components/app/ReferScreen";
import { SettingsScreen } from "@/components/app/SettingsScreen";
import { Splash } from "@/components/app/Splash";
import { SpinScreen } from "@/components/app/SpinScreen";
import { SupportScreen } from "@/components/app/SupportScreen";
import { TournamentsScreen } from "@/components/app/TournamentsScreen";
import { WalletScreen } from "@/components/app/WalletScreen";
import { WithdrawScreen } from "@/components/app/WithdrawScreen";
import { useApp, type Screen } from "@/lib/store";
import "./styles.css";

const bottomTabs: Screen[] = ["home", "play", "tournaments", "wallet", "profile"];

function App() {
  const screen = useApp((state) => state.screen);

  if (screen === "splash") return <Frame><Splash /></Frame>;
  if (screen === "onboarding") return <Frame><Onboarding /></Frame>;

  return (
    <Frame>
      <div key={screen} className="flex flex-1 flex-col overflow-hidden animate-screen-in">
        {renderScreen(screen)}
      </div>
      {bottomTabs.includes(screen) && <BottomNav />}
      <Toaster position="top-center" theme="dark" richColors closeButton />
    </Frame>
  );
}

function renderScreen(screen: Screen) {
  switch (screen) {
    case "home": return <HomeScreen />;
    case "play": return <PlayScreen />;
    case "tournaments": return <TournamentsScreen />;
    case "wallet": return <WalletScreen />;
    case "profile": return <ProfileScreen />;
    case "deposit": return <DepositScreen />;
    case "withdraw": return <WithdrawScreen />;
    case "kyc": return <KycScreen />;
    case "refer": return <ReferScreen />;
    case "spin": return <SpinScreen />;
    case "gameRoom": return <GameRoomScreen />;
    case "gameResult": return <GameResultScreen />;
    case "history": return <HistoryScreen />;
    case "leaderboard": return <LeaderboardScreen />;
    case "support": return <SupportScreen />;
    case "settings": return <SettingsScreen />;
    default: return <HomeScreen />;
  }
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden bg-background text-foreground" style={{ height: "100dvh", minHeight: "100dvh" }}>
      {children}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
