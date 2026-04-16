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
}

// TODO: rename and add support for rollCategory and rollType to apply global modifiers based on them

/**
 * Advanced Dice Parser
 * Supports: d20, 2d20+1 -2, 3d10+3-1 +3, D20+3, 2d20-d4 +d6
 */
export function executeRawRoll(notation: string): ParseResult {
  const cleanStr = notation.trim().toLowerCase().replace(/\s+/g, "");

  // Split into tokens: keep + or - attached to the following terms
  const tokens = cleanStr.match(/[+-]?[^+-]+/g);
  if (!tokens)
    return {
      total: 0,
      log: "",
      error: "Formato de dados inválido.",
      results: [],
    };

  let total = 0;
  let log = `> EXPRESSÃO: [ ${notation.toUpperCase()} ]\n`;
  const indResults: ParseResult["results"] = [];

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
          error: `Termo inválido ou limite excedido: ${token}`,
          results: [],
        };
      }

      let termSum = 0;
      const rolls = [];
      for (let i = 0; i < count; i++) {
        const roll = vg_roll(faces);
        termSum += roll;
        rolls.push(roll);
        indResults.push({ roll, faces, isNegative });
      }

      const finalTermValue = isNegative ? -termSum : termSum;
      total += finalTermValue;

      const signStr = isNegative ? "-" : "+";
      log += `> DADO (${count}d${faces}): [${rolls.join(", ")}] = ${signStr}${termSum}\n`;
    } else {
      // Static modifier
      const mod = parseInt(term, 10);
      if (isNaN(mod)) {
        return {
          total: 0,
          log: "",
          error: `Modificador inválido: ${token}`,
          results: [],
        };
      }

      const finalModValue = isNegative ? -mod : mod;
      total += finalModValue;
      const signStr = isNegative ? "-" : "+";
      log += `> MODIFICADOR: ${signStr}${mod}\n`;
    }
  }

  // TODO: add global modifiers when rollCategory or rollType is sended

  log += `> RESULTADO FINAL: ${total}`;

  return { total, log, results: indResults };
}
