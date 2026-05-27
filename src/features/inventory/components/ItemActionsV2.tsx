import { useState, useMemo } from "react";
import { useCharacterStore } from "../../character/store";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { useSystemData } from "../../../shared/hooks/useSystemData";
import { useDisclosure } from "../../../shared/hooks/useDisclosure";
import { Button, NumberStepper } from "../../../shared/ui/Form";
import { RetroToast } from "../../../shared/ui/RetroToast";
import {
  dispatchDiscordLog,
  type DiscordEmbed,
} from "../../../shared/utils/discordWebhook";
import { generateInjectionHash } from "../../../shared/utils/hashIntegration";
import { TargetSelectionModal } from "../../../shared/ui/TargetSelectionModal";
import type { Item } from "../../../shared/types/veil-grey";
import { SplitStackModal } from "../components/SplitStackModal";
import { MergeStackModal } from "../components/MergeStackModal";
import { RepairActiveModal } from "../components/RepairActiveModal";
import { DamageItemModal } from "../components/DamageItemModal";
import { HardwareGauge } from "../components/HardwareGauge";

const isDev =
  import.meta.env.VITE_IN_DEVELOPMENT === "true" || import.meta.env.DEV;

interface ItemActionsV2Props {
  item: Item;
  allInventory: Item[];
  currentUses: number;
  onUse: (e: React.MouseEvent) => void;
  isNestedAmmo?: boolean;
  disableUse?: boolean;
  isEditMode?: boolean;
}

