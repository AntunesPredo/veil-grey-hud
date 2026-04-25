import { useCharacterStore } from "../character/store";

export function EnergyWidget() {
  const energy = useCharacterStore((state) => state.energy);
  const updateEnergy = useCharacterStore((state) => state.updateEnergy);

  return (
    <div className="flex flex-col gap-2 h-full justify-center">
      <span className="text-[10px] text-[var(--theme-text)]/50 font-bold uppercase">
        Nível de Energia
      </span>
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 text-[10px] cursor-pointer text-[var(--theme-accent)]">
          <input
            type="radio"
            checked={energy === "rested"}
            onChange={() => updateEnergy("rested")}
            className="accent-[var(--theme-accent)]"
          />{" "}
          DESCANSADO
        </label>
        <label className="flex items-center gap-2 text-[10px] cursor-pointer text-[var(--theme-warning)]">
          <input
            type="radio"
            checked={energy === "tired"}
            onChange={() => updateEnergy("tired")}
            className="accent-[var(--theme-warning)]"
          />{" "}
          CANSADO
        </label>
        <label className="flex items-center gap-2 text-[10px] cursor-pointer text-[var(--theme-danger)]">
          <input
            type="radio"
            checked={energy === "exhausted"}
            onChange={() => updateEnergy("exhausted")}
            className="accent-[var(--theme-danger)]"
          />{" "}
          EXAUSTO
        </label>
      </div>
    </div>
  );
}
