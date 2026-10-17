import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  MapPin,
  ShieldAlert,
  ChevronDown,
  Share2,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { Occurrence, OccurrenceSeverity, OccurrenceCategory, OccurrenceStatus, Auditorium } from '../types';
import { shareOrFallback, downloadTextFile } from '../utils/shareUtils';

interface OccurrenceLogProps {
  currentAuditorium: Auditorium;
  occurrences: Occurrence[];
  onAddOccurrence: (occurrence: Omit<Occurrence, 'id' | 'timestamp'>) => void;
  onUpdateOccurrenceStatus: (id: string, newStatus: OccurrenceStatus) => void;
  onDeleteOccurrence: (id: string) => void;
}

export const OccurrenceLog: React.FC<OccurrenceLogProps> = ({
  currentAuditorium,
  occurrences,
  onAddOccurrence,
  onUpdateOccurrenceStatus,
  onDeleteOccurrence,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterAuditorium, setFilterAuditorium] = useState<'Todos' | Auditorium>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [auditorium, setAuditorium] = useState<Auditorium>(currentAuditorium);
  const [category, setCategory] = useState<OccurrenceCategory>('Áudio');
  const [severity, setSeverity] = useState<OccurrenceSeverity>('Média');
  const [symptom, setSymptom] = useState('');
  const [locationChecked, setLocationChecked] = useState('Bancada de Operação (Qu-16)');
  const [actionTaken, setActionTaken] = useState('');
  const [status, setStatus] = useState<OccurrenceStatus>('Resolvido');
  const [operatorInCharge, setOperatorInCharge] = useState('Plantonista A/V');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptom.trim() || !actionTaken.trim()) return;

    onAddOccurrence({
      auditorium,
      category,
      severity,
      symptom,
      locationChecked,
      actionTaken,
      status,
      operatorInCharge,
    });

    setSymptom('');
    setActionTaken('');
    setIsAdding(false);
  };

  const filteredOccurrences = occurrences.filter((occ) => {
    const matchesAudit = filterAuditorium === 'Todos' || occ.auditorium === filterAuditorium;
    const matchesStatus = filterStatus === 'Todos' || occ.status === filterStatus;
    const matchesSearch =
      occ.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAudit && matchesStatus && matchesSearch;
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);

  const showToast = (text: string, isSuccess: boolean) => {
    setToastMessage({ text, isSuccess });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const formatOccurrencesText = () => {
    const header = `========================================================================\n` +
      `LIVRO DE OCORRÊNCIAS - ÁUDIO E VÍDEO\n` +
      `SALÃO DE ASSEMBLEIAS DE MAIRIPORÃ (CO-160-T / REV. 2026)\n` +
      `========================================================================\n` +
      `Total de Ocorrências: ${occurrences.length}\n` +
      `Auditório Filtrado: ${filterAuditorium}\n\n`;

    const body = filteredOccurrences.length === 0
      ? 'Nenhuma ocorrência registrada no momento.'
      : filteredOccurrences
          .map(
            (occ, idx) =>
              `[#${idx + 1}] - Horário: ${occ.timestamp} | Auditório ${occ.auditorium} | ${occ.category} (Gravidade: ${occ.severity})\n` +
              `• Sintoma: ${occ.symptom}\n` +
              `• Local Inspecionado: ${occ.locationChecked}\n` +
              `• Ação Tomada: ${occ.actionTaken}\n` +
              `• Status: ${occ.status}\n` +
              `• Responsável: ${occ.operatorInCharge || 'Plantonista'}\n`
          )
          .join('\n------------------------------------------------------------------------\n');

    return `${header}${body}\n========================================================================\n`;
  };

  const handleShareOccurrences = async () => {
    const text = formatOccurrencesText();
    const title = `Ocorrências A/V Mairiporã (${occurrences.length} registros)`;
    const whatsappSummary = `*LIVRO DE OCORRÊNCIAS A/V - SALÃO DE MAIRIPORÃ*\n\n` +
      `⚠️ *Registros:* ${occurrences.length} ocorrências cadastradas no plantão.\n` +
      `📋 *Status:* ${occurrences.filter((o) => o.status === 'Resolvido').length} resolvidas, ${occurrences.filter((o) => o.status !== 'Resolvido').length} pendentes/em monitoramento.\n\n` +
      `_A lista detalhada de ocorrências foi copiada para a área de transferência. Cole aqui na conversa:_`;

    await shareOrFallback(
      {
        title,
        text,
        whatsappSummary,
        fileName: 'ocorrencias-plantao-mairipora.txt',
      },
      (msg, isSuccess) => showToast(msg, isSuccess)
    );
  };

  const handleDownloadTxt = () => {
    const text = formatOccurrencesText();
    downloadTextFile('livro-de-ocorrencias-mairipora.txt', text);
    showToast('Arquivo de ocorrências baixado com sucesso!', true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs shadow-lg animate-in fade-in slide-in-from-top-2 ${
            toastMessage.isSuccess
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[11px] font-bold text-slate-400 hover:text-white px-2 py-0.5"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">Livro de Ocorrências do Plantão</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {occurrences.length} {occurrences.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Histórico operacional com horário, sintoma, local inspecionado e resolução oficial
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTxt}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Baixar lista de ocorrências em arquivo .txt"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            Baixar .txt
          </button>

          <button
            onClick={handleShareOccurrences}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            title="Compartilhar livro de ocorrências via WhatsApp ou Web Share"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartilhar / WhatsApp
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Fechar Formulário' : 'Nova Ocorrência'}
          </button>
        </div>
      </div>

      {/* New Occurrence Modal/Drawer */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Registrar Ocorrência Técnica em Tempo Real
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Horário:{' '}
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Auditório</label>
              <select
                value={auditorium}
                onChange={(e) => setAuditorium(e.target.value as Auditorium)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="A">Auditório A</option>
                <option value="B">Auditório B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as OccurrenceCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Áudio">Áudio</option>
                <option value="Vídeo">Vídeo</option>
                <option value="Palco">Palco</option>
                <option value="Elétrica / Nobreak">Elétrica / Nobreak</option>
                <option value="Rádios FM">Rádios FM</option>
                <option value="JW Library / Rede">JW Library / Rede</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gravidade</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as OccurrenceSeverity)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status Final</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OccurrenceStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Resolvido">Resolvido</option>
                <option value="Em Monitoramento">Em Monitoramento</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sintoma / Falha Observada
              </label>
              <input
                type="text"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="Ex: Nível do PC-1 oscilou durante o cântico inicial..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Onde foi inspecionado fisicamente?
              </label>
              <input
                type="text"
                value={locationChecked}
                onChange={(e) => setLocationChecked(e.target.value)}
                placeholder="Ex: Bancada Qu-16, Rack MA-61-E12-01 ou Palco..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ação Corretiva Tomada (Conforme CO-160-T / Manual Mairiporã)
            </label>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              rows={2}
              placeholder="Descreva a ação executada (ex: Ajustado fader para 0 dB, conferido medidor Clarity e restabelecido nível normal sem alteração no rack)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por sintoma, ação ou categoria..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Auditório Filter */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            {(['Todos', 'A', 'B'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setFilterAuditorium(a)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  filterAuditorium === a
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {a === 'Todos' ? 'Todos' : `Aud. ${a}`}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="Todos">Status: Todos</option>
            <option value="Resolvido">Resolvido</option>
            <option value="Em Monitoramento">Em Monitoramento</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>
      </div>

      {/* Occurrence List */}
      <div className="space-y-3">
        {filteredOccurrences.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
            Nenhuma ocorrência encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredOccurrences.map((occ) => {
            const isCritical = occ.severity === 'Crítica';
            const isHigh = occ.severity === 'Alta';

            return (
              <div
                key={occ.id}
                className={`bg-slate-900 border rounded-xl p-4 shadow-md transition-all space-y-3 ${
                  isCritical
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isHigh
                    ? 'border-amber-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {occ.timestamp}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                      Auditório {occ.auditorium}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {occ.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {occ.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={occ.status}
                      onChange={(e) =>
                        onUpdateOccurrenceStatus(occ.id, e.target.value as OccurrenceStatus)
                      }
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        occ.status === 'Resolvido'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : occ.status === 'Em Monitoramento'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      <option value="Resolvido">Resolvido</option>
                      <option value="Em Monitoramento">Em Monitoramento</option>
                      <option value="Pendente">Pendente</option>
                    </select>

                    <button
                      onClick={() => onDeleteOccurrence(occ.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Excluir ocorrência"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{occ.symptom}</h4>
                  <div className="mt-1 text-xs text-slate-300 flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium">Local Inspecionado: </span>
                      <span className="text-slate-200">{occ.locationChecked}</span>
                      <div className="mt-1">
                        <span className="text-slate-400 font-medium">Ação Corretiva: </span>
                        <span className="text-slate-100 font-medium">{occ.actionTaken}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
