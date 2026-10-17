import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-3 rounded-xl bg-slate-900 border border-amber-500/50 p-3 text-xs text-amber-200 shadow-2xl backdrop-blur-md max-w-md animate-in fade-in slide-in-from-bottom-2">
      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
        <WifiOff className="w-5 h-5 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <span>Modo Offline Ativo (Rede Desconectada)</span>
        </div>
        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
          O guia de troubleshooting, diagramas Qu-16/Rack, checklists e relatórios continuam <strong>100% disponíveis offline</strong>.
        </p>
      </div>
    </div>
  );
};
