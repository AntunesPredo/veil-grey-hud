import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type {
  Attribute,
  Skill,
  CustomEffect,
} from "../../shared/types/veil-grey";
import { VG_CONFIG } from "../../shared/config/system.config";

export interface StatsSlice {
  attributes: Record<Attribute, number>;
  skills: Record<Skill, number>;
  customEffects: CustomEffect[];

  updateAttribute: (attr: Attribute, value: number) => void;
  updateSkill: (skill: Skill, value: number) => void;
  addCustomEffect: (effect: CustomEffect) => void;
  removeCustomEffect: (id: number) => void;
}

const generateInitialStats = () => {
  const stats = {} as Record<Attribute, number>;
  Object.values(VG_CONFIG.att_groups).forEach((g) =>
    Object.keys(g.atributes).forEach((a) => (stats[a as Attribute] = 0)),
  );
  return stats;
};

const generateInitialSkills = () => {
  const skills = {} as Record<Skill, number>;
  Object.values(VG_CONFIG.skill_groups).forEach((g) =>
    Object.keys(g.skills).forEach((s) => (skills[s as Skill] = 0)),
  );
  return skills;
};

export const createStatsSlice: StateCreator<
  CharacterStore,
  [],
  [],
  StatsSlice
> = (set) => ({
  attributes: generateInitialStats(),
  skills: generateInitialSkills(),
  customEffects: [],

  updateAttribute: (attr, value) => {
    set((state) => ({
      attributes: {
        ...state.attributes,
        [attr]: Math.max(
          VG_CONFIG.rules.attrMin,
          Math.min(VG_CONFIG.rules.attrMax, value),
        ),
      },
    }));
  },

  updateSkill: (skill, value) => {
    set((state) => ({
      skills: {
        ...state.skills,
        [skill]: Math.max(
          VG_CONFIG.rules.skillMin,
          Math.min(VG_CONFIG.rules.skillMax, value),
        ),
      },
    }));
  },

  addCustomEffect: (effect) => {
    set((state) => ({ customEffects: [...state.customEffects, effect] }));
  },

  removeCustomEffect: (id) => {
    set((state) => ({
      customEffects: state.customEffects.filter((e) => e.id !== id),
    }));
  },
});
