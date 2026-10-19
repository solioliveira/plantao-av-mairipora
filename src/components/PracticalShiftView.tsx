import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Share2,
  Copy,
  Plus,
  Trash2,
  Users,
  Flashlight,
  Sparkles,
  Radio,
  Tv,
  Zap,
  Sliders,
  ShieldCheck,
  Activity,
  Edit3,
  Save,
  Check,
  X,
  ChevronRight,
  PhoneCall,
  Flame,
  Volume1,
  FileText,
  RotateCcw,
  MapPin,
  Cable,
  Server,
} from 'lucide-react';
import { Auditorium, AuditoriumTeam, Occurrence, ChecklistItem } from '../types';
import { shareOrFallback } from '../utils/shareUtils';
import { PhysicalDispatchResolver } from './PhysicalDispatchResolver';

interface PracticalShiftViewProps {
  currentAuditorium: Auditorium;
  onSelectAuditorium: (aud: Auditorium) => void;
  teamA: AuditoriumTeam;
  teamB: AuditoriumTeam;
  onUpdateTeamA: (team: AuditoriumTeam) => void;
  onUpdateTeamB: (team: AuditoriumTeam) => void;
  occurrences: Occurrence[];
  onAddOccurrence: (occurrence: Omit<Occurrence, 'id' | 'timestamp'>) => void;
  onDeleteOccurrence: (id: string) => void;
  checklist: ChecklistItem[];
  onToggleChecklistItem: (id: string) => void;
  onResetChecklist: () => void;
  onOpenAdvancedMode?: () => void;
  onOpenDispatchMode?: () => void;
}

interface QuickSOSModalData {
  title: string;
  icon: any;
  color: string;
  targetLocation: string; // ONDE IR FISICAMENTE
  rackIdentifier: string; // RACK / PAINEL
  targetCableOrFiber: string; // CABO OU FIBRA ALVO
  cableColorTag: string;
  steps: { action: string; tip: string }[];
  emergencyTip: string;
}

