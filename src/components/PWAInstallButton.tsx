import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGenericGuide, setShowGenericGuide] = useState(false);

  // If already running in standalone mode (already installed), show offline badge
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Instalado (Offline Ativo)</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
        title="Instalar no dispositivo para acesso offline completo mesmo sem rede"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App Offline</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors shrink-0"
          title="Instalar no iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instalar no iPad/iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Smartphone className="w-5 h-5" />
                  <h3>Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <p>
                  Para usar o assistente sem conexão à internet no Salão de Mairiporã:
                </p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">1.</span>
                    <span>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) no Safari.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">2.</span>
                    <span>Role para baixo e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">3.</span>
                    <span>Confirme em <strong>Adicionar</strong> no canto superior direito.</span>
                  </p>
                </div>
                <p className="text-[11px] text-slate-400">
                  O aplicativo funcionará instantaneamente em tela cheia mesmo se a rede do salão cair!
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowGenericGuide(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
        title="Instalar App no dispositivo para acesso 100% offline"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>

      {showGenericGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">Fixar Atalho / Instalar App</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Acesso Instantâneo 100% Offline</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenericGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed text-slate-300">
                Instale o aplicativo no seu smartphone ou tablet de plantão para garantir abertura instantânea em tela cheia e consulta ao troubleshooting mesmo com queda total da rede no Salão de Mairiporã:
              </p>

              {/* Android / Chrome / Edge */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>No Chrome / Celular Android / Computador</span>
                </div>
                <p className="text-slate-300 pl-4 text-[11.5px] leading-relaxed">
                  Toque nos <strong>três pontinhos ⋮</strong> do navegador no canto superior direito e selecione <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.
                </p>
              </div>

              {/* iOS / iPhone / iPad */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>No iPhone / iPad (Safari)</span>
                </div>
                <p className="text-slate-300 pl-4 text-[11.5px] leading-relaxed">
                  Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima) na barra inferior e escolha <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Todos os manuais, presets de câmeras, frequências FM e roteamento Qu-16 já estão pré-carregados no cache.</span>
              </div>
            </div>

            <button
              onClick={() => setShowGenericGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              Compreendi, Fechar Instruções
            </button>
          </div>
        </div>
      )}
    </>
  );
};
