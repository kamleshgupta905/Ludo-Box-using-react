import {
  Dice5,
  Zap,
  Flag,
  Trophy,
  Users,
  Gift,
  Sparkles,
  BadgeCheck,
  MessageCircle,
  ShieldCheck,
  Wallet,
  Coins,
  type LucideIcon,
} from "lucide-react";

export const gameIcons: Record<string, LucideIcon> = {
  practice: Dice5,
  quick: Zap,
  classic: Flag,
  tournament: Trophy,
  private: Users,
};

export const quickLinkIcons: Record<string, LucideIcon> = {
  refer: Gift,
  spin: Sparkles,
  kyc: BadgeCheck,
  support: MessageCircle,
};

export { ShieldCheck, Wallet, Coins };