const SOS_PROBLEMS: Record<string, QuickSOSModalData> = {
  'sem-som': {
    title: 'Sem Som no Salão (Silêncio Total)',
    icon: VolumeX,
    color: 'rose',
    targetLocation: 'Cabine Técnica -> Rack Principal de Áudio (MA-61-E12-01)',
    rackIdentifier: 'Rack Principal MA-61-E12-01 (Atrás da Mesa Qu-16)',
    targetCableOrFiber: 'Cabos XLR de Saída do DBX Venu360 para os 4 Amplificadores Next Pro R2',
    cableColorTag: 'Cabos XLR Balanceados Pretos com Anéis Coloridos',
    steps: [
      {
        action: '1. Olhe o Fader Master (LR) na Qu-16',
        tip: 'O Fader vermelho (LR) está em 0 dB? Verifique se o botão MUTE do Master está apagado.',
      },
      {
        action: '2. Verifique o Canal do Orador / Cântico',
        tip: 'Se os LEDs do canal estão acendendo, o som está entrando na mesa. Se não estiverem, confira o receptor sem fio ou o cabo do PC.',
      },
      {
        action: '3. Vá até o Rack Principal e Confira os Amplificadores',
        tip: 'Olhe os 4 Amplificadores Next Pro R2: LEDs devem estar VERDES. Se houver LED vermelho de Protect piscando, não puxe fios, avise o superintendente.',
      },
    ],
    emergencyTip: 'Se o Rack estiver sem luz, verifique no Gerenciador de Energia 1 (PM 1.3) se a tensão marca 220V ou se o Nobreak APC apitou.',
  },
  microfonia: {
    title: 'Microfonia ou Apito Alto no Salão',
    icon: Flame,
    color: 'amber',
    targetLocation: 'Posto do Operador (Mesa Qu-16) / Palco (Orador)',
    rackIdentifier: 'Mesa Qu-16 Canal 1 (Tribuna) & Medusa de Palco DL32',
    targetCableOrFiber: 'Cabo XLR balanceado com trava Neutrik na base do pedestal da tribuna',
    cableColorTag: 'Cabo Neutrik XLR com trava de clique mecânica',
    steps: [
      {
        action: '1. Baixe imediatamente 3 a 5 dB no Fader',
        tip: 'Puxe o fader do microfone que está apitando (Ch 1 ou 2) para baixo suavemente. Nunca espere parar sozinho.',
      },
      {
        action: '2. Oriente o Orador discretamente',
        tip: 'Peça pelo rádio ou assistente para o orador não cobrir a cápsula com a mão e manter a distância de 1 palmo.',
      },
      {
        action: '3. Se o apito for grave ou agudo constante',
        tip: 'Na Qu-16, toque na tela em PEQ (Equalizador Paramétrico) e reduza 3 dB na frequência sobressalente.',
      },
    ],
    emergencyTip: 'Em caso de pânico ou descontrole total, pressione o botão MUTE do canal por 2 segundos e suba suavemente.',
  },
  'sem-video': {
    title: 'Sem Imagem no Telão ou Telas Pretas',
    icon: Tv,
    color: 'blue',
    targetLocation: 'Cabine Técnica -> Rack Lateral de Vídeo (MA-61-V02) / DIO de Fibras',
    rackIdentifier: 'Rack de Vídeo MA-61-V02 & Switcher ATEM HD',
    targetCableOrFiber: 'Fibra Monomodo Amarela (LC Azul) -> Porta 1 (Telão Central) / Porta 3 (Reserva B)',
    cableColorTag: 'Fibra Amarela Monomodo com Conector LC/UPC Azul',
    steps: [
      {
        action: '1. Aperte o botão da Câmera ou PC no Switcher',
        tip: 'No painel ATEM Blackmagic, aperte com firmeza o botão [1] (Câmera) ou [2] (PC-1). Veja se o corte muda na saída PGM.',
      },
      {
        action: '2. Vá ao Rack de Vídeo: Confira o Micro Conversor Blackmagic',
        tip: 'Olhe a gaveta 4U do Rack de Vídeo: localize o Conversor SDI/HDMI. O LED verde "LOCK" deve estar aceso contínuo.',
      },
      {
        action: '3. Veja a Fibra Óptica no DIO: Troca para Porta Reserva',
        tip: 'Se a fibra principal estiver apagada, mude o conector LC azul da Porta 1 para a Porta 3 (FIBRA RESERVA DE VÍDEO B) até ouvir o clique.',
      },
    ],
    emergencyTip: 'Mantenha o PC-2 reserva com o mesmo cântico pronto caso o PC-1 trave.',
  },
  'radio-fm': {
    title: 'Rádio FM Chiando ou Sem Sinal',
    icon: Radio,
    color: 'indigo',
    targetLocation: 'Cabine Técnica -> Sub-rack Lateral de Transmissão FM',
    rackIdentifier: 'Sub-rack Lateral FM (Módulo de Transmissores Digitais 2U)',
    targetCableOrFiber: 'Cabo Coaxial RG-58 50Ω com Conector BNC -> Antena Dipolo Externa',
    cableColorTag: 'Cabo Coaxial Preto RG-58 com Conector Metálico BNC de Trava',
    steps: [
      {
        action: '1. Confira o cabo da Antena BNC no Sub-rack FM',
        tip: 'Atrás do transmissor FM, confirme se o conector BNC de metal está com a trava girada e firme. Se estiver frouxo, o sinal perde alcance.',
      },
      {
        action: '2. Troque as Pilhas do Receptor do Irmão',
        tip: '90% das queixas de chiado no salão são pilhas gastas no receptor. Troque imediatamente por 2 pilhas recarregáveis novas.',
      },
      {
        action: '3. Confirme a Frequência Correta do Auditório',
        tip: 'Auditório A usa 72.1 MHz (Auditivo) ou 72.9 MHz (Audiodescrição). Auditório B usa 75.5 MHz ou 72.7 MHz.',
      },
    ],
    emergencyTip: 'Tenha sempre 2 receptores de reserva já sintonizados na gaveta para troca imediata.',
  },
  'som-baixo': {
    title: 'Som Muito Baixo ou com Eco no Fundo',
    icon: Volume1,
    color: 'cyan',
    targetLocation: 'Cabine Técnica -> Rack Principal (Unidade 3U DBX Crossover / Delay)',
    rackIdentifier: 'Rack Principal MA-61-E12-01 (Linha de Delay de Fundo)',
    targetCableOrFiber: 'Saídas XLR Canais 3-4 do DBX para Amplificador Next Pro das caixas do fundo',
    cableColorTag: 'Cabos XLR Neutrik balanceados',
    steps: [
      {
        action: '1. Confira o Amplificador das Caixas de Delay',
        tip: 'No Rack Principal, olhe o amplificador responsável pelas caixas suspensas do fundo: veja se o sinal está modulando verde.',
      },
      {
        action: '2. Aumente o Ganho da Tribuna até -18 dBFS',
        tip: 'Oradores que falam baixo precisam de mais pré-amplificação. Ajuste o Gain na Qu-16 sem deixar acender o LED vermelho de clip.',
      },
      {
        action: '3. Monitore com o Decibelímetro',
        tip: 'Use o medidor de bolso para conferir se o som atinge entre 70 e 75 dB SPL no centro e fundo do salão.',
      },
    ],
    emergencyTip: 'Se houver eco perceptível, nunca aumente o volume geral; confira se o alinhamento de tempo do processador dbx está ativo.',
  },
};

