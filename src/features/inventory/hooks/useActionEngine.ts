import { useState, useMemo } from "react";
import type { ActiveItem, Item } from "../../../shared/types/veil-grey";
import { useCharacterStore } from "../../character/store";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { useSystemData } from "../../../shared/hooks/useSystemData";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { executeRawRoll } from "../../../shared/utils/diceEngine";
import {
  dispatchDiscordLog,
  type DiscordEmbed,
} from "../../../shared/utils/discordWebhook";
import { VG_CONFIG } from "../../../shared/config/system.config";
import { useVitalsStore } from "../../vitals/useVitalsStore";

export function useActionEngine(item: Item, allInventory: Item[]) {
  const name = useCharacterStore((state) => state.name);
  const skills = useCharacterStore((state) => state.skills);
  const attributes = useCharacterStore((state) => state.attributes);
  const consumeItem = useCharacterStore((state) => state.consumeItem);
  const consumeRechargeable = useCharacterStore(
    (state) => state.consumeRechargeable,
  );
  const sendPayload = useNetworkStore((state) => state.sendPayload);
  const { getSkillById } = useSystemData();

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  const childrenItems = useMemo(
    () => allInventory.filter((i) => i.parentId === item.id),
    [allInventory, item.id],
  );

  const currentUses = useMemo(() => {
    if (item.type === "RECHARGEABLE" || item.type === "KIT") {
      let usesCount = 0;

      usesCount += childrenItems
        .filter((i) => i.type === "CONSUMABLE")
        .reduce((sum, i) => sum + ("uses" in i ? i.uses : 0) * i.quantity, 0);

      childrenItems
        .filter((i) => i.type === "RECHARGEABLE")
        .forEach((mag) => {
          const nestedAmmos = allInventory.filter(
            (invItem) =>
              invItem.parentId === mag.id && invItem.type === "CONSUMABLE",
          );
          usesCount += nestedAmmos.reduce(
            (sum, i) => sum + ("uses" in i ? i.uses : 0) * i.quantity,
            0,
          );
        });

      return usesCount;
    }
    return "uses" in item ? item.uses : 0;
  }, [item, childrenItems, allInventory]);

  let hasAmmo = true;
  if (item.type === "ACTIVE" && "requiresAmmo" in item && item.requiresAmmo) {
    const ammos = childrenItems.filter(
      (i) => i.type === "CONSUMABLE" && i.uses > 0,
    );
    let magAmmos = 0;
    childrenItems
      .filter((i) => i.type === "RECHARGEABLE")
      .forEach((mag) => {
        magAmmos += allInventory.filter(
          (i) => i.parentId === mag.id && i.type === "CONSUMABLE" && i.uses > 0,
        ).length;
      });
    hasAmmo = ammos.length > 0 || magAmmos > 0;
  }

  const disableUse =
    item.type === "ACTIVE" &&
    (!item.isEquipped ||
      ("uses" in item && item.uses <= 0) ||
      ("requiresAmmo" in item && item.requiresAmmo && !hasAmmo));

  const handleUse = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (disableUse) return;
    if (
      item.type === "MATERIAL" ||
      item.type === "CONTAINER" ||
      item.type === "EQUIPABLE"
    )
      return;

    if (item.type === "ACTIVE" && !item.isEquipped) {
      RetroToast.error("ITEM PRECISA ESTAR EQUIPADO PARA USO.");
      return;
    }

    if (
      item.type === "ACTIVE" &&
      item.combatProps &&
      item.combatProps.weaponType !== "NONE"
    ) {
      setIsTargetModalOpen(true);
      return;
    }

    if (item.type === "RECHARGEABLE" || item.type === "KIT") {
      if (currentUses > 0) {
        consumeRechargeable(item.id);
        let extraDesc = "";
        if (item.type === "KIT" && item.skillId) {
          const itemSkill = getSkillById(item.skillId);
          const skillVal = skills[item.skillId as keyof typeof skills] || 0;
          const rollRes = executeRawRoll(`1d20+${skillVal}`);
          extraDesc = `\n**ROLAGEM (${itemSkill?.label || "NO-SKILL"}):** ${rollRes.total}`;
        }
        const embed: DiscordEmbed = {
          title: "[>] AÇÃO IMEDIATA [>]",
          color: 3447003,
          description: `**UNIDADE OPERACIONAL:** ${name}\n**ITEM UTILIZADO:** ${item.name}${extraDesc}`,
          footer: { text: "SYS.MNLT // INVENTORY_SYNC" },
          timestamp: new Date().toISOString(),
        };
        dispatchDiscordLog("INVENTORY", name, "", [embed]);
        RetroToast.success(`USADO: ${item.name}`);
      } else {
        RetroToast.error("COMPARTIMENTO VAZIO. RECARREGUE.");
      }
    } else {
      const res = consumeItem(item.id);
      if (res.success) {
        const embed: DiscordEmbed = {
          title: "[>] AÇÃO IMEDIATA [>]",
          color: 3447003,
          description: `**UNIDADE OPERACIONAL:** ${name}\n**ITEM UTILIZADO:** ${item.name}`,
          footer: { text: "SYS.MNLT // INVENTORY_SYNC" },
          timestamp: new Date().toISOString(),
        };
        dispatchDiscordLog("INVENTORY", name, "", [embed]);
        RetroToast.success(`USADO: ${item.name}`);
      } else {
        RetroToast.error(res.message);
      }
    }
  };

  const executeCombatAction = (targets: string[]) => {
    setIsTargetModalOpen(false);
    const res = consumeItem(item.id);
    if (!res.success) {
      RetroToast.error(res.message);
      return;
    }

    const activeItem = item as ActiveItem;
    const props = activeItem.combatProps!;

    let attackRoll = 0;
    let isCrit = false;
    let isFail = false;
    let rollLog = "";
    let finalDmg = props.baseDamage;

    if (res.rollData?.skillId) {
      const skillVal = skills[res.rollData.skillId as keyof typeof skills] || 0;
      const rollRes = executeRawRoll(`1d20+${skillVal > 1 ? skillVal : -1}`);
      attackRoll = rollRes.total;
      isCrit = rollRes.isCriticalSuccess;
      isFail = rollRes.isCriticalFail;
      rollLog = rollRes.log;
    }

    if (props.weaponType === "RANGED") {
      finalDmg += res.rollData?.bonusDamage || 0;
    } else if (props.weaponType === "MELEE") {
      const scalingMap: Record<string, number> = {
        S: 5,
        A: 3,
        B: 2,
        C: 1,
        D: 0.5,
        NONE: 0,
      };
      const mult = scalingMap[props.scalingTier] || 0;
      const attrVal = props.scalingAttr
        ? attributes[props.scalingAttr as keyof typeof attributes] || 0
        : 0;
      finalDmg += Math.floor(attrVal * mult);
      if (isCrit) finalDmg *= 2;
    }

    let isSuccess = false;
    if (!isFail) {
      if (
        props.weaponType === "RANGED" &&
        (attackRoll >= props.baseDifficulty || isCrit)
      )
        isSuccess = true;
      if (
        props.weaponType === "MELEE" &&
        (attackRoll >= VG_CONFIG.rules.minMeleeAttack || isCrit)
      )
        isSuccess = true;
    }

    targets.forEach((targetName) => {
      if (targetName === "SELF") {
        useVitalsStore.getState().openDefenseModal({
          attackRoll,
          damage: finalDmg,
          attackerName: name,
        });
      } else if (targetName !== "ENEMY" && isSuccess) {
        sendPayload(targetName, "COMBAT_DEFENSE", {
          attackRoll,
          damage: finalDmg,
          attackerName: name,
        });
      }

      const isCriticalStr = isCrit ? "\n> [!] CRITICO" : "";
      const isFailStr = isFail ? "\n> [X] ERRO CRITICO" : "";

      const combatEmbed: DiscordEmbed = {
        title: `[>] ATAQUE ${props.weaponType === "RANGED" ? "A DISTANCIA" : "CORPO-A-CORPO"}`,
        color: 16711680,
        description: `**AGRESSOR:** ${name}\n**ALVO:** ${targetName}\n**ARMA:** ${item.name}\n**ALCANCE:** ${props.range}`,
        thumbnail: item.imageUrl ? { url: item.imageUrl } : undefined,
        fields: [
          {
            name: "ROLED",
            value: `[*] **${attackRoll}**${isCriticalStr}${isFailStr}`,
            inline: true,
          },
        ],
        footer: { text: "SYS.MNLT // NETWORK_SYNC" },
      };

      if (props.weaponType === "RANGED") {
        if (isSuccess) {
          combatEmbed.fields!.push({
            name: "DANO PROJETADO",
            value: `[!] **${finalDmg} PV**`,
            inline: true,
          });
        } else {
          combatEmbed.fields!.push({
            name: "STATUS",
            value: "[~] >> BALA PERDIDA <<",
            inline: true,
          });
        }
      } else {
        if (isSuccess) {
          combatEmbed.fields!.push({
            name: "DANO PROJETADO",
            value: `[!] **${finalDmg} PV**`,
            inline: true,
          });
        } else {
          combatEmbed.fields!.push({
            name: "STATUS",
            value: "[~] >> ATAQUE FALHO <<",
            inline: true,
          });
        }
      }

      combatEmbed.fields!.push({
        name: "LOG DE EXECUCAO",
        value: `\`\`\`\n${rollLog}\n\`\`\``,
        inline: false,
      });
      dispatchDiscordLog("INVENTORY", name, "", [combatEmbed]);
      RetroToast.success(`ATAQUE ENVIADO PARA: ${targetName}`);
    });
  };

  return {
    handleUse,
    executeCombatAction,
    isTargetModalOpen,
    setIsTargetModalOpen,
    disableUse,
    currentUses,
  };
}
