import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VG_CONFIG } from "../../shared/config/system.config";
import { buildSustenanceStages } from "../../shared/utils/mathUtils";

import {
  createProgressionSlice,
  type ProgressionSlice,
} from "../progression/progressionSlice";
import { createStatsSlice, type StatsSlice } from "../stats/statsSlice";
import { createVitalsSlice, type VitalsSlice } from "../vitals/vitalsSlice";
import {
  createInventorySlice,
  type InventorySlice,
} from "../inventory/inventorySlice";
import { createNotesSlice, type NotesSlice } from "../notes/notesSlice";

export type CharacterStore = ProgressionSlice &
  StatsSlice &
  VitalsSlice &
  InventorySlice &
  NotesSlice & {
    recalculateAll: () => void;
    resetCharacterData: () => void;
    importCharacterData: (data: Partial<CharacterStore>) => void;
  };

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (...a) => {
      const [set, get] = a;

      return {
        ...createProgressionSlice(...a),
        ...createStatsSlice(...a),
        ...createVitalsSlice(...a),
        ...createInventorySlice(...a),
        ...createNotesSlice(...a),

        importCharacterData: (data) => {
          set((state) => ({ ...state, ...data }));
          get().recalculateAll();
        },

        resetCharacterData: () => {
          const emptyState = {
            ...createProgressionSlice(...a),
            ...createStatsSlice(...a),
            ...createVitalsSlice(...a),
            ...createInventorySlice(...a),
            ...createNotesSlice(...a),
          };
          set(emptyState);
          get().recalculateAll();
        },

        recalculateAll: () => {
          set((state) => {
            const rules = VG_CONFIG.rules;
            const updates = { ...state };

            updates.secondaryAttributes.agility = Math.floor(
              (state.attributes.dexterity + state.attributes.instinct) / 2,
            );
            updates.secondaryAttributes.mass =
              state.attributes.strength + state.attributes.constitution;
            updates.secondaryAttributes.mental_health = Math.floor(
              (state.attributes.intelligence + state.attributes.wisdom) / 2,
            );

            updates.hp.max = rules.baseHp + updates.hp.max_mod;
            updates.insanity.limit =
              rules.baseInsanity + updates.secondaryAttributes.mental_health;
            updates.sustenance.limit =
              rules.baseSustenance + updates.secondaryAttributes.mass;

            const calculatedLoad = updates.inventory.reduce((total, item) => {
              if (!item.isCarried || item.parentId !== null) return total;

              const itemTotalSlots = item.slots * item.quantity;

              const hasProps =
                (item.type === "CONTAINER" || item.type === "EQUIPABLE") &&
                item.containerProps;

              if (hasProps && item.containerProps) {
                const props = item.containerProps;
                const inside = updates.inventory
                  .filter((i) => i.parentId === item.id && i.isCarried)
                  .reduce((s, i) => s + i.slots * i.quantity, 0);

                let activeRed = 0;
                if (item.type === "CONTAINER") {
                  activeRed = Math.min(props.slotReduction, inside);
                } else if (item.type === "EQUIPABLE") {
                  activeRed = item.isEquipped
                    ? Math.min(props.slotReduction, inside)
                    : 0;
                }

                return total + itemTotalSlots + (inside - activeRed);
              }

              if (item.type === "RECHARGEABLE") {
                const reductionPerUnit = item.perItemSlotReduction || 0;
                const inside = updates.inventory
                  .filter((i) => i.parentId === item.id && i.isCarried)
                  .reduce((s, i) => {
                    const reducedSlotPerUnit = Math.max(
                      0,
                      i.slots - reductionPerUnit,
                    );
                    return s + reducedSlotPerUnit * i.quantity;
                  }, 0);

                return total + itemTotalSlots + inside;
              }

              return total + itemTotalSlots;
            }, 0);

            updates.currentLoad = calculatedLoad;
            updates.maxLoad = rules.baseLoad + updates.secondaryAttributes.mass;
            updates.isOverweight = updates.currentLoad > updates.maxLoad;

            updates.inventory
              .filter((i) => i.isEquipped)
              .forEach((item) => {
                item.effects
                  .filter((e) => e.mode === "FIXED")
                  .forEach((effect) => {
                    // TODO: Apply fixed effects by itens
                    console.log({ effect });
                  });
              });

            updates.hp.current = Math.max(
              0,
              Math.min(updates.hp.max, updates.hp.current),
            );

            const hpPorc =
              updates.hp.max === 0
                ? 0
                : (updates.hp.current / updates.hp.max) * 100;
            if (updates.hp.autoApplyInjury) {
              updates.hp.isInjured = hpPorc <= rules.thresholdInjured;
              updates.hp.isVeryInjured = hpPorc <= rules.thresholdCrit;
            }

            updates.sustenance.current = Math.max(
              0,
              Math.min(updates.sustenance.limit, updates.sustenance.current),
            );
            const sus = buildSustenanceStages(updates.sustenance.limit);
            if (updates.sustenance.current <= sus[0] - 1)
              updates.sustenance.state = "STARVING";
            else if (updates.sustenance.current <= sus[0] - 1 + sus[1])
              updates.sustenance.state = "HUNGRY";
            else if (updates.sustenance.current <= sus[0] - 1 + sus[1] + sus[2])
              updates.sustenance.state = "SATIATED";
            else updates.sustenance.state = "FULL";

            let [phys, ment, soc, mov] = [0, 0, 0, 0];
            if (updates.insanity.state === "UNSTABLE") ment -= 1;
            if (updates.insanity.state === "INSANE") ment -= 3;
            soc -= Math.floor(
              Math.min(updates.evilness, rules.evilnessMax) / 2,
            );

            if (updates.sustenance.state === "FULL") {
              phys += 1;
              ment += 1;
            } else if (updates.sustenance.state === "HUNGRY") {
              phys -= 1;
              ment -= 1;
            } else if (updates.sustenance.state === "STARVING") {
              phys -= 3;
              ment -= 3;
            }

            if (updates.energy === "tired") {
              phys -= 2;
              soc -= 1;
            } else if (updates.energy === "exhausted") {
              phys -= 4;
              soc -= 3;
              ment -= 3;
              mov -= 2;
            }

            if (updates.hp.isVeryInjured) {
              phys -= 2;
              ment -= 2;
              soc -= 2;
              mov -= 1;
            } else if (updates.hp.isInjured) {
              phys -= 1;
              ment -= 1;
              soc -= 1;
            }

            // TODO: add Custom Effects
            // updates.customEffects.forEach((eff) => {
            //   if (eff.target === "ATTR_PHYSICAL") phys += eff.val;
            //   if (eff.target === "ATTR_MENTAL") ment += eff.val;
            //   if (eff.target === "ATTR_SOCIAL") soc += eff.val;
            // });

            // updates.modifiers = { phys, ment, soc, mov };
            console.log({ phys, ment, soc, mov });

            if (!updates.crisis.ignore) {
              const isDying = updates.hp.current <= 0;
              const isCollapsing =
                updates.insanity.current > updates.insanity.limit;
              if (updates.crisis.state === "DEATH" && !isDying) {
                updates.crisis.state = null;
                updates.crisis.fails = 0;
              } else if (updates.crisis.state === "COLLAPSE" && !isCollapsing) {
                updates.crisis.state = null;
                updates.crisis.fails = 0;
              }

              if (isDying && updates.crisis.state !== "DEATH") {
                updates.crisis.state = "DEATH";
                updates.crisis.fails = 0;
              } else if (
                isCollapsing &&
                !isDying &&
                updates.crisis.state !== "COLLAPSE"
              ) {
                updates.crisis.state = "COLLAPSE";
                updates.crisis.fails = 0;
              }
            }

            return updates;
          });
        },
      };
    },
    {
      name: "vg_character_data",
      partialize: (state) => ({
        ...state,
        crisis: { ...state.crisis, ignore: false },
      }),
    },
  ),
);
