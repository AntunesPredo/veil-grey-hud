import { useState, useEffect } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input, Checkbox } from "../../../shared/ui/Form";
import { Accordion } from "../../../shared/ui/Accordion";
import { useMasterStore, type MasterNpc } from "../masterStore";

interface NpcAdvancedSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcId: string | null;
}

export function NpcAdvancedSandboxModal({ isOpen, onClose, npcId }: NpcAdvancedSandboxModalProps) {
  const npcs = useMasterStore((state) => state.npcs);
  const updateNpcData = useMasterStore((state) => state.updateNpcData);
  const npc = npcs.find((n) => n.id === npcId);

  const [formData, setFormData] = useState<Partial<MasterNpc>>({});

  useEffect(() => {
    if (npc && isOpen) {
      setFormData(JSON.parse(JSON.stringify(npc)));
    }
  }, [npc, isOpen]);

  if (!npc || !isOpen) return null;

  const handleSave = () => {
    if (npcId) {
      updateNpcData(npcId, formData);
    }
    onClose();
  };

  const updateAttribute = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [field]: value,
      } as any,
    }));
  };

  const updateSkill = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value,
      } as any,
    }));
  };

  const updateHp = (field: "current" | "baseMax", value: number) => {
    setFormData((prev) => ({
      ...prev,
      hp: {
        ...prev.hp!,
        [field]: value,
      },
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`CRIAÇÃO AVANÇADA: ${npc.name} (SANDBOX)`}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">NOME</span>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <Checkbox
            label="É INIMIGO?"
            checked={formData.isEnemy || false}
            onChange={(e) => setFormData((prev) => ({ ...prev, isEnemy: e.target.checked }))}
          />
        </div>

        <Accordion title="SISTEMA VITAL (HP)" isOpen={true} onToggle={() => {}}>
          <div className="grid grid-cols-2 gap-4 p-2 bg-black">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">HP ATUAL</span>
              <Input
                type="number"
                value={formData.hp?.current || 0}
                onChange={(e) => updateHp("current", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">HP MÁXIMO</span>
              <Input
                type="number"
                value={formData.hp?.baseMax || 0}
                onChange={(e) => updateHp("baseMax", Number(e.target.value))}
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="ATRIBUTOS (LIVRE)" isOpen={false} onToggle={() => {}}>
          <div className="grid grid-cols-2 gap-4 p-2 bg-black">
            {Object.keys(formData.attributes || {}).map((attr) => (
              <div key={attr} className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">{attr}</span>
                <Input
                  type="number"
                  value={(formData.attributes as any)?.[attr] || 0}
                  onChange={(e) => updateAttribute(attr, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="PERÍCIAS (LIVRE)" isOpen={false} onToggle={() => {}}>
          <div className="grid grid-cols-2 gap-4 p-2 bg-black">
            {Object.keys(formData.skills || {}).map((skill) => (
              <div key={skill} className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[var(--theme-accent)]">{skill}</span>
                <Input
                  type="number"
                  value={(formData.skills as any)?.[skill] || 0}
                  onChange={(e) => updateSkill(skill, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </Accordion>

        <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-[var(--theme-border)]">
          <Button variant="primary" onClick={onClose}>
            CANCELAR
          </Button>
          <Button variant="success" onClick={handleSave}>
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </div>
    </Modal>
  );
}
