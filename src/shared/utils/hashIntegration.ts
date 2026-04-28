import CryptoJS from "crypto-js";
import { RetroToast } from "../ui/RetroToast";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback_veil_grey_key";

export type InjectPayloadType =
  | "XP"
  | "ITEM"
  | "EFFECT"
  | "ACTION"
  | "COMBAT_DEFENSE";

export interface InjectPayload {
  id: string;
  type: InjectPayloadType;
  singleUse: boolean;
  data: unknown;
}

export const generateInjectionHash = (
  payloads: Omit<InjectPayload, "id"> | Omit<InjectPayload, "id">[],
  options?: { silent?: boolean },
) => {
  const arrayPayloads = Array.isArray(payloads) ? payloads : [payloads];

  const finalPayloads: InjectPayload[] = arrayPayloads.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
  }));

  const hash = CryptoJS.AES.encrypt(
    JSON.stringify(finalPayloads),
    SECRET_KEY,
  ).toString();

  const safeUrlHash = encodeURIComponent(hash);
  if (!options?.silent) {
    navigator.clipboard.writeText(safeUrlHash);
    RetroToast.success(
      `[DEV] HASH GERADA E COPIADA (${finalPayloads.length} payloads).`,
    );
  }
  return safeUrlHash;
};

export const copyInjectionHashToClipboard = (hash: string) => {
  navigator.clipboard.writeText(hash);
  RetroToast.success("[DEV] HASH COPIADA PARA A ÁREA DE TRANSFERÊNCIA.");
};
