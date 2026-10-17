import React, { useState } from 'react';
import {
  VolumeX,
  Tv,
  Zap,
  Radio,
  Activity,
  Mic,
  AlertTriangle,
  ChevronRight,
  X,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Auditorium } from '../types';
import { QUICK_TROUBLESHOOTING_GUIDES } from '../data/constants';

interface EmergencyContainmentBarProps {
  currentAuditorium: Auditorium;
  onNavigateToTroubleshooting: (guideId: string) => void;
  onNavigateToVoiceChat: () => void;
  onNavigateToVisualizer: () => void;
}

export const EmergencyContainmentBar: React.FC<EmergencyContainmentBarProps> = ({
  currentAuditorium,
  onNavigateToTroubleshooting,
  onNavigateToVoiceChat,
  onNavigateToVisualizer,
}) => {
  const [quickModalGuideId, setQuickModalGuideId] = useState<string | null>(null);

  const activeGuide = QUICK_TROUBLESHOOTING_GUIDES.find((g) => g.id === quickModalGuideId);

  const handleOpenQuickGuide = (guideId: string) => {
    setQuickModalGuideId(guideId);
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 mb-6">
      {/* Top Banner: Plantão de Contenção Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute"></span>
            <span className="w-3 h-3 rounded-full bg-rose-600 relative"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                Plantão de Contenção &amp; Suporte Imediato
              </h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Acesso Rápido
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Botões táteis para consulta imediata com o polegar enquanto se desloca pelos auditórios
            </p>
          </div>
        </div>

        {/* Quick Voice Consultation Button */}
        <button
          onClick={onNavigateToVoiceChat}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.98] ring-2 ring-emerald-400/40"
          title="Falar dúvida técnica usando o microfone"
        >
          <Mic className="w-5 h-5 animate-pulse text-white" />
          <span>Falar com Assistente (Chat por Voz)</span>
        </button>
      </div>

      {/* Grid of Large Thumb-Friendly Emergency Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* 1. Sem Som */}
        <button
          onClick={() => handleOpenQuickGuide('no-sound-pc')}
          className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-rose-950/70 to-slate-900 border-2 border-rose-500/50 hover:border-rose-400 text-left transition-all active:scale-95 shadow-md group min-h-[96px]"
        >
          <div className="w-full flex items-center justify-between">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30 transition-colors">
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200">
              Crítica
            </span>
          </div>
          <div>
            <strong className="text-xs sm:text-sm font-extrabold text-white block mt-2 leading-tight">
              SEM SOM
            </strong>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
              PC-1 / Qu-16 / Rack
            </span>
          </div>
        </button>

        {/* 2. Sem Vídeo */}
        <button
          onClick={() => handleOpenQuickGuide('no-video-screens')}
          className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-sky-950/70 to-slate-900 border-2 border-sky-500/50 hover:border-sky-400 text-left transition-all active:scale-95 shadow-md group min-h-[96px]"
        >
          <div className="w-full flex items-center justify-between">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 group-hover:bg-sky-500/30 transition-colors">
              <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200">
              Crítica
            </span>
          </div>
          <div>
            <strong className="text-xs sm:text-sm font-extrabold text-white block mt-2 leading-tight">
              SEM VÍDEO
            </strong>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
              Telões / Câmeras
            </span>
          </div>
        </button>

        {/* 3. Queda de Energia */}
        <button
          onClick={() => handleOpenQuickGuide('power-blackout')}
          className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-amber-950/70 to-slate-900 border-2 border-amber-500/50 hover:border-amber-400 text-left transition-all active:scale-95 shadow-md group min-h-[96px]"
        >
          <div className="w-full flex items-center justify-between">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30 transition-colors">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
              1 Min ATS
            </span>
          </div>
          <div>
            <strong className="text-xs sm:text-sm font-extrabold text-white block mt-2 leading-tight">
              QUEDA ENERGIA
            </strong>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
              Gerador / Nobreak APC
            </span>
          </div>
        </button>

        {/* 4. Rádios FM */}
        <button
          onClick={() => handleOpenQuickGuide('fm-radio-noise')}
          className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-purple-950/70 to-slate-900 border-2 border-purple-500/50 hover:border-purple-400 text-left transition-all active:scale-95 shadow-md group min-h-[96px]"
        >
          <div className="w-full flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
              Aud. {currentAuditorium}
            </span>
          </div>
          <div>
            <strong className="text-xs sm:text-sm font-extrabold text-white block mt-2 leading-tight">
              RÁDIOS FM
            </strong>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
              {currentAuditorium === 'A' ? '72.1 / 72.9 MHz' : '75.5 / 72.7 MHz'}
            </span>
          </div>
        </button>

        {/* 5. Decibelímetro SPL */}
        <button
          onClick={onNavigateToVisualizer}
          className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 text-left transition-all active:scale-95 shadow-md group min-h-[96px]"
        >
          <div className="w-full flex items-center justify-between">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
              70–77 dB
            </span>
          </div>
          <div>
            <strong className="text-xs sm:text-sm font-extrabold text-white block mt-2 leading-tight">
              DECIBELÍMETRO
            </strong>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
              Voz / TC Clarity M
            </span>
          </div>
        </button>

        {/* 6. Microfonia Palco */}
        <button
          onClick={() => handleOpenQuickGuide('feedback-speaker')}
          className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-amber-950/70 to-slate-900 border-2 border-amber-600/50 hover:border-amber-400 text-left transition-all active:scale-95 shadow-md group min-h-[96px]"
        >
          <div className="w-full flex items-center justify-between">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30 transition-colors">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
              Tribuna
            </span>
          </div>
          <div>
            <strong className="text-xs sm:text-sm font-extrabold text-white block mt-2 leading-tight">
              MICROFONIA
            </strong>
            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
              Canal 1 / Palco
            </span>
          </div>
        </button>
      </div>

      {/* Quick Mobile Modal for Instant On-The-Go Action (3 Immediate Steps) */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-emerald-500/60 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    Emergência Imediata
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {activeGuide.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setQuickModalGuideId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Steps in High Contrast */}
            <div className="space-y-3 text-xs leading-relaxed">
              {/* Step 1 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
                <strong className="text-emerald-300 font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  1. O que verificar primeiro (Posto de Operação):
                </strong>
                <p className="text-slate-200 whitespace-pre-line pl-5">
                  {activeGuide.step1.replace(/1\. O que verificar primeiro.*:\n/i, '')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-1">
                <strong className="text-amber-300 font-bold block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  2. Onde ir fisicamente:
                </strong>
                <p className="text-slate-200 whitespace-pre-line pl-5">
                  {activeGuide.step2.replace(/2\. Onde ir fisicamente.*:\n/i, '')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/30 space-y-1">
                <strong className="text-blue-300 font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  3. Ação corretiva segura (Regras do Rack):
                </strong>
                <p className="text-slate-200 whitespace-pre-line pl-5">
                  {activeGuide.step3.replace(/3\. Ação corretiva segura.*:\n/i, '')}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const id = activeGuide.id;
                  setQuickModalGuideId(null);
                  onNavigateToTroubleshooting(id);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>Abrir no painel completo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setQuickModalGuideId(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
              >
                Concluir Consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
