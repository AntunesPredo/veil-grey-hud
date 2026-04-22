import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type {
  Attribute,
  Skill,
  SecondaryAttribute,
  CustomEffect,
} from "../../shared/types/veil-grey";
import { VG_CONFIG } from "../../shared/config/system.config";

export interface StatsSlice {
  attributes: Record<Attribute, number>;
  secondaryAttributes: Record<SecondaryAttribute, number>;
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
> = (set, get) => ({
  attributes: generateInitialStats(),
  secondaryAttributes: { agility: 0, mass: 0, mental_health: 0, perception: 0 },
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
    get().recalculateAll();
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
    get().recalculateAll();
  },

  addCustomEffect: (effect) => {
    set((state) => ({ customEffects: [...state.customEffects, effect] }));
    get().recalculateAll();
  },

  removeCustomEffect: (id) => {
    set((state) => ({
      customEffects: state.customEffects.filter((e) => e.id !== id),
    }));
    get().recalculateAll();
  },
});
