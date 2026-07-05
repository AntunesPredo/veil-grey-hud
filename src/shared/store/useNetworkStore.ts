import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { useCharacterStore } from "../../features/character/store";
import { RetroToast } from "../ui/RetroToast";
import type {
  Attribute,
  CreationStatus,
  CrisisState,
  CustomEffect,
  Disadvantage,
  EnergyState,
  Item,
  Note,
  Role,
  Skill,
  SustenanceState,
} from "../types/veil-grey";
import type { VitalsSlice } from "../../features/vitals/vitalsSlice";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface QueuedPayload {
  id: string;
  type: string;
  attackerName: string;
  targetName: string;
  data: unknown;
}

export interface PlayerTelemetry {
  core?: {
    attributes: Record<Attribute, number>;
    secondaryAttributes: {
      agility: number;
      mass: number;
      mental_health: number;
      perception: number;
      actionPoints: number;
      reactions: number;
      movement: number;
    };
    skills: Record<Skill, number>;
    evilness: number;
    name: string;
    level: number;
    xp: { current: number; max: number; usedXpLogs: string[] };
    creationStatus: CreationStatus;
    freePoints: { attributes: number; skills: number; specializations: number };
    disadvantages: Disadvantage[];
    role?: Role | null;
  };
  vitals?: {
    hp: VitalsSlice["hp"] & {
      max: number;
    };
    insanity: { current: number; max: number; volatile: boolean };
    energy: { current: number; max: number; state: EnergyState };
    sustenance: { current: number; max: number; state: SustenanceState };
    crisis: { state: CrisisState; fails: number; ignore: boolean };
  };
  inventory?: Item[];
  effects?: CustomEffect[];
  customEffectIds?: number[];
  timestamp: number;
  notes?: {
    notes: Note[];
    mainNote: string;
    mainNoteHeight?: number;
  };
}

interface NetworkState {
  onlinePlayers: string[];
  telemetryData: Record<string, Partial<PlayerTelemetry>>;
  telemetryTimestamps: Record<string, Record<string, number>>;
  channel: RealtimeChannel | null;
  telemetryChannel: RealtimeChannel | null;
  queue: QueuedPayload[];
  localNpcNames: string[];
  globalNpcs: { name: string; isEnemy: boolean }[];

  setLocalNpcNames: (names: string[]) => void;
  setGlobalNpcs: (npcs: { name: string; isEnemy: boolean }[]) => void;
  syncNpcs: (npcs: { name: string; isEnemy: boolean }[]) => void;
  connect: (playerName: string) => void;
  disconnect: () => void;
  sendPayload: (target: string, type: string, data: unknown) => void;

  broadcastPowerOff: (playerName: string) => void;
  removeTelemetry: (playerName: string) => void;

  broadcastPartialTelemetry: (
    playerName: string,
    domain: keyof PlayerTelemetry,
    data: unknown,
  ) => void;
  clearOfflineTelemetry: () => void;
  kickPlayer: (playerName: string) => void;
  forceSyncAll: () => void;
  forceSyncPlayer: (playerName: string) => void;
  pushToQueue: (payload: QueuedPayload) => void;
  removeQueueItem: (id: string) => void;
}

