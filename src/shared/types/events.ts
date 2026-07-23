import type { Attribute, CustomEffect, SecondaryAttribute, Skill, CroppedImage } from "./veil-grey";

export type EventStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type CurrencyType = "CC" | "FCC";

export type EventType =
  | "TEST"
  | "MARKET"
  | "MERCHANT"
  | "JOB"
  | "DEBT"
  | "P2P_TRANSFER"
  | "COMBAT";

export interface EventBase {
  id: string;
  roomId: string;
  type: EventType;
  title: string;
  description: string;
  coverImage?: CroppedImage;
  status: EventStatus;
  createdAt: number;
  targets: string[]; // Character IDs
}

export interface TestEvent extends EventBase {
  type: "TEST";
  payload: {
    targetAttribute?: Attribute | SecondaryAttribute;
    targetSkill?: Skill;
    difficulty?: number | null; // se null, teste livre
    onSuccess?: CustomEffect[];
    onFailure?: CustomEffect[];
  };
}

export interface MarketItem {
  itemId: string;
  basePrice: number;
  finalPrice: number; // Preço com flutuação + rng
  stockLimit: number | null; // null = ilimitado
  playerLimit: number | null; // null = ilimitado
}

export interface MarketEvent extends EventBase {
  type: "MARKET";
  payload: {
    items: MarketItem[];
    currency: CurrencyType;
  };
}

export interface MerchantEvent extends EventBase {
  type: "MERCHANT";
  payload: {
    merchantName: string;
    merchantImage?: string;
    currency: CurrencyType;
    devaluationMargin: number; // 0 a 100
    wearImpact: number; // 0 a 100
    isOnline: boolean;
  };
}

export interface JobPaymentRecord {
  transferId: string;
  timestamp: number;
  workerId: string;
  walletId: string;
  baseSalary: number;
  bonus: number;
  discount: number;
  finalAmount: number;
}

export interface JobEvent extends EventBase {
  type: "JOB";
  payload: {
    employerName: string;
    currency: CurrencyType;
    salary: number;
    isRecurring: boolean;
    hiredWorkers: Record<string, { walletId: string }>; // characterId -> { walletId }
    paymentHistory: JobPaymentRecord[];
  };
}

export interface DebtEvent extends EventBase {
  type: "DEBT";
  payload: {
    currency: CurrencyType;
    totalAmount: number;
    remainingAmount: number;
    debtType: "INDIVIDUAL" | "JOINT";
    debts: Record<string, number>; // characterId -> amount owed
    isFixed: boolean; // true = completes when fully paid, false = persistent
  };
}

export interface P2PTransferEvent extends EventBase {
  type: "P2P_TRANSFER";
  payload: {
    currency: CurrencyType;
    hostId: string; // Character ID, NPC ou "MASTER"
    pool: number;
    initialPool: number;
    hostIsPresent: boolean;
    hostConfirmed?: boolean;
    transactions: { id: string; from: string; to: string; amount: number; timestamp: number }[];
    participants: Record<
      string,
      {
        walletId: string;
        initialBalance: number;
        currentBalance: number;
        approved: boolean; // Confirmed wallet
        transferConfirmed?: boolean;
      }
    >;
  };
}

export interface CombatParticipant {
  id: string; // characterId or NPC ID
  name: string;
  initiative: number;
  hasRolledInitiative: boolean;
  reactionUsed: number;
  apUsed: number;
  isBlocked?: boolean;
}

export interface CombatEvent extends EventBase {
  type: "COMBAT";
  payload: {
    participants: Record<string, CombatParticipant>;
    currentRound: number;
    currentTurn: string | null; // characterId ou null se ainda não iniciou
  };
}

export type GameEvent =
  | TestEvent
  | MarketEvent
  | MerchantEvent
  | JobEvent
  | DebtEvent
  | P2PTransferEvent
  | CombatEvent;

export interface EventLogEntry {
  id: string;
  eventId: string;
  timestamp: number;
  message: string;
  characterId: string;
}
