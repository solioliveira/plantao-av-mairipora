import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ChecklistItem } from '../types';

interface ChecklistDrawerProps {
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onResetPhase: (phase: 'abertura' | 'encerramento') => void;
}

export const ChecklistDrawer: React.FC<ChecklistDrawerProps> = ({
  checklist,
  onToggleItem,
  onResetPhase,
}) => {
  const [activePhase, setActivePhase] = useState<'abertura' | 'encerramento'>('encerramento');

  const currentItems = checklist.filter((item) => item.phase === activePhase);
  const completedCount = currentItems.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / (currentItems.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Checklist Operacional & Encerramento</h3>
            <p className="text-xs text-slate-400">
              Procedimentos obrigatórios de checagem inicial e desligamento sequencial estrito
            </p>
          </div>
        </div>

        {/* Phase Toggle */}
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActivePhase('abertura')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activePhase === 'abertura'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Abertura do Salão ({checklist.filter((i) => i.phase === 'abertura' && i.completed).length}/10)
          </button>
          <button
            onClick={() => setActivePhase('encerramento')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activePhase === 'encerramento'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Encerramento Sequencial ({checklist.filter((i) => i.phase === 'encerramento' && i.completed).length}/7)
          </button>
        </div>
      </div>

      {/* Progress & Guidance Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-2">
            Progresso de {activePhase === 'abertura' ? 'Abertura' : 'Encerramento'}:
            <span className="text-emerald-400 font-bold font-mono">{progressPercent}%</span>
          </span>
          <span className="text-slate-400">
            {completedCount} de {currentItems.length} concluídos
          </span>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercent === 100
                ? 'bg-emerald-500'
                : activePhase === 'encerramento'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {activePhase === 'encerramento' && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">
                Regra de Ouro: Sequência Estrita de Desligamento no Encerramento
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                NUNCA inverta a ordem: <strong>1. PCs</strong> → <strong>2. Qu-16 Shutdown</strong> →{' '}
                <strong>3. Câmeras (User 1 por 2s)</strong> → <strong>4. Gerenciador 2 (2s Ação)</strong> →{' '}
                <strong>5. Gerenciador 1 (2s Ação)</strong> → <strong>6. 25 Rádios FM</strong> →{' '}
                <strong>7. Microfones sem pilhas no gaveteiro</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-2.5">
        {currentItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 shadow-sm ${
              item.completed
                ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100'
            }`}
          >
            <button
              type="button"
              className="mt-0.5 text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
            >
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-emerald-500" />
              ) : (
                <Square className="w-5 h-5 text-slate-500" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-xs font-bold text-slate-500">#{item.order}</span>
                <h4
                  className={`text-xs sm:text-sm font-bold ${
                    item.completed ? 'line-through text-slate-500' : 'text-slate-100'
                  }`}
                >
                  {item.title}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => onResetPhase(activePhase)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar checklist de {activePhase}
        </button>
      </div>
    </div>
  );
};
