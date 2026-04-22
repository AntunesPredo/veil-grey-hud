import { useCharacterStore } from "../../features/character/store";
import { useRollStore } from "../../features/stats/useRollStore";
import { useActiveModifiers } from "./useActiveModifiers";
import { executeRawRoll } from "../utils/diceEngine";
import { RetroToast } from "../ui/RetroToast";
import { dispatchDiscordLog } from "../utils/discordWebhook";
import type { CustomEffect } from "../types/veil-grey";

export function useRoller() {
  const { settings, name } = useCharacterStore();
  const { activeEffects } = useActiveModifiers();
  const rollStore = useRollStore();

  const initiateRoll = (
    title: string,
    baseExpression: string,
    targets: string[], // Ex: ["strength", "ATT_PHYSICAL"]
    dc?: number,
  ) => {
    const relevantEffects = activeEffects.filter((e) =>
      targets.includes(e.target),
    );

    const fixedEffects = relevantEffects.filter((e) => e.mode !== "OPTIONAL");
    const optionalEffects = relevantEffects.filter(
      (e) => e.mode === "OPTIONAL",
    );

    const showDetails = settings.showRollDetails;

    if (!showDetails && optionalEffects.length === 0) {
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

  let toastMsg = `[${title}] = ${result.total}`;
  let logMsg = `**ROLAGEM:** ${title}\n\`\`\`\n${result.log}\n\`\`\``;

  if (result.isCriticalSuccess) {
    toastMsg = `CRÍTICO! ${toastMsg}`;
    logMsg += `\n[ SUCESSO CRÍTICO ]`;
  } else if (result.isCriticalFail) {
    toastMsg = `FALHA CRÍTICA! ${toastMsg}`;
    logMsg += `\n[ FALHA CRÍTICA ]`;
  } else if (dc !== undefined) {
    if (result.total >= dc) {
      toastMsg += ` (SUCESSO VS DC ${dc})`;
      logMsg += `\n[ SUCESSO VS DC ${dc} ]`;
    } else {
      toastMsg += ` (FALHA VS DC ${dc})`;
      logMsg += `\n[ FALHA VS DC ${dc} ]`;
    }
  }

  if (result.isCriticalFail) {
    RetroToast.error(toastMsg);
  } else if (
    result.isCriticalSuccess ||
    (dc !== undefined && result.total >= dc)
  ) {
    RetroToast.success(toastMsg);
  } else {
    RetroToast.info(toastMsg);
  }

  dispatchDiscordLog("PLAYER", characterName, logMsg);
}
