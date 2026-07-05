import { useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../../../shared/store/useNetworkStore";
import { useEventsStore } from "../store/useEventsStore";
import type { GameEvent } from "../../../shared/types/events";

interface UseEventsRealtimeProps {
  roomId: string;
  isMaster: boolean;
  characterId?: string; // used for player
}

export function useEventsRealtime({
  roomId,
  isMaster,
  characterId,
}: UseEventsRealtimeProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const {
    addEvent: addPlayerEvent,
    removeEvent: removePlayerEvent,
    updateEvent: updatePlayerEvent,
  } = useEventsStore();

  useEffect(() => {
    if (!roomId) return;

    const channelName = `room-events:${roomId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Listeners for Master (Source of Truth) -> Player (Clients)
    channel
      .on(
        "broadcast",
        { event: "event-created" },
        (payload: { payload: GameEvent }) => {
          const ev = payload.payload;
          if (isMaster) return; // Master already knows

          if (ev.targets.length === 0 || (characterId && ev.targets.includes(characterId))) {
            addPlayerEvent(ev);
          }
        }
      )
      .on(
        "broadcast",
        { event: "event-updated" },
        (payload: { payload: { id: string; data: Partial<GameEvent> } }) => {
          if (isMaster) return;
          updatePlayerEvent(payload.payload.id, payload.payload.data);
        }
      )
      .on(
        "broadcast",
        { event: "event-deleted" },
        (payload: { payload: { id: string } }) => {
          if (isMaster) return;
          removePlayerEvent(payload.payload.id);
        }
      );

    // Listeners for Player -> Master (ACKs and Updates)
    channel
      .on(
        "broadcast",
        { event: "event-ack" },
        (payload: {
          payload: { eventId: string; characterId: string; action: string; data?: any };
        }) => {
          if (!isMaster) return;
          // Here the master processes acks, e.g., a player accepting a job or buying an item.
          // This should trigger state updates in the master store.
          // Note: In a complete implementation, this might dispatch to a master-specific handler
          // that updates the events.
          console.log("Master received event-ack:", payload.payload);
        }
      );

    channel.subscribe((status) => {
      console.log(`[Events Realtime] ${channelName} status:`, status);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, isMaster, characterId]);

  const emitEvent = (type: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: type,
        payload,
      });
    }
  };

  return {
    emitEvent,
  };
}
