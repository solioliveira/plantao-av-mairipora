import React, { useState } from 'react';
import {
  MapPin,
  Cable,
  Server,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Copy,
  PlusCircle,
  Search,
  ChevronRight,
  Flame,
  Tv,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  Camera,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Check,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  DISPATCH_ACTION_GUIDES,
  RACK_EQUIPMENT_DATA,
  DispatchActionGuide,
  RackInfo,
} from '../data/rackWiringData';
import { Auditorium, Occurrence } from '../types';

interface PhysicalDispatchResolverProps {
  currentAuditorium: Auditorium;
  onAddOccurrence?: (occurrence: Omit<Occurrence, 'id' | 'timestamp'>) => void;
  onClose?: () => void;
}

export const PhysicalDispatchResolver: React.FC<PhysicalDispatchResolverProps> = ({
  currentAuditorium,
  onAddOccurrence,
  onClose,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>('dsp-video-black');
  const [activeTab, setActiveTab] = useState<'dispatch' | 'racks' | 'fibers'>('dispatch');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedText, setCopiedText] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [selectedRackId, setSelectedRackId] = useState<string>('rack-video-01');

  // Filtered guides based on search and category
  const filteredGuides = DISPATCH_ACTION_GUIDES.filter((guide) => {
    const matchesSearch =
      guide.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.targetLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.targetCableOrFiber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.rackIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || guide.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const currentGuide =
    DISPATCH_ACTION_GUIDES.find((g) => g.id === selectedGuideId) || DISPATCH_ACTION_GUIDES[0];

  const currentRack =
    RACK_EQUIPMENT_DATA.find((r) => r.id === selectedRackId) || RACK_EQUIPMENT_DATA[0];

  const handleCopyGuide = () => {
    const text = `🚨 *DESPACHO DE PLANTÃO AV (${currentAuditorium})*
*Problema:* ${currentGuide.problem}
*📍 ONDE IR:* ${currentGuide.targetLocation}
*🏢 RACK/PAINEL:* ${currentGuide.rackIdentifier}
*🔌 CABO/FIBRA:* ${currentGuide.targetCableOrFiber}

*PASSO A PASSO:*
${currentGuide.steps.map((s) => `${s.stepNumber}. ${s.title}: ${s.action}`).join('\n')}

*🛡️ PLANO B (CONTINGÊNCIA):* ${currentGuide.fallbackAction}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCreateOccurrenceFromGuide = () => {
    if (onAddOccurrence) {
      const catMap: Record<string, Occurrence['category']> = {
        video: 'Vídeo',
        audio: 'Áudio',
        stage: 'Palco',
        power: 'Elétrica / Nobreak',
        fm: 'Rádios FM',
        network: 'JW Library / Rede',
      };

      onAddOccurrence({
        auditorium: currentAuditorium,
        category: catMap[currentGuide.category] || 'Outro',
        severity: currentGuide.urgency,
        symptom: currentGuide.problem,
        locationChecked: `${currentGuide.targetLocation} | ${currentGuide.rackIdentifier}`,
        actionTaken: `Seguiu roteiro de despacho físico: Inspecionou ${currentGuide.targetCableOrFiber}. Solução aplicada com sucesso.`,
        status: 'Resolvido',
        operatorInCharge: 'Plantonista de Campo',
      });
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border-b border-amber-900/40 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <MapPin className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Despacho de Campo
                </span>
                <span className="text-xs text-slate-400">Auditório {currentAuditorium}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Onde Ir & O que Fazer (Racks, Fibras e Cabos)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Diretrizes físicas imediatas: local exato, qual cabo/fibra mexer e rota de resolução sem perda de tempo.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'dispatch'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Roteiro de Despacho
            </button>
            <button
              onClick={() => setActiveTab('racks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'racks'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Mapa dos Racks
            </button>
            <button
              onClick={() => setActiveTab('fibers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'fibers'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cable className="w-3.5 h-3.5" />
              DIO & Fibras Ópticas
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Dispatch Action Guides */}
      {activeTab === 'dispatch' && (
        <div className="p-4 sm:p-5">
          {/* Quick Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por sintoma, rack, cabo ou fibra (ex: 'fibra', 'telão', 'som', 'disjuntor')..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'video', label: '📺 Vídeo & Telão' },
                { id: 'audio', label: '🔊 Áudio & Amps' },
                { id: 'stage', label: '🎤 Palco & Medusa' },
                { id: 'power', label: '⚡ QGBT / Disjuntores' },
                { id: 'fm', label: '📻 Rádios FM' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left list of problems */}
            <div className="lg:col-span-5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1">
                Selecione o Problema para Despacho ({filteredGuides.length})
              </div>
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredGuides.map((guide) => {
                  const isSelected = guide.id === selectedGuideId;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedGuideId(guide.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950/50 to-slate-900 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          guide.category === 'video'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : guide.category === 'audio'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : guide.category === 'stage'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : guide.category === 'power'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {guide.category === 'video' ? (
                          <Tv className="w-4 h-4" />
                        ) : guide.category === 'audio' ? (
                          <Volume2 className="w-4 h-4" />
                        ) : guide.category === 'stage' ? (
                          <Sliders className="w-4 h-4" />
                        ) : guide.category === 'power' ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <Radio className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {guide.categoryLabel}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              guide.urgency === 'Crítica'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                            }`}
                          >
                            {guide.urgency}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                          {guide.problem}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-300/90 font-medium truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-amber-400" />
                          <span className="truncate">{guide.targetLocation}</span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform mt-3 ${
                          isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Immediate Physical Action & Wiring Instructions */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl">
              <div>
                {/* Header Problem */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {currentGuide.categoryLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Urgência: {currentGuide.urgency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyGuide}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
                      title="Copiar Roteiro para WhatsApp"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar Instrução
                        </>
                      )}
                    </button>
                    {onAddOccurrence && (
                      <button
                        onClick={handleCreateOccurrenceFromGuide}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                        title="Salvar Ocorrência"
                      >
                        {addedToast ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Registrado!</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            Registrar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-4">
                  {currentGuide.problem}
                </h3>

                {/* TWO ESSENTIAL PHYSICAL CALLOUT BOXES: ONDE IR & QUAL CABO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {/* BOX 1: ONDE IR */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      1. Onde Ir Fisicamente
                    </div>
                    <div className="text-sm font-bold text-white leading-snug">
                      {currentGuide.targetLocation}
                    </div>
                    <div className="text-xs text-amber-200/80 mt-1 font-mono">
                      📍 {currentGuide.rackIdentifier}
                    </div>
                  </div>

                  {/* BOX 2: QUAL CABO / FIBRA MEXER */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                      <Cable className="w-4 h-4 text-cyan-400 shrink-0" />
                      2. Cabo / Fibra / Conector Alvo
                    </div>
                    <div className="text-sm font-bold text-white leading-snug">
                      {currentGuide.targetCableOrFiber}
                    </div>
                    <div className="inline-block px-2 py-0.5 mt-1.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-[11px] font-mono">
                      {currentGuide.cableColorTag}
                    </div>
                  </div>
                </div>

                {/* STEP-BY-STEP ACTIONS */}
                <div className="space-y-3 mb-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Passo a Passo de Resolução no Local:
                  </div>

                  {currentGuide.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {st.stepNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-bold text-white mb-0.5">
                          {st.title}
                        </h5>
                        <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                          {st.action}
                        </p>
                        {st.warning && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{st.warning}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CONTINGENCY FALLBACK BOX */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Plano B de Contingência Imediata (Se não resolver em 30s):
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {currentGuide.fallbackAction}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Advice */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>⚡ Dica de ouro: Mantenha calma, confirme o clique da trava antes de puxar cabos.</span>
                <span className="font-mono text-amber-400">Auditório {currentAuditorium}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: Visual Map of Racks */}
      {activeTab === 'racks' && (
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {RACK_EQUIPMENT_DATA.map((rack) => (
              <button
                key={rack.id}
                onClick={() => setSelectedRackId(rack.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  selectedRackId === rack.id
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <Server className="w-4 h-4" />
                {rack.name}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-400" />
                  {currentRack.name}
                </h3>
                <p className="text-xs text-amber-300/90 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Localização: {currentRack.location}
                </p>
              </div>
              <span className="text-xs text-slate-400 italic">{currentRack.description}</span>
            </div>

            <div className="space-y-3">
              {currentRack.units.map((unit, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {unit.unitU}
                      </span>
                      <h4 className="text-sm font-bold text-white">{unit.equipmentName}</h4>
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Status Normal: {unit.normalStatusLed}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-2">{unit.function}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-0.5">🔌 Cabos Conectados:</span>
                      <span className="text-slate-200">{unit.cablesConnected}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/40">
                      <span className="text-amber-400 font-semibold block mb-0.5">💡 Resolução Rápida / O que olhar:</span>
                      <span className="text-amber-200/90">{unit.troubleshootingTip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: Optical Fibers & DIO Patching */}
      {activeTab === 'fibers' && (
        <div className="p-4 sm:p-5">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Cable className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Distribuidor Interno Óptico (DIO) - Rack de Vídeo MA-61-V02
                </h3>
                <p className="text-xs text-slate-300">
                  Mapeamento de portas ópticas monomodo para chaveamento rápido de telões e sinal reserva.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {RACK_EQUIPMENT_DATA.find((r) => r.id === 'rack-video-01')?.fiberOpticalPorts?.map(
                (fiber, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {fiber.port}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          fiber.status.includes('Reserva')
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        }`}
                      >
                        {fiber.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5">{fiber.destination}</h4>

                    <div className="space-y-1 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400">Pigtail / Cor:</span>{' '}
                        <span className="font-mono text-cyan-200">{fiber.colorCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Tipo & Conector:</span>{' '}
                        <span className="text-slate-200">{fiber.fiberType} | {fiber.connector}</span>
                      </div>
                      {fiber.reservePort && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-amber-300 font-medium">
                          🔄 Se falhar: Chaveie imediatamente para a <strong>{fiber.reservePort}</strong>.
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Quick Rule on Optical Fibers */}
            <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-amber-300 block mb-0.5">
                  Regras de Ouro na Manobra de Fibras Ópticas:
                </span>
                1. <strong>Raio de curvatura:</strong> Nunca curve o cabo amarelo com diâmetro menor que uma lata de refrigerante (quebra o núcleo de sílica).
                <br />
                2. <strong>Limpeza:</strong> Não toque a ponta cerâmica com os dedos; use a capinha azul de proteção sempre que desengatar.
                <br />
                3. <strong>Clique sonoro:</strong> Ao engatar o conector LC azul no DIO ou no conversor Blackmagic, confirme o "click" mecânico de travamento.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
