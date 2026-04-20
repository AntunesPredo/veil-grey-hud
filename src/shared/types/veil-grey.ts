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
  | "MOVEMENT"
  | Attribute
  | SecondaryAttribute
  | Skill;

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

export type EffectMode = "FIXED" | "OPTIONAL" | "TEMP";

export interface CustomEffect {
  id: number;
  target: CustomEffectTarget;
  description: string;
  mode: EffectMode;
  link: number | string | null;
  val: number;
}

export type ItemType =
  | "MATERIAL"
  | "CONSUMABLE"
  | "RECHARGEABLE"
  | "ACTIVE"
  | "KIT"
  | "CONTAINER"
  | "EQUIPABLE";

export interface BaseItem {
  id: number;
  name: string;
  description: string;
  svgId: string;
  quantity: number;
  slots: number;
  isCarried: boolean;
  isEquipped: boolean;
  parentId: number | null;
  drawer: string | null;
  effects: CustomEffect[];
  type: ItemType;
}

export interface MaterialItem extends BaseItem {
  type: "MATERIAL";
}

export interface ConsumableItem extends BaseItem {
  type: "CONSUMABLE";
  uses: number;
  maxUses: number;
  commsType: string;
}

export interface RechargeableItem extends BaseItem {
  type: "RECHARGEABLE";
  uses: number;
  maxUses: number;
  commsType: string;
  perItemSlotReduction: number;
}

export interface ActiveItem extends BaseItem {
  type: "ACTIVE";
  uses: number;
  maxUses: number;
  quality: number;
  condition: number;
  commsType: string;
}

export interface KitItem extends BaseItem {
  type: "KIT";
  uses: number;
  maxUses: number;
  skillId: Skill | null;
  commsType: string;
}

export interface ContainerItem extends BaseItem {
  type: "CONTAINER";
  containerProps: {
    slotReduction: number;
    slotCapacity: number;
    drawers?: string[];
  };
}

export interface EquipableItem extends BaseItem {
  type: "EQUIPABLE";
  containerProps?: {
    slotReduction: number;
    slotCapacity: number;
    drawers?: string[];
  };
}

// A união que exportamos para o sistema
export type Item =
  | MaterialItem
  | ConsumableItem
  | RechargeableItem
  | ActiveItem
  | KitItem
  | ContainerItem
  | EquipableItem;

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
