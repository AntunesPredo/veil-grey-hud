import { Input } from "../../shared/ui/Form";
import { useCharacterStore } from "../character/store";

export function EvilnessWidget() {
  const evilness = useCharacterStore((state) => state.evilness);
  const updateEvilness = useCharacterStore((state) => state.updateEvilness);

  return (
    <div className="flex flex-col gap-2 h-full justify-center">
      <span className="text-[10px] text-[var(--theme-text)]/50 font-bold uppercase flex justify-between items-center">
        Maldade
        <span className="text-[8px] opacity-70 bg-[var(--theme-background)]/50 px-1 border border-[var(--theme-border)] text-[var(--theme-accent)]">
          -1 SOC / 2 LVL
        </span>
      </span>
      <Input
        type="number"
        min="0"
        max="10"
        value={evilness}
        onChange={(e) => updateEvilness(parseInt(e.target.value) || 0)}
        className="w-full text-center text-lg font-bold"
      />
    </div>
  );
}
