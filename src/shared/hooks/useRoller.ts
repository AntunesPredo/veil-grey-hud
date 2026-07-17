import { useCharacterStore } from "../../features/character/store";
import { useRollStore } from "../../features/stats/useRollStore";
import { useActiveModifiers } from "./useActiveModifiers";
import { executeRawRoll } from "../utils/diceEngine";
import { RetroToast } from "../ui/RetroToast";
import { dispatchDiscordLog, type DiscordEmbed } from "../utils/discordWebhook";
import type { CustomEffect } from "../types/veil-grey";
import { useCombatStatus } from "../../features/combat/useCombatStatus";
import { useCombatConsumption } from "../../features/combat/useCombatConsumption";
export function useRoller() {
  const settings = useCharacterStore((state) => state.settings);
  const name = useCharacterStore((state) => state.name);

  const { activeEffects } = useActiveModifiers();
  const rollStore = useRollStore();
  const combatStatus = useCombatStatus();
  const { consumeAction } = useCombatConsumption();

  const initiateRoll = (
    title: string,
    baseExpression: string,
    targets: string[], // Ex: ["strength", "ATT_PHYSICAL"]
    dc?: number,
  ) => {
    const relevantEffects = activeEffects.filter((e) =>
      targets.includes(e.target),
    );

    if (combatStatus.inCombat) {
      const npcType = useCharacterStore.getState().npcType;
      const isMasterMode = useCharacterStore.getState().isMasterMode;
      const isNonHuman = isMasterMode && npcType === "NON_HUMAN";

      if (!isNonHuman) {
        const attributes = useCharacterStore.getState().attributes;
        const maxAp = 1 + Math.floor(Math.floor(((attributes.dexterity || 0) + (attributes.instinct || 0)) / 2) / 3);

        if (!combatStatus.myTurn) {
          RetroToast.error("NÃO É O SEU TURNO!");
          return;
        }
        if (combatStatus.participant && combatStatus.participant.apUsed >= maxAp) {
          RetroToast.error("SEM PONTOS DE AÇÃO!");
          return;
        }
        if (useCharacterStore.getState().energy.current <= 0 && !useCharacterStore.getState().sandboxMode) {
          RetroToast.error("SEM ENERGIA PARA REALIZAR TESTE!");
          return;
        }
      }
    }

    const fixedEffects = relevantEffects.filter((e) => e.mode !== "OPTIONAL");
    const optionalEffects = relevantEffects.filter(
      (e) => e.mode === "OPTIONAL",
    );

    const showDetails = settings.showRollDetails;

    const doCombatConsumption = () => {
      consumeAction(true);
    };

    if (!showDetails && optionalEffects.length === 0) {
      doCombatConsumption();
      executeDirectRoll(title, baseExpression, fixedEffects, [], dc, name);
      return;
    }

    rollStore.openConfig({
      title,
      baseExpression,
      dc,
      fixedEffects,
      optionalEffects,
      resolveAsToast: !showDetails,
      onConfirm: () => {
        doCombatConsumption();
      }
    });
  };

  return { initiateRoll };
}

function executeDirectRoll(
  title: string,
  baseExpression: string,
  fixedEffects: CustomEffect[],
  selectedOptionals: CustomEffect[],
  dc: number | undefined,
  characterName: string,
) {
  const allActive = [...fixedEffects, ...selectedOptionals];

  const result = executeRawRoll(baseExpression, allActive);

  if (result.error) {
    RetroToast.error(result.error);
    return;
  }

  let resultColorStr = 3066993; // default success/neutral
  if (result.isCriticalFail || (dc !== undefined && result.total < dc)) {
    resultColorStr = 15158332; // failure
  } else if (result.isCriticalSuccess) {
    resultColorStr = 16753920; // critical
  }

  const embed: DiscordEmbed = {
    title: `[?] RESOLUÇÃO: ${title} [?]`,
    color: resultColorStr,
    description: `**UNIDADE OPERACIONAL:** ${characterName}\n**EXPRESSÃO:** ${baseExpression}\n**TOTAL:** ${result.total}\n\`\`\`\n${result.log}\n\`\`\` ${result.isCriticalSuccess ? `\n# [ SUCESSO CRÍTICO ]` : ""}`,
    footer: { text: "SYS.MNLT // ROLL_TRACKER" },
    timestamp: new Date().toISOString(),
  };

  dispatchDiscordLog("PLAYER", characterName, "", [embed]);
}
