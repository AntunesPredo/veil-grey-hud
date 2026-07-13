import { useState } from "react";
import { useNetworkStore } from "../store/useNetworkStore";
import { useShallow } from "zustand/react/shallow";
import { Modal } from "./Overlays";
import { Button } from "./Form";
import { useCharacterStore } from "../../features/character/store";

interface TargetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (targets: string[]) => void;
  title?: string;
  allowAll?: boolean;
  singleSelect?: boolean;
}

export function TargetSelectionModal({
  isOpen,
  onClose,
  onSelect,
  title = "SELECIONAR ALVOS",
  allowAll = false,
  singleSelect = false,
}: TargetSelectionModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const onlinePlayers = useNetworkStore((state) => state.onlinePlayers);
  const telemetryKeys = useNetworkStore(useShallow((state) => Object.keys(state.telemetryData)));
  const globalNpcs = useNetworkStore((state) => state.globalNpcs || []);
  const localNpcNames = useNetworkStore((state) => state.localNpcNames || []);
  const name = useCharacterStore((state) => state.name);
  const isMasterMode = useCharacterStore((state) => state.isMasterMode);

  const allPossibleTargets = Array.from(
    new Set([...onlinePlayers, ...telemetryKeys, ...globalNpcs.map((n) => n.name), ...localNpcNames]),
  );

  const filteredPlayers = allPossibleTargets.filter(
    (player) => player !== name && player !== "MESTRE" && player !== "SANDBOX",
  );

  if (!isOpen) return null;

  const toggleSelect = (target: string) => {
    if (target === "ALL") {
      setSelected(selected.includes("ALL") ? [] : ["ALL"]);
      return;
    }
    setSelected((prev) => {
      if (prev.includes(target)) {
        return prev.filter((t) => t !== target);
      } else {
        if (!isMasterMode || singleSelect) {
          return [target];
        }
        return [...prev.filter((t) => t !== "ALL"), target];
      }
    });
  };

  const handleConfirm = () => {
    if (selected.length > 0) {
      onSelect(selected);
      onClose();
      setSelected([]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-2 bg-[var(--theme-background)] border border-[var(--theme-border)]">
          <Button
            variant={selected.includes("SELF") ? "success" : "primary"}
            onClick={() => toggleSelect("SELF")}
          >
            [ MIM MESMO ]
          </Button>
          <Button
            variant={selected.includes("MESTRE") ? "success" : "danger"}
            onClick={() => toggleSelect("MESTRE")}
            className="border-dashed"
          >
            [ MESTRE ]
          </Button>
          <Button
            variant={selected.includes("ENEMY") ? "success" : "danger"}
            onClick={() => toggleSelect("ENEMY")}
            className="border-dashed"
          >
            [ INIMIGO GENÉRICO ]
          </Button>
          {allowAll && isMasterMode && (
            <Button
              variant={selected.includes("ALL") ? "success" : "primary"}
              onClick={() => toggleSelect("ALL")}
            >
              [ TODOS (BROADCAST) ]
            </Button>
          )}
          <div className="col-span-full border-t border-[var(--theme-border)] my-2"></div>
          {filteredPlayers.map((player) => {
            const isEnemy = globalNpcs.find((n) => n.name === player)?.isEnemy;
            const isSelected = selected.includes(player);
            let btnVariant: "primary" | "warning" | "danger" | "success" = "primary";
            
            if (isSelected) {
              btnVariant = "warning";
            } else if (isEnemy) {
              btnVariant = "danger";
            }
            
            return (
              <Button
                key={player}
                variant={btnVariant}
                onClick={() => toggleSelect(player)}
              >
                UNIDADE: {player}
              </Button>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="danger" onClick={onClose} className="flex-1">
            CANCELAR
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="flex-1"
          >
            CONFIRMAR
          </Button>
        </div>
      </div>
    </Modal>
  );
}
