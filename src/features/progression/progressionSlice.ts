import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type {
  CreationStatus,
  Role,
  SnapshotStats,
} from "../../shared/types/veil-grey";
import { VG_CONFIG } from "../../shared/config/system.config";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";

export interface ProgressionSlice {
  name: string;
  level: number;
  xp: { current: number; max: number; usedXpLogs: string[] };
  creationStatus: CreationStatus;
  sandboxMode: boolean;
  freePoints: { attributes: number; skills: number; specializations: number };
  role: Role | null;
  settings: { lockPoints: boolean; showRollDetails: boolean };
  lockedSnapshot: SnapshotStats | null;

  updateProgression: (data: Partial<ProgressionSlice>) => void;
  addXp: (amount: number, log?: string) => void;
  triggerLevelUp: () => void;
  confirmDistribution: () => void;
  updateCreationStatus: (status: CreationStatus) => void;
  confirmRoleSelection: (
    roleId: keyof typeof VG_CONFIG.roles,
    allocatedPoints: Record<string, number>,
  ) => void;
}

export const createProgressionSlice: StateCreator<
  CharacterStore,
  [],
  [],
  ProgressionSlice
> = (set, get) => ({
  name: "",
  level: 1,
  xp: { current: 0, max: 100, usedXpLogs: [] },
  creationStatus: "NOT_STARTED",
  sandboxMode: false,
  freePoints: { attributes: 0, skills: 0, specializations: 0 },
  role: null,
  settings: { lockPoints: true, showRollDetails: true },
  lockedSnapshot: null,

  updateCreationStatus: (status) => set({ creationStatus: status }),

  updateProgression: (data) => {
    set((state) => ({ ...state, ...data }));
  },

  addXp: (amount, log) =>
    set((state) => {
      const updates = state;
      updates.xp = {
        ...state.xp,
        current: state.xp.current + amount,
        usedXpLogs: [...state.xp.usedXpLogs, ...(log ? [log] : [])],
      };
      return updates;
    }),

  triggerLevelUp: () => {
    set((state) => {
      const nextLevel = state.level + 1;
      const rewards =
        VG_CONFIG.progression.rewardsPerLevel[
          nextLevel as keyof typeof VG_CONFIG.progression.rewardsPerLevel
        ];

      return {
        creationStatus: "LEVEL_UP",
        settings: { ...state.settings, lockPoints: false },
        lockedSnapshot: {
          attributes: { ...state.attributes },
          skills: { ...state.skills },
        },
        freePoints: {
          attributes: state.freePoints.attributes + (rewards?.attr || 0),
          skills: state.freePoints.skills + (rewards?.skill || 0),
          specializations:
            state.freePoints.specializations + (rewards?.spec || 0),
        },
      };
    });
  },

  confirmDistribution: () => {
    const { creationStatus, attributes } = get();

    set((state) => {
      console.log({ creationStatus, setCS: state.creationStatus });
      const isFirstSetup = state.creationStatus === "STARTED";
      const updates: Partial<CharacterStore> = {
        creationStatus: "CLOSED",
        settings: { ...state.settings, lockPoints: true },
        lockedSnapshot: null,
      };
      const { sustanceStages } = useCharacterStats();

      if (isFirstSetup) {
        const startHp = 65 + attributes.constitution * 4;
        const satiatedMax =
          sustanceStages[0] + sustanceStages[1] + sustanceStages[2] - 1;

        updates.hp = {
          ...state.hp,
          current: startHp,
        };
        updates.crisis = { ...state.crisis, ignore: false };
        updates.sustenance = { ...state.sustenance, current: satiatedMax };
        updates.energy = "rested";
        updates.insanity = { ...state.insanity, current: 0 };
      } else {
        // TODO: apply result of levelUp hp dice.
      }

      if (state.creationStatus === "LEVEL_UP") {
        updates.level = state.level + 1;
        updates.xp = {
          ...state.xp,
          current: state.xp.current - state.xp.max,
          max: (state.level + 1) * VG_CONFIG.progression.xpMultiplier,
        };
      }

      return updates;
    });
  },

  confirmRoleSelection: (roleId, allocatedPoints) => {
    const roleData = VG_CONFIG.roles[roleId];
    if (!roleData) return;

    set((state) => {
      const updates = { ...state };

      updates.role = {
        id: roleData.id,
        title: roleData.title,
        subtitle: roleData.subtitle,
        description: roleData.description,
        photoUrl: roleData.photoUrl,
        uniqueAbility: roleData.uniqueAbility,
      };

      Object.entries(roleData.initialStats.attributes).forEach(
        ([attr, val]) => {
          updates.attributes[attr as keyof typeof updates.attributes] =
            val as number;
        },
      );

      roleData.initialStats.baseSkills.forEach((skill: string) => {
        updates.skills[skill as keyof typeof updates.skills] = 1;
      });

      Object.entries(allocatedPoints).forEach(([skill, val]) => {
        updates.skills[skill as keyof typeof updates.skills] += val;
      });

      updates.freePoints = {
        attributes: VG_CONFIG.rules.characterCreation.initialAttributePoints,
        skills: VG_CONFIG.rules.characterCreation.initialSkillPoints,
        specializations: 0,
      };

      updates.creationStatus = "STARTED";
      updates.crisis.ignore = true;

      updates.settings = { ...state.settings, lockPoints: false };
      updates.lockedSnapshot = {
        attributes: { ...state.attributes },
        skills: { ...state.skills },
      };

      return updates;
    });
  },
});
