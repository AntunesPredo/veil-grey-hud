import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import { useMasterEventsStore } from "../store/useMasterEventsStore";
import { FiTrash2 } from "../../../shared/ui/Icons";

interface MasterEventLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MasterEventLogsModal({
  isOpen,
  onClose,
}: MasterEventLogsModalProps) {
  const logs = useMasterEventsStore((state) => state.logs);
  const clearLogs = useMasterEventsStore((state) => state.clearLogs);
  const events = useMasterEventsStore((state) => state.masterEvents);

  if (!isOpen) return null;

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);
  
  // Sort dates descending
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => {
    return new Date(b.split('/').reverse().join('-')).getTime() - new Date(a.split('/').reverse().join('-')).getTime();
  });

  return (
    <Modal title="HISTÓRICO DE LOGS" onClose={onClose} isOpen={isOpen} maxWidth="max-w-2xl">
      <div className="p-4 text-slate-300 w-full flex flex-col h-[70vh]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono font-bold text-slate-400">
            TOTAL DE REGISTROS: {logs.length}
          </span>
          <Button variant="danger" size="sm" onClick={clearLogs} className="flex items-center gap-1">
            <FiTrash2 /> LIMPAR
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
          {logs.length === 0 ? (
            <div className="text-center text-slate-500 font-mono text-sm py-10">
              Nenhum log registrado ainda.
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="flex flex-col mb-6">
                <h4 className="font-bold text-[var(--theme-accent)] border-b border-slate-700 pb-1 mb-3 sticky top-0 bg-slate-950 z-10">
                  {date}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...groupedLogs[date]].reverse().map((log) => {
                    const relatedEvent = events.find((e) => e.id === log.eventId);
                    const eventTitle = relatedEvent ? relatedEvent.title : "Evento Desconhecido";

                    return (
                      <div key={log.id} className="bg-slate-900 border-l-4 border-l-[var(--theme-accent)] border border-slate-700 p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 text-slate-300 uppercase tracking-wider">
                            {eventTitle}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-sm font-mono text-slate-300">
                          <span className="font-bold text-white block mb-1">[{log.characterId}]</span> 
                          <span className="text-slate-400">{log.message}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="warning" onClick={onClose}>FECHAR</Button>
        </div>
      </div>
    </Modal>
  );
}

