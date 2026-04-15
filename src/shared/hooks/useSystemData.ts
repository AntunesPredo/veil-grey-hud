import { useMemo } from "react";
import { VG_CONFIG } from "../config/system.config";
import type { Attribute, Skill } from "../types/veil-grey";

export interface FlatAttribute {
  id: Attribute;
  label: string;
  short: string;
  rollCategory: string;
  groupLabel: string;
}

export interface FlatSkill {
  id: Skill;
  label: string;
  description: string;
  bases: Attribute[];
  rollCategory: string;
  groupLabel: string;
}

export function useSystemData() {
  const flatAttributes = useMemo(() => {
    const list: FlatAttribute[] = [];

    Object.values(VG_CONFIG.att_groups).forEach((group) => {
      Object.entries(group.atributes).forEach(([attrKey, attrData]) => {
        list.push({
          id: attrKey as Attribute,
          label: attrData.label,
          short: attrData.short,
          rollCategory: group.rollCategory,
          groupLabel: group.label,
        });
      });
    });

    return list;
  }, []);

  const flatSkills = useMemo(() => {
    const list: FlatSkill[] = [];

    Object.values(VG_CONFIG.skill_groups).forEach((group) => {
      Object.entries(group.skills).forEach(([skillKey, skillData]) => {
        list.push({
          id: skillKey as Skill,
          label: skillData.label,
          description: skillData.description,
          bases: skillData.bases as Attribute[],
          rollCategory: group.rollCategory,
          groupLabel: group.label,
        });
      });
    });

    return list;
  }, []);

  const getAttributeById = (id: Attribute) =>
    flatAttributes.find((a) => a.id === id);
  const getSkillById = (id: Skill) => flatSkills.find((s) => s.id === id);

  return {
    attributes: flatAttributes,
    skills: flatSkills,
    getAttributeById,
    getSkillById,
  };
}
