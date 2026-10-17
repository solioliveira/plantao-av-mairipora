import React, { useState } from 'react';
import {
  Users,
  Save,
  CheckCircle2,
  Calendar,
  Building,
  Sparkles,
  RefreshCw,
  FileText,
  UserCheck,
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

  const handleChange = (field: keyof AuditoriumTeam, value: string) => {
    updateCurrentTeam({
      ...currentTeam,
      [field]: value,
    });
  };

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
    <div className="space-y-6">
      {/* Header and Auditorium Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Escala Oficial de Equipes A/V</h3>
            <p className="text-xs text-slate-400">
              Gestão nominal dos operadores conforme estrutura exigida em Mairiporã e CO-160-T
            </p>
          </div>
        </div>

        {/* Auditorium Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setSelectedAudit('A')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedAudit === 'A'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auditório A
            </button>
            <button
              onClick={() => setSelectedAudit('B')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
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
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Escala do Auditório {selectedAudit} salva com sucesso! Os dados serão incluídos no Relatório Oficial.</span>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
        {/* Event Header Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Evento / Assembleia
            </label>
            <input
              type="text"
              value={currentTeam.eventName}
              onChange={(e) => handleChange('eventName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Circuito</label>
            <input
              type="text"
              value={currentTeam.circuit}
              onChange={(e) => handleChange('circuit', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Data do Plantão</label>
            <input
              type="date"
              value={currentTeam.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Liderança e Superintendência */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            Liderança e Supervisão
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Plantonista Responsável (Salão)</label>
              <input
                type="text"
                value={currentTeam.dutyTechnician}
                onChange={(e) => handleChange('dutyTechnician', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Superintendente de A/V (Titular)</label>
              <input
                type="text"
                value={currentTeam.superintendentAV}
                onChange={(e) => handleChange('superintendentAV', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Diretor Técnico</label>
              <input
                type="text"
                value={currentTeam.technicalDirector}
                onChange={(e) => handleChange('technicalDirector', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Assistentes de Departamento */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">
            Superintendentes Assistentes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Superintendente Assistente (Áudio)</label>
              <input
                type="text"
                value={currentTeam.assistantAudio}
                onChange={(e) => handleChange('assistantAudio', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Superintendente Assistente (Vídeo)</label>
              <input
                type="text"
                value={currentTeam.assistantVideo}
                onChange={(e) => handleChange('assistantVideo', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Superintendente Assistente (Palco)</label>
              <input
                type="text"
                value={currentTeam.assistantStage}
                onChange={(e) => handleChange('assistantStage', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Postos de Operação (Cabine / Bancada) */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">
            Operadores de Posto
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Operador de Mesa de Som (Qu-16)</label>
              <input
                type="text"
                value={currentTeam.soundOperator}
                onChange={(e) => handleChange('soundOperator', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Assistente de Som (Decibelímetro)</label>
              <input
                type="text"
                value={currentTeam.soundAssistant}
                onChange={(e) => handleChange('soundAssistant', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Operador da Mesa de Corte (Blackmagic)</label>
              <input
                type="text"
                value={currentTeam.switchOperator}
                onChange={(e) => handleChange('switchOperator', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Operador de Mídia (JW Library)</label>
              <input
                type="text"
                value={currentTeam.mediaOperator}
                onChange={(e) => handleChange('mediaOperator', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Operador(es) de Câmera PTZ (AW-RP50)</label>
              <input
                type="text"
                value={currentTeam.cameraOperators}
                onChange={(e) => handleChange('cameraOperators', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Equipe de Palco & Maquiagem</label>
              <input
                type="text"
                value={currentTeam.stageMakeupTeam}
                onChange={(e) => handleChange('stageMakeupTeam', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Makeup / Palco Note Box */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <strong className="text-slate-300 font-semibold block">Diretrizes de Maquiagem de Palco:</strong>
          <p>
            • <strong>Local:</strong> Auditório A: Sala EXTRA | Auditório B: local definido pela comissão da assembleia.
          </p>
          <p>
            • <strong>Higiene:</strong> Obrigatório uso de aplicadores descartáveis individuais e pó compacto translúcido para evitar reflexos das luzes cênicas nas câmeras PTZ.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleResetToDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar dados modelo de Mairiporã
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Escala do Auditório {selectedAudit}
          </button>
        </div>
      </div>
    </div>
  );
};
