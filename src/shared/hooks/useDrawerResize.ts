import { useCallback, useRef } from "react";
import { useUIStore } from "../store/useUIStore";

export function useDrawerResize(
  side: "left" | "right",
  drawerRef: React.RefObject<HTMLDivElement>,
) {
  const { setDrawerState } = useUIStore();
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      document.body.style.cursor = "col-resize";

      const ui = useUIStore.getState();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current || !drawerRef.current) return;

        const screenWidth = window.innerWidth;
        let newVW = 20;

        if (side === "left") {
          newVW = (moveEvent.clientX / screenWidth) * 100;
        } else {
          newVW = ((screenWidth - moveEvent.clientX) / screenWidth) * 100;
        }

        newVW = Math.max(15, Math.min(40, newVW));

        const isLeftPinned = side === "left" ? true : ui.drawerLeft.isPinned;
        const isRightPinned = side === "right" ? true : ui.drawerRight.isPinned;

        if (isLeftPinned && isRightPinned) {
          const otherWidth =
            side === "left" ? ui.drawerRight.widthVW : ui.drawerLeft.widthVW;
          if (newVW + otherWidth > 60) newVW = 60 - otherWidth;
        }

        drawerRef.current.style.width = `${newVW}vw`;
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = "default";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

        if (drawerRef.current) {
          const finalWidthStr = drawerRef.current.style.width;
          const finalVW = parseFloat(finalWidthStr.replace("vw", ""));
          if (!isNaN(finalVW)) setDrawerState(side, { widthVW: finalVW });
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [side, setDrawerState, drawerRef],
  );

  return { handleMouseDown };
}
