import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "play"
  | "tournaments"
  | "wallet"
  | "profile"
  | "deposit"
  | "withdraw"
  | "kyc"
  | "refer"
  | "spin"
  | "gameRoom"
  | "gameResult"
  | "history"
  | "leaderboard"
  | "support"
  | "settings";

export type KycStatus = "verified" | "pending" | "rejected" | "not_started";

export type Transaction = {
  id: string;
  type: "won" | "entry" | "deposit" | "withdraw" | "bonus";
  amount: number;
  label: string;
  time: number; // epoch ms
};

export type Match = {
  id: string;
  time: number;
  mode: string; // "Ludo Supreme ₹50"
  entry: number;
  prize: number;
  won: boolean;
  myScore: number;
  aiScore: number;
  opponent: string;
  durationSec: number;
};

export type LastGame = {
  mode: string;
  entry: number;
  prize: number;
  won: boolean;
  myScore: number;
  aiScore: number;
  opponent: string;
  durationSec: number;
} | null;

export type Settings = {
  notif: boolean;
  sound: boolean;
  dark: boolean;
  biometric: boolean;
  dailyDepositLimit: number;
  dailyPlayMinutes: number;
};

const dayMs = 24 * 60 * 60 * 1000;

type State = {
  screen: Screen;
  onboarded: boolean;
  language: "en" | "hi";

  // user + wallet
  user: { name: string; username: string; level: "Silver" | "Gold" | "Platinum" };
  balance: { deposit: number; winning: number; bonus: number };
  kycStatus: KycStatus;
  stats: { games: number; wins: number; earned: number; streak: number };
  transactions: Transaction[];
  matches: Match[];

  // features
  referralBonusClaimed: boolean;
  referralInvited: number;
  spinLastAt: number | null; // epoch ms
  registeredTournaments: string[]; // tournament ids user joined

  // game context
  currentTable: { entry: number; prize: number; label: string } | null;
  lastGame: LastGame;

  settings: Settings;

  // navigation
  setScreen: (s: Screen) => void;
  finishOnboarding: () => void;
  setLanguage: (l: "en" | "hi") => void;

  // wallet mutations
  addDeposit: (amount: number, note?: string) => void;
  addBonus: (amount: number, note?: string) => void;
  withdrawWinning: (amount: number, method: "upi" | "bank") => { ok: boolean; message?: string };
  chargeEntry: (amount: number, label: string) => { ok: boolean; message?: string };
  creditWinning: (amount: number, label: string) => void;

  // features
  claimSpinReward: (reward: { label: string; amount: number; kind: "cash" | "bonus" | "none" }) => void;
  canSpin: () => boolean;
  claimReferralBonus: () => { ok: boolean; message?: string };
  simulateReferralJoin: () => void;

  // KYC
  submitKyc: () => void;
  setKycStatus: (s: KycStatus) => void;

  // game
  startTable: (table: { entry: number; prize: number; label: string }) => { ok: boolean; message?: string };
  finishGame: (result: LastGame) => void;

  // tournaments
  joinTournament: (id: string, entry: number, name: string) => { ok: boolean; message?: string };
  isRegistered: (id: string) => boolean;

  // settings
  updateSettings: (patch: Partial<Settings>) => void;

  // demo controls
  resetDemo: () => void;
};

