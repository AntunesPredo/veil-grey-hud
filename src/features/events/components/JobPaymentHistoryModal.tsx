import { useMemo } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import type { JobEvent, JobPaymentRecord } from "../../../shared/types/events";

interface JobPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: JobEvent;
  isMaster?: boolean;
  characterId?: string; // ID of the player, if not master
}

export function JobPaymentHistoryModal({
  isOpen,
  onClose,
  event,
  isMaster,
  characterId,
}: JobPaymentHistoryModalProps) {
  const history = event.payload.paymentHistory || [];

  const displayHistory = useMemo(() => {
    if (isMaster) return history;
    if (!characterId) return [];
    return history.filter((h) => h.workerId === characterId);
  }, [history, isMaster, characterId]);

  const totals = useMemo(() => {
    return displayHistory.reduce(
      (acc, curr) => {
        acc.baseSalary += curr.baseSalary;
        acc.bonus += curr.bonus;
        acc.discount += curr.discount;
        acc.finalAmount += curr.finalAmount;
        return acc;
      },
      { baseSalary: 0, bonus: 0, discount: 0, finalAmount: 0 }
    );
  }, [displayHistory]);

  if (!isOpen) return null;

  // Group by transferId for Master view to show bulk payments
  const groupedHistory: Record<string, JobPaymentRecord[]> = {};
  if (isMaster) {
    displayHistory.forEach((h) => {
      if (!groupedHistory[h.transferId]) {
        groupedHistory[h.transferId] = [];
      }
      groupedHistory[h.transferId].push(h);
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="HISTÓRICO DE PAGAMENTOS">
      <div className="flex flex-col gap-4 max-h-[80vh]">
        <div className="bg-slate-800 p-4 border border-cyan-500/50 rounded flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-slate-300 block">
              Trabalho: <span className="text-white">{event.title}</span>
            </span>
            <span className="text-sm font-bold text-slate-300 block">
              Empregador: <span className="text-white">{event.payload.employerName}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase tracking-widest">
              Total {isMaster ? "Gasto" : "Recebido"}
            </span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {totals.finalAmount} {event.payload.currency}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
          {displayHistory.length === 0 ? (
            <div className="text-center p-4 text-slate-500 font-mono text-sm italic">
              Nenhum pagamento registrado.
            </div>
          ) : isMaster ? (
            // MASTER VIEW
            Object.keys(groupedHistory).map((tId) => {
              const records = groupedHistory[tId];
              const bulkTotal = records.reduce((acc, curr) => acc + curr.finalAmount, 0);

              return (
                <div key={tId} className="bg-slate-900 border-l-4 border-slate-600 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs font-bold text-slate-300 tracking-widest">
                      TRANSFERÊNCIA ID: <span className="text-white">{tId}</span>
                    </span>
                  </div>

                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left font-mono text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-500 uppercase tracking-widest">
                          <th className="py-1 px-2 font-normal">Trabalhador</th>
                          <th className="py-1 px-2 font-normal text-right">Salário</th>
                          <th className="py-1 px-2 font-normal text-right">Bônus</th>
                          <th className="py-1 px-2 font-normal text-right">Desconto</th>
                          <th className="py-1 px-2 font-normal text-right text-emerald-500">Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((r, i) => (
                          <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="py-2 px-2 font-bold uppercase">{r.workerId}</td>
                            <td className="py-2 px-2 text-right">{r.baseSalary}</td>
                            <td className="py-2 px-2 text-right text-emerald-400">+{r.bonus}</td>
                            <td className="py-2 px-2 text-right text-red-400">-{r.discount}</td>
                            <td className="py-2 px-2 text-right text-emerald-500 font-bold">{r.finalAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-600 bg-slate-800/50">
                          <td className="py-2 px-2 font-bold uppercase text-slate-400 tracking-widest">Soma Total</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-300">{records.reduce((a, b) => a + b.baseSalary, 0)}</td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-400">+{records.reduce((a, b) => a + b.bonus, 0)}</td>
                          <td className="py-2 px-2 text-right font-bold text-red-400">-{records.reduce((a, b) => a + b.discount, 0)}</td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-500">{bulkTotal}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })
          ) : (
            // PLAYER VIEW
            displayHistory.map((r, i) => (
              <div key={i} className="bg-slate-900 border-l-4 border-slate-600 p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-bold text-slate-300 tracking-widest">
                    ID: {r.transferId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
                  <div className="flex flex-col bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-500">Salário Base</span>
                    <span className="text-slate-300 font-bold">{r.baseSalary}</span>
                  </div>
                  <div className="flex flex-col bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-500">Bônus</span>
                    <span className="text-emerald-400 font-bold">+{r.bonus}</span>
                  </div>
                  <div className="flex flex-col bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-500">Descontos</span>
                    <span className="text-red-400 font-bold">-{r.discount}</span>
                  </div>
                  <div className="flex flex-col bg-slate-800 p-2 border border-slate-700">
                    <span className="text-slate-400 font-bold">Total Recebido</span>
                    <span className="text-emerald-500 font-bold text-sm">
                      {r.finalAmount} {event.payload.currency}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-950 p-4 border-t border-slate-700 mt-2 flex flex-col gap-2">
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            RESUMO TOTAL {isMaster ? "DA FOLHA" : "RECEBIDO"}
          </span>
          <div className="grid grid-cols-3 gap-2 font-mono text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">Salário Base</span>
              <span className="text-slate-300">{totals.baseSalary}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">Bônus</span>
              <span className="text-emerald-400">+{totals.bonus}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">Descontos</span>
              <span className="text-red-400">-{totals.discount}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="primary" onClick={onClose} className="px-8">
            FECHAR HISTÓRICO
          </Button>
        </div>
      </div>
    </Modal>
  );
}
