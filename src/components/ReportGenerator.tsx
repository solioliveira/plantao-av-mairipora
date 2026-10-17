import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Printer,
  Share2,
  Check,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Download,
  Send,
  Upload,
  Radio,
  Zap,
  Clock,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';
import { AuditoriumTeam, Occurrence, ChecklistItem, Auditorium } from '../types';
import { shareOrFallback, downloadTextFile } from '../utils/shareUtils';

interface ReportGeneratorProps {
  currentAuditorium: Auditorium;
  teamA: AuditoriumTeam;
  teamB: AuditoriumTeam;
  occurrences: Occurrence[];
  checklist: ChecklistItem[];
  onRestoreBackup?: (backupData: {
    teamA?: AuditoriumTeam;
    teamB?: AuditoriumTeam;
    occurrences?: Occurrence[];
    checklist?: ChecklistItem[];
  }) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  currentAuditorium,
  teamA,
  teamB,
  occurrences,
  checklist,
  onRestoreBackup,
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customReportText, setCustomReportText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [showQuickNotices, setShowQuickNotices] = useState(false);
  const [sentNoticeKey, setSentNoticeKey] = useState<string | null>(null);

  const showToast = (text: string, isSuccess: boolean) => {
    setToastMessage({ text, isSuccess });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Generate standard structured report text with simplified leadership roster
  const generateStandardText = () => {
    const activeTeam = currentAuditorium === 'A' ? teamA : teamB;
    const closingItems = checklist.filter((i) => i.phase === 'encerramento');
    const allClosingCompleted = closingItems.every((i) => i.completed);

    return `========================================================================
RELATÓRIO OFICIAL DO PLANTÃO DE ÁUDIO E VÍDEO
SALÃO DE ASSEMBLEIAS DE MAIRIPORÃ (CO-160-T / REV. 2026)
========================================================================

1. DADOS GERAIS DO EVENTO
------------------------------------------------------------------------
• Data do Plantão: ${activeTeam.date}
• Auditório em Operação: Auditório ${currentAuditorium} (Salão de Mairiporã)
• Plantonista Responsável: ${activeTeam.dutyTechnician}
• Superintendente de Áudio e Vídeo: ${activeTeam.superintendentAV || activeTeam.superintendentAudio || 'Designado'}

2. ESCALA E SUPERVISÃO DE PLANTÃO
------------------------------------------------------------------------
[ AUDITÓRIO A ]
• Data do Plantão: ${teamA.date}
• Plantonista Responsável: ${teamA.dutyTechnician}
• Superintendente de Áudio e Vídeo: ${teamA.superintendentAV || teamA.superintendentAudio || 'Designado'}

[ AUDITÓRIO B ]
• Data do Plantão: ${teamB.date}
• Plantonista Responsável: ${teamB.dutyTechnician}
• Superintendente de Áudio e Vídeo: ${teamB.superintendentAV || teamB.superintendentAudio || 'Designado'}

3. CONDIÇÕES INICIAIS DOS EQUIPAMENTOS
------------------------------------------------------------------------
• Rack Principal (MA-61-E12-01): Operando normalmente. Intervenções restritas ao botão AÇÃO dos gerenciadores PM 1.3 PC 220V.
• Nobreak APC 2200VA & Chave ATS: Operando em rede com carga estável.
• Medidor TC Clarity M: Nível aferido com referência em 0 dB.
• Mesa Allen & Heath Qu-16: Faders Ch 9/10, 11/12, Canal 15 e Master conferidos em 0 dB.
• Câmeras Panasonic & AW-RP50: Presets 1 (Orador), 3 (Entrevistas) e 10 (Geral/Orações) calibrados.
• Transmissores FM: Auditório A (72.1 / 72.9 MHz) e Auditório B (75.5 / 72.7 MHz) com os 25 rádios testados.

4. OCORRÊNCIAS E FALHAS REGISTRADAS
------------------------------------------------------------------------
${
  occurrences.length === 0
    ? 'Nenhuma ocorrência adversa registrada. Todos os sistemas operaram com 100% de estabilidade técnica.'
    : occurrences
        .map(
          (occ, idx) =>
            `[Ocorrência #${idx + 1}] - ${occ.timestamp} | Auditório ${occ.auditorium} | ${occ.category} (${occ.severity})\n` +
            `• Sintoma: ${occ.symptom}\n` +
            `• Local Inspecionado: ${occ.locationChecked}\n` +
            `• Ação Corretiva: ${occ.actionTaken}\n` +
            `• Status Final: ${occ.status}\n`
        )
        .join('\n')
}

5. OBSERVAÇÕES FINAIS E CHECKLIST DE ENCERRAMENTO
------------------------------------------------------------------------
• Sequência Estrita de Desligamento: ${
      allClosingCompleted
        ? 'EXECUTADA COM SUCESSO (PCs -> Qu-16 Shutdown -> Câmeras User 1 2s -> Gerenciador 2 -> Gerenciador 1).'
        : 'PARCIALMENTE CONCLUÍDA - Verificar pendências do checklist antes de deixar a cabine.'
    }
• Rádios FM: Todos os 25 rádios de cada auditório recolhidos e colocados nos carregadores (Rádios 1-13 auditivos e 14-25 com tarja laranja para audiodescrição).
• Microfones: Guardados no gaveteiro trancado com pilhas removidas.
• Pedestal de microfone: Desligado e protegido.
• Observações do Plantonista: O evento transcorreu dentro dos padrões da organização. Equipamentos prontos para o próximo evento.

Assinatura do Plantonista: ${activeTeam.dutyTechnician}
Data: ${activeTeam.date}
`;
  };

  const currentReport = customReportText || generateStandardText();
  const activeTeam = currentAuditorium === 'A' ? teamA : teamB;

  // Gemini AI Polished Report Generator
  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    try {
      const payload = {
        currentAuditorium,
        teamA,
        teamB,
        occurrences,
        checklistSummary: checklist.map((c) => ({
          title: c.title,
          phase: c.phase,
          completed: c.completed,
        })),
        date: teamA.date,
      };

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro na geração com IA');

      const data = await response.json();
      if (data.report) {
        setCustomReportText(data.report);
        showToast('Relatório aprimorado com sucesso pela inteligência artificial!', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Não foi possível conectar com a IA online. Usando modelo padrão.', false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentReport);
    setCopied(true);
    showToast('Relatório completo copiado para a área de transferência!', true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const filename = `relatorio-plantao-mairipora-${activeTeam.date}-aud-${currentAuditorium}.txt`;
    downloadTextFile(filename, currentReport);
    showToast(`Arquivo "${filename}" baixado com sucesso!`, true);
  };

  // Robust Share with WhatsApp + Clipboard fallback
  const handleShare = async () => {
    const title = `Relatório Oficial A/V - Salão de Mairiporã (${activeTeam.date})`;
    const whatsappSummary = `*RELATÓRIO OFICIAL DO PLANTÃO A/V - SALÃO DE MAIRIPORÃ*\n\n` +
      `📅 *Data do Plantão:* ${activeTeam.date} | *Auditório:* ${currentAuditorium}\n` +
      `🔧 *Plantonista Responsável:* ${activeTeam.dutyTechnician}\n` +
      `👤 *Superintendente de Áudio e Vídeo:* ${activeTeam.superintendentAV || activeTeam.superintendentAudio || 'Designado'}\n` +
      `⚠️ *Ocorrências:* ${occurrences.length} registradas\n\n` +
      `_O relatório completo e detalhado foi copiado para a área de transferência. Cole o texto completo aqui para envio oficial._`;

    await shareOrFallback(
      {
        title,
        text: currentReport,
        whatsappSummary,
        fileName: `relatorio-plantao-${activeTeam.date}.txt`,
      },
      (msg, isSuccess) => showToast(msg, isSuccess)
    );
  };

  const handleSendWhatsAppNotice = (key: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setSentNoticeKey(key);
    setTimeout(() => setSentNoticeKey(null), 3000);
    const encoded = encodeURIComponent(text);
    window.location.href = `https://api.whatsapp.com/send?text=${encoded}`;
  };

