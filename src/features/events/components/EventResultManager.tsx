import { useEffect, useState } from "react";
import { Button } from "../../../shared/ui/Form";
import { createPortal } from "react-dom";

interface EventResultData {
  title: string;
  hostName: string;
  walletId: string;
  walletName: string;
  delta: number;
  finalBalance?: number;
  currency: string;
}

export function EventResultManager() {
  const [resultData, setResultData] = useState<EventResultData | null>(null);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const handleResult = (e: Event) => {
      const customEvent = e as CustomEvent<EventResultData>;
      const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
      setTransactionId(`TXN-${hash}`);
      setResultData(customEvent.detail);
    };

    window.addEventListener("OPEN_EVENT_RESULT", handleResult);
    return () => {
      window.removeEventListener("OPEN_EVENT_RESULT", handleResult);
    };
  }, []);

  if (!resultData) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-lg w-full max-w-md overflow-hidden animate-fade-in relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h2 className="text-lg font-black tracking-widest text-emerald-400 uppercase">
              {resultData.title}
            </h2>
          </div>

          <div className="flex flex-col gap-4 font-mono text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">ID da Transação:</span>
              <span className="text-white font-bold">{transactionId}</span>
            </div>
            
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Operador / Host:</span>
              <span className="text-amber-400">{resultData.hostName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Item (Carteira):</span>
              <span className="text-white truncate max-w-[150px]">{resultData.walletName}</span>
            </div>

            {resultData.finalBalance !== undefined && (
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Balanço Final:</span>
                <span className="text-slate-300">{resultData.finalBalance} {resultData.currency}</span>
              </div>
            )}

            <div className="flex justify-between bg-slate-950 p-3 rounded border border-slate-800 mt-2">
              <span className="text-slate-400">Total Liquidado:</span>
              <span className={`font-black text-lg ${resultData.delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {resultData.delta > 0 ? '+' : ''}{resultData.delta} {resultData.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <Button variant="success" onClick={() => setResultData(null)} className="px-8 tracking-widest text-xs font-bold">
            FECHAR
          </Button>
        </div>
      </div>
    </div>,
    document.getElementById("app-root") || document.body
  );
}
