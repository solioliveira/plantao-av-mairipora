import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Volume2,
  Tv,
  Radio,
  Sliders,
  Clock,
  Play,
  RotateCcw,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QUICK_TROUBLESHOOTING_GUIDES } from '../data/constants';
import { Occurrence, Auditorium } from '../types';

interface TroubleshootingGuideProps {
  currentAuditorium: Auditorium;
  onAddOccurrence: (occurrence: Omit<Occurrence, 'id' | 'timestamp'>) => void;
}

export const TroubleshootingGuide: React.FC<TroubleshootingGuideProps> = ({
  currentAuditorium,
  onAddOccurrence,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>('no-sound-pc');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Generator 1-Minute Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setTimerFinished(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleStartTimer = () => {
    setTimerSeconds(60);
    setTimerFinished(false);
    setIsTimerRunning(true);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(60);
    setTimerFinished(false);
  };

  const selectedGuide =
    QUICK_TROUBLESHOOTING_GUIDES.find((g) => g.id === selectedGuideId) || QUICK_TROUBLESHOOTING_GUIDES[0];

  const filteredGuides = QUICK_TROUBLESHOOTING_GUIDES.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'Todos' || g.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'VolumeX':
      case 'Volume2':
        return <Volume2 className="w-5 h-5" />;
      case 'Tv':
        return <Tv className="w-5 h-5" />;
      case 'Radio':
        return <Radio className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const handleSendToOccurrences = (guide: typeof selectedGuide) => {
    onAddOccurrence({
      auditorium: currentAuditorium,
      category: guide.category as any,
      severity: guide.urgency as any,
      symptom: guide.title,
      locationChecked: 'Posto de Operação e Rack MA-61-E12-01',
      actionTaken: 'Executado protocolo de verificação padrão em 3 etapas.',
      status: 'Resolvido',
      operatorInCharge: 'Plantonista de Áudio e Vídeo',
    });
  };

  return (
    <div className="space-y-6">
      {/* Power Failure 1-Minute Contingency Tool */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">
                  Contingência: Queda de Energia Geral (Rede)
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Transição ATS: 1 Minuto
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                O Nobreak APC 2200VA e a Chave ATS sustentam os PCs, a mesa Qu-16 e a mesa Blackmagic. Telões e amplificadores desligam até o gerador engatar.
              </p>
            </div>
          </div>

          {/* Interactive Countdown */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <Clock className="w-5 h-5 text-amber-400" />
            <div className="text-center">
              <span className="font-mono text-2xl font-black text-amber-300 tracking-wider">
                00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
              </span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                {timerFinished ? 'Gerador Operante' : isTimerRunning ? 'Aguardando Gerador' : 'Tempo Estimado'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={handleResetTimer}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Zerar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {isTimerRunning && (
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((60 - timerSeconds) / 60) * 100}%` }}
            />
          </div>
        )}

        {timerFinished && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              1 minuto decorrido: O gerador deve ter assumido a carga total. Verifique os amplificadores Next Pro (leds verdes) e aguarde o sinal do Representante do Salão.
            </span>
          </div>
        )}
      </div>

      {/* Main Troubleshooting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Guides Menu (Left Column) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2.5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar sintoma ou falha..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex flex-wrap gap-1">
              {['Todos', 'Áudio', 'Vídeo', 'Elétrica / Nobreak', 'Palco', 'Rádios FM'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredGuides.map((guide) => {
              const isSelected = guide.id === selectedGuideId;
              return (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 shadow-sm ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 text-slate-100 ring-1 ring-emerald-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getIcon(guide.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {guide.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          guide.urgency === 'Crítica'
                            ? 'bg-rose-500/20 text-rose-300'
                            : guide.urgency === 'Alta'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {guide.urgency}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-100 leading-snug line-clamp-2">
                      {guide.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Guide Details (Right Column) */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
            {/* Guide Title & Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {getIcon(selectedGuide.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Protocolo Oficial Mairiporã
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-medium">{selectedGuide.category}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                    {selectedGuide.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => handleSendToOccurrences(selectedGuide)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
                title="Registra este problema no Livro de Ocorrências com 1 clique"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Registrar no Livro de Ocorrências
              </button>
            </div>

            {/* The 3-Step Action Plan */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">
                    1. O que verificar primeiro (Posto de Operação)
                  </h3>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-7">
                  {selectedGuide.step1}
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">
                    2. Onde ir fisicamente (Se o problema persistir)
                  </h3>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-7">
                  {selectedGuide.step2}
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950/70 border border-blue-500/30 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">
                    3. Ação corretiva segura (Regras de Ouro)
                  </h3>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-7">
                  {selectedGuide.step3}
                </div>
              </div>
            </div>

            {/* Safety Warning Card */}
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 font-semibold">Lembrete de Segurança do Rack (MA-61-E12-01):</strong>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  As únicas intervenções autorizadas são no botão &quot;AÇÃO&quot; dos gerenciadores PM 1.3 PC 220V. Ninguém pode alterar conexões, cabeamento, configurações de processadores ou disjuntores do rack. Qualquer alteração profunda é de competência exclusiva do Plantonista do Salão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
