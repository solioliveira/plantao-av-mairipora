import React from 'react';
import {
  Radio,
  Sliders,
  Tv,
  Zap,
  Activity,
  Bot,
  AlertTriangle,
  Server,
  Layers,
  Users,
  FileText,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Cable,
} from 'lucide-react';
import { Auditorium } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentAuditorium: Auditorium;
  onSelectAuditorium: (aud: Auditorium) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingOccurrencesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentAuditorium,
  onSelectAuditorium,
  activeTab,
  onSelectTab,
  pendingOccurrencesCount,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
      {/* Top Bar: Venue & Live Health Status Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                Salão de Assembleias de Mairiporã
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                CO-160-T / rev. 2026
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-100">
              Assistente Virtual de Plantão • Áudio & Vídeo
            </h1>
          </div>
        </div>

        {/* Live System Chips & Auditorium Switcher */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Auditório Switcher */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => onSelectAuditorium('A')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                currentAuditorium === 'A'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auditório A
            </button>
            <button
              onClick={() => onSelectAuditorium('B')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                currentAuditorium === 'B'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auditório B
            </button>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Equipment Status Pills */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>APC 2200VA: <strong>Rede</strong></span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Qu-16: <strong>0 dB Ref</strong></span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span>FM {currentAuditorium}: <strong>{currentAuditorium === 'A' ? '72.1 / 72.9' : '75.5 / 72.7'} MHz</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'practical', label: '📱 Plantão Prático (Dia a Dia)', icon: ShieldCheck, badge: 'Principal' },
            { id: 'dispatch', label: '🧭 Onde Ir & O Que Fazer (Racks/Fibras)', icon: MapPin, badge: 'Despacho' },
            { id: 'troubleshooting', label: 'Troubleshooting Rápido', icon: AlertTriangle },
            { id: 'visualizer', label: 'Decibelímetro & Clarity M', icon: Activity },
            { id: 'team', label: 'Escala de Equipes', icon: Users },
            { id: 'checklist', label: 'Checklist Operacional', icon: CheckCircle2 },
            { id: 'occurrences', label: 'Livro de Ocorrências', icon: FileText, count: pendingOccurrencesCount },
            { id: 'equipment', label: 'Mapa Técnico & Roteamento', icon: Sliders },
            { id: 'chat', label: 'Assistente IA', icon: Bot, badge: 'IA' },
            { id: 'report', label: 'Relatório Oficial', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                    item.id === 'practical'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