  const handleExportJsonBackup = () => {
    const backupData = {
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      currentAuditorium,
      teamA,
      teamB,
      occurrences,
      checklist,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    downloadTextFile(`backup-plantao-mairipora-${activeTeam.date}.json`, jsonStr, 'application/json');
    showToast('Backup do plantão (.json) baixado com sucesso!', true);
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (onRestoreBackup) {
          onRestoreBackup(parsed);
          showToast('Dados do plantão restaurados com sucesso a partir do backup!', true);
        }
      } catch (err) {
        showToast('Arquivo de backup inválido ou corrompido.', false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const QUICK_NOTICES = [
    {
      key: 'soundcheck',
      title: 'Teste de Som e Vídeo (15 min antes)',
      icon: Clock,
      color: 'text-emerald-400',
      text: `📢 *ALINHAMENTO A/V - SALÃO DE ASSEMBLEIAS DE MAIRIPORÃ (AUDITÓRIO ${currentAuditorium})*\n` +
        `Data: ${activeTeam.date}\n\n` +
        `Atenção equipe de Áudio e Vídeo: Iniciaremos o teste geral de microfones, JW Library (PCs 1 e 2) e câmeras em 15 minutos na cabine.\n` +
        `Favor verificar postos, crachás e fones de ouvido.`,
    },
    {
      key: 'fm-radios',
      title: 'Distribuição dos 25 Rádios FM',
      icon: Radio,
      color: 'text-cyan-400',
      text: `📻 *RÁDIOS FM LIBERADOS PARA O AUDITÓRIO ${currentAuditorium}*\n` +
        `Frequências oficiais:\n` +
        `${currentAuditorium === 'A' ? '• 72.1 MHz: Deficientes Auditivos (Rádios 01 a 13)\n• 72.9 MHz: Audiodescrição (Rádios 14 a 25 - Tarja Laranja)' : '• 75.5 MHz: Deficientes Auditivos (Rádios 01 a 13)\n• 72.7 MHz: Audiodescrição (Rádios 14 a 25 - Tarja Laranja)'}\n\n` +
        `Todos os aparelhos estão testados e disponíveis no balcão de apoio.`,
    },
    {
      key: 'power-generator',
      title: 'Transição para Gerador / Queda',
      icon: Zap,
      color: 'text-amber-400',
      text: `⚡ *ALERTA OPERACIONAL: TRANSIÇÃO PARA GERADOR*\n` +
        `Houve oscilação na rede elétrica. Computadores e mesas de som/corte permanecem ativos no Nobreak APC 2200VA.\n` +
        `A transição para o gerador leva 1 minuto. Telões e amplificadores religarão automaticamente. Manter calma na bancada.`,
    },
    {
      key: 'closing-rack',
      title: 'Alerta de Encerramento (Não mexer no Rack)',
      icon: ShieldAlert,
      color: 'text-rose-400',
      text: `🛑 *ENCERRAMENTO DA SESSÃO - AVISO À EQUIPE*\n` +
        `Lembramos à equipe: Ninguém está autorizado a mexer nas conexões, cabos ou disjuntores do Rack!\n` +
        `O desligamento sequencial estrito dos gerenciadores de energia será realizado pelo Plantonista do Salão.\n` +
        `Favor recolher os 25 rádios FM de cada auditório e desligar as chaves.`,
    },
  ];

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

      {/* Header & Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">Relatório Oficial do Plantão</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Auditório {currentAuditorium}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Estrutura nos 5 tópicos oficiais com compartilhamento direto e cópia automática
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateAIReport}
            disabled={isGeneratingAI}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            title="Usa o modelo Gemini para formatar o relatório com redação técnica oficial"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGeneratingAI ? 'Redigindo com IA...' : 'Aprimorar com IA'}
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Copiar texto completo para a área de transferência"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Baixar arquivo de texto (.txt) no dispositivo"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            Baixar .txt
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Imprimir ou salvar como PDF limpo"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>

          <button
            onClick={handleExportJsonBackup}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Salvar arquivo de backup com todas as ocorrências, checklists e escala (.json)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Backup .json
          </button>

          <label
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Restaurar dados de ocorrências e equipes a partir de arquivo de backup (.json)"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            Restaurar
            <input
              type="file"
              accept=".json"
              onChange={handleImportJsonBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            title="Compartilhar via aplicativo móvel ou copiar e abrir WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartilhar / WhatsApp
          </button>
        </div>
      </div>

      {/* Quick WhatsApp Announcements for Volunteers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Avisos Rápidos no WhatsApp para a Equipe de Voluntários</h4>
              <p className="text-[11px] text-slate-400">Toque para copiar o aviso oficial e disparar direto no grupo de áudio & vídeo</p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickNotices((prev) => !prev)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            {showQuickNotices ? 'Ocultar Avisos' : 'Ver 4 Avisos Oficiais'}
          </button>
        </div>

        {showQuickNotices && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
            {QUICK_NOTICES.map((notice) => {
              const Icon = notice.icon;
              const isSent = sentNoticeKey === notice.key;

              return (
                <div
                  key={notice.key}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                        <Icon className={`w-4 h-4 ${notice.color}`} />
                        <span>{notice.title}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {notice.text.replace(/\*/g, '')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSendWhatsAppNotice(notice.key, notice.text)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-emerald-600/90 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500/50 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {isSent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isSent ? 'Copiado & Abrindo WhatsApp...' : 'Enviar este Aviso no WhatsApp'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor & Preview Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span className="font-semibold text-slate-300">Prévia do Documento Oficial (Editável)</span>
          {customReportText && (
            <button
              onClick={() => setCustomReportText('')}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar Modelo Base
            </button>
          )}
        </div>

        <textarea
          value={currentReport}
          onChange={(e) => setCustomReportText(e.target.value)}
          rows={24}
          className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y selection:bg-emerald-500 selection:text-slate-950"
        />

        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
          <span>Salão de Assembleias de Mairiporã • Departamento de Áudio e Vídeo</span>
          <span>Em conformidade com a Diretriz CO-160-T (2026)</span>
        </div>
      </div>
    </div>
  );
};
