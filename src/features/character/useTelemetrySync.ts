import { useEffect, useRef, useCallback } from "react";
import { useCharacterStore } from "./store";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import type { PlayerTelemetry } from "../../shared/store/useNetworkStore";

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
    actionPoints,
    reactions,
    movement,
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
    mainNoteHeight,
    isMasterMode,
    isPossessing,
    role,
  } = store;

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const syncDomain = useCallback(
    (domain: keyof PlayerTelemetry, data: unknown, delay = 500) => {
      if (!isConnected || !name || isMasterMode || isPossessing) return;
      if (timers.current[domain]) clearTimeout(timers.current[domain]);

      timers.current[domain] = setTimeout(() => {
        broadcastPartial(name, domain, data);
      }, delay);
    },
    [isConnected, name, isMasterMode, isPossessing, broadcastPartial],
  );

  const syncAllNow = useCallback(() => {
    if (!isConnected || !name || isMasterMode || isPossessing) return;

    broadcastPartial(name, "core", {
      attributes,
      secondaryAttributes: {
        ...secondaryAttributes,
        actionPoints,
        reactions,
        movement,
      },
      skills,
      evilness,
      name,
      level,
      xp,
      creationStatus,
      freePoints,
      disadvantages,
      role,
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

    broadcastPartial(name, "notes", { notes, mainNote, mainNoteHeight });
  }, [
    isConnected,
    name,
    isMasterMode,
    isPossessing,
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
    role,
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
    mainNoteHeight,
    actionPoints,
    reactions,
    movement,
  ]);

  useEffect(() => {
    syncDomain(
      "vitals",
      {
        hp: {
          ...hp,
          max: maxHp,
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
        secondaryAttributes: {
          ...secondaryAttributes,
          actionPoints,
          reactions,
          movement,
        },
        skills: skills,
        evilness: evilness,
        name: name,
        level: level,
        xp: xp,
        creationStatus: creationStatus,
        freePoints: freePoints,
        disadvantages: disadvantages,
        role: role,
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
    role,
    secondaryAttributes,
    actionPoints,
    reactions,
    movement,
    syncDomain,
  ]);

  useEffect(() => {
    syncDomain(
      "notes",
      {
        notes: notes,
        mainNote: mainNote,
        mainNoteHeight: mainNoteHeight,
      },
      2000,
    );
  }, [notes, mainNote, mainNoteHeight, syncDomain]);

  useEffect(() => {
    const handleForceSync = () => syncAllNow();
    window.addEventListener("vg-force-sync", handleForceSync);
    return () => window.removeEventListener("vg-force-sync", handleForceSync);
  }, [syncAllNow]);
}
