import { VG_CONFIG } from "../config/system.config";

export function vg_roll(faces: number): number {
  if (faces <= 0) return 0;
  if (faces === 1) return 1;
  const arr = new Uint32Array(1);
  const limit = 4294967295 - (4294967295 % faces);
  do {
    window.crypto.getRandomValues(arr);
  } while (arr[0] >= limit);
  return (arr[0] % faces) + 1;
}

export interface ParseResult {
  total: number;
  log: string;
  error?: string;
  results: { roll: number; faces: number; isNegative: boolean }[];
  mainDice?: { roll: number; faces: number };
  isCriticalSuccess: boolean;
  isCriticalFail: boolean;
}

/**
 * Advanced Dice Parser
 * Supports: d20, 2d20+1 -2, 3d10+3-1 +3, D20+3, 2d20-d4 +d6
 */
export function executeRawRoll(
  notation: string,
  activeEffects: { description: string; val: number }[] = [],
): ParseResult {
  const rawStr = notation.trim() === "" ? VG_CONFIG.rules.mainDice : notation;
  const cleanStr = rawStr.trim().toLowerCase().replace(/\s+/g, "");

  const tokens = cleanStr.match(/[+-]?[^+-]+/g);
  if (!tokens)
    return {
      total: 0,
      log: "",
      error: "FORMATO DE DADOS INVÁLIDO.",
      results: [],
      isCriticalSuccess: false,
      isCriticalFail: false,
    };

  let currentTotal = 0;
  let log = `> EXPRESSÃO BASE: [ ${rawStr.toUpperCase()} ]\n`;
  const indResults: ParseResult["results"] = [];
  let mainDice: { roll: number; faces: number } | undefined = undefined;

  for (const token of tokens) {
    const isNegative = token.startsWith("-");
    const term = token.replace(/^[+-]/, "");

    if (term.includes("d")) {
      const parts = term.split("d");
      const count = parts[0] === "" ? 1 : parseInt(parts[0], 10);
      const faces = parseInt(parts[1], 10);

      if (isNaN(count) || isNaN(faces) || count > 100 || faces > 100) {
        return {
          total: 0,
          log: "",
          error: `TERMO INVÁLIDO OU LIMITE EXCEDIDO: ${token}`,
          results: [],
          isCriticalSuccess: false,
          isCriticalFail: false,
        };
      }

      let termSum = 0;
      const rolls = [];
      for (let i = 0; i < count; i++) {
        const roll = vg_roll(faces);
        termSum += roll;
        rolls.push(roll);
        indResults.push({ roll, faces, isNegative });

        if (!mainDice) mainDice = { roll, faces };
      }

      const finalTermValue = isNegative ? -termSum : termSum;
      const previousTotal = currentTotal;
      currentTotal += finalTermValue;

      const signStr = isNegative ? "-" : "+";
      if (previousTotal === 0) {
        log += `> DADO (${count}d${faces}): [${rolls.join(", ")}] = ${currentTotal}\n`;
      } else {
        log += `> DADO (${count}d${faces}): [${rolls.join(", ")}] -> ${previousTotal} ${signStr} ${termSum} = ${currentTotal}\n`;
      }
    } else {
      const mod = parseInt(term, 10);
      if (isNaN(mod)) {
        return {
          total: 0,
          log: "",
          error: `MODIFICADOR INVÁLIDO: ${token}`,
          results: [],
          isCriticalSuccess: false,
          isCriticalFail: false,
        };
      }

      const finalModValue = isNegative ? -mod : mod;
      const previousTotal = currentTotal;
      currentTotal += finalModValue;
      const signStr = isNegative ? "-" : "+";

      if (previousTotal === 0) {
        log += `> MODIFICADOR BASE: ${signStr}${mod}\n`;
      } else {
        log += `> MODIFICADOR BASE: ${previousTotal} ${signStr} ${mod} = ${currentTotal}\n`;
      }
    }
  }

  for (const effect of activeEffects) {
    if (effect.val === 0) continue;
    const previousTotal = currentTotal;
    currentTotal += effect.val;
    const signStr = effect.val < 0 ? "-" : "+";
    const absVal = Math.abs(effect.val);
    log += `> EFEITO [${effect.description.toUpperCase()}]: ${previousTotal} ${signStr} ${absVal} = ${currentTotal}\n`;
  }

  log += `> RESULTADO FINAL: ${currentTotal}`;

  const isCriticalSuccess = mainDice ? mainDice.roll === mainDice.faces : false;
  const isCriticalFail = mainDice ? mainDice.roll === 1 : false;

  return {
    total: currentTotal,
    log,
    results: indResults,
    mainDice,
    isCriticalSuccess,
    isCriticalFail,
  };
}
