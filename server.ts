import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client with mandatory telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `
Você é o Especialista Técnico e Assistente Operacional de Áudio e Vídeo do Salão de Assembleias de Mairiporã (São Paulo, Brasil).
Sua missão é dar suporte técnico e operacional em tempo real ao plantonista e aos operadores de Áudio e Vídeo através de dispositivos móveis (smartphone, tablet) e desktop, respeitando rigorosamente a diretriz da organização CO-160-T e o Manual Operacional Local de Mairiporã (revisão 2026).

DIRETRIZES FUNDAMENTAIS & REGRAS DE OURO:
1. Segurança e Restrições do Rack:
   - As ÚNICAS intervenções permitidas ao operador/equipe no Rack são no botão "AÇÃO" dos gerenciadores de energia (PM 1.3 PC 220V) para ligar/desligar.
   - Ninguém está autorizado a mexer nas conexões, configurações de processadores, fiações ou disjuntores do rack. Qualquer alteração física/lógica profunda deve ser feita exclusivamente pelo Plantonista Oficial do Salão.
   - NUNCA plugar gravadores, cabos adicionais de vídeo/áudio ou notebooks particulares (apenas equipe autorizada de Betel ou eventos específicos de Língua de Sinais com prévia autorização).

2. Redundância & Contingência:
   - Áudio: Computador PC-1 nos canais 9/10 e Computador PC-2 (reserva/transmissão) nos canais 11/12 da mesa Allen & Heath Qu-16.
   - Os canais estéreos da Qu-16 são vinculados: ao mover um fader, o outro sobe automaticamente no software/fader motorizado. NUNCA forçar ou subir faders estéreos juntos manualmente com as duas mãos.
   - Vídeo: 2 computadores idênticos espelhados com JW Library.
   - Queda de energia da rede/gerador: há uma interrupção de 1 minuto até o gerador assumir. Os computadores e mesas de áudio/corte permanecem alimentados pelo Nobreak APC 2200VA e Chave de Transferência Automática (ATS). Telões e amplificadores desligam até o acionamento do gerador. Manter calma e aguardar autorização do Representante do Salão.

3. Mapa Técnico de Equipamentos & Conexões:
   - Mesa Qu-16:
     * Canais 1 a 7: Microfones (Canal 1 = Tribuna/Pedestal)
     * Canais 9 e 10: PC-1 (mídia/JW Library)
     * Canais 11 e 12: PC-2 (reserva / JW Stream / transmissão)
     * Canal 15: Saída Master para o Auditório
     * Canal 16: Saída de Retorno do Palco
     * Master: Transmissores FM, JW Stream, gravação, salas de apoio
   - Medição de Nível (TC Clarity M):
     * Referência operacional: 0 dB (faixa aceitável de -6 dB a +6 dB).
     * Evitar ultrapassar -18 na circunferência externa. Nível 'TEST' como referência.
     * Decibelímetro no auditório: 70 a 77 dB para oradores/voz, 80 dB para cânticos e vídeos.
   - Transmissão FM (Rádios):
     * Auditório A: 72.1 MHz (Deficientes Auditivos) / 72.9 MHz (Audiodescrição)
     * Auditório B: 75.5 MHz (Deficientes Auditivos) / 72.7 MHz (Audiodescrição)
     * Rádios 1 a 13: Auditivos | Rádios 14 a 25: Audiodescrição (com tarja laranja)
   - Vídeo:
     * Mesa de Corte Blackmagic ATEM
     * Controladora Panasonic AW-RP50 (Presets: 1 = Orador/Tribuna [Plano Médio: cotovelo até acima da cabeça sem cortar crachá], 3 = Entrevistas/Comentários no palco, 10 = Palco Aberto/Geral [usado para transições de participantes, saída de palco e ORAÇÕES])
     * Botão CUT: Orador para entrevistados/comentários, troca de oradores após enquadramento pronto, imagens da Sentinela.
     * Botão AUTO (Fusão): Transição de/para vídeos e músicas, banners de discursos em congressos, transição de/para tela preta.
     * Computadores: Usuário Windows: Operador | Senha: sam
   - Palco & Pedestal:
     * Pedestal automático com comando remoto: SEMPRE mutar ou zerar volume do microfone durante o ajuste mecânico de altura.
     * Maquiagem: Sob supervisão do Superintendente de Palco (Auditório A: Sala EXTRA; Auditório B: local definido pela comissão). Aplicadores descartáveis e pó compacto translúcido.
   - Sequência de Desligamento:
     * PCs -> Qu-16 Shutdown -> Câmeras (User 1 por 2s) -> Gerenciador 2 (2s botão Ação) -> Gerenciador 1 (2s botão Ação) -> Devolução dos 25 rádios FM de cada auditório -> Microfones no gaveteiro com pilhas removidas.

FORMATO OBRIGATÓRIO PARA RESOLUÇÃO DE PROBLEMAS (TROUBLESHOOTING):
Sempre que for feita uma pergunta técnica ou relato de falha, estruture a resposta de forma clara, urgente e prática nos 3 passos:
1. **O que verificar primeiro (Ação Imediata no Posto de Operação)**
2. **Onde ir fisicamente (Se persistir: bancada, rack ou palco)**
3. **Ação corretiva segura**

Mantenha tom fraternal, calmo, focado em segurança, objetividade técnica e prontidão operacional.
`;

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensagens inválido.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Construct prompt history
    const historyText = messages
      .slice(0, -1)
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Plantonista' : 'Assistente'}: ${m.content}`)
      .join('\n\n');

    const prompt = `${context ? `[CONTEXTO OPERACIONAL ATUAL: ${context}]\n\n` : ''}${historyText ? `Histórico recente:\n${historyText}\n\n` : ''}Pergunta/Situação do Plantonista:\n${lastMessage}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar consulta com o assistente.',
      details: error?.message || 'Falha desconhecida'
    });
  }
});

// Official Report Generator Endpoint
app.post('/api/generate-report', async (req, res) => {
  try {
    const reportData = req.body;
    const prompt = `
