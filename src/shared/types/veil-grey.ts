import { VG_CONFIG } from "../config/system.config";

export type AttributeCategory =
  | typeof VG_CONFIG.att_groups.physical.rollCategory
  | typeof VG_CONFIG.att_groups.mental.rollCategory
  | typeof VG_CONFIG.att_groups.social.rollCategory;

export type SkillCategory =
  | typeof VG_CONFIG.skill_groups.physical.rollCategory
  | typeof VG_CONFIG.skill_groups.mental.rollCategory
  | typeof VG_CONFIG.skill_groups.social.rollCategory;

export type RollCategory = AttributeCategory | SkillCategory;

// ATT
type PhysicalAtts = keyof typeof VG_CONFIG.att_groups.physical.atributes;
type MentalAtts = keyof typeof VG_CONFIG.att_groups.mental.atributes;
type SocialAtts = keyof typeof VG_CONFIG.att_groups.social.atributes;

export type Attribute = PhysicalAtts | MentalAtts | SocialAtts;

// SECONDARY ATT
export type SecondaryAttribute = keyof typeof VG_CONFIG.att_secondary;

// SKILLS
type PhysicalSkills = keyof typeof VG_CONFIG.skill_groups.physical.skills;
type MentalSkills = keyof typeof VG_CONFIG.skill_groups.mental.skills;
type SocialSkills = keyof typeof VG_CONFIG.skill_groups.social.skills;

export type Skill = PhysicalSkills | MentalSkills | SocialSkills;

// OTHER SYSTEM TYPES
export type CreationStatus =
  | "NOT_STARTED"
  | "PRE_STARTED"
  | "STARTED"
  | "LEVEL_UP"
  | "CLOSED";

export type EnergyLevel = "rested" | "tired" | "exhausted";

export type SustenanceState = "STARVING" | "HUNGRY" | "SATIATED" | "FULL";

export type InsanityState = "STABLE" | "UNSTABLE" | "INSANE";

export type CrisisState = "COLLAPSE" | "DEATH" | null;

export type CustomEffectTarget =
  | RollCategory
  | "FREE_ATTR"
  | "FREE_SKILL"
  | "HP"
  | "INSANITY"
  | "MOVEMENT";

export interface UniqueAbility {
  title: string;
  description: string;
}

export interface Role {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  photoUrl?: string | URL;
  uniqueAbility: UniqueAbility;
}

export interface CustomEffect {
  id: number;
  description: string;
  noteId: number | string | null;
  target: CustomEffectTarget;
  val: number;
}

export interface Item {
  id: number;
  name: string;
  slots: number;
  isCarried: boolean;
  parentId: number | null;
  isContainer: boolean;
  description: string;
  containerProps: {
    slotReduction: number;
    slotCapacity: number;
  } | null;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  isEditing: boolean;
  height: number;
}

export interface SnapshotStats {
  attributes: Record<Attribute, number>;
  skills: Record<Skill, number>;
}

export interface SkillData {
  label: string;
  bases: string[];
  id: string;
  groupLabel?: string;
  description: string;
}
