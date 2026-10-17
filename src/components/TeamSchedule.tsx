import React, { useState } from 'react';
import {
  Users,
  Save,
  CheckCircle2,
  Calendar,
  FileText,
  UserCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AuditoriumTeam, Auditorium } from '../types';
import { INITIAL_TEAM_A, INITIAL_TEAM_B } from '../data/constants';

interface TeamScheduleProps {
  currentAuditorium: Auditorium;
  teamA: AuditoriumTeam;
  teamB: AuditoriumTeam;
  onUpdateTeamA: (team: AuditoriumTeam) => void;
  onUpdateTeamB: (team: AuditoriumTeam) => void;
  onGoToReport?: () => void;
}

export const TeamSchedule: React.FC<TeamScheduleProps> = ({
  currentAuditorium,
  teamA,
  teamB,
  onUpdateTeamA,
  onUpdateTeamB,
  onGoToReport,
}) => {
  const [selectedAudit, setSelectedAudit] = useState<Auditorium>(currentAuditorium);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentTeam = selectedAudit === 'A' ? teamA : teamB;
  const updateCurrentTeam = selectedAudit === 'A' ? onUpdateTeamA : onUpdateTeamB;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetToDefaults = () => {
    if (selectedAudit === 'A') {
      onUpdateTeamA(INITIAL_TEAM_A);
    } else {
      onUpdateTeamB(INITIAL_TEAM_B);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header and Auditorium Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">Escala de Plantão A/V</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Preenchimento Rápido
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Apenas os 3 dados essenciais para o plantão no Salão de Mairiporã
            </p>
          </div>
        </div>

        {/* Auditorium Switcher Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setSelectedAudit('A')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedAudit === 'A'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auditório A
            </button>
            <button
              onClick={() => setSelectedAudit('B')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedAudit === 'B'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auditório B
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Dados do Auditório {selectedAudit} salvos com sucesso e atualizados no Relatório Oficial!</span>
        </div>
      )}

      {/* The 3 Essential Fields Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        {/* Campo 1: Data do Plantão */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            1. Data do Plantão
          </label>
          <input
            type="date"
            value={currentTeam.date}
            onChange={(e) => updateCurrentTeam({ ...currentTeam, date: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>

        {/* Campo 2: Nome do Plantonista Responsável */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            2. Nome do Plantonista Responsável
          </label>
          <input
            type="text"
            value={currentTeam.dutyTechnician}
            onChange={(e) => updateCurrentTeam({ ...currentTeam, dutyTechnician: e.target.value })}
            placeholder="Ex: Irmão Marcos Oliveira (Plantonista)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
          <span className="text-[11px] text-slate-500 block">
            Plantonista oficial do Salão de Mairiporã com autorização no Rack MA-61-E12-01.
          </span>
        </div>

        {/* Campo 3: Nome do Superintendente de Áudio e Vídeo */}
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
          <label className="block text-xs font-bold text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            3. Nome do Superintendente de Áudio e Vídeo
          </label>
          <input
            type="text"
            value={currentTeam.superintendentAV || currentTeam.superintendentAudio || ''}
            onChange={(e) => {
              const val = e.target.value;
              updateCurrentTeam({
                ...currentTeam,
                superintendentAV: val,
                superintendentAudio: val,
              });
            }}
            placeholder="Ex: Irmão Carlos Andrade"
            className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none transition-colors"
            required
          />
          <span className="text-[11px] text-slate-400 block">
            Superintendente responsável pela operação técnica durante a reunião/assembleia no Auditório {selectedAudit}.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleResetToDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar padrão
          </button>

          <div className="flex items-center gap-2">
            {onGoToReport && (
              <button
                onClick={onGoToReport}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Ver no Relatório Oficial
              </button>
            )}

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              Salvar Escala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
