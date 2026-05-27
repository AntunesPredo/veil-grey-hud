import { useState } from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { EquipableItem, Item } from "../../../shared/types/veil-grey";
import { RetroToast } from "../../../shared/ui/RetroToast";

interface UseInventoryDndProps {
  inventory: Item[];
  isEditMode: boolean;
  updateInventoryItem: (
    id: string,
    field: keyof EquipableItem | keyof Item,
    val: Item[keyof Item] | EquipableItem[keyof EquipableItem],
  ) => void;
  moveInventoryItem: (
    itemId: string,
    targetId: string | null,
    drawerName?: string | null,
  ) => { success: boolean; message: string };
  reorderInventoryItem: (activeId: string, overId: string) => void;
  onNestedEquipWarning: (
    activeId: string,
    overId: string,
    targetDrawer: string | null,
  ) => void;
}

export function useInventoryDndV2({
  inventory,
  isEditMode,
  updateInventoryItem,
  moveInventoryItem,
  reorderInventoryItem,
  onNestedEquipWarning,
}: UseInventoryDndProps) {
  const [activeDragItem, setActiveDragItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    const item = inventory.find((i) => String(i.id) === String(e.active.id));
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = e;

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeItem = inventory.find((i) => String(i.id) === activeId);

    if (!activeItem) return;

    let targetParentId: string | null = null;
    let targetDrawer: string | null = null;
    let targetIsCarried: boolean = activeItem.isCarried;
    let overItemForReorder: Item | null = null;

    if (overId === "zone_carried" || overId === "zone_base") {
      targetParentId = null;
      targetDrawer = null;
      targetIsCarried = overId === "zone_carried";
    } else if (overId.startsWith("drawer::")) {
      const parts = overId.split("::");
      targetParentId = parts[1];
      targetDrawer = parts[2] === "GERAL" ? null : parts[2];
      const container = inventory.find((i) => String(i.id) === targetParentId);
      targetIsCarried = container ? container.isCarried : activeItem.isCarried;
    } else {
      const overItem = inventory.find((i) => String(i.id) === overId);
      if (!overItem) return;

      overItemForReorder = overItem;
      targetParentId = overItem.parentId;
      targetDrawer = overItem.drawer;
      targetIsCarried = overItem.isCarried;
    }

    const isChangingStructure =
      targetParentId !== activeItem.parentId ||
      targetDrawer !== activeItem.drawer;

    const isInteractingWithBase = !targetIsCarried || !activeItem.isCarried;

    if (isInteractingWithBase && !isEditMode) {
      return RetroToast.error(
        "MODO EDIÇÃO NECESSÁRIO PARA ACESSAR O ARMAZÉM DA BASE.",
      );
    }

    if (
      isChangingStructure &&
      targetParentId !== null &&
      activeItem.type === "EQUIPABLE"
    ) {
      const targetContainer = inventory.find(
        (i) => String(i.id) === targetParentId,
      );
      if (
        targetContainer &&
        (targetContainer.type === "EQUIPABLE" ||
          targetContainer.type === "CONTAINER")
      ) {
        const hasChildren = inventory.some(
          (i) => String(i.parentId) === activeId,
        );
        if (hasChildren) {
          onNestedEquipWarning(activeId, targetParentId, targetDrawer);
          return;
        }
      }
    }

    if (isChangingStructure || targetIsCarried !== activeItem.isCarried) {
      const res = moveInventoryItem(activeId, targetParentId, targetDrawer);
      if (!res.success) {
        return RetroToast.error(res.message);
      }

      if (targetIsCarried !== activeItem.isCarried) {
        updateInventoryItem(activeId, "isCarried", targetIsCarried);
        if (!targetIsCarried) {
          updateInventoryItem(activeId, "isEquipped", false);
        }
      }
    }

    if (overItemForReorder) {
      reorderInventoryItem(activeId, String(overItemForReorder.id));
    }
  };

  return {
    sensors,
    collisionDetection: pointerWithin,
    activeDragItem,
    handleDragStart,
    handleDragEnd,
  };
}