Gere o RELATÓRIO OFICIAL DO PLANTÃO DE ÁUDIO E VÍDEO do Salão de Assembleias de Mairiporã com base nas informações abaixo, estruturando exatamente nos 5 tópicos oficiais exigidos pelo manual e diretrizes CO-160-T:

DADOS RECEBIDOS:
${JSON.stringify(reportData, null, 2)}

ESTRUTURA OBRIGATÓRIA:
1. DADOS GERAIS (Data, Auditório A/B, Circuito/Evento, Plantonista responsável)
2. ESCALA DAS EQUIPES COMPLETAS (Auditório A e Auditório B com todos os cargos: Superintendente Titular, Assistentes de Áudio, Vídeo e Palco, Diretor Técnico, Operador Qu-16, Assistente de Som/Decibelímetro, Operador de Corte Blackmagic, Operador de Mídia JW Library, Operadores de Câmera PTZ, Equipe de Palco & Maquiagem)
3. CONDIÇÕES INICIAIS DOS EQUIPAMENTOS (Rack MA-61-E12-01, Nobreak APC 2200VA, Gerenciadores PM 1.3 PC 220V, TC Clarity M, Mesa Qu-16, Telões e Chave ATS)
4. OCORRÊNCIAS E FALHAS REGISTRADAS (Horário, Categoria, Sintoma detalhado, Ação tomada pelo plantonista/equipe e Status final)
5. OBSERVAÇÕES FINAIS E CHECKLIST DE ENCERRAMENTO (Status da sequência de desligamento: PCs -> Qu-16 Shutdown -> Câmeras User 1 -> Gerenciador 2 -> Gerenciador 1; Devolução dos 25 rádios FM de cada auditório; guarda de microfones no gaveteiro e recomendações para o próximo evento).

Formate o texto com elegância formal, cabeçalho limpo, pronto para cópia ou envio ao Superintendente do Salão e Betel.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    return res.json({ report: response.text });
  } catch (error: any) {
    console.error('Error in /api/generate-report:', error);
    return res.status(500).json({ 
      error: 'Erro ao gerar relatório com IA.',
      details: error?.message || 'Falha desconhecida'
    });
  }
});

// Vite or Static file serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mairipora AV Assistant] Server running on port ${PORT}`);
  });
}

setupServer();
