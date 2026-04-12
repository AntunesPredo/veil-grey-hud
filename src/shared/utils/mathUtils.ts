export const buildSustenanceStages = (limit: number): number[] => {
  const sizes = [2, 1, 1, 1],
    cycle = [2, 1, 0, 3];
  let i = 0,
    extra = limit - 4;
  while (extra > 0) {
    sizes[cycle[i % 4]]++;
    i++;
    extra--;
  }
  return sizes;
};

export const buildInsanityStages = (
  limit: number,
  isVolatile: boolean,
): number[] => {
  const sizes = [2, 1, 1],
    cycle = isVolatile ? [2, 1, 0] : [0, 1, 2];
  let extra = limit - 3,
    i = 0;
  while (extra > 0) {
    sizes[cycle[i % 3]]++;
    i++;
    extra--;
  }
  return sizes;
};
