// Static demo constants. Mutable state lives in src/lib/store.ts.

export type GameMode = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tag?: string;
  gradient?: boolean;
};

export const gameModes: GameMode[] = [
  { id: "practice", title: "Practice", subtitle: "Free • vs Smart AI", icon: "🎲", tag: "FREE" },
  { id: "quick", title: "Quick Cash", subtitle: "1 vs 1 • 2 min match", icon: "⚡", tag: "HOT", gradient: true },
  { id: "classic", title: "Classic Cash", subtitle: "1 vs 1 • Higher stakes", icon: "🏁" },
  { id: "tournament", title: "Tournament", subtitle: "Mega prize pool", icon: "🏆", tag: "₹10,000" },
  { id: "private", title: "Private Table", subtitle: "Play with friends", icon: "👥" },
];

export type Table = {
  id: string;
  entry: number;
  players: number;
  spotsLeft: number;
  prize: number;
  commission: number;
};

export const tables: Table[] = [
  { id: "t-free", entry: 0, players: 2, spotsLeft: 1, prize: 0, commission: 0 },
  { id: "t1", entry: 10, players: 2, spotsLeft: 1, prize: 18, commission: 10 },
  { id: "t2", entry: 50, players: 2, spotsLeft: 1, prize: 90, commission: 10 },
  { id: "t3", entry: 100, players: 2, spotsLeft: 1, prize: 180, commission: 10 },
  { id: "t4", entry: 250, players: 2, spotsLeft: 1, prize: 450, commission: 10 },
  { id: "t5", entry: 500, players: 2, spotsLeft: 1, prize: 900, commission: 10 },
  { id: "t6", entry: 1000, players: 2, spotsLeft: 1, prize: 1800, commission: 10 },
];

export type Tournament = {
  id: string;
  name: string;
  prize: number;
  entry: number;
  players: number;
  maxPlayers: number;
  startsIn: string;
  status: "live" | "upcoming" | "registering";
};

export const tournaments: Tournament[] = [
  { id: "tr1", name: "Weekend Mega", prize: 50000, entry: 100, players: 342, maxPlayers: 500, startsIn: "2h 14m", status: "registering" },
  { id: "tr2", name: "Daily Blitz", prize: 5000, entry: 25, players: 87, maxPlayers: 100, startsIn: "18m", status: "registering" },
  { id: "tr3", name: "High Roller", prize: 100000, entry: 500, players: 156, maxPlayers: 200, startsIn: "1d 4h", status: "upcoming" },
  { id: "tr4", name: "Rookie Cup", prize: 2000, entry: 10, players: 245, maxPlayers: 256, startsIn: "Live", status: "live" },
];

export const liveTicker = [
  "🎉 Priya won ₹1,800 in Classic Cash",
  "🔥 Amit won ₹450 in Quick Cash",
  "🏆 Vikram cleared Round 2 of Weekend Mega",
  "💰 Sneha withdrew ₹2,100 to bank",
  "⚡ Rohan won ₹360 in Quick Cash",
];

export const referralCode = "RAHUL50";

export type LeaderboardEntry = {
  rank: number;
  name: string;
  avatar: string;
  earnings: number;
  wins: number;
  isYou?: boolean;
};

// Base leaderboard; user's row is spliced in dynamically using store stats.
export const baseLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "AceMoves99", avatar: "🐉", earnings: 42800, wins: 214 },
  { rank: 2, name: "Priya_S", avatar: "🌸", earnings: 31450, wins: 187 },
  { rank: 3, name: "TokenKing", avatar: "👑", earnings: 28900, wins: 165 },
  { rank: 4, name: "Amit.R", avatar: "⭐", earnings: 22100, wins: 142 },
  { rank: 5, name: "SixOnly", avatar: "🎲", earnings: 19800, wins: 128 },
  { rank: 6, name: "Sneha", avatar: "🎯", earnings: 17250, wins: 119 },
  { rank: 7, name: "Vikram_G", avatar: "🐯", earnings: 15900, wins: 108 },
  { rank: 8, name: "RajaBet", avatar: "🃏", earnings: 12440, wins: 91 },
];

export const aiOpponents = ["Priya", "Amit", "Vikram", "Sneha", "Rohan", "Kavya", "Arjun"];
