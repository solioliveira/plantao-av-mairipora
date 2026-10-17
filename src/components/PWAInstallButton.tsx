import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

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
    <button
      onClick={() => {
        alert(
          'Para instalar este aplicativo no seu navegador:\n\n' +
            '• No Chrome/Edge: Clique no ícone de instalação na barra de endereços (ou Menu > Instalar).\n' +
            '• No Safari iOS: Compartilhar > Adicionar à Tela de Início.\n\n' +
            'O app ficará disponível 100% offline para plantões com queda de rede!'
        );
      }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors shrink-0"
    >
      <Download className="w-3.5 h-3.5 text-emerald-400" />
      <span>Instalar App</span>
    </button>
  );
};
