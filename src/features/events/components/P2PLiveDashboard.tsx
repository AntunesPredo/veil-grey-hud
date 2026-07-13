import React, { useEffect, useState, useMemo, useRef } from "react";
import { Button, Input } from "../../../shared/ui/Form";
import type { P2PTransferEvent } from "../../../shared/types/events";
import { useCharacterStore } from "../../character/store";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { FiMinimize2, FiMaximize2, FiX, FiCheck, FiDownload } from "../../../shared/ui/Icons";

interface P2PLiveDashboardProps {
  event: P2PTransferEvent;
  isHost: boolean;
  onClose: () => void;
}

export function P2PLiveDashboard({ event, isHost, onClose }: P2PLiveDashboardProps) {
  const characterId = useCharacterStore((state) => state.name);
  const participants = event.payload.participants || {};
  const pKeys = Object.keys(participants).filter(k => participants[k].approved);
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [pullAmount, setPullAmount] = useState<number>(0);
  const [particles, setParticles] = useState<{ id: string; from: string; to: string; progress: number }[]>([]);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // PAN & ZOOM STATE
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  // Track viewport dimensions to center the 1000x1000 logical world
  const [viewport, setViewport] = useState({ width: 1000, height: 700 });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Initialize view to center the logical world (1000x1000)
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setViewport({ width, height });
      
      // Calculate initial scale to fit world with some padding
      const scaleX = width / 1100;
      const scaleY = height / 1100;
      const initialScale = Math.min(scaleX, scaleY, 1);
      
      // Center the 1000x1000 world
      setTransform({
        x: width / 2 - 500 * initialScale,
        y: height / 2 - 500 * initialScale,
        scale: initialScale
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setViewport({ width, height });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
     const scaleAmount = -e.deltaY * 0.001;
     
     // Zoom towards mouse position
     const rect = canvasRef.current?.getBoundingClientRect();
     if (!rect) return;
     
     const mouseX = e.clientX - rect.left;
     const mouseY = e.clientY - rect.top;
     
     setTransform(prev => {
        const newScale = Math.min(Math.max(0.2, prev.scale + scaleAmount), 4);
        const scaleRatio = newScale / prev.scale;
        
        return {
           scale: newScale,
           x: mouseX - (mouseX - prev.x) * scaleRatio,
           y: mouseY - (mouseY - prev.y) * scaleRatio
        };
     });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     isDragging.current = true;
     hasDragged.current = false;
     dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
     e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (isDragging.current) {
        hasDragged.current = true;
        setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }));
     }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
     isDragging.current = false;
     e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Convert screen coords to logical coords
  const screenToLogical = (screenX: number, screenY: number) => {
     return {
        x: (screenX - transform.x) / transform.scale,
        y: (screenY - transform.y) / transform.scale
     };
  };

  // Convert logical coords to screen coords (for the HTML context menu)
  const logicalToScreen = (logicalX: number, logicalY: number) => {
     return {
        x: logicalX * transform.scale + transform.x,
        y: logicalY * transform.scale + transform.y
     };
  };

  // CONFIRMATION LOGIC
  const totalConfirmationsRequired = pKeys.length + 1;
  const currentConfirmations = pKeys.filter(k => participants[k].transferConfirmed).length + (event.payload.hostConfirmed ? 1 : 0);
  const isAllConfirmed = currentConfirmations === totalConfirmationsRequired;
  const myConfirmationState = isHost ? event.payload.hostConfirmed : participants[characterId]?.transferConfirmed;

  const handleToggleConfirm = () => {
     useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
        eventId: event.id,
        action: "P2P_TOGGLE_CONFIRM",
        characterId: characterId === "MASTER" ? "MASTER" : characterId
     });
  };

  // Calculate Node positions based on a circle in the 1000x1000 world
  const nodes = useMemo(() => {
    const cx = 500;
    const cy = 500;
    const radius = 350;
    
    return pKeys.map((pid, index) => {
      const angle = (index / pKeys.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: pid,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        data: participants[pid]
      };
    });
  }, [pKeys, participants]);

  // Click detection
  const handleCanvasClick = (e: React.MouseEvent) => {
     if (hasDragged.current) return;
     const rect = canvasRef.current?.getBoundingClientRect();
     if (!rect) return;
     
     const logical = screenToLogical(e.clientX - rect.left, e.clientY - rect.top);
     
     // Check collision with nodes (approximate radius of 72 for hit box)
     let clickedNode = null;
     for (const node of nodes) {
        const dx = logical.x - node.x;
        const dy = logical.y - node.y;
        if (dx * dx + dy * dy < 72 * 72) {
           clickedNode = node.id;
           break;
        }
     }
     
     if (isHost) {
        setSelectedNode(prev => (prev === clickedNode ? null : clickedNode));
     }
  };

  // Handle incoming transactions to spawn particles
  useEffect(() => {
    if (event.payload.transactions && event.payload.transactions.length > 0) {
       const recentTxs = event.payload.transactions.filter(t => Date.now() - t.timestamp < 2000);
       const newParticles = recentTxs.map(t => ({
         id: t.id,
         from: t.from,
         to: t.to,
         progress: 0
       }));
       
       if (newParticles.length > 0) {
         setParticles(prev => {
            const existingIds = prev.map(p => p.id);
            const added = newParticles.filter(np => !existingIds.includes(np.id));
            return [...prev, ...added];
         });
       }
    }
  }, [event.payload.transactions]);

  // Actions
  const handleCloseEvent = () => {
    if (isHost) {
       useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
          eventId: event.id,
          action: "CLOSE_P2P",
          characterId: isHost ? "MASTER" : characterId,
       });
       onClose();
    }
  };
  const handleDividePool = () => {
     console.log("P2P_DIVIDE_POOL");
     useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", { eventId: event.id, action: "P2P_DIVIDE_POOL" });
  };
  const handleAllToPool = () => {
     console.log("P2P_TRANSFER_TO_POOL");
     useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", { eventId: event.id, action: "P2P_TRANSFER_TO_POOL" });
  };
  const handleSendToPlayer = () => {
     console.log("P2P_TRANSFER_TO_PLAYER:", selectedNode, transferAmount);
     if (!selectedNode || transferAmount <= 0) return;
     if (transferAmount > event.payload.pool) {
        RetroToast.warning("VALOR MAIOR QUE A POOL DISPONÍVEL.");
        return;
     }
     useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
        eventId: event.id, action: "P2P_TRANSFER_TO_PLAYER", participantId: selectedNode, amount: transferAmount
     });
     setTransferAmount(0);
     setSelectedNode(null);
  };
  const handlePullFromPlayer = (pid: string, amount?: number) => {
     console.log("P2P_PULL_FROM_PLAYER:", pid, amount);
     useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
        eventId: event.id, action: "P2P_PULL_FROM_PLAYER", participantId: pid, amount
     });
     setPullAmount(0);
     setSelectedNode(null);
  };

  const getCoords = (id: string) => {
     if (id === "POOL") return { x: 500, y: 500 };
     const node = nodes.find(n => n.id === id);
     return node ? { x: node.x, y: node.y } : { x: 500, y: 500 };
  };

  // RENDER LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let frameId: number;
    let lastTime = performance.now();
    
    // Pulse animation logic
    let pulseTime = 0;

    const render = (time: number) => {
       const delta = time - lastTime;
       lastTime = time;
       pulseTime += delta;
       
       // Update particles
       setParticles(prev => {
          let updated = false;
          const next = prev.map(p => {
             const newProgress = p.progress + (delta * 0.0015);
             if (newProgress !== p.progress) updated = true;
             return { ...p, progress: newProgress };
          }).filter(p => p.progress <= 1.0);
          return updated ? next : prev;
       });

       // Draw
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       ctx.save();
       ctx.translate(transform.x, transform.y);
       ctx.scale(transform.scale, transform.scale);
       
       // 1. Lines
       ctx.lineWidth = 2;
       ctx.setLineDash([10, 10]);
       ctx.strokeStyle = "rgba(51, 65, 85, 0.5)"; // slate-700
       
       nodes.forEach(n => {
          ctx.beginPath();
          ctx.moveTo(500, 500);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
       });
       ctx.setLineDash([]);
       
       // 2. Particles
       particles.forEach(p => {
          const start = getCoords(p.from);
          const end = getCoords(p.to);
          const currX = start.x + (end.x - start.x) * p.progress;
          const currY = start.y + (end.y - start.y) * p.progress;
          const isToPool = p.to === "POOL";
          
          ctx.beginPath();
          ctx.arc(currX, currY, 8, 0, Math.PI * 2);
          ctx.fillStyle = isToPool ? "#10b981" : "#f59e0b";
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
       });

       // 3. Central Pool
       const poolPulse = 1 + Math.sin(pulseTime * 0.003) * 0.03;
       
       ctx.save();
       ctx.translate(500, 500);
       ctx.scale(poolPulse, poolPulse);
       
       // Pool Background
       ctx.beginPath();
       ctx.arc(0, 0, 96, 0, Math.PI * 2);
       ctx.fillStyle = "#1e1b4b"; // indigo-950
       ctx.strokeStyle = "#6366f1"; // indigo-500
       ctx.lineWidth = 4;
       ctx.shadowColor = "rgba(99, 102, 241, 0.5)";
       ctx.shadowBlur = 40;
       ctx.fill();
       ctx.stroke();
       ctx.shadowBlur = 0;
       
       // Pool Texts
       ctx.textAlign = "center";
       ctx.textBaseline = "middle";
       ctx.font = "bold 12px monospace";
       ctx.fillStyle = "#818cf8"; // indigo-400
       ctx.fillText("POOL ATUAL", 0, -35);
       
       ctx.font = "900 40px monospace";
       ctx.fillStyle = "#ffffff";
       ctx.shadowColor = "#ffffff";
       ctx.shadowBlur = 10;
       ctx.fillText(`${event.payload.pool}`, 0, 5);
       ctx.shadowBlur = 0;
       
       ctx.font = "14px monospace";
       ctx.fillStyle = "#a5b4fc"; // indigo-300
       ctx.fillText(`${event.payload.currency || "CC"}`, 0, 35);
       
       // Pool Delta badge
       if (event.payload.pool !== event.payload.initialPool) {
          const pDelta = event.payload.pool - event.payload.initialPool;
          const isPositive = pDelta > 0;
          
          ctx.beginPath();
          ctx.arc(70, -70, 24, 0, Math.PI * 2);
          ctx.fillStyle = isPositive ? "#064e3b" : "#7f1d1d";
          ctx.strokeStyle = isPositive ? "#10b981" : "#ef4444";
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
          
          ctx.font = "bold 14px monospace";
          ctx.fillStyle = isPositive ? "#34d399" : "#f87171";
          ctx.fillText(`${isPositive ? '+' : ''}${pDelta}`, 70, -70);
       }
       ctx.restore();
       
       // 4. Participant Nodes
       nodes.forEach(n => {
          const delta = n.data.currentBalance - n.data.initialBalance;
          const isSelected = selectedNode === n.id;
          
          ctx.save();
          ctx.translate(n.x, n.y);
          
          if (isSelected) {
             ctx.scale(1.1, 1.1);
          }
          
          // Node Background
          ctx.beginPath();
          ctx.roundRect(-72, -72, 144, 144, 12);
          ctx.fillStyle = isSelected ? "rgba(120, 53, 15, 0.8)" : "#0f172a"; // amber-900/80 or slate-900
          ctx.strokeStyle = isSelected ? "#f59e0b" : "#475569"; // amber-500 or slate-600
          ctx.lineWidth = 2;
          if (isSelected) {
             ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
             ctx.shadowBlur = 20;
          }
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          // Texts
          ctx.textAlign = "center";
          
          // Wallet ID
          ctx.font = "10px monospace";
          ctx.fillStyle = "#94a3b8"; // slate-400
          ctx.fillText(n.data.walletId.split('-')[0], 0, -40);
          
          // Player Name
          ctx.font = "900 16px sans-serif";
          ctx.fillStyle = "#ffffff";
          // truncate
          let displayName = n.id;
          if (ctx.measureText(displayName).width > 120) {
             displayName = displayName.substring(0, 10) + "...";
          }
          ctx.fillText(displayName.toUpperCase(), 0, -15);
          
          // Balance pill
          ctx.beginPath();
          ctx.roundRect(-40, 5, 80, 24, 4);
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fill();
          
          ctx.font = "bold 14px monospace";
          ctx.fillStyle = "#34d399"; // emerald-400
          ctx.textBaseline = "middle";
          ctx.fillText(`${n.data.currentBalance}`, 0, 17);
          
          // Delta pill
          if (delta !== 0) {
             const isPos = delta > 0;
             const pulseSca = 1 + Math.sin(pulseTime * 0.01) * 0.1;
             
             ctx.save();
             ctx.translate(-50, 50);
             ctx.scale(pulseSca, pulseSca);
             
             ctx.beginPath();
             ctx.roundRect(-20, -10, 40, 20, 4);
             ctx.fillStyle = isPos ? "#064e3b" : "#7f1d1d";
             ctx.strokeStyle = isPos ? "#10b981" : "#ef4444";
             ctx.lineWidth = 2;
             ctx.shadowColor = isPos ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)";
             ctx.shadowBlur = 10;
             ctx.fill();
             ctx.stroke();
             ctx.shadowBlur = 0;
             
             ctx.font = "bold 12px monospace";
             ctx.fillStyle = isPos ? "#34d399" : "#f87171";
             ctx.fillText(`${isPos ? '+' : ''}${delta}`, 0, 0);
             ctx.restore();
          }
          
          ctx.restore();
       });
       
       ctx.restore();
       frameId = requestAnimationFrame(render);
    };
    
    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [particles, nodes, transform, event.payload, selectedNode]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-white relative overflow-hidden" ref={containerRef}>
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-1 bg-slate-900/80 p-4 border-l-4 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-sm pointer-events-auto">
           <span className="text-xs text-amber-500 font-bold tracking-widest uppercase">HOST</span>
           <span className="text-2xl font-black tracking-widest uppercase">{event.payload.hostId}</span>
        </div>
        <div className="flex flex-col items-end gap-1 bg-slate-900/80 p-4 border-r-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-sm pointer-events-auto">
           <span className="text-xs text-emerald-500 font-bold tracking-widest uppercase">FUNDO INICIAL</span>
           <span className="text-2xl font-black tracking-widest uppercase font-mono">{event.payload.initialPool} {event.payload.currency || "CC"}</span>
           
           <Button variant="danger" size="sm" onClick={onClose} className="mt-2 w-full text-[10px] tracking-widest">
              SAIR / MINIMIZAR
           </Button>
        </div>
      </div>

      {/* CENTER - NATIVE CANVAS WITH PAN/ZOOM */}
      <div 
         className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing"
         onWheel={handleWheel}
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={handlePointerUp}
         onClick={handleCanvasClick}
      >
         <canvas 
            ref={canvasRef}
            width={viewport.width}
            height={viewport.height}
            className="absolute top-0 left-0 w-full h-full outline-none touch-none"
         />

         {/* HOST CONTEXT MENU AS HTML OVERLAY */}
         {selectedNode && isHost && (
            (() => {
               const node = nodes.find(n => n.id === selectedNode);
               if (!node) return null;
               const screenPos = logicalToScreen(node.x, node.y + 80); // position below node
               
               return (
                 <div 
                   className="absolute w-72 bg-slate-900 border border-amber-500 p-3 shadow-2xl z-10 cursor-default flex flex-col gap-3 pointer-events-auto" 
                   style={{ left: screenPos.x, top: screenPos.y, transform: 'translateX(-50%)' }}
                   onPointerDown={e => e.stopPropagation()} 
                   onClick={e => e.stopPropagation()}
                 >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">Ações do Host</span>
                      <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white"><FiX /></button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-mono text-slate-400">ENVIAR DA POOL PARA JOGADOR</label>
                       <div className="flex gap-2">
                         <Input 
                           type="number" 
                           value={transferAmount} 
                           onChange={e => setTransferAmount(Math.max(0, parseInt(e.target.value) || 0))}
                           min={0}
                           max={event.payload.pool}
                           className="h-8 text-sm px-2 w-20"
                         />
                         <Button variant="success" size="sm" onClick={handleSendToPlayer} disabled={transferAmount <= 0} className="px-2 w-full text-[10px] tracking-widest">
                            <FiCheck className="inline mr-1" /> ENVIAR
                         </Button>
                       </div>
                       <Button 
                         variant="warning" 
                         size="sm" 
                         onClick={() => { setTransferAmount(event.payload.pool); setTimeout(handleSendToPlayer, 50); }}
                         disabled={event.payload.pool <= 0}
                         className="w-full text-[10px] tracking-widest py-1 h-6"
                       >
                          ENVIAR TUDO DA POOL ({event.payload.pool})
                       </Button>
                    </div>

                    <div className="w-full h-px bg-slate-800 my-1" />

                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-mono text-slate-400">PUXAR DO JOGADOR PARA POOL</label>
                       <div className="flex gap-2">
                         <Input 
                           type="number" 
                           value={pullAmount} 
                           onChange={e => setPullAmount(Math.max(0, Math.min(parseInt(e.target.value) || 0, node.data.currentBalance)))}
                           min={0}
                           max={node.data.currentBalance}
                           className="h-8 text-sm px-2 w-20"
                         />
                         <Button variant="success" size="sm" onClick={() => handlePullFromPlayer(node.id, pullAmount)} disabled={pullAmount <= 0} className="px-2 w-full text-[10px] tracking-widest">
                            <FiCheck className="inline mr-1" /> PUXAR
                         </Button>
                       </div>
                       <Button 
                         variant="warning" 
                         size="sm" 
                         onClick={() => handlePullFromPlayer(node.id)}
                         disabled={node.data.currentBalance <= 0}
                         className="w-full text-[10px] tracking-widest"
                       >
                          <FiDownload className="inline mr-2" /> PUXAR TUDO ({node.data.currentBalance})
                       </Button>
                    </div>
                 </div>
               );
            })()
         )}
      </div>

      {/* BOTTOM BAR */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-slate-950/90 border-t-2 border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 z-30 backdrop-blur-md">
         {isHost ? (
           <div className="flex gap-4 w-full md:w-auto flex-1">
             <Button variant="primary" onClick={handleAllToPool} className="flex-1 border-dashed border-slate-600 hover:border-emerald-500 hover:text-emerald-400 text-[10px] md:text-xs tracking-widest py-3 md:py-4 transition-colors">
                <FiMinimize2 className="inline mr-1 md:mr-2 text-base md:text-lg" /> PUXAR TUDO P/ POOL
             </Button>
             <Button variant="primary" onClick={handleDividePool} className="flex-1 border-dashed border-slate-600 hover:border-amber-500 hover:text-amber-400 text-[10px] md:text-xs tracking-widest py-3 md:py-4 transition-colors">
                <FiMaximize2 className="inline mr-1 md:mr-2 text-base md:text-lg" /> DIVIDIR IGUALMENTE
             </Button>
           </div>
         ) : (
           <div className="flex flex-1 items-center gap-4 text-xs md:text-sm font-mono text-slate-400 w-full justify-center md:justify-start text-center md:text-left">
             Aguarde o Host finalizar as alterações antes de confirmar.
           </div>
         )}
         
         <div className="flex gap-4 items-center w-full md:w-auto">
            <Button 
               variant={myConfirmationState ? "success" : "primary"} 
               onClick={handleToggleConfirm} 
               className={`flex-1 md:flex-none py-3 md:py-4 text-xs md:text-sm font-bold tracking-widest transition-all ${myConfirmationState ? 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}`}
            >
               {myConfirmationState ? "CONFIRMADO" : "CONFIRMAR"} [{currentConfirmations}/{totalConfirmationsRequired}]
            </Button>
            
            {isHost && (
               <Button 
                 variant="success" 
                 onClick={handleCloseEvent} 
                 disabled={!isAllConfirmed}
                 className={`flex-1 md:w-80 py-3 md:py-4 text-xs md:text-sm font-black tracking-widest ${isAllConfirmed ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse' : 'opacity-50 grayscale'}`}
               >
                 FINALIZAR
               </Button>
            )}
         </div>
      </div>
    </div>
  );
}
