import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AssistantChat } from './components/AssistantChat';
import { TroubleshootingGuide } from './components/TroubleshootingGuide';
import { AudioVisualizer } from './components/AudioVisualizer';
import { EquipmentMap } from './components/EquipmentMap';
import { TeamSchedule } from './components/TeamSchedule';
import { OccurrenceLog } from './components/OccurrenceLog';
import { ChecklistDrawer } from './components/ChecklistDrawer';
import { ReportGenerator } from './components/ReportGenerator';
import { OfflineIndicator } from './components/OfflineIndicator';
import { EmergencyContainmentBar } from './components/EmergencyContainmentBar';
import { PracticalShiftView } from './components/PracticalShiftView';
import { PhysicalDispatchResolver } from './components/PhysicalDispatchResolver';
import {
  Auditorium,
  AuditoriumTeam,
  Occurrence,
  ChecklistItem,
  OccurrenceStatus,
} from './types';
import {
  INITIAL_TEAM_A,
  INITIAL_TEAM_B,
  INITIAL_CHECKLIST,
} from './data/constants';

const INITIAL_OCCURRENCES: Occurrence[] = [
  {
    id: 'occ-1',
    timestamp: '08:45',
    auditorium: 'A',
    category: 'Elétrica / Nobreak',
    severity: 'Baixa',
    symptom: 'Inspeção preventiva do Nobreak APC 2200VA e Chave ATS antes da abertura.',
    locationChecked: 'Rack Principal (MA-61-E12-01)',
    actionTaken: 'Nobreak operando em rede normalmente. Tensão estável em 220V e sem alarmes.',
    status: 'Resolvido',
    operatorInCharge: 'Plantonista de Áudio e Vídeo',
  },
  {
    id: 'occ-2',
    timestamp: '09:20',
    auditorium: 'A',
    category: 'Áudio',
    severity: 'Média',
    symptom: 'Nível do player de vídeo no PC-1 oscilou durante o teste do cântico inicial.',
    locationChecked: 'Bancada de Som (Qu-16) e JW Library',
    actionTaken: 'Ajustado fader motorizado dos canais 9/10 para 0 dB e conferido ganho no medidor TC Clarity M (0 dB FS de referência).',
    status: 'Resolvido',
    operatorInCharge: 'Operador de Som Qu-16',
  },
  {
    id: 'occ-3',
    timestamp: '10:15',
    auditorium: 'A',
    category: 'Rádios FM',
    severity: 'Baixa',
    symptom: 'Conferência da distribuição dos 25 rádios FM (01-13 auditivos e 14-25 audiodescrição).',
    locationChecked: 'Bandeja de Rádios e Balcão de Apoio',
    actionTaken: 'Todos os 25 rádios testados nas frequências 72.1 MHz e 72.9 MHz. Fones desdobrados e funcionando com clareza.',
    status: 'Resolvido',
    operatorInCharge: 'Assistente de Som',
  },
];

