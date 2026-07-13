import { useEffect } from "react";
// Removed Modal import
import type { P2PTransferEvent } from "../../../shared/types/events";

import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { P2PLiveDashboard } from "./P2PLiveDashboard";

interface P2PHostManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: P2PTransferEvent;
  isMaster?: boolean;
}

import { createPortal } from "react-dom";

export function P2PHostManageModal({ isOpen, onClose, event }: P2PHostManageModalProps) {

  useEffect(() => {
    if (isOpen) {
      useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
        eventId: event.id,
        action: "P2P_HOST_ENTER",
      });
    }
    
    return () => {
      useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
        eventId: event.id,
        action: "P2P_HOST_LEAVE",
      });
    };
  }, [isOpen, event.id]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9000] bg-slate-950 w-screen h-[100dvh] overflow-hidden">
       <P2PLiveDashboard event={event} isHost={true} onClose={onClose} />
    </div>,
    document.getElementById("app-root") || document.body
  );
}
