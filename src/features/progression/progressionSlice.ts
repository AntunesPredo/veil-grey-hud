import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type {
  CreationStatus,
  Role,
  SnapshotStats,
} from "../../shared/types/veil-grey";
import { VG_CONFIG } from "../../shared/config/system.config";
import { buildSustenanceStages } from "../../shared/utils/mathUtils";

export interface ProgressionSlice {
  name: string;
  level: number;
  xp: { current: number; max: number };
  creationStatus: CreationStatus;
  sandboxMode: boolean;
  freePoints: { attributes: number; skills: number; specializations: number };
  role: Role | null;
  settings: { lockPoints: boolean; showRollDetails: boolean };
  lockedSnapshot: SnapshotStats | null;

  updateProgression: (data: Partial<ProgressionSlice>) => void;
  addXp: (amount: number) => void;
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
  xp: { current: 0, max: 100 },
  creationStatus: "NOT_STARTED",
  sandboxMode: false,
  freePoints: { attributes: 0, skills: 0, specializations: 0 },
  role: null,
  settings: { lockPoints: true, showRollDetails: true },
  lockedSnapshot: null,

  updateCreationStatus: (status) => set({ creationStatus: status }),

  updateProgression: (data) => {
    set((state) => ({ ...state, ...data }));
    get().recalculateAll();
  },

  addXp: (amount) =>
    set((state) => ({
      xp: { ...state.xp, current: state.xp.current + amount },
    })),

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
  //ok
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

      if (isFirstSetup) {
        const startHp = 65 + attributes.constitution * 4;
        const susStages = buildSustenanceStages(state.sustenance.limit);
        const satiatedMax = susStages[0] + susStages[1] + susStages[2] - 1;

        updates.hp = {
          ...state.hp,
          max: startHp,
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
          current: state.xp.current - state.xp.max,
          max: (state.level + 1) * VG_CONFIG.progression.xpMultiplier,
        };
      }

      return updates;
    });
    get().recalculateAll();
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
    get().recalculateAll();
  },
});
