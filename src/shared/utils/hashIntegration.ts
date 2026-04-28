import CryptoJS from "crypto-js";
import { RetroToast } from "../ui/RetroToast";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback_veil_grey_key";

export type InjectPayloadType = "XP" | "ITEM" | "EFFECT" | "ACTION";

export interface InjectPayload {
  id: string;
  type: InjectPayloadType;
  singleUse: boolean;
  data: unknown;
}

export const generateInjectionHash = (
  payloads: Omit<InjectPayload, "id"> | Omit<InjectPayload, "id">[],
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

  navigator.clipboard.writeText(hash);
  RetroToast.success(
    `[DEV] HASH GERADA E COPIADA (${finalPayloads.length} instrução/ões)`,
  );

  return hash;
};
