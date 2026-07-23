import { useEffect, useState } from "react";

import { createPortal } from "react-dom";

interface EventResultData {
  title: string;
  hostName: string;
  walletId: string;
  walletName: string;
  delta: number;
  finalBalance?: number;
  currency: string;
  transferId?: string;
  details?: {
    baseSalary: number;
    bonus: number;
    discount: number;
  };
  isRevoke?: boolean;
  isConclusion?: boolean;
  eventName?: string;
  message?: string;
}

export function EventResultManager() {
  const [resultQueue, setResultQueue] = useState<(EventResultData & { generatedId: string })[]>([]);

  useEffect(() => {
    const handleResult = (e: Event) => {
      const customEvent = e as CustomEvent<EventResultData>;
      const newResult = { ...customEvent.detail, generatedId: customEvent.detail.transferId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}` };
      setResultQueue(prev => [...prev, newResult]);
    };

    window.addEventListener("OPEN_EVENT_RESULT", handleResult);
    return () => {
      window.removeEventListener("OPEN_EVENT_RESULT", handleResult);
    };
  }, []);

  if (resultQueue.length === 0) return null;

  const currentResult = resultQueue[0];
  const isRevoke = currentResult.isRevoke;
  const isConclusion = currentResult.isConclusion;

  const handleNext = () => {
    setResultQueue(prev => prev.slice(1));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className={`bg-slate-950 border-2 ${isRevoke ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : isConclusion ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'} rounded-none w-full max-w-md overflow-hidden animate-fade-in relative`}>
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isRevoke ? 'bg-red-500' : isConclusion ? 'bg-cyan-500' : 'bg-emerald-500'} animate-pulse`} />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-800 pb-4">
            {isRevoke ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="text-red-500 w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            ) : isConclusion ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="text-cyan-500 w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )}
            <h2 className={`text-xl font-black tracking-widest ${isRevoke ? 'text-red-400' : isConclusion ? 'text-cyan-400' : 'text-emerald-400'} uppercase leading-tight`}>
              {currentResult.title}
            </h2>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs text-slate-300">
            <div className="flex justify-between items-center bg-slate-900 p-2 border border-slate-800">
              <span className="text-slate-500 uppercase tracking-widest font-bold">ID da Transação</span>
              <span className="text-white font-bold">{currentResult.generatedId}</span>
            </div>

            {(isRevoke || isConclusion) && currentResult.eventName && (
              <div className="flex flex-col bg-slate-900 p-3 border-l-4 border-slate-700 my-1">
                <span className="text-slate-500 uppercase tracking-widest font-bold text-[10px] mb-1">Referência do Contrato</span>
                <span className="text-white font-bold">{currentResult.eventName}</span>
              </div>
            )}

            {(isRevoke || isConclusion) && currentResult.message && (
              <div className={`flex flex-col bg-slate-950 p-4 border border-dashed ${isRevoke ? 'border-red-900/50' : 'border-cyan-900/50'} my-1`}>
                <span className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isRevoke ? 'text-red-500' : 'text-cyan-500'}`}>
                  MENSAGEM DO SISTEMA
                </span>
                <p className="text-slate-400 font-mono text-[11px] leading-relaxed italic">
                  "{currentResult.message}"
                </p>
              </div>
            )}

            <div className="flex justify-between items-center bg-slate-900 p-2 border border-slate-800">
              <span className="text-slate-500 uppercase tracking-widest font-bold">{isConclusion ? "Assinatura" : "Operador / Host"}</span>
              <span className="text-amber-400 font-bold truncate max-w-[150px]">{currentResult.hostName}</span>
            </div>

            {!isRevoke && !isConclusion && (
              <div className="flex justify-between items-center bg-slate-900 p-2 border border-slate-800">
                <span className="text-slate-500 uppercase tracking-widest font-bold">Carteira</span>
                <span className="text-white truncate max-w-[150px]">{currentResult.walletName}</span>
              </div>
            )}

            {currentResult.details && !isRevoke && !isConclusion && (
              <div className="flex flex-col gap-2 p-3 bg-slate-900 border-l-4 border-emerald-500 my-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase tracking-widest font-bold">Salário Base</span>
                  <span className="text-slate-300">{currentResult.details.baseSalary}</span>
                </div>
                {currentResult.details.bonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase tracking-widest font-bold">Bônus</span>
                    <span className="text-emerald-400">+{currentResult.details.bonus}</span>
                  </div>
                )}
                {currentResult.details.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase tracking-widest font-bold">Descontos</span>
                    <span className="text-red-400">-{currentResult.details.discount}</span>
                  </div>
                )}
              </div>
            )}

            {currentResult.finalBalance !== undefined && !isRevoke && !isConclusion && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col bg-slate-900 p-2 border border-slate-800">
                  <span className="text-slate-500 uppercase tracking-widest font-bold text-[10px]">Saldo Anterior</span>
                  <span className="text-slate-400 font-bold">
                    {currentResult.finalBalance - currentResult.delta} {currentResult.currency}
                  </span>
                </div>
                <div className="flex flex-col bg-slate-900 p-2 border border-slate-800">
                  <span className="text-slate-500 uppercase tracking-widest font-bold text-[10px]">Saldo Atualizado</span>
                  <span className="text-slate-300 font-bold">
                    {currentResult.finalBalance} {currentResult.currency}
                  </span>
                </div>
              </div>
            )}

            {!isRevoke && !isConclusion && (
              <div className="flex justify-between items-center bg-slate-950 p-3 border-2 border-slate-700 mt-2">
                <span className="text-slate-400 uppercase tracking-widest font-bold">Total Transacionado</span>
                <span className={`font-black text-lg ${currentResult.delta > 0 ? 'text-emerald-400' : currentResult.delta < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {currentResult.delta > 0 ? '+' : ''}{currentResult.delta} {currentResult.currency}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border-t-2 border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">
            {resultQueue.length > 1 ? `FILA: ${resultQueue.length - 1} PENDENTE(S)` : "MENSAGEM ÚNICA"}
          </span>
          <button
            onClick={handleNext}
            className={`px-6 py-2 tracking-widest text-xs font-black uppercase font-mono transition-colors ${isRevoke
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : isConclusion ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
          >
            {resultQueue.length > 1 ? "PRÓXIMO COMPROVANTE" : "FECHAR"}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("app-root") || document.body
  );
}
