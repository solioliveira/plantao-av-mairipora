import React, { useState } from 'react';
import {
  Sliders,
  Tv,
  Radio,
  Server,
  Key,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  Camera,
  Layers,
  Volume2,
  Printer,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { QU16_CHANNELS, FM_CONFIG, PTZ_PRESETS, VIDEO_SWITCH_RULES } from '../data/constants';
import { Auditorium } from '../types';

interface EquipmentMapProps {
  currentAuditorium: Auditorium;
}

export const EquipmentMap: React.FC<EquipmentMapProps> = ({ currentAuditorium }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'fm' | 'rack' | 'cheatSheet'>('audio');
  const [selectedChannel, setSelectedChannel] = useState<string>('Ch 9/10');
  const [copiedCheat, setCopiedCheat] = useState(false);

  const currentFm = currentAuditorium === 'A' ? FM_CONFIG.auditoriumA : FM_CONFIG.auditoriumB;

  return (
    <div className="space-y-6">
      {/* Sub-nav Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'audio'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Áudio (Mesa Qu-16 & Canais)
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'video'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Tv className="w-4 h-4" />
          Vídeo (Blackmagic & AW-RP50)
        </button>

        <button
          onClick={() => setActiveTab('fm')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'fm'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          Transmissão FM (Rádios)
        </button>

        <button
          onClick={() => setActiveTab('rack')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rack'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          Rack & Segurança Elétrica
        </button>

        <button
          onClick={() => setActiveTab('cheatSheet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'cheatSheet'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800 border border-amber-500/30'
          }`}
        >
          <Layers className="w-4 h-4" />
          Guia de Bolso do Operador
        </button>
      </div>

      {/* TAB 1: ÁUDIO & QU-16 */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          {/* Important Rule Banner */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 shadow-md">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block text-sm mb-0.5">
                Regra de Ouro da Mesa Allen & Heath Qu-16: Faders Estéreos
              </strong>
              <p className="text-slate-200 leading-relaxed">
                Os computadores estão nos canais <strong>9/10 (PC-1)</strong> e <strong>11/12 (PC-2)</strong>. O fader de um canal estéreo sobe o outro automaticamente na mesa. 
                <strong className="text-amber-400"> NUNCA suba faders estéreos juntos manualmente com as duas mãos</strong>, pois isso pode danificar o motor de indução dos faders!
              </p>
            </div>
          </div>

          {/* Interactive Channel Strip Visualizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Mapeamento de Canais e Roteamento Qu-16
                </h3>
                <p className="text-xs text-slate-400">
                  Clique em qualquer canal para ver a função operacional exata e regras de manuseio.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                Allen & Heath Qu-16 Digital Console
              </span>
            </div>

            {/* Channels Grid / Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {QU16_CHANNELS.map((channel) => {
                const isSelected = selectedChannel === channel.ch;
                return (
                  <button
                    key={channel.ch}
                    onClick={() => setSelectedChannel(channel.ch)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-28 shadow-sm ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {channel.ch}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          channel.type === 'Microfone'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : channel.type === 'Sem Fio'
                            ? 'bg-teal-500/20 text-teal-300'
                            : channel.type === 'Estéreo'
                            ? 'bg-blue-500/20 text-blue-300'
                            : channel.type === 'Saída'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {channel.type}
                      </span>
                    </div>

                    <div className="my-1">
                      <span className="text-xs font-semibold text-slate-200 block truncate">
                        {channel.name}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          channel.type === 'Estéreo'
                            ? 'bg-blue-500'
                            : channel.type === 'Saída'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: isSelected ? '100%' : '60%' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Channel Detailed Card */}
            {selectedChannel && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    {selectedChannel} &mdash;{' '}
                    {QU16_CHANNELS.find((c) => c.ch === selectedChannel)?.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {QU16_CHANNELS.find((c) => c.ch === selectedChannel)?.note}
                  </p>
                  {selectedChannel === 'Ch 1' && (
                    <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30">
                      ⚠️ <strong>Atenção Palco:</strong> Ao acionar o motor de ajuste mecânico do pedestal de microfone pelo comando remoto, zerar ou mutar o Canal 1 para que o ruído mecânico não chegue ao auditório.
                    </div>
                  )}
                  {(selectedChannel === 'Ch 9/10' || selectedChannel === 'Ch 11/12') && (
                    <div className="mt-2 text-[11px] text-blue-300 bg-blue-950/40 p-2 rounded border border-blue-500/30">
                      ℹ️ <strong>Redundância:</strong> O PC-1 (9/10) é o primário de mídia. Caso haja travamento, o operador sobe o PC-2 (11/12) que possui espelhamento exato com as mesmas mídias abertas no JW Library.
                    </div>
                  )}
                  {selectedChannel === 'Ch 15' && (
                    <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30">
                      🔊 <strong>Alimentação do Auditório:</strong> Canal 15 envia sinal ao DBX Venu360 no Rack. Se este canal estiver mutado ou zerado, não haverá som nas caixas do auditório.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VÍDEO & CONTROLADORA */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          {/* Credentials Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Credenciais Oficiais dos Computadores de Vídeo</h4>
                <p className="text-xs text-slate-400">Usuário e senha padrão para PC-1 e PC-2 de mídia</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Usuário: </span>
                <span className="font-mono font-bold text-emerald-400">Operador</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Senha: </span>
                <span className="font-mono font-bold text-emerald-400">sam</span>
              </div>
            </div>
          </div>

          {/* Panasonic AW-RP50 Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Camera className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-base">
                  Presets da Controladora Panasonic AW-RP50 (Câmeras PTZ)
                </h3>
                <p className="text-xs text-slate-400">
                  Enquadramentos padronizados pelo Manual Operacional de Mairiporã
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PTZ_PRESETS.map((preset) => (
                <div
                  key={preset.preset}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {preset.preset}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {preset.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{preset.name}</h4>
                    <span className="text-xs text-emerald-300 font-medium block mt-0.5">
                      Enquadramento: {preset.framing}
                    </span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  {preset.preset === 'Preset 10' && (
                    <div className="text-[10px] bg-amber-500/10 text-amber-300 p-2 rounded border border-amber-500/20 font-medium">
                      ⚠️ OBRIGATÓRIO: Corte para Preset 10 durante TODAS AS ORAÇÕES da reunião/assembleia.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blackmagic ATEM Switching Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Layers className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-base">
                  Regras de Transição na Mesa de Corte Blackmagic ATEM
                </h3>
                <p className="text-xs text-slate-400">
                  Diretriz de transição suave e profissional
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIDEO_SWITCH_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-sm">
                      {rule.action}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {rule.useCases.map((uc, uIdx) => (
                      <li key={uIdx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{uc}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    💡 {rule.alert}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSMISSÃO FM */}
      {activeTab === 'fm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auditório A */}
            <div
              className={`bg-slate-900 border rounded-xl p-5 shadow-xl space-y-4 ${
                currentAuditorium === 'A' ? 'border-emerald-500/80 ring-1 ring-emerald-500/40' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-base">Auditório A (Frequências)</h3>
                </div>
                {currentAuditorium === 'A' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Auditório Selecionado
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Deficientes Auditivos</span>
                    <span className="text-xs text-slate-500">Rádios 01 a 13</span>
                  </div>
                  <span className="font-mono text-xl font-black text-emerald-400">72.1 MHz</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Audiodescrição (Tarja Laranja)</span>
                    <span className="text-xs text-slate-500">Rádios 14 a 25</span>
                  </div>
                  <span className="font-mono text-xl font-black text-orange-400">72.9 MHz</span>
                </div>
              </div>
            </div>

            {/* Auditório B */}
            <div
              className={`bg-slate-900 border rounded-xl p-5 shadow-xl space-y-4 ${
                currentAuditorium === 'B' ? 'border-emerald-500/80 ring-1 ring-emerald-500/40' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-slate-100 text-base">Auditório B (Frequências)</h3>
                </div>
                {currentAuditorium === 'B' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Auditório Selecionado
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Deficientes Auditivos</span>
                    <span className="text-xs text-slate-500">Rádios 01 a 13</span>
                  </div>
                  <span className="font-mono text-xl font-black text-blue-400">75.5 MHz</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Audiodescrição (Tarja Laranja)</span>
                    <span className="text-xs text-slate-500">Rádios 14 a 25</span>
                  </div>
                  <span className="font-mono text-xl font-black text-orange-400">72.7 MHz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rádios FM Instructions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Diretrizes de Manuseio dos 25 Rádios FM por Auditório
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Identificação Rígida:</strong> Rádios de número <strong>01 a 13</strong> são reservados para auxílio auditivo. Rádios de <strong>14 a 25 possuem tarja laranja indelével</strong> e são configurados para audiodescrição.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Antena do Rádio:</strong> O cabo do fone de ouvido funciona como antena receptora. Caso o usuário relate chiado, oriente a desenrolar o cabo do fone e verificar o encaixe P2.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Devolução e Carregamento:</strong> Ao término da sessão, todos os 25 rádios de cada auditório devem ser recolhidos pelo voluntário encarregado e devolvidos ao carregador na sala de som.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: RACK & SEGURANÇA ELÉTRICA */}
      {activeTab === 'rack' && (
        <div className="space-y-6">
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-rose-200 text-base">
                  Protocolo de Segurança e Restrições do Rack (MA-61-E12-01)
                </h3>
                <p className="text-xs text-rose-300">
                  Norma de conformidade estrita CO-160-T / Manual Mairiporã 2026
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/30 space-y-2.5 text-xs text-slate-200 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">1.</span>
                <span>
                  <strong>Única Intervenção Permitida:</strong> Os operadores e a equipe só têm permissão para tocar no botão <strong>&quot;AÇÃO&quot;</strong> dos gerenciadores de energia (PM 1.3 PC 220V) para ligar ou desligar.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">2.</span>
                <span>
                  <strong>Proibição de Alterações:</strong> Ninguém está autorizado a mexer nas conexões físicas, fiações, configurações de processadores ou disjuntores do rack. Qualquer alteração técnica ou lógica profunda é de competência <strong>exclusiva do Plantonista Oficial do Salão</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">3.</span>
                <span>
                  <strong>Proibição de Aparelhos Particulares:</strong> Ninguém está autorizado a plugar gravadores de áudio portáteis, cabos adicionais de vídeo/áudio ou notebooks particulares (apenas equipe expressamente autorizada de Betel ou eventos específicos de Língua de Sinais).
                </span>
              </div>
            </div>
          </div>

          {/* Rack Components Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Componentes do Rack Principal (MA-61-E12-01)
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-100 block">Gerenciador de Energia 1 e 2 (PM 1.3 PC 220V)</strong>
                  <span className="text-slate-400">Liga/desliga sequencial dos periféricos via botão AÇÃO</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Botão AÇÃO: 2 segundos
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-100 block">Processador de Áudio DBX Venu360</strong>
                  <span className="text-slate-400">Alinhamento, crossovers e limitadores das caixas</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Leds Input/Output
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-100 block">4 Amplificadores Next Pro R2</strong>
                  <span className="text-slate-400">Potência para auditório e subwoofers</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Leds Verdes Normais
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-100 block">Nobreak APC 2200VA + Chave ATS</strong>
                  <span className="text-slate-400">Sustentação contínua de mesas, PCs e câmeras em blackout</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  1 Minuto de Autonomia
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GUIA DE BOLSO DO OPERADOR (CHEAT SHEET) */}
      {activeTab === 'cheatSheet' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Guia de Bolso / Cartão Rápido de Instruções ao Operador
              </h3>
              <p className="text-xs text-slate-400">
                Ideal para enviar ao operador voluntário da semana via WhatsApp ou imprimir em 1 página.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const text = `📋 *GUIA DE BOLSO DO OPERADOR - SALÃO DE ASSEMBLEIAS DE MAIRIPORÃ (AUDITÓRIO ${currentAuditorium})*
CO-160-T / rev. 2026

🔴 *REGRAS DE OURO:*
1. NUNCA mexa nas conexões, disjuntores ou cabos do Rack. Em qualquer dúvida, chame o Plantonista.
2. Mesa Qu-16: Os faders estéreos sobem juntos automaticamente. NUNCA suba faders estéreos juntos com as duas mãos!

🎛️ *MESA ALLEN & HEATH QU-16:*
• Ch 1 a 7: Microfones (Ch 1 = Tribuna / Pedestal)
• Ch 9/10: PC-1 (JW Library / Mídia Principal)
• Ch 11/12: PC-2 (Reserva / JW Stream / Transmissão)
• Ch 15: Master Auditório
• Ch 16: Retorno do Palco
• Medidor Clarity M: Referência em 0 dB (-6 a +6 dB tolerável, evitar ultrapassar -18 na circunferência).

🎥 *VÍDEO (BLACKMAGIC & CONTROLADORA AW-RP50):*
• Preset 1: Orador / Tribuna (cotovelo até topo da cabeça)
• Preset 3: Entrevistas / Comentários no palco
• Preset 10: Palco Aberto / Geral (trocas de participantes e ORAÇÕES)
• Botão CUT: Corte seco para orador e entrevistados
• Botão AUTO: Fusão suave para transição de vídeos e músicas

📻 *RÁDIOS FM (AUDITÓRIO ${currentAuditorium}):*
${currentAuditorium === 'A' ? '• 72.1 MHz: Deficientes Auditivos (Rádios 01 a 13)\n• 72.9 MHz: Audiodescrição (Rádios 14 a 25 - Tarja Laranja)' : '• 75.5 MHz: Deficientes Auditivos (Rádios 01 a 13)\n• 72.7 MHz: Audiodescrição (Rádios 14 a 25 - Tarja Laranja)'}

⚡ *QUEDA DE ENERGIA / GERADOR:*
• Aguarde 1 minuto: computadores e mesas permanecem no Nobreak APC 2200; telões e amplificadores religam automaticamente no gerador.`;

                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(text);
                    setCopiedCheat(true);
                    setTimeout(() => setCopiedCheat(false), 2500);
                  }

                  const encoded = encodeURIComponent(text);
                  window.location.href = `https://api.whatsapp.com/send?text=${encoded}`;
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                {copiedCheat ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedCheat ? 'Copiado & Abrindo!' : 'Enviar no WhatsApp'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Imprimir Cartão</span>
              </button>
            </div>
          </div>

          {/* Printable / Viewable Card */}
          <div className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-6 print:border-none print:bg-white print:text-black">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Manual Operacional Mairiporã • CO-160-T (rev. 2026)
                </span>
                <h2 className="text-lg font-black text-slate-100 mt-1">
                  Cartão de Bolso do Operador • Auditório {currentAuditorium}
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                Uso em Bancada & Cabine
              </span>
            </div>

            {/* Grid with 4 essential sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Regras Críticas */}
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>1. Regras Críticas de Segurança</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>NÃO MEXA NO RACK:</strong> Ninguém está autorizado a plugar gravadores, cabos ou alterar conexões no rack. Em falhas, acione o Plantonista.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>FADERS ESTÉREOS QU-16:</strong> Sobem e descem sincronizados por motor. <em>NUNCA force os dois faders com as duas mãos!</em></span>
                  </li>
                </ul>
              </div>

              {/* Box 2: Roteamento Qu-16 & Medidor */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Sliders className="w-4 h-4" />
                  <span>2. Mesa Qu-16 & TC Clarity M</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p>• <strong>Ch 1-7:</strong> Microfones (Ch 1 = Tribuna/Pedestal)</p>
                  <p>• <strong>Ch 9/10:</strong> Computador PC-1 (JW Library Principal)</p>
                  <p>• <strong>Ch 11/12:</strong> Computador PC-2 (JW Stream / Backup)</p>
                  <p>• <strong>Ch 15:</strong> Master Auditório | <strong>Ch 16:</strong> Retorno Palco</p>
                  <p>• <strong>Clarity M:</strong> Referência <strong>0 dB</strong> (faixa -6 a +6 dB). Limite de segurança: não passar de -18 no anel externo.</p>
                </div>
              </div>

              {/* Box 3: Vídeo & Câmeras PTZ */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Camera className="w-4 h-4" />
                  <span>3. Vídeo, Câmeras PTZ & Cortes</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p>• <strong>Preset 1 (AW-RP50):</strong> Orador / Tribuna (plano médio, cotovelo ao topo)</p>
                  <p>• <strong>Preset 3:</strong> Entrevistas e comentários no palco</p>
                  <p>• <strong>Preset 10:</strong> Palco Geral (trocas de partes e ORAÇÕES)</p>
                  <p>• <strong>Botão CUT:</strong> Corte seco para fala e oradores</p>
                  <p>• <strong>Botão AUTO:</strong> Fusão suave para vídeos e cânticos</p>
                </div>
              </div>

              {/* Box 4: Rádios FM & Contingência */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Radio className="w-4 h-4" />
                  <span>4. Rádios FM & Queda de Rede</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p>• <strong>Auditório {currentAuditorium}:</strong> {currentAuditorium === 'A' ? '72.1 MHz (Auditivo) | 72.9 MHz (Audiodescrição)' : '75.5 MHz (Auditivo) | 72.7 MHz (Audiodescrição)'}</p>
                  <p>• <strong>Rádios 01-13:</strong> Deficientes Auditivos</p>
                  <p>• <strong>Rádios 14-25:</strong> Audiodescrição (tarja laranja)</p>
                  <p>• <strong>Blackout:</strong> Transição para gerador dura 1 min. Mesas e PCs ficam no nobreak; telões religam sozinhos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
