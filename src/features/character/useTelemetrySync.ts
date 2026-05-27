import { useEffect, useRef, useCallback } from "react";
import { useCharacterStore } from "./store";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import type { PlayerTelemetry } from "../../shared/store/useNetworkStore";
import { useMasterStore } from "../master/masterStore";

export function useTelemetrySync() {
  const store = useCharacterStore();
  const broadcastPartial = useNetworkStore(
    (state) => state.broadcastPartialTelemetry,
  );
  const isConnected = useNetworkStore(
    (state) => state.telemetryChannel !== null,
  );

  const {
    maxHp,
    maxInsanity,
    maxEnergy,
    energyState,
    maxSustenance,
    sustenanceState,
    secondaryAttributes,
  } = useCharacterStats();

  const {
    attributes,
    skills,
    evilness,
    name,
    level,
    xp,
    creationStatus,
    freePoints,
    disadvantages,
    hp,
    insanity,
    energy,
    sustenance,
    crisis,
    inventory,
    customEffects,
    notes,
    mainNote,
    isMasterMode,
    isPossessing,
  } = store;

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const syncDomain = useCallback(
    (domain: keyof PlayerTelemetry, data: unknown, delay = 500) => {
      if (!isConnected || !name || isMasterMode) return;
      if (timers.current[domain]) clearTimeout(timers.current[domain]);

      timers.current[domain] = setTimeout(() => {
        broadcastPartial(name, domain, data);
      }, delay);
    },
    [isConnected, name, isMasterMode, broadcastPartial],
  );

  const syncAllNow = useCallback(() => {
    if (!isConnected || !name || isMasterMode) return;

    broadcastPartial(name, "core", {
      attributes,
      secondaryAttributes,
      skills,
      evilness,
      name,
      level,
      xp,
      creationStatus,
      freePoints,
      disadvantages,
    });

    broadcastPartial(name, "vitals", {
      hp: {
        ...hp,
        max: maxHp,
      },
      insanity: { ...insanity, max: maxInsanity },
      energy: { ...energy, max: maxEnergy, state: energyState },
      sustenance: { ...sustenance, max: maxSustenance, state: sustenanceState },
      crisis,
    });

    broadcastPartial(name, "inventory", inventory);

    broadcastPartial(name, "effects", customEffects);

    broadcastPartial(
      name,
      "customEffectIds",
      customEffects
        .filter((e) => e.link !== "FLAW" && e.link !== "SYS")
        .map((e) => e.id),
    );

    broadcastPartial(name, "notes", { notes, mainNote });
  }, [
    isConnected,
    name,
    isMasterMode,
    broadcastPartial,
    attributes,
    secondaryAttributes,
    skills,
    evilness,
    level,
    xp,
    creationStatus,
    freePoints,
    disadvantages,
    hp,
    maxHp,
    insanity,
    maxInsanity,
    energy,
    maxEnergy,
    energyState,
    sustenance,
    maxSustenance,
    sustenanceState,
    crisis,
    inventory,
    customEffects,
    notes,
    mainNote,
  ]);

  useEffect(() => {
    if (isPossessing) {
      const timer = setTimeout(() => {
        const {
          resetCharacterData,
          importCharacterData,
          isOutdatedSave,
          ...syncData
        } = store;
        const noSave = [
          resetCharacterData,
          importCharacterData,
          isOutdatedSave,
        ];
        delete noSave[0];
        delete noSave[1];
        delete noSave[2];

        const masterStore = useMasterStore.getState();
        const localNpc = masterStore.npcs.find((n) => n.name === isPossessing);

        if (localNpc) {
          masterStore.updateNpcData(localNpc.id, syncData);
        } else {
          const channel = useNetworkStore.getState().telemetryChannel;
          if (channel) {
            const msg = {
              type: "broadcast" as
                | "broadcast"
                | "presence"
                | "postgres_changes",
              event: "MASTER_COMMAND",
              payload: {
                target: isPossessing,
                command: "FULL_OVERRIDE",
                data: syncData,
              },
            };
            if (typeof channel.httpSend === "function") {
              channel.httpSend(msg.event, msg.payload).catch(console.error);
            } else {
              channel.send(msg);
            }
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [store, isPossessing]);

  useEffect(() => {
    syncDomain(
      "vitals",
      {
        hp: {
          current: hp.current,
          max: maxHp,
          temp: hp.temp,
          isInjured: hp.isInjured,
          isVeryInjured: hp.isVeryInjured,
          autoApplyInjury: hp.autoApplyInjury,
        },
        insanity: { ...insanity, max: maxInsanity },
        energy: { ...energy, max: maxEnergy, state: energyState },
        sustenance: {
          ...sustenance,
          max: maxSustenance,
          state: sustenanceState,
        },
        crisis: crisis,
      },
      400,
    );
  }, [
    hp,
    insanity,
    energy,
    sustenance,
    crisis,
    maxInsanity,
    maxHp,
    maxEnergy,
    energyState,
    maxSustenance,
    sustenanceState,
    syncDomain,
  ]);

  useEffect(() => {
    syncDomain("inventory", inventory, 800);
  }, [inventory, syncDomain]);

  useEffect(() => {
    syncDomain("effects", customEffects, 600);
  }, [customEffects, syncDomain]);

  useEffect(() => {
    const customEffectIds = store.customEffects
      .filter((e) => e.link !== "FLAW" && e.link !== "SYS")
      .map((e) => e.id);
    syncDomain("customEffectIds", customEffectIds, 600);
  }, [store.customEffects, syncDomain]);

  useEffect(() => {
    syncDomain(
      "core",
      {
        attributes: attributes,
        secondaryAttributes,
        skills: skills,
        evilness: evilness,
        name: name,
        level: level,
        xp: xp,
        creationStatus: creationStatus,
        freePoints: freePoints,
        disadvantages: disadvantages,
      },
      1000,
    );
  }, [
    attributes,
    skills,
    xp,
    level,
    evilness,
    name,
    creationStatus,
    freePoints,
    disadvantages,
    secondaryAttributes,
    syncDomain,
  ]);

  useEffect(() => {
    syncDomain(
      "notes",
      {
        notes: notes,
        mainNote: mainNote,
      },
      2000,
    );
  }, [notes, mainNote, syncDomain]);

  useEffect(() => {
    const handleForceSync = () => syncAllNow();
    window.addEventListener("vg-force-sync", handleForceSync);
    return () => window.removeEventListener("vg-force-sync", handleForceSync);
  }, [syncAllNow]);
}
