export type Auditorium = 'A' | 'B';

export interface TeamMemberRole {
  title: string;
  key: string;
  name: string;
  phone?: string;
  congregation?: string;
}

export interface AuditoriumTeam {
  auditorium: Auditorium;
  eventName: string;
  circuit: string;
  date: string;
  dutyTechnician: string; // Plantonista Responsável
  superintendentAudio: string; // Superintendente de Áudio (Principal / Obrigatório)
  superintendentAV?: string; // Superintendente de A/V Titular
  technicalDirector?: string; // Diretor Técnico
  supervisionNotes?: string; // Observações de Supervisão e Equipe
  // Campos opcionais mantidos para compatibilidade
  assistantAudio?: string;
  assistantVideo?: string;
  assistantStage?: string;
  soundOperator?: string;
  soundAssistant?: string;
  switchOperator?: string;
  mediaOperator?: string;
  cameraOperators?: string;
  stageMakeupTeam?: string;
  notes?: string;
}

export type OccurrenceSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type OccurrenceCategory = 'Áudio' | 'Vídeo' | 'Palco' | 'Elétrica / Nobreak' | 'Rádios FM' | 'JW Library / Rede' | 'Outro';
export type OccurrenceStatus = 'Resolvido' | 'Em Monitoramento' | 'Pendente';

export interface Occurrence {
  id: string;
  timestamp: string;
  auditorium: Auditorium;
  category: OccurrenceCategory;
  severity: OccurrenceSeverity;
  symptom: string;
  locationChecked: string;
  actionTaken: string;
  status: OccurrenceStatus;
  operatorInCharge?: string;
}

export interface EquipmentStatus {
  rackPowerManagers: 'Normal' | 'Alerta' | 'Desligado';
  nobreakAPC: 'Normal (Rede)' | 'Alimentando na Bateria' | 'Alerta';
  qu16SoundDesk: 'Online' | 'Offline';
  tcClarityM: 'Normal (0 dB Ref)' | 'Sinal Alto (> -18)' | 'Sem Sinal';
  atemSwitcher: 'Online' | 'Offline';
  panasonicController: 'Online' | 'Offline';
  fmTransmitters: 'Normal (72.1/72.9 MHz)' | 'Alerta / Ruído';
  screensAndProjectors: 'Ligados' | 'Em Standby' | 'Sem Sinal';
  dbxVenu360: 'Normal' | 'Clip/Protect';
  nextProAmps: 'Normal (Leds Verdes)' | 'Protect / Clip';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isQuickDiagnosis?: boolean;
}

export interface ChecklistItem {
  id: string;
  phase: 'abertura' | 'encerramento';
  title: string;
  description: string;
  order: number;
  completed: boolean;
  auditorium?: Auditorium | 'ambos';
}
