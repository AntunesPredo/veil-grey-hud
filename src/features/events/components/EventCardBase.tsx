import React from "react";
import type { GameEvent } from "../../../shared/types/events";
import { FiEdit2, FiUsers, FiTrash2, FiSend } from "../../../shared/ui/Icons";

interface EventCardBaseProps {
  event: GameEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPush?: () => void;
  children: React.ReactNode;
  colorTheme?: string;
}

export function EventCardBase({
  event,
  isMaster = false,
  onEdit,
  onDelete,
  onPush,
  children,
  colorTheme = "border-slate-800",
}: EventCardBaseProps) {
  return (
    <div className={`flex flex-col bg-slate-900 border ${colorTheme} rounded-none overflow-hidden shadow-xl mb-4 relative`}>
      {/* Cover Image */}
      {event.coverImage && (
        <div
          className="h-32 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${event.coverImage})` }}
        />
      )}

      {/* Header */}
      <div className={`p-4 border-b ${colorTheme} flex justify-between items-start bg-slate-900/50`}>
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-slate-400 mt-1">{event.description}</p>
          )}
        </div>

        {/* Master Controls */}
        {isMaster && (
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-none">
              <FiUsers className="mr-1" />
              <span>{event.targets.length} alvos</span>
            </div>
            {onPush && (
              <button
                onClick={onPush}
                className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-none transition-colors"
                title="Sincronizar (Enviar para Jogadores)"
              >
                <FiSend />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-none transition-colors"
                title="Editar Evento"
              >
                <FiEdit2 />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-red-400 hover:text-white hover:bg-red-900/50 rounded-none transition-colors"
                title="Deletar Evento"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body / Module specifics */}
      <div className="p-4">{children}</div>
    </div>
  );
}