const initialState = {
  screen: "splash" as Screen,
  onboarded: false,
  language: "en" as const,
  user: { name: "Rahul K.", username: "@rahul_k", level: "Gold" as const },
  balance: { deposit: 850, winning: 300, bonus: 100 },
  kycStatus: "verified" as KycStatus,
  stats: { games: 12, wins: 7, earned: 420, streak: 5 },
  transactions: [
    { id: "seed1", type: "deposit" as const, amount: 500, label: "Welcome bonus deposit", time: Date.now() - 3 * dayMs },
    { id: "seed2", type: "won" as const, amount: 180, label: "Ludo Supreme ₹100", time: Date.now() - 2 * dayMs },
    { id: "seed3", type: "bonus" as const, amount: 25, label: "Daily spin reward", time: Date.now() - dayMs },
  ] as Transaction[],
  matches: [
    {
      id: "m-seed1",
      time: Date.now() - 2 * dayMs,
      mode: "Ludo Supreme ₹100",
      entry: 100,
      prize: 180,
      won: true,
      myScore: 57,
      aiScore: 42,
      opponent: "Priya",
      durationSec: 128,
    },
    {
      id: "m-seed2",
      time: Date.now() - 4 * dayMs,
      mode: "Ludo Supreme ₹50",
      entry: 50,
      prize: 90,
      won: false,
      myScore: 44,
      aiScore: 57,
      opponent: "Amit",
      durationSec: 154,
    },
  ] as Match[],
  referralBonusClaimed: false,
  referralInvited: 12,
  spinLastAt: null,
  registeredTournaments: [] as string[],
  currentTable: null,
  lastGame: null,
  settings: {
    notif: true,
    sound: true,
    dark: true,
    biometric: true,
    dailyDepositLimit: 5000,
    dailyPlayMinutes: 180,
  },
};

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const pushTx = (list: Transaction[], tx: Omit<Transaction, "id" | "time">): Transaction[] => {
  return [{ id: genId(), time: Date.now(), ...tx }, ...list].slice(0, 100);
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initialState,

      setScreen: (screen) => set({ screen }),
      finishOnboarding: () => set({ onboarded: true, screen: "home" }),
      setLanguage: (language) => set({ language }),

      addDeposit: (amount, note) => {
        if (amount <= 0) return;
        const bonusAdd = Math.round(amount * 0.2);
        set((s) => ({
          balance: {
            ...s.balance,
            deposit: s.balance.deposit + amount,
            bonus: s.balance.bonus + bonusAdd,
          },
          transactions: pushTx(
            pushTx(s.transactions, {
              type: "deposit",
              amount,
              label: note ?? "Added via UPI",
            }),
            { type: "bonus", amount: bonusAdd, label: "Deposit bonus (20%)" },
          ),
        }));
      },

      addBonus: (amount, note) => {
        if (amount <= 0) return;
        set((s) => ({
          balance: { ...s.balance, bonus: s.balance.bonus + amount },
          transactions: pushTx(s.transactions, {
            type: "bonus",
            amount,
            label: note ?? "Bonus credited",
          }),
        }));
      },

      withdrawWinning: (amount, method) => {
        const s = get();
        if (s.kycStatus !== "verified") return { ok: false, message: "Complete KYC first" };
        if (amount < 100) return { ok: false, message: "Minimum ₹100" };
        if (amount > s.balance.winning) return { ok: false, message: "Insufficient winning balance" };
        set((st) => ({
          balance: { ...st.balance, winning: st.balance.winning - amount },
          transactions: pushTx(st.transactions, {
            type: "withdraw",
            amount,
            label: `Withdrawn via ${method === "upi" ? "UPI" : "Bank"}`,
          }),
        }));
        return { ok: true };
      },

      chargeEntry: (amount, label) => {
        const s = get();
        const total = s.balance.deposit + s.balance.winning + s.balance.bonus;
        if (amount > total) return { ok: false, message: "Add money to play" };
        // Deduct from bonus → deposit → winning
        let remaining = amount;
        const bonusUse = Math.min(remaining, s.balance.bonus);
        remaining -= bonusUse;
        const depUse = Math.min(remaining, s.balance.deposit);
        remaining -= depUse;
        const winUse = Math.min(remaining, s.balance.winning);
        set((st) => ({
          balance: {
            bonus: st.balance.bonus - bonusUse,
            deposit: st.balance.deposit - depUse,
            winning: st.balance.winning - winUse,
          },
          transactions: pushTx(st.transactions, {
            type: "entry",
            amount,
            label: `Entry • ${label}`,
          }),
        }));
        return { ok: true };
      },

      creditWinning: (amount, label) => {
        if (amount <= 0) return;
        set((s) => ({
          balance: { ...s.balance, winning: s.balance.winning + amount },
          stats: { ...s.stats, earned: s.stats.earned + amount },
          transactions: pushTx(s.transactions, {
            type: "won",
            amount,
            label: `Won • ${label}`,
          }),
        }));
      },

      canSpin: () => {
        const last = get().spinLastAt;
        if (!last) return true;
        return Date.now() - last >= 20 * 60 * 60 * 1000; // 20h
      },

      claimSpinReward: (reward) => {
        set((s) => {
          const next: Partial<State> = { spinLastAt: Date.now() };
          if (reward.kind === "cash" && reward.amount > 0) {
            next.balance = { ...s.balance, winning: s.balance.winning + reward.amount };
            next.transactions = pushTx(s.transactions, {
              type: "won",
              amount: reward.amount,
              label: `Daily spin • ${reward.label}`,
            });
          } else if (reward.kind === "bonus" && reward.amount > 0) {
            next.balance = { ...s.balance, bonus: s.balance.bonus + reward.amount };
            next.transactions = pushTx(s.transactions, {
              type: "bonus",
              amount: reward.amount,
              label: `Daily spin • ${reward.label}`,
            });
          }
          return next as State;
        });
      },

      claimReferralBonus: () => {
        if (get().referralBonusClaimed) return { ok: false, message: "Already claimed" };
        set((s) => ({
          referralBonusClaimed: true,
          balance: { ...s.balance, bonus: s.balance.bonus + 50 },
          transactions: pushTx(s.transactions, {
            type: "bonus",
            amount: 50,
            label: "Referral bonus • Share",
          }),
        }));
        return { ok: true };
      },

      simulateReferralJoin: () =>
        set((s) => ({
          referralInvited: s.referralInvited + 1,
          balance: { ...s.balance, bonus: s.balance.bonus + 25 },
          transactions: pushTx(s.transactions, {
            type: "bonus",
            amount: 25,
            label: "Referral joined • +₹25",
          }),
        })),

      submitKyc: () => set({ kycStatus: "pending" }),
      setKycStatus: (kycStatus) => set({ kycStatus }),

      startTable: (table) => {
        const res = get().chargeEntry(table.entry, table.label);
        if (!res.ok) return res;
        set({ currentTable: table, screen: "gameRoom" });
        return { ok: true };
      },

      finishGame: (result) => {
        if (!result) return;
        set((s) => {
          const match: Match = {
            id: genId(),
            time: Date.now(),
            ...result,
          };
          const nextStats = {
            ...s.stats,
            games: s.stats.games + 1,
            wins: s.stats.wins + (result.won ? 1 : 0),
          };
          return {
            matches: [match, ...s.matches].slice(0, 50),
            lastGame: result,
            stats: nextStats,
            currentTable: null,
          };
        });
        if (result.won) {
          get().creditWinning(result.prize, result.mode);
        }
      },

      joinTournament: (id, entry, name) => {
        const s = get();
        if (s.registeredTournaments.includes(id)) return { ok: false, message: "Already registered" };
        const charge = get().chargeEntry(entry, `Tournament ${name}`);
        if (!charge.ok) return charge;
        set((st) => ({ registeredTournaments: [...st.registeredTournaments, id] }));
        return { ok: true };
      },

      isRegistered: (id) => get().registeredTournaments.includes(id),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetDemo: () => set({ ...initialState, screen: "home", onboarded: true }),
    }),
    {
      name: "ludo-feel-store-v2",
      partialize: (s) => ({
        onboarded: s.onboarded,
        language: s.language,
        user: s.user,
        balance: s.balance,
        kycStatus: s.kycStatus,
        stats: s.stats,
        transactions: s.transactions,
        matches: s.matches,
        referralBonusClaimed: s.referralBonusClaimed,
        referralInvited: s.referralInvited,
        spinLastAt: s.spinLastAt,
        registeredTournaments: s.registeredTournaments,
        lastGame: s.lastGame,
        settings: s.settings,
      }),
    },
  ),
);

// Helper selectors
export const selectTotalBalance = (s: State) =>
  s.balance.deposit + s.balance.winning + s.balance.bonus;
