import React, { useState, useEffect, useRef } from 'react';
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
  Flashlight,
  Sun,
  Calendar,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Auditorium } from '../types';
import { QUICK_TROUBLESHOOTING_GUIDES } from '../data/constants';

interface EmergencyContainmentBarProps {
  currentAuditorium: Auditorium;
  onNavigateToTroubleshooting: (guideId: string) => void;
  onNavigateToVoiceChat: () => void;
  onNavigateToVisualizer: () => void;
}

interface AssemblyMilestone {
  timeStr: string;
  hour: number;
  minute: number;
  title: string;
  action: string;
  whatsappMessage: string;
}

const ASSEMBLY_MILESTONES: AssemblyMilestone[] = [
  {
    timeStr: '08:00',
    hour: 8,
    minute: 0,
    title: 'Energização & Teste Inicial',
    action: 'Ligar estabilizadores, Qu-16, DBX Venu360, testar mic tribuna (Ch 1) e transmissores FM.',
    whatsappMessage: '🔊 *A/V Mairiporã - 08:00:* Racks energizados e checagem inicial dos canais iniciada.',
  },
  {
    timeStr: '09:15',
    hour: 9,
    minute: 15,
    title: 'Prelúdio Musical (Abertura)',
    action: 'Abrir música de fundo no canal ST3 em -15 dB. Conferir se caixas de delay estão ligadas.',
    whatsappMessage: '🎶 *A/V Mairiporã - 09:15:* Prelúdio musical aberto no salão (ST3 a -15 dB). Assistentes nos corredores.',
  },
  {
    timeStr: '09:30',
    hour: 9,
    minute: 30,
    title: 'Início da Sessão da Manhã',
    action: 'Cântico 1 & Oração. Orador na tribuna. Monitorar TC Clarity M em 0 dB e SPL até 77 dB.',
    whatsappMessage: '🎙️ *A/V Mairiporã - 09:30:* Sessão da Manhã iniciada. Áudio e vídeo operando nominalmente.',
  },
  {
    timeStr: '11:45',
    hour: 11,
    minute: 45,
    title: 'Intervalo do Almoço',
    action: 'Mutar Ch 1 (Tribuna) e volantes. Manter música ambiente suave e rádios FM ativos.',
    whatsappMessage: '🥪 *A/V Mairiporã - 11:45:* Intervalo de almoço. Microfones de palco mutados e música ambiente ligada.',
  },
  {
    timeStr: '13:20',
    hour: 13,
    minute: 20,
    title: 'Prelúdio da Tarde',
    action: 'Reabrir câmeras PTZ AW-RP50 (Preset 1 - Geral), testar baterias dos microfones volantes.',
    whatsappMessage: '🎶 *A/V Mairiporã - 13:20:* Prelúdio da tarde no salão. Equipe de áudio e vídeo a postos.',
  },
  {
    timeStr: '13:30',
    hour: 13,
    minute: 30,
    title: 'Início da Sessão da Tarde',
    action: 'Cântico do meio-dia. Foco nos discursos finais e controle de SPL nas partes de vídeo.',
    whatsappMessage: '🎙️ *A/V Mairiporã - 13:30:* Sessão da Tarde iniciada. Transmissão FM operando.',
  },
  {
    timeStr: '16:15',
    hour: 16,
    minute: 15,
    title: 'Encerramento & Protocolo de Desligamento',
    action: 'Cântico final e oração. Aguardar saída do público. Desligar amplificadores antes da Qu-16.',
    whatsappMessage: '✅ *A/V Mairiporã - 16:15:* Programa concluído. Iniciando protocolo de desligamento e livro de ocorrências.',
  },
];