export const PracticalShiftView: React.FC<PracticalShiftViewProps> = ({
  currentAuditorium,
  onSelectAuditorium,
  teamA,
  teamB,
  onUpdateTeamA,
  onUpdateTeamB,
  occurrences,
  onAddOccurrence,
  onDeleteOccurrence,
  checklist,
  onToggleChecklistItem,
  onResetChecklist,
  onOpenAdvancedMode,
  onOpenDispatchMode,
}) => {
  const currentTeam = currentAuditorium === 'A' ? teamA : teamB;
  const updateCurrentTeam = currentAuditorium === 'A' ? onUpdateTeamA : onUpdateTeamB;

  // Edit Team state
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editDate, setEditDate] = useState(currentTeam.date || '');
  const [editDutyTech, setEditDutyTech] = useState(currentTeam.dutyTechnician || '');
  const [editSuperintendent, setEditSuperintendent] = useState(currentTeam.superintendentAudio || '');

  // Dispatch Center State
  const [isDispatchExpanded, setIsDispatchExpanded] = useState(true);

  // Quick SOS Modal state
  const [activeSOS, setActiveSOS] = useState<string | null>(null);

  // Quick Occurrence state
  const [quickSymptom, setQuickSymptom] = useState('');
  const [quickSavedToast, setQuickSavedToast] = useState(false);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Decibelímetro state
  const [isMicActive, setIsMicActive] = useState(false);
  const [currentDb, setCurrentDb] = useState(72);
  const [peakDb, setPeakDb] = useState(74);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Audio Context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

  // Inspection Flashlight state
  const [isTorchOpen, setIsTorchOpen] = useState(false);
  const [torchBrightness, setTorchBrightness] = useState(100);

  // Tone generator state
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const toneOscRef = useRef<OscillatorNode | null>(null);
  const toneGainRef = useRef<GainNode | null>(null);

  // Share feedback toast
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Sync team edit fields when auditorium changes
  useEffect(() => {
    setEditDate(currentTeam.date || '');
    setEditDutyTech(currentTeam.dutyTechnician || '');
    setEditSuperintendent(currentTeam.superintendentAudio || '');
  }, [currentAuditorium, currentTeam]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save edited team
  const handleSaveTeam = () => {
    updateCurrentTeam({
      ...currentTeam,
      date: editDate,
      dutyTechnician: editDutyTech,
      superintendentAudio: editSuperintendent,
    });
    setIsEditingTeam(false);
  };

  // Quick Occurrence Submit
  const handleAddQuickOccurrence = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickSymptom.trim()) return;

    onAddOccurrence({
      auditorium: currentAuditorium,
      category: 'Áudio',
      severity: 'Média',
      symptom: quickSymptom.trim(),
      locationChecked: 'Bancada de Operação / Salão',
      actionTaken: 'Atendido e verificado pelo plantonista de serviço.',
      status: 'Resolvido',
      operatorInCharge: currentTeam.dutyTechnician || 'Plantonista A/V',
    });

    setQuickSymptom('');
    setQuickSavedToast(true);
    setTimeout(() => setQuickSavedToast(false), 2500);
  };

  // Real Web Audio Mic Capture for Quick Decibel meter
  const startMicCapture = async () => {
    setMicPermissionError(null);
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        setMicPermissionError('Web Audio API não é suportada neste navegador.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      micStreamRef.current = stream;
      setIsMicActive(true);

      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      const processAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          sumSquares += val * val;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        // Map RMS to SPL (40 to 95 dB SPL)
        let spl = 40;
        if (rms > 0.0001) {
          const dbFSRaw = 20 * Math.log10(rms);
          spl = Math.round(dbFSRaw + 96);
        } else {
          spl = 40;
        }

        const clampedSpl = Math.max(40, Math.min(105, spl));
        setCurrentDb(clampedSpl);
        setPeakDb((prev) => Math.max(prev, clampedSpl));

        // Voice Alert if enabled
        if (voiceAlertsEnabled && clampedSpl >= 78) {
          const now = Date.now();
          if (now - lastAlertTimeRef.current > 8000) {
            lastAlertTimeRef.current = now;
            speakAlert(`Atenção: volume alto no auditório, ${clampedSpl} decibéis.`);
          }
        }

        animFrameRef.current = requestAnimationFrame(processAudio);
      };

      processAudio();
    } catch (err: any) {
      console.error('Mic capture error:', err);
      setMicPermissionError('Permissão do microfone negada ou indisponível.');
      setIsMicActive(false);
    }
  };

  const stopMicCapture = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
  };

  const speakAlert = (msg: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Test Tone 1kHz
  const toggleTestTone = () => {
    if (isPlayingTestTone) {
      if (toneOscRef.current) {
        try {
          toneOscRef.current.stop();
          toneOscRef.current.disconnect();
        } catch (_) {}
      }
      setIsPlayingTestTone(false);
    } else {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime); // 1 kHz
        gain.gain.setValueAtTime(0.15, ctx.currentTime); // Safe volume (-16 dBFS)

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        toneOscRef.current = osc;
        toneGainRef.current = gain;
        setIsPlayingTestTone(true);
      } catch (err) {
        console.error('Tone error:', err);
      }
    }
  };

  // Cleanup audio
  useEffect(() => {
    return () => {
      stopMicCapture();
      if (isPlayingTestTone && toneOscRef.current) {
        try {
          toneOscRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Generate WhatsApp Message & Share
  const handleShareWhatsAppReport = () => {
    const today = currentTeam.date || new Date().toLocaleDateString('pt-BR');
    const completedTasks = checklist.filter((i) => i.completed).length;
    const totalTasks = checklist.length;

    let occText = 'Nenhuma ocorrência registrada hoje (Operação 100% normal).';
    if (occurrences.length > 0) {
      occText = occurrences
        .map((o) => `• ${o.timestamp} - ${o.symptom} (${o.status})`)
        .join('\n');
    }

    const reportMessage = `*📋 RELATÓRIO DE PLANTÃO A/V - MAIRIPORÃ*
🏛️ *Auditório:* ${currentAuditorium}
📅 *Data:* ${today}
👤 *Plantonista:* ${currentTeam.dutyTechnician || 'Não informado'}
👔 *Superintendente A/V:* ${currentTeam.superintendentAudio || 'Não informado'}

*✅ Checklist Operacional:* ${completedTasks}/${totalTasks} itens verificados
*🔊 Nível de Som Médio:* ${currentDb} dB SPL (Pico: ${peakDb} dB)

*🚨 Ocorrências do Dia:*
${occText}

_Relatório enviado diretamente pelo App de Plantão A/V._`;

    shareOrFallback(
      {
        title: `Relatório de Plantão A/V - Auditório ${currentAuditorium}`,
        text: reportMessage,
        whatsappSummary: reportMessage,
      },
      (msg) => {
        setShareFeedback(msg);
        setTimeout(() => setShareFeedback(null), 4000);
      }
    );
  };

  // Checklist items completion
  const completedChecklistCount = checklist.filter((i) => i.completed).length;
  const checklistPercent = Math.round((completedChecklistCount / (checklist.length || 1)) * 100);

  // Grouped tasks by timeline
  const groupedTasks = [
    {
      time: '07:30',
      title: 'Chegada & Energia',
      items: checklist.filter((_, idx) => idx < 4),
    },
    {
      time: '08:00',
      title: 'Microfones & Palco',
      items: checklist.filter((_, idx) => idx >= 4 && idx < 8),
    },
    {
      time: '08:15',
      title: 'Rádios FM & Vídeo',
      items: checklist.filter((_, idx) => idx >= 8 && idx < 12),
    },
    {
      time: '16:15',
      title: 'Encerramento Sequencial',
      items: checklist.filter((_, idx) => idx >= 12),
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* Toast Feedback */}
      {shareFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold border border-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* TOP HEADER: Auditório, Plantonista & Relógio Vivo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Modo Plantão de Bolso
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ao Vivo {currentTime}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                Salão de Assembleias de Mairiporã
              </h2>
            </div>
          </div>

          {/* Auditório Switcher & Botão Modo Avançado */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => onSelectAuditorium('A')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentAuditorium === 'A'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auditório A
              </button>
              <button
                onClick={() => onSelectAuditorium('B')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentAuditorium === 'B'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auditório B
              </button>
            </div>

            {onOpenAdvancedMode && (
              <button
                onClick={onOpenAdvancedMode}
                title="Abrir Central Técnica com Diagramas e Manuais"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Central Técnica</span>
              </button>
            )}
          </div>
        </div>

        {/* Informações da Escala (3 Campos Essenciais) */}
        <div className="pt-3">
          {isEditingTeam ? (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>Editar Dados do Plantão ({currentAuditorium})</span>
                <button
                  onClick={() => setIsEditingTeam(false)}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    1. Data do Plantão
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    2. Nome do Plantonista
                  </label>
                  <input
                    type="text"
                    value={editDutyTech}
                    onChange={(e) => setEditDutyTech(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    3. Superintendente A/V
                  </label>
                  <input
                    type="text"
                    value={editSuperintendent}
                    onChange={(e) => setEditSuperintendent(e.target.value)}
                    placeholder="Nome do superintendente"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingTeam(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTeam}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Plantonista:</span>
                  <strong className="text-slate-100 font-bold">
                    {currentTeam.dutyTechnician || 'Não informado'}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Superintendente:</span>
                  <strong className="text-slate-100 font-bold">
                    {currentTeam.superintendentAudio || 'Não informado'}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span>Data:</span>
                  <span className="font-mono">{currentTeam.date || 'Hoje'}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditingTeam(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 py-1 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                Alterar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BLOCO DE EMERGÊNCIA: 🚨 SOS RÁPIDO (Se der problema no salão) */}
      <div className="bg-slate-900 border-2 border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-rose-200">
                🚨 SOS Imediato • O que fazer se der problema?
              </h3>
              <p className="text-[11px] text-slate-400">
                Toque no problema abaixo para ver 3 passos diretos de resolução em 10 segundos:
              </p>
            </div>
          </div>
        </div>

        {/* 5 Botões de Emergência Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          <button
            onClick={() => setActiveSOS('sem-som')}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-950 border border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/20 text-slate-200 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 flex items-center justify-center text-rose-400 mb-1.5">
              <VolumeX className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-rose-300">Sem Som</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Salão mudo</span>
          </button>

          <button
            onClick={() => setActiveSOS('microfonia')}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/20 text-slate-200 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-400 mb-1.5">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-amber-300">Microfonia</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Apito no salão</span>
          </button>

          <button
            onClick={() => setActiveSOS('sem-video')}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-950 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-950/20 text-slate-200 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center text-blue-400 mb-1.5">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-blue-300">Sem Imagem</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Telão preto</span>
          </button>

          <button
            onClick={() => setActiveSOS('radio-fm')}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-950/20 text-slate-200 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-1.5">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-indigo-300">Rádio FM</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Chiado/ruído</span>
          </button>

          <button
            onClick={() => setActiveSOS('som-baixo')}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 text-slate-200 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-1.5">
              <Volume1 className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-cyan-300">Som Baixo</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Fundo do salão</span>
          </button>
        </div>
      </div>

      {/* MODAL POPUP DO SOS SELECIONADO */}
      {activeSOS && SOS_PROBLEMS[activeSOS] && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setActiveSOS(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                {React.createElement(SOS_PROBLEMS[activeSOS].icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                  Ação Rápida de Emergência
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {SOS_PROBLEMS[activeSOS].title}
                </h3>
              </div>
            </div>

            {/* BOXES DE DESPACHO FÍSICO NO MODAL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  1. Onde Ir Fisicamente:
                </span>
                <div className="text-xs font-bold text-white">
                  {SOS_PROBLEMS[activeSOS].targetLocation}
                </div>
                <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                  📍 {SOS_PROBLEMS[activeSOS].rackIdentifier}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1 mb-1">
                  <Cable className="w-3.5 h-3.5" />
                  2. Cabo / Fibra Alvo:
                </span>
                <div className="text-xs font-bold text-white">
                  {SOS_PROBLEMS[activeSOS].targetCableOrFiber}
                </div>
                <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                  🔌 {SOS_PROBLEMS[activeSOS].cableColorTag}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Passos de Resolução no Local:
              </div>
              {SOS_PROBLEMS[activeSOS].steps.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-100">{s.action}</h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{s.tip}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 mb-4 text-[11px] text-amber-200">
              <strong>💡 Dica do Plantonista:</strong> {SOS_PROBLEMS[activeSOS].emergencyTip}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setQuickSymptom(`Contenção rápida: ${SOS_PROBLEMS[activeSOS].title}`);
                  setActiveSOS(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Registrar no Diário
              </button>

              <div className="flex items-center gap-2">
                {onOpenDispatchMode && (
                  <button
                    onClick={() => {
                      setActiveSOS(null);
                      onOpenDispatchMode();
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Server className="w-3.5 h-3.5" />
                    Abrir Mapa Completo do Rack
                  </button>
                )}
                <button
                  onClick={() => setActiveSOS(null)}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg"
                >
                  Entendi, Tudo Certo! ✅
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO PRINCIPAL DE DESPACHO FÍSICO: ONDE IR & QUAL CABO/FIBRA MEXER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-200">
                🧭 Roteador de Despacho Físico • Onde Ir & O que Fazer
              </h3>
              <p className="text-[11px] text-slate-400">
                Diretrizes diretas no celular: para qual rack ir, qual fibra mexer e como resolver.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDispatchExpanded(!isDispatchExpanded)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-300 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isDispatchExpanded ? 'Ocultar Painel' : 'Expandir Racks/Fibras'}
          </button>
        </div>

        {isDispatchExpanded && (
          <PhysicalDispatchResolver
            currentAuditorium={currentAuditorium}
            onAddOccurrence={onAddOccurrence}
          />
        )}
      </div>

      {/* GRID DUPLO: DECIBELÍMETRO DE BOLSO & FERRAMENTAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARTÃO 1: DECIBELÍMETRO RÁPIDO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100">Decibelímetro de Bolso</h3>
                  <span className="text-[10px] text-slate-400">Diretriz: Orador 70-77 dB &bull; Cântico 80 dB</span>
                </div>
              </div>

              {/* Botão Liga/Desliga Mic */}
              <button
                onClick={isMicActive ? stopMicCapture : startMicCapture}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isMicActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isMicActive ? 'Desligar Mic' : 'Medir Som Real'}</span>
              </button>
            </div>

            {/* Mostrador Gigante do Nível */}
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-2xl p-4 mb-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Pressão Sonora</div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                      currentDb < 77
                        ? 'text-emerald-400'
                        : currentDb <= 80
                        ? 'text-amber-400'
                        : 'text-rose-400 animate-pulse'
                    }`}
                  >
                    {currentDb}
                  </span>
                  <span className="text-sm font-bold text-slate-500">dB SPL</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Pico de hoje: <strong className="text-slate-200">{peakDb} dB</strong>
                </div>
              </div>

              {/* Status Visual com Cor */}
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-1 ${
                    currentDb < 77
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : currentDb <= 80
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {currentDb < 77 ? '🟢 Ideal (70-75)' : currentDb <= 80 ? '🟡 Atenção' : '🔴 Alto! Abaixar'}
                </span>
                <p className="text-[10px] text-slate-400 max-w-[130px] leading-tight">
                  {currentDb < 77
                    ? 'Voz nítida no salão'
                    : currentDb <= 80
                    ? 'No limite superior'
                    : 'Abaixe fader na Qu-16!'}
                </p>
              </div>
            </div>

            {micPermissionError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg p-2 mb-2">
                ⚠️ {micPermissionError}
              </p>
            )}
          </div>

          {/* Toggle de Alerta por Voz */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="text-[11px]">Aviso sonoro se passar de 77 dB:</span>
            <button
              onClick={() => {
                const next = !voiceAlertsEnabled;
                setVoiceAlertsEnabled(next);
                if (next) speakAlert('Alerta de voz ativado.');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                voiceAlertsEnabled
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {voiceAlertsEnabled ? '🔊 Voz Ativada' : '🔇 Silencioso'}
            </button>
          </div>
        </div>

        {/* CARTÃO 2: FERRAMENTAS RÁPIDAS DE BOLSO (Lanterna, Tom 1kHz & WhatsApp) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100">Canivete do Plantonista</h3>
                <span className="text-[10px] text-slate-400">Ferramentas de mão para uso imediato</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {/* Botão Lanterna de Inspeção */}
              <button
                onClick={() => setIsTorchOpen(true)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:bg-amber-950/10 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Flashlight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-200">Luz do Rack</div>
                  <div className="text-[10px] text-slate-500">Lanterna de tela</div>
                </div>
              </button>

              {/* Botão Gerador de Tom 1kHz */}
              <button
                onClick={toggleTestTone}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                  isPlayingTestTone
                    ? 'bg-rose-950/40 border-rose-500/50 text-white animate-pulse'
                    : 'bg-slate-950 border-slate-800 hover:border-emerald-500/40 text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isPlayingTestTone
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-200">
                    {isPlayingTestTone ? 'Parar Tom' : 'Testar Som (1kHz)'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isPlayingTestTone ? 'Tocando no fone' : 'Sinal sem música'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Botão de Enviar WhatsApp com 1 Toque */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleShareWhatsAppReport}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar Relatório do Dia no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKLIST PRÁTICO DO DIA COM HORÁRIOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-100">
                  Roteiro & Checklist do Plantão
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {completedChecklistCount} de {checklist.length} concluídos ({checklistPercent}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Toque nos itens conforme você realizar as tarefas durante o dia
              </p>
            </div>
          </div>

          <button
            onClick={onResetChecklist}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reiniciar
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-5 border border-slate-800">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${checklistPercent}%` }}
          ></div>
        </div>

        {/* Grupos de Horários */}
        <div className="space-y-4">
          {groupedTasks.map((group, gIdx) => (
            <div key={gIdx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs">
                    {group.time}
                  </span>
                  <span className="text-xs font-black text-slate-200">{group.title}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {group.items.filter((i) => i.completed).length}/{group.items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onToggleChecklistItem(item.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                      item.completed
                        ? 'bg-emerald-950/20 text-slate-300 border border-emerald-900/30'
                        : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                        item.completed
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'border border-slate-600 bg-slate-950'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-semibold leading-snug ${
                          item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIÁRIO RÁPIDO DO PLANTÃO (ANOTAR O QUE ACONTECEU) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                Anotar Ocorrência do Dia
              </h3>
              <p className="text-[11px] text-slate-400">
                Digite qualquer imprevisto ou observação rápida (sem preencher fichas complexas)
              </p>
            </div>
          </div>
        </div>

        {/* Input Rápido */}
        <form onSubmit={handleAddQuickOccurrence} className="flex gap-2 mb-3">
          <input
            type="text"
            value={quickSymptom}
            onChange={(e) => setQuickSymptom(e.target.value)}
            placeholder="Ex: Microfone 2 sem pilha no meio da leitura / Irmão reclamou de eco..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!quickSymptom.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white cursor-pointer shadow-md flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </form>

        {quickSavedToast && (
          <p className="text-[11px] text-emerald-400 font-bold mb-3 animate-in fade-in">
            ✅ Ocorrência registrada no relatório de hoje!
          </p>
        )}

        {/* Atalhos com 1 toque */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[10px] text-slate-500">Atalhos rápidos:</span>
          {[
            'Pilha de microfone trocada',
            'Microfonia contida na tribuna',
            'Cabo HDMI reconectado',
            'Rádio FM ajustado para irmão',
          ].map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setQuickSymptom(tag)}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 cursor-pointer"
            >
              + {tag}
            </button>
          ))}
        </div>

        {/* Lista das Ocorrências Registradas Hoje */}
        <div className="space-y-2">
          {occurrences.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
              Nenhuma ocorrência hoje. Tudo operando 100% no Salão de Mairiporã!
            </div>
          ) : (
            occurrences.map((occ) => (
              <div
                key={occ.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {occ.timestamp}
                  </span>
                  <div>
                    <strong className="text-slate-200 font-semibold block">{occ.symptom}</strong>
                    <span className="text-[10px] text-slate-400">
                      {occ.category} &bull; {occ.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteOccurrence(occ.id)}
                  title="Excluir"
                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL LANTERNA DE INSPEÇÃO */}
      {isTorchOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-200 select-none"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${torchBrightness / 100})`,
          }}
        >
          <div className="flex items-center justify-between bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white max-w-md mx-auto w-full">
            <div className="flex items-center gap-2">
              <Flashlight className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black">Lanterna de Inspeção do Rack</span>
            </div>
            <button
              onClick={() => setIsTorchOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-white max-w-xs mx-auto w-full">
            <span className="text-[11px] text-slate-300 block mb-2 font-bold">
              Brilho da Tela ({torchBrightness}%)
            </span>
            <input
              type="range"
              min="20"
              max="100"
              value={torchBrightness}
              onChange={(e) => setTorchBrightness(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <p className="text-[10px] text-slate-400 mt-2">
              Aponte a tela iluminada para o fundo escuro do rack para enxergar cabos e conectores.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