export default function App() {
  const [currentAuditorium, setCurrentAuditorium] = useState<Auditorium>('A');
  const [activeTab, setActiveTab] = useState<string>('practical');
  const [selectedTroubleshootId, setSelectedTroubleshootId] = useState<string>('no-sound-pc');
  const [voiceTriggerCounter, setVoiceTriggerCounter] = useState<number>(0);

  // Teams state
  const [teamA, setTeamA] = useState<AuditoriumTeam>(() => {
    const saved = localStorage.getItem('mairipora_team_a');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_A;
  });

  const [teamB, setTeamB] = useState<AuditoriumTeam>(() => {
    const saved = localStorage.getItem('mairipora_team_b');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_B;
  });

  // Occurrences state
  const [occurrences, setOccurrences] = useState<Occurrence[]>(() => {
    const saved = localStorage.getItem('mairipora_occurrences');
    return saved ? JSON.parse(saved) : INITIAL_OCCURRENCES;
  });

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('mairipora_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mairipora_team_a', JSON.stringify(teamA));
  }, [teamA]);

  useEffect(() => {
    localStorage.setItem('mairipora_team_b', JSON.stringify(teamB));
  }, [teamB]);

  useEffect(() => {
    localStorage.setItem('mairipora_occurrences', JSON.stringify(occurrences));
  }, [occurrences]);

  useEffect(() => {
    localStorage.setItem('mairipora_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Handler for adding new occurrence
  const handleAddOccurrence = (newOccData: Omit<Occurrence, 'id' | 'timestamp'>) => {
    const newOcc: Occurrence = {
      ...newOccData,
      id: `occ-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setOccurrences((prev) => [newOcc, ...prev]);
  };

  const handleUpdateOccurrenceStatus = (id: string, newStatus: OccurrenceStatus) => {
    setOccurrences((prev) =>
      prev.map((occ) => (occ.id === id ? { ...occ, status: newStatus } : occ))
    );
  };

  const handleDeleteOccurrence = (id: string) => {
    setOccurrences((prev) => prev.filter((occ) => occ.id !== id));
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleResetChecklistPhase = (phase: 'abertura' | 'encerramento') => {
    setChecklist((prev) =>
      prev.map((item) => (item.phase === phase ? { ...item, completed: false } : item))
    );
  };

  const pendingOccurrencesCount = occurrences.filter((o) => o.status !== 'Resolvido').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentAuditorium={currentAuditorium}
        onSelectAuditorium={setCurrentAuditorium}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingOccurrencesCount={pendingOccurrencesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {activeTab === 'practical' ? (
          <PracticalShiftView
            currentAuditorium={currentAuditorium}
            onSelectAuditorium={setCurrentAuditorium}
            teamA={teamA}
            teamB={teamB}
            onUpdateTeamA={setTeamA}
            onUpdateTeamB={setTeamB}
            occurrences={occurrences}
            onAddOccurrence={handleAddOccurrence}
            onDeleteOccurrence={handleDeleteOccurrence}
            checklist={checklist}
            onToggleChecklistItem={handleToggleChecklistItem}
            onResetChecklist={() => {
              handleResetChecklistPhase('abertura');
              handleResetChecklistPhase('encerramento');
            }}
            onOpenAdvancedMode={() => setActiveTab('troubleshooting')}
            onOpenDispatchMode={() => setActiveTab('dispatch')}
          />
        ) : (
          <>
            {/* Plantão de Contenção & Suporte Imediato - Bloco de Acesso Rápido no Topo */}
            <EmergencyContainmentBar
              currentAuditorium={currentAuditorium}
              onNavigateToTroubleshooting={(guideId) => {
                setSelectedTroubleshootId(guideId);
                setActiveTab('troubleshooting');
              }}
              onNavigateToVoiceChat={() => {
                setActiveTab('chat');
                setVoiceTriggerCounter((prev) => prev + 1);
              }}
              onNavigateToVisualizer={() => {
                setActiveTab('visualizer');
              }}
            />
          </>
        )}

        {activeTab === 'dispatch' && (
          <div className="space-y-6">
            <PhysicalDispatchResolver
              currentAuditorium={currentAuditorium}
              onAddOccurrence={(occ) => {
                handleAddOccurrence(occ);
                setActiveTab('occurrences');
              }}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <AssistantChat
              currentAuditorium={currentAuditorium}
              onOpenTroubleshooting={() => setActiveTab('troubleshooting')}
              autoStartVoiceTrigger={voiceTriggerCounter}
            />
            {/* Embedded Live SPL gauge for quick reference during chat */}
            <AudioVisualizer />
          </div>
        )}

        {activeTab === 'troubleshooting' && (
          <TroubleshootingGuide
            currentAuditorium={currentAuditorium}
            selectedGuideId={selectedTroubleshootId}
            onSelectGuideId={setSelectedTroubleshootId}
            onAddOccurrence={(occ) => {
              handleAddOccurrence(occ);
              setActiveTab('occurrences');
            }}
          />
        )}

        {activeTab === 'visualizer' && (
          <div className="space-y-6">
            <AudioVisualizer />
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
              <strong className="text-slate-200 text-sm block">Instruções do Decibelímetro para o Assistente no Auditório:</strong>
              <p>
                • O assistente do operador de som deve circular discretamente pelo auditório com este aplicativo aberto em smartphone ou tablet.
              </p>
              <p>
                • Pressione o botão <strong>&quot;Usar Microfone do Dispositivo&quot;</strong> acima para medição direta dos níveis sonoros em tempo real.
              </p>
              <p>
                • Alvo acústico oficial: <strong>70 a 77 dB SPL</strong> para oradores/discursos e <strong>80 dB SPL</strong> para cânticos e vídeos.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <EquipmentMap currentAuditorium={currentAuditorium} />
        )}

        {activeTab === 'team' && (
          <TeamSchedule
            currentAuditorium={currentAuditorium}
            teamA={teamA}
            teamB={teamB}
            onUpdateTeamA={setTeamA}
            onUpdateTeamB={setTeamB}
            onGoToReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'occurrences' && (
          <OccurrenceLog
            currentAuditorium={currentAuditorium}
            occurrences={occurrences}
            onAddOccurrence={handleAddOccurrence}
            onUpdateOccurrenceStatus={handleUpdateOccurrenceStatus}
            onDeleteOccurrence={handleDeleteOccurrence}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistDrawer
            checklist={checklist}
            onToggleItem={handleToggleChecklistItem}
            onResetPhase={handleResetChecklistPhase}
          />
        )}

        {activeTab === 'report' && (
          <ReportGenerator
            currentAuditorium={currentAuditorium}
            teamA={teamA}
            teamB={teamB}
            occurrences={occurrences}
            checklist={checklist}
            onRestoreBackup={(backupData) => {
              if (backupData.teamA) setTeamA(backupData.teamA);
              if (backupData.teamB) setTeamB(backupData.teamB);
              if (backupData.occurrences && Array.isArray(backupData.occurrences)) {
                setOccurrences(backupData.occurrences);
              }
              if (backupData.checklist && Array.isArray(backupData.checklist)) {
                setChecklist(backupData.checklist);
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>
            Salão de Assembleias de Mairiporã &bull; Sistema de Apoio ao Plantonista A/V
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            Diretriz CO-160-T &bull; Manual Operacional rev. 2026
          </span>
        </div>
      </footer>

      {/* Floating Offline Notification when network is lost */}
      <OfflineIndicator />
    </div>
  );
}
