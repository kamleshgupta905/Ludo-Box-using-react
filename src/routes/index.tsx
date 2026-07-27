import { createFileRoute } from "@tanstack/react-router";
import { useApp, type Screen } from "@/lib/store";
import { Splash } from "@/components/app/Splash";
import { Onboarding } from "@/components/app/Onboarding";
import { HomeScreen } from "@/components/app/HomeScreen";
import { PlayScreen } from "@/components/app/PlayScreen";
import { TournamentsScreen } from "@/components/app/TournamentsScreen";
import { WalletScreen } from "@/components/app/WalletScreen";
import { ProfileScreen } from "@/components/app/ProfileScreen";
import { DepositScreen } from "@/components/app/DepositScreen";
import { WithdrawScreen } from "@/components/app/WithdrawScreen";
import { KycScreen } from "@/components/app/KycScreen";
import { ReferScreen } from "@/components/app/ReferScreen";
import { SpinScreen } from "@/components/app/SpinScreen";
import { GameRoomScreen } from "@/components/app/GameRoomScreen";
import { GameResultScreen } from "@/components/app/GameResultScreen";
import { SupportScreen } from "@/components/app/SupportScreen";
import { SettingsScreen } from "@/components/app/SettingsScreen";
import { HistoryScreen } from "@/components/app/HistoryScreen";
import { LeaderboardScreen } from "@/components/app/LeaderboardScreen";
import { BottomNav } from "@/components/app/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludo Feel — Play, Win & Cash Out" },
      {
        name: "description",
        content:
          "Ludo Feel — the real-money Ludo experience. Play Quick Cash, Classic, and Tournaments in demo mode. Fast withdrawals, safe & fair.",
      },
      { property: "og:title", content: "Ludo Feel — Play, Win & Cash Out" },
      {
        property: "og:description",
        content: "Ludo Feel — the real-money Ludo experience. Play Quick Cash, Classic, and Tournaments in demo mode. Fast withdrawals, safe & fair.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const bottomTabs: Screen[] = ["home", "play", "tournaments", "wallet", "profile"];

function HomePage() {
  const screen = useApp((s) => s.screen);

  if (screen === "splash") return <Frame><Splash /></Frame>;
  if (screen === "onboarding") return <Frame><Onboarding /></Frame>;

  const showNav = bottomTabs.includes(screen);

  return (
    <Frame>
      <div key={screen} className="flex flex-1 flex-col overflow-hidden animate-screen-in">
        {renderScreen(screen)}
      </div>
      {showNav && <BottomNav />}
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

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col overflow-hidden bg-background text-foreground"
      style={{ height: "100dvh", minHeight: "100dvh" }}
    >
      {children}
    </div>
  );
}