export function ItemActionsV2({
  item,
  allInventory,
  currentUses,
  onUse,
  isNestedAmmo = false,
  disableUse = false,
  isEditMode = false,
}: ItemActionsV2Props) {
  const name = useCharacterStore((state) => state.name);
  const deleteInventoryItem = useCharacterStore(
    (state) => state.deleteInventoryItem,
  );
  const updateInventoryItem = useCharacterStore(
    (state) => state.updateInventoryItem,
  );
  const sendPayload = useNetworkStore((state) => state.sendPayload);
  const { getSkillById } = useSystemData();

  const onUpdateQty = (val: number) =>
    updateInventoryItem(item.id, "quantity", Math.max(1, val));

  const splitModal = useDisclosure();
  const mergeModal = useDisclosure();
  const repairModal = useDisclosure();
  const damageModal = useDisclosure();
  const [isTargetModalOpen, setTargetModalOpen] = useState(false);

  const canStack = item.type === "MATERIAL" || item.type === "CONSUMABLE";
  const itemSkill =
    (item.type === "ACTIVE" || item.type === "KIT") && item.skillId
      ? getSkillById(item.skillId)
      : null;
  const hasUses = "maxUses" in item;
  const maxUses = hasUses ? item.maxUses : 1;
  const pct = hasUses ? Math.min((currentUses / maxUses) * 100, 100) : 0;

  const compatibleMergeItems = useMemo(() => {
    if (!canStack) return [];
    return allInventory.filter(
      (i) => i.id !== item.id && i.type === item.type && i.name === item.name,
    );
  }, [allInventory, item, canStack]);

  const handleShareOrDrop = (targets: string[]) => {
    targets.forEach((targetName) => {
      sendPayload(targetName, "ITEM", item);
    });
    RetroToast.success(
      targets.includes("ALL")
        ? `[${item.name}] DESCARTADO NO AMBIENTE.`
        : `[${item.name}] ENVIADO COM SUCESSO.`,
    );
    deleteInventoryItem(item.id);
    setTargetModalOpen(false);
  };

  const handleWebhook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const embed: DiscordEmbed = {
      title: `[>] DADOS LOGÍSTICOS DA MATÉRIA`,
      color: 3447003,
      description: `**NOME:** ${item.name}\n**TIPO:** ${item.type}\n**PESO:** ${item.slots} SLOTS`,
      thumbnail: item.imageUrl ? { url: item.imageUrl } : undefined,
    };
    if (item.quantity > 1) embed.description += `\n**QTD:** ${item.quantity}`;
    if (item.description) embed.description += `\n\n*${item.description}*`;

    dispatchDiscordLog("INVENTORY", name, "", [embed]);
    RetroToast.info("DADOS LOGÍSTICOS TRANSMITIDOS.");
  };

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateInjectionHash({
      type: "ITEM",
      singleUse: true,
      data: {
        ...item,
        id: crypto.randomUUID(),
        parentId: null,
        isCarried: true,
        isEquipped: false,
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-[var(--theme-border)] mt-2">
      {item.type === "EQUIPABLE" && item.armorProps && !isNestedAmmo && (
        <div className="flex flex-col w-full gap-1 mb-2">
          <span className="text-[12px] font-bold border-b border-dashed mb-2 pb-2 text-[var(--theme-warning)] text-center uppercase tracking-widest">
            INTEGRIDADE DA BLINDAGEM ({item.armorProps.pe}/
            {item.armorProps.maxPe})
          </span>
          <div className="w-full h-2 bg-[var(--theme-background)] border border-[var(--theme-border)] mb-2">
            <div
              className="h-full bg-[var(--theme-warning)] shadow-[0_0_5px_var(--theme-warning)] transition-all"
              style={{
                width: `${Math.min((item.armorProps.pe / item.armorProps.maxPe) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {item.type === "ACTIVE" && hasUses && !isNestedAmmo && (
        <div className="flex flex-col w-full gap-1 mb-2">
          <span className="text-[12px] font-bold border-b border-dashed mb-2 pb-2 text-[var(--theme-warning)] text-center uppercase tracking-widest">
            CONDIÇÃO DO EQUIPAMENTO [{Math.floor((currentUses / maxUses) * 100)}
            %]
          </span>
          <div className="w-full h-2 bg-[var(--theme-background)] border border-[var(--theme-border)] mb-2">
            <div
              className="h-full bg-[var(--theme-warning)] shadow-[0_0_5px_var(--theme-warning)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {!isEditMode && (
        <div className="flex flex-wrap gap-2">
          {item.type === "ACTIVE" ||
          (item.type === "EQUIPABLE" && item.armorProps) ? (
            <div className="flex flex-1 gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={repairModal.onOpen}
                className="flex-1 border-dashed text-[10px]"
              >
                MANUTENÇÃO
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={damageModal.onOpen}
                className="flex-1 border-dashed text-[10px]"
              >
                DEGRADAR
              </Button>
            </div>
          ) : null}
          {hasUses ? (
            <Button
              size="sm"
              variant="warning"
              onClick={onUse}
              disabled={disableUse}
              className="flex-1 h-12 text-[14px] shadow-[0_0_8px_rgba(204,122,0,0.2)]"
            >
              {itemSkill ? `[ ${itemSkill.label} ]` : "[ EXECUTAR USO ]"}
            </Button>
          ) : null}
        </div>
      )}

      {isDev && (
        <div className="flex items-center gap-2 mt-1 border-t border-dashed border-[var(--theme-border)] pt-2">
          <span className="text-[9px] font-bold text-[var(--theme-text)]/50 uppercase tracking-widest">
            CHANGE QUANTITY:
          </span>
          <NumberStepper
            size="sm"
            value={item.quantity}
            onDecrement={() => onUpdateQty(item.quantity - 1)}
            onIncrement={() => onUpdateQty(item.quantity + 1)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-1">
        {canStack && item.quantity > 1 && (
          <Button
            size="sm"
            onClick={splitModal.onOpen}
            className="flex-1 h-10 border-dashed text-[9px]"
          >
            DIVIDIR STACK
          </Button>
        )}
        {canStack && compatibleMergeItems.length > 0 && (
          <Button
            size="sm"
            variant="success"
            onClick={mergeModal.onOpen}
            className="flex-1 h-10 border-dashed text-[9px]"
          >
            CONDENSAR
          </Button>
        )}
      </div>

      {item.type === "CONSUMABLE" && item.quantity > 1 && (
        <div className="flex flex-col gap-1 mt-1 border-t border-dashed border-[var(--theme-border)] pt-2">
          <span className="text-[9px] font-bold text-[var(--theme-warning)] uppercase tracking-widest mb-1">
            UNIDADES NA STACK:
          </span>
          <div className="flex flex-row gap-1 flex-wrap">
            {Array.from({ length: item.quantity }).map((_, i) => (
              <div
                key={i}
                className="flex flex-1 justify-between items-center bg-[var(--theme-background)] p-1 border border-[var(--theme-border)] shadow-[0_0_5px_rgba(0,0,0,0.5)_inset]"
              >
                <span className="text-[9px] font-mono text-[var(--theme-text)] font-bold px-1">
                  UNID. {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-[var(--theme-warning)] tracking-widest">
                    <HardwareGauge current={currentUses} max={maxUses} />
                  </span>
                  {!isNestedAmmo && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={onUse}
                      disabled={isEditMode}
                      className="px-2 text-[8px]"
                    >
                      USAR
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEditMode && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => setTargetModalOpen(true)}
            className="flex-1 text-[9px]"
          >
            COMPARTILHAR ou DESCARTAR
          </Button>
          <Button size="sm" onClick={handleWebhook} className="flex-1">
            &gt; TRANSMITIR INFO
          </Button>
          {isDev && (
            <Button
              size="sm"
              variant="warning"
              onClick={handleCopyHash}
              className="px-3 text-[9px]"
            >
              [ HASH ]
            </Button>
          )}
        </div>
      )}

      <TargetSelectionModal
        isOpen={isTargetModalOpen}
        onClose={() => setTargetModalOpen(false)}
        onSelect={handleShareOrDrop}
        title="SELECIONE O RECEPTOR (OU DROPE NO CHÃO)"
        allowAll={true}
      />
      <SplitStackModal
        isOpen={splitModal.isOpen}
        onClose={splitModal.onClose}
        item={item}
      />
      <MergeStackModal
        isOpen={mergeModal.isOpen}
        onClose={mergeModal.onClose}
        targetItem={item}
        allInventory={allInventory}
      />
      <RepairActiveModal
        isOpen={repairModal.isOpen}
        onClose={repairModal.onClose}
        item={item}
      />
      <DamageItemModal
        isOpen={damageModal.isOpen}
        onClose={damageModal.onClose}
        item={item}
      />
    </div>
  );
}
