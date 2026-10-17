import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Zap,
  Mic,
  MicOff,
} from 'lucide-react';
import { ChatMessage, Auditorium } from '../types';

interface AssistantChatProps {
  currentAuditorium: Auditorium;
  onOpenTroubleshooting?: (id: string) => void;
}

const QUICK_PROMPTS = [
  'Sem som no auditório vindo do computador',
  'Sem imagem da câmera nas TVs/Telões',
  'Microfonia no orador do palco',
  'Queda de energia geral / Procedimento ATS',
  'Sequência correta de desligamento no encerramento',
  'Posso plugar um gravador ou notebook particular no Rack?',
  'Frequências dos rádios FM e tarjas de identificação',
  'Presets 1, 3 e 10 da controladora Panasonic AW-RP50',
];

export const AssistantChat: React.FC<AssistantChatProps> = ({ currentAuditorium, onOpenTroubleshooting }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      content: `Olá, irmão Plantonista! Sou o **Assistente Virtual de Áudio e Vídeo do Salão de Assembleias de Mairiporã** (rev. 2026 / CO-160-T).

Estou pronto para ajudar você em tempo real com:
• **Resolução rápida de problemas (Troubleshooting)** em 3 etapas práticas (O que checar no posto, Onde ir fisicamente e Ação corretiva segura).
• **Regras de Ouro e segurança do Rack** (PM 1.3 PC 220V, Allen & Heath Qu-16, Blackmagic ATEM, Panasonic AW-RP50).
• **Contingências e redundâncias** (PC-1/PC-2, gerador e nobreak APC 2200VA).

Selecione uma dúvida rápida abaixo ou descreva qualquer sintoma para diagnóstico imediato.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Speech-to-Text (Reconhecimento de Voz nativo do navegador)
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'O reconhecimento de voz não é suportado pelo seu navegador atual.\n\nRecomendamos usar o Google Chrome, Microsoft Edge ou Safari para ditar por voz.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      const initialBaseText = input;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript) {
          const separator = initialBaseText.trim().length > 0 ? ' ' : '';
          setInput(`${initialBaseText}${separator}${currentTranscript}`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Falha ao iniciar SpeechRecognition:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context: `Auditório Atual: ${currentAuditorium} • Salão de Assembleias de Mairiporã • Manual rev. 2026 • Diretriz CO-160-T`,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do assistente.');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Desculpe, não consegui processar a resposta no momento.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Aviso Operacional:** Não foi possível consultar o servidor online. 
        
Lembre-se das regras fundamentais:
1. Verifique primeiro JW Library e faders dos canais 9/10 ou 11/12 e canal 15 na Qu-16.
2. No Rack: apenas aperte o botão "AÇÃO" dos gerenciadores PM 1.3 PC 220V se necessário. Ninguém mexe em cabos ou configurações.
3. Consulte o painel de **Troubleshooting Rápido** na aba ao lado para os protocolos offline!`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown-like sections cleanly with special visual styling for the 3 steps
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Step 1: O que verificar primeiro
          if (trimmed.toLowerCase().includes('1. o que verificar primeiro') || trimmed.toLowerCase().includes('1.') && trimmed.toLowerCase().includes('verificar')) {
            return (
              <div key={idx} className="p-3 my-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 font-semibold block text-xs uppercase tracking-wide">
                    Etapa 1: Ação Imediata no Posto de Operação
                  </strong>
                  <span className="text-slate-200 font-medium">{trimmed.replace(/^(\d+\.|\*\*1\.\*\*)/i, '').trim()}</span>
                </div>
              </div>
            );
          }

          // Step 2: Onde ir fisicamente
          if (trimmed.toLowerCase().includes('2. onde ir fisicamente') || trimmed.toLowerCase().includes('2.') && trimmed.toLowerCase().includes('fisicamente')) {
            return (
              <div key={idx} className="p-3 my-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-100 flex items-start gap-2.5 shadow-sm">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold block text-xs uppercase tracking-wide">
                    Etapa 2: Onde Ir Fisicamente (Bancada, Rack ou Palco)
                  </strong>
                  <span className="text-slate-200 font-medium">{trimmed.replace(/^(\d+\.|\*\*2\.\*\*)/i, '').trim()}</span>
                </div>
              </div>
            );
          }

          // Step 3: Ação corretiva segura
          if (trimmed.toLowerCase().includes('3. ação corretiva segura') || trimmed.toLowerCase().includes('3.') && trimmed.toLowerCase().includes('corretiva')) {
            return (
              <div key={idx} className="p-3 my-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-100 flex items-start gap-2.5 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-300 font-semibold block text-xs uppercase tracking-wide">
                    Etapa 3: Ação Corretiva Segura
                  </strong>
                  <span className="text-slate-200 font-medium">{trimmed.replace(/^(\d+\.|\*\*3\.\*\*)/i, '').trim()}</span>
                </div>
              </div>
            );
          }

          // List item bullet
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-slate-300">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{trimmed.substring(1).trim()}</span>
              </div>
            );
          }

          // Bold title
          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            return (
              <h4 key={idx} className="font-bold text-slate-100 text-sm mt-2 mb-1 text-emerald-400">
                {trimmed.replace(/\*\*/g, '')}
              </h4>
            );
          }

          return <p key={idx}>{trimmed.replace(/\*\*/g, '')}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Assistente de Plantão A/V (IA)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Auditório {currentAuditorium}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Especialista Mairiporã • Respostas em 3 Etapas</p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                content: 'Chat reiniciado. Como posso orientar o plantão de áudio e vídeo agora?',
              },
            ]);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
          title="Limpar histórico do chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Emergências:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 whitespace-nowrap border border-slate-700 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[90%] sm:max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`relative group rounded-2xl p-3.5 sm:p-4 shadow-md ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800/90 rounded-tl-none'
                }`}
              >
                {/* Copy Button */}
                {!isUser && (
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="absolute top-2 right-2 p-1 rounded bg-slate-800/80 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copiar instrução"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {isUser ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  renderFormattedMessage(msg.content)
                )}

                <span
                  className={`block text-[10px] mt-1.5 ${
                    isUser ? 'text-emerald-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5 max-w-[80%]">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs text-slate-400 font-medium">
                Consultando manual CO-160-T e diretrizes Mairiporã 2026...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Voice Dictation Banner */}
      {isListening && (
        <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-500/40 text-xs text-rose-200 flex items-center justify-between animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Ouvindo em português (pt-BR)... Fale o sintoma ou dúvida técnica.</span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-[11px] underline font-semibold text-rose-300 hover:text-white"
          >
            Concluir / Parar
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isListening) {
            toggleListening();
          }
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Ouvindo sua voz... (transcrevendo automaticamente)'
                : 'Ex: Como proceder se o PC 1 travar na oração final? Ou ditar pelo microfone...'
            }
            className={`w-full bg-slate-900 border rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
              isListening
                ? 'border-rose-500/80 ring-1 ring-rose-500/40 text-rose-100 placeholder-rose-300/60'
                : 'border-slate-700 focus:border-emerald-500'
            }`}
            disabled={loading}
          />

          {/* Microphone button inside / at the end of input field */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={loading}
            title={
              isListening
                ? 'Parar gravação de voz'
                : 'Ditado por Voz (Falar em vez de digitar no celular ou tablet)'
            }
            className={`absolute right-1.5 p-2 rounded-lg transition-all flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-400'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