export const EmergencyContainmentBar: React.FC<EmergencyContainmentBarProps> = ({
  currentAuditorium,
  onNavigateToTroubleshooting,
  onNavigateToVoiceChat,
  onNavigateToVisualizer,
}) => {
  const [quickModalGuideId, setQuickModalGuideId] = useState<string | null>(null);
  const [showInspectionLight, setShowInspectionLight] = useState<boolean>(false);
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const torchStreamRef = useRef<MediaStream | null>(null);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Torch / Flashlight implementation
  const toggleDeviceTorch = async () => {
    if (torchActive) {
      if (torchStreamRef.current) {
        torchStreamRef.current.getTracks().forEach((track) => track.stop());
        torchStreamRef.current = null;
      }
      setTorchActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        torchStreamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const imageCapture = (track.getCapabilities && (track.getCapabilities() as any).torch) ? true : false;
        if (imageCapture) {
          await (track as any).applyConstraints({ advanced: [{ torch: true }] });
          setTorchActive(true);
        } else {
          setTorchActive(true); // Fallback to screen illumination
        }
      } catch (err) {
        console.warn('Torch not supported, using high-lumen white screen mode', err);
        setTorchActive(true);
      }
    }
  };

  const closeInspectionLight = () => {
    if (torchStreamRef.current) {
      torchStreamRef.current.getTracks().forEach((track) => track.stop());
      torchStreamRef.current = null;
    }
    setTorchActive(false);
    setShowInspectionLight(false);
  };

  // Find current and next milestone
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  let currentMilestone = ASSEMBLY_MILESTONES[0];
  let nextMilestone = ASSEMBLY_MILESTONES[ASSEMBLY_MILESTONES.length - 1];

  for (let i = 0; i < ASSEMBLY_MILESTONES.length; i++) {
    const m = ASSEMBLY_MILESTONES[i];
    const mMinutes = m.hour * 60 + m.minute;
    if (currentMinutes >= mMinutes) {
      currentMilestone = m;
      nextMilestone = ASSEMBLY_MILESTONES[i + 1] || m;
    }
  }

  const handleSendMilestoneNotice = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const activeGuide = QUICK_TROUBLESHOOTING_GUIDES.find((g) => g.id === quickModalGuideId);

  const handleOpenQuickGuide = (guideId: string) => {
    setQuickModalGuideId(guideId);
    onNavigateToTroubleshooting(guideId);
  };

  const handleOpenVisualizerWithGuide = () => {
    setQuickModalGuideId('spl-meter-guide');
    onNavigateToVisualizer();
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

        {/* Action Buttons: Voice Consultation & Rack Light & Timeline */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Rack Inspection Light */}
          <button
            onClick={() => {
              setShowInspectionLight(true);
              toggleDeviceTorch();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Luz forte de alta intensidade para inspecionar cabos XLR e tomadas atrás do rack escuro"
          >
            <Flashlight className="w-4 h-4 text-amber-400" />
            <span>Luz do Rack</span>
          </button>

          {/* Timeline Toggle */}
          <button
            onClick={() => setShowTimeline((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm ${
              showTimeline
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-blue-500/30'
            }`}
            title="Linha do tempo dos momentos críticos do programa da assembleia"
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Horários do Programa</span>
            {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Voice Consultation Button */}
          <button
            onClick={onNavigateToVoiceChat}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.98] ring-2 ring-emerald-400/40 cursor-pointer"
            title="Falar dúvida técnica usando o microfone"
          >
            <Mic className="w-4 h-4 animate-pulse text-white" />
            <span>Chat por Voz</span>
          </button>
        </div>
      </div>

      {/* Expandable Assembly Day Timeline Strip */}
      {showTimeline && (
        <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-3 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                Momentos Críticos do Programa (Salão de Mairiporã)
              </span>
            </div>
            <span className="text-[11px] text-blue-300 font-mono font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
              Horário Atual: {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Milestone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {ASSEMBLY_MILESTONES.map((milestone, idx) => {
              const isCurrent = milestone.timeStr === currentMilestone.timeStr;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/50 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-black text-blue-400 text-sm">{milestone.timeStr}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          FASE ATUAL
                        </span>
                      )}
                    </div>
                    <strong className="text-slate-200 block text-xs font-bold leading-tight">
                      {milestone.title}
                    </strong>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {milestone.action}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSendMilestoneNotice(milestone.whatsappMessage)}
                    className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                    title="Avisar a equipe no WhatsApp"
                  >
                    <Send className="w-3 h-3" />
                    <span>Avisar no WhatsApp</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen High-Lumen Rack Inspection Light Modal */}
      {showInspectionLight && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white text-slate-950 p-6 animate-in fade-in select-none">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="font-black text-sm uppercase tracking-wider text-slate-900">
                Luz de Inspeção do Rack (Lanterna)
              </span>
            </div>
            <button
              onClick={closeInspectionLight}
              className="p-2.5 rounded-full bg-slate-950 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-lg"
              title="Fechar Lanterna"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center my-auto space-y-3">
            <Flashlight className="w-20 h-20 text-amber-500 mx-auto animate-pulse" />
            <h2 className="text-2xl font-black text-slate-900">Luz de Alta Intensidade Ativa</h2>
            <p className="text-sm text-slate-700 max-w-md mx-auto">
              Aponte a tela ou o flash do dispositivo para iluminar a traseira do rack, conectores XLR, réguas de
              energia ou patch panels escuros no Salão de Mairiporã.
            </p>
          </div>

          <div className="w-full flex justify-center pb-4">
            <button
              onClick={closeInspectionLight}
              className="px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm shadow-2xl cursor-pointer"
            >
              Fechar Luz e Voltar ao Painel
            </button>
          </div>
        </div>
      )}

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
          onClick={handleOpenVisualizerWithGuide}
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
        <div
          onClick={() => setQuickModalGuideId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-emerald-500/60 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Roteiro Imediato
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      (Aba aberta no painel)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {activeGuide.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setQuickModalGuideId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Fechar roteiro rápido"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Steps in High Contrast */}
            <div className="space-y-3 text-xs leading-relaxed">
              {/* Step 1 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
                <strong className="text-emerald-300 font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  1. O que verificar primeiro (Posto de Operação):
                </strong>
                <p className="text-slate-200 whitespace-pre-line pl-5">
                  {activeGuide.step1.replace(/1\. O que verificar primeiro.*:\n/i, '')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-1">
                <strong className="text-amber-300 font-bold block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  2. Onde ir fisicamente:
                </strong>
                <p className="text-slate-200 whitespace-pre-line pl-5">
                  {activeGuide.step2.replace(/2\. Onde ir fisicamente.*:\n/i, '')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/30 space-y-1">
                <strong className="text-blue-300 font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  3. Ação corretiva segura (Regras do Rack):
                </strong>
                <p className="text-slate-200 whitespace-pre-line pl-5">
                  {activeGuide.step3.replace(/3\. Ação corretiva segura.*:\n/i, '')}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Toque fora ou feche para interagir com os controles da aba.
              </span>

              <button
                onClick={() => setQuickModalGuideId(null)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shrink-0 flex items-center gap-1.5"
              >
                <span>Fechar / Ir para Ferramenta</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
