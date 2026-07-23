import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";

import type { JobEvent } from "../../../shared/types/events";

interface JobPaymentMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: JobEvent;
  onConfirm: (
    adjustments: Record<
      string,
      { baseSalary: number; bonus: number; discount: number; finalAmount: number }
    >
  ) => void;
}

export function JobPaymentMasterModal({
  isOpen,
  onClose,
  event,
  onConfirm,
}: JobPaymentMasterModalProps) {
  const [generalBonus, setGeneralBonus] = useState<number>(0);
  const [generalDiscount, setGeneralDiscount] = useState<number>(0);
  const [individualAdjustments, setIndividualAdjustments] = useState<
    Record<string, { bonus: number; discount: number }>
  >({});

  if (!isOpen) return null;

  const workers = Object.keys(event.payload.hiredWorkers || {});
  const baseSalary = event.payload.salary;

  const handleConfirm = () => {
    const finalAdjustments: Record<
      string,
      { baseSalary: number; bonus: number; discount: number; finalAmount: number }
    > = {};

    workers.forEach((workerId) => {
      const ind = individualAdjustments[workerId] || { bonus: 0, discount: 0 };
      const totalBonus = generalBonus + ind.bonus;
      const totalDiscount = generalDiscount + ind.discount;
      const finalAmount = Math.max(0, baseSalary + totalBonus - totalDiscount);

      finalAdjustments[workerId] = {
        baseSalary,
        bonus: totalBonus,
        discount: totalDiscount,
        finalAmount,
      };
    });

    onConfirm(finalAdjustments);
  };

  const updateIndividual = (workerId: string, field: "bonus" | "discount", val: number) => {
    setIndividualAdjustments((prev) => {
      const current = prev[workerId] || { bonus: 0, discount: 0 };
      return {
        ...prev,
        [workerId]: {
          ...current,
          [field]: val,
        },
      };
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="EXTRATO DE PAGAMENTO (MESTRE)" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4 max-h-[80vh]">
        <div className="bg-slate-950 p-4 border-2 border-cyan-600 rounded-none flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Empregador
            </span>
            <span className="text-sm font-black text-white font-mono uppercase">
              {event.payload.employerName}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">
              Trabalhadores Ativos
            </span>
            <span className="text-sm font-black text-cyan-400 font-mono">
              {workers.length}
            </span>
          </div>
          <div className="text-right bg-slate-900 p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-bold">Salário Base</span>
            <span className="text-3xl font-mono font-black text-emerald-500 tracking-tighter">
              ${baseSalary} <span className="text-lg text-emerald-700">{event.payload.currency}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-slate-900 border-l-4 border-slate-600 mt-2">
          <label className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 inline-block animate-pulse" />
            AJUSTES GERAIS (Aplicado a todos)
          </label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Bônus Adicional (+)</span>
              <div className="flex items-center bg-slate-950 border border-emerald-900/50 focus-within:border-emerald-500 transition-colors">
                <span className="text-emerald-500 font-black px-3 bg-slate-900 py-2 border-r border-emerald-900/50">+</span>
                <input
                  type="number"
                  value={generalBonus || ""}
                  onChange={(e) => setGeneralBonus(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-transparent text-emerald-400 font-mono font-bold px-3 py-2 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Desconto Geral (-)</span>
              <div className="flex items-center bg-slate-950 border border-red-900/50 focus-within:border-red-500 transition-colors">
                <span className="text-red-500 font-black px-3 bg-slate-900 py-2 border-r border-red-900/50">-</span>
                <input
                  type="number"
                  value={generalDiscount || ""}
                  onChange={(e) => setGeneralDiscount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-transparent text-red-400 font-mono font-bold px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 mt-2">
          <div className="sticky top-0 bg-[var(--theme-background)] py-2 z-10 border-b-2 border-slate-800">
            <label className="text-xs font-black text-slate-300 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-300 inline-block" />
              FOLHA DE PAGAMENTO INDIVIDUAL
            </label>
          </div>

          {workers.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-slate-700 bg-slate-900/50 text-slate-500 font-mono text-sm font-bold uppercase tracking-widest">
              NENHUM TRABALHADOR CONTRATADO.
            </div>
          ) : (
            workers.map((workerId) => {
              const ind = individualAdjustments[workerId] || { bonus: 0, discount: 0 };
              const totalBonus = generalBonus + ind.bonus;
              const totalDiscount = generalDiscount + ind.discount;
              const finalVal = Math.max(0, baseSalary + totalBonus - totalDiscount);

              return (
                <div key={workerId} className="flex flex-col gap-3 bg-slate-950 p-4 border border-slate-800 hover:border-slate-600 transition-colors group">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID do Contratado</span>
                      <span className="font-black text-lg text-white uppercase tracking-wider">{workerId}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Líquido</span>
                      <span className={`font-mono font-black text-xl ${finalVal > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                        {finalVal} {event.payload.currency}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bônus Extra</span>
                      <div className="flex items-center bg-slate-900 border border-slate-800 focus-within:border-emerald-500/50 transition-colors">
                        <span className="text-emerald-500/50 font-black px-2 py-1 text-xs">+</span>
                        <input
                          type="number"
                          value={ind.bonus || ""}
                          onChange={(e) => updateIndividual(workerId, "bonus", parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-transparent text-emerald-400 font-mono font-bold px-2 py-1 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Desconto Extra</span>
                      <div className="flex items-center bg-slate-900 border border-slate-800 focus-within:border-red-500/50 transition-colors">
                        <span className="text-red-500/50 font-black px-2 py-1 text-xs">-</span>
                        <input
                          type="number"
                          value={ind.discount || ""}
                          onChange={(e) => updateIndividual(workerId, "discount", parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-transparent text-red-400 font-mono font-bold px-2 py-1 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-slate-800">
          <button onClick={onClose} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black tracking-widest text-xs uppercase border border-slate-700 transition-colors">
            CANCELAR OPERAÇÃO
          </button>
          <button
            onClick={handleConfirm}
            disabled={workers.length === 0}
            className={`px-8 py-3 font-black tracking-widest text-xs uppercase ${workers.length === 0
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700 shadow-none"
              : "bg-emerald-600 text-white border-2 border-emerald-400 hover:bg-emerald-500"
              }`}
          >
            CONFIRMAR TRANSAÇÃO ({workers.length})
          </button>
        </div>
      </div>
    </Modal>
  );
}