const safeBroadcast = (
  channel: RealtimeChannel | null,
  event: string,
  payload: unknown,
) => {
  if (!channel) return;
  const msg = { type: "broadcast" as const, event, payload };
  const size = JSON.stringify(msg).length;

  const extendedChannel = channel as RealtimeChannel & {
    httpSend?: (msg: unknown) => Promise<unknown>;
  };

  if (size > 150000 && typeof extendedChannel.httpSend === "function") {
    extendedChannel.httpSend(msg).catch(console.error);
  } else {
    channel.send(msg).catch((e: Error) => {
      if (
        (e.message?.includes("httpSend") || e.message?.includes("REST")) &&
        typeof extendedChannel.httpSend === "function"
      ) {
        extendedChannel.httpSend(msg).catch(console.error);
      }
    });
  }
};

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      onlinePlayers: [],
      telemetryData: {},
      telemetryTimestamps: {},
      channel: null,
      telemetryChannel: null,
      queue: [],
      localNpcNames: [],
      globalNpcs: [],

      setLocalNpcNames: (names) => set({ localNpcNames: names }),
      setGlobalNpcs: (npcs) => set({ globalNpcs: npcs }),
      
      syncNpcs: (npcs) => {
        const { telemetryChannel } = get();
        if (telemetryChannel) {
          safeBroadcast(telemetryChannel, "MASTER_COMMAND", {
            command: "SYNC_NPCS",
            attackerName: "MESTRE",
            target: "ALL",
            data: npcs,
          });
        }
      },

      pushToQueue: (p) => set((s) => ({ queue: [...s.queue, p] })),
      removeQueueItem: (id) =>
        set((s) => ({ queue: s.queue.filter((q) => q.id !== id) })),

      connect: (playerName) => {
        if (get().channel) return;

        const channel = supabase.channel("vg-session-main", {
          config: { presence: { key: playerName } },
        });

        channel
          .on("presence", { event: "sync" }, () => {
            set({ onlinePlayers: Object.keys(channel.presenceState()) });
          })
          .on("broadcast", { event: "system-inject" }, ({ payload }) => {
            const { name, isMasterMode, isPossessing } =
              useCharacterStore.getState();
            const isLocalNpc = get().localNpcNames.includes(payload.target);

            // Authority Validation for Master commands
            if (payload.type === "FULL_OVERRIDE") {
              if (payload.attackerName !== "MESTRE" && payload.attackerName !== "MAINFRAME (MESTRE)") {
                return;
              }
            }



            if (
              payload.target === name ||
              payload.target === "ALL" ||
              (isMasterMode && (payload.target === "MESTRE" || isLocalNpc))
            ) {
              get().pushToQueue({
                id: crypto.randomUUID(),
                type: payload.type,
                attackerName: payload.attackerName || "MESTRE",
                targetName: payload.target,
                data: payload.data,
              });
              if (payload.target === name || payload.target === isPossessing) {
                RetroToast.info(`PACOTE ENFILEIRADO: [${payload.type}]`);
              }
            }
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await channel.track({ online_at: new Date().toISOString() });
            }
          });

        const telemetryChannel = supabase.channel("vg-telemetry");

        telemetryChannel
          .on("broadcast", { event: "SYNC_PARTIAL" }, ({ payload }) => {
            const { name, domain, data, timestamp } = payload;
            const currentTimestamp =
              get().telemetryTimestamps[name]?.[domain] || 0;

            if (timestamp < currentTimestamp) return;

            set((state) => ({
              telemetryData: {
                ...state.telemetryData,
                [name]: {
                  ...(state.telemetryData[name] || {}),
                  [domain]: data,
                },
              },
              telemetryTimestamps: {
                ...state.telemetryTimestamps,
                [name]: {
                  ...(state.telemetryTimestamps[name] || {}),
                  [domain]: timestamp,
                },
              },
            }));
          })
          .on("broadcast", { event: "MASTER_COMMAND" }, ({ payload }) => {
            if (payload.attackerName !== "MESTRE") return;
            if (payload.target === playerName || payload.target === "ALL") {
              if (payload.command === "FORCE_SYNC") {
                window.dispatchEvent(new CustomEvent("vg-force-sync"));
              }
              if (payload.command === "KICK") {
                get().disconnect();
                window.location.reload();
              }
              if (payload.command === "SYNC_NPCS") {
                get().setGlobalNpcs(payload.data as { name: string; isEnemy: boolean }[]);
              }
              if (payload.command === "FULL_OVERRIDE") {
                get().pushToQueue({
                  id: crypto.randomUUID(),
                  type: "FULL_OVERRIDE",
                  attackerName: "MAINFRAME (MESTRE)",
                  targetName: payload.target,
                  data: payload.data,
                });
                RetroToast.info("PACOTE DE ATUALIZAÇÃO DO MESTRE RECEBIDO.");
              }
              if (payload.command === "FORCE_UPDATE_ITEM") {
                useCharacterStore
                  .getState()
                  .overwriteInventoryItem(payload.data);
              }
              if (payload.command === "FORCE_DELETE_ITEM") {
                useCharacterStore
                  .getState()
                  .deleteInventoryItem(payload.data.id);
              }
              if (payload.command === "EXPORT_REQUEST") {
                const {
                  resetCharacterData,
                  importCharacterData,
                  isOutdatedSave,
                  ...dataToSave
                } = useCharacterStore.getState();
                const noSave = [
                  resetCharacterData,
                  importCharacterData,
                  isOutdatedSave,
                ];
                delete noSave[0];
                delete noSave[1];
                delete noSave[2];

                const savePayload = {
                  vg_version: import.meta.env.VITE_APP_VERSION || "1.0.0",
                  timestamp: new Date().toISOString(),
                  data: dataToSave,
                };
                import("crypto-js").then((CryptoJS) => {
                  const encrypted = CryptoJS.default.AES.encrypt(
                    JSON.stringify(savePayload),
                    import.meta.env.VITE_SECRET_KEY || "fallback_veil_grey_key",
                  ).toString();
                  get().sendPayload("MESTRE", "SAVE_DELIVERY", encrypted);
                });
              }
            }
          })
          .subscribe();

        set({ channel, telemetryChannel });
      },

      disconnect: () => {
        const { channel, telemetryChannel } = get();
        if (channel) {
          channel.untrack();
          channel.unsubscribe();
        }
        if (telemetryChannel) telemetryChannel.unsubscribe();
        set({ channel: null, telemetryChannel: null, onlinePlayers: [] });
      },

      sendPayload: (target, type, data) => {
        const senderName = useCharacterStore.getState().name;
        const isMasterMode = useCharacterStore.getState().isMasterMode;
        
        if (target === "SELF") {
          get().pushToQueue({
            id: crypto.randomUUID(),
            type,
            attackerName: senderName,
            targetName: senderName,
            data,
          });
          RetroToast.info(`PACOTE ENFILEIRADO LOCALMENTE: [${type}]`);
          return;
        }

        if (isMasterMode && get().localNpcNames.includes(target)) {
          get().pushToQueue({
            id: crypto.randomUUID(),
            type,
            attackerName: senderName,
            targetName: target,
            data,
          });
          return;
        }

        const { channel } = get();
        if (channel) {
          safeBroadcast(channel, "system-inject", {
            target,
            type,
            attackerName: senderName,
            data,
          });
        }
      },

      broadcastPartialTelemetry: (playerName, domain, data) => {
        const { telemetryChannel } = get();
        const timestamp = Date.now();
        if (telemetryChannel) {
          safeBroadcast(telemetryChannel, "SYNC_PARTIAL", {
            name: playerName,
            domain,
            data,
            timestamp,
          });
        }
        set((state) => ({
          telemetryData: {
            ...state.telemetryData,
            [playerName]: {
              ...(state.telemetryData[playerName] || {}),
              [domain]: data,
            },
          },
        }));
      },

      clearOfflineTelemetry: () =>
        set((state) => {
          const online = state.onlinePlayers;
          const newData = { ...state.telemetryData };
          Object.keys(newData).forEach((key) => {
            const isLocalNpc = get().localNpcNames.includes(key);
            if (!online.includes(key) && !isLocalNpc) delete newData[key];
          });
          return { telemetryData: newData };
        }),

      kickPlayer: (playerName) => {
        const { telemetryChannel } = get();
        if (telemetryChannel)
          safeBroadcast(telemetryChannel, "MASTER_COMMAND", {
            target: playerName,
            command: "KICK",
            attackerName: "MESTRE",
          });
        set((s) => {
          const newData = { ...s.telemetryData };
          delete newData[playerName];
          return { telemetryData: newData };
        });
      },

      forceSyncAll: () => {
        const { telemetryChannel } = get();
        if (telemetryChannel)
          safeBroadcast(telemetryChannel, "MASTER_COMMAND", {
            target: "ALL",
            command: "FORCE_SYNC",
            attackerName: "MESTRE",
          });
      },

      forceSyncPlayer: (playerName) => {
        const { telemetryChannel } = get();
        if (telemetryChannel)
          safeBroadcast(telemetryChannel, "MASTER_COMMAND", {
            target: playerName,
            command: "FORCE_SYNC",
            attackerName: "MESTRE",
          });
      },

      removeTelemetry: (playerName) =>
        set((state) => {
          const newData = { ...state.telemetryData };
          delete newData[playerName];
          return { telemetryData: newData };
        }),

      broadcastPowerOff: (playerName) => {
        const { telemetryChannel } = get();
        if (telemetryChannel)
          safeBroadcast(telemetryChannel, "POWER_OFF", { name: playerName });
      },
    }),
    {
      name: "vg_network_cache",
      partialize: () => ({}),
    },
  ),
);
