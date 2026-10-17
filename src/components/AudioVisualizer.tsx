import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, Activity, AlertTriangle, CheckCircle, ShieldCheck, Calculator, Sparkles, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface AudioVisualizerProps {
  currentCategory?: 'voz' | 'musica';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ currentCategory = 'voz' }) => {
  const [mode, setMode] = useState<'simulated' | 'mic'>('simulated');
  const [currentDb, setCurrentDb] = useState<number>(73);
  const [clarityDb, setClarityDb] = useState<number>(0.2); // centered at 0 dB
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedTarget, setSelectedTarget] = useState<'voz' | 'musica'>(currentCategory);
  const [peakDb, setPeakDb] = useState<number>(75);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [refSpl, setRefSpl] = useState<number>(75);
  const [distFront, setDistFront] = useState<number>(8);
  const [distBack, setDistBack] = useState<number>(32);
  const [hasDelaySpeakers, setHasDelaySpeakers] = useState<boolean>(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Target ranges:
  // Voice: 70 - 77 dB
  // Music: 80 dB
  const targetMin = selectedTarget === 'voz' ? 70 : 78;
  const targetMax = selectedTarget === 'voz' ? 77 : 82;
  const targetIdeal = selectedTarget === 'voz' ? 74 : 80;

  // Real mic audio capture
  const startMicCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      setMode('mic');

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Map to realistic SPL dB (roughly 45 to 88 dB scale)
        const normalized = Math.min(100, Math.max(0, rms));
        const estimatedDb = Math.round(50 + (normalized / 255) * 45);

        setCurrentDb(estimatedDb);
        setPeakDb((prev) => Math.max(prev, estimatedDb));

        // Clarity M relative reading
        const relativeClarity = Number(((estimatedDb - 74) / 4).toFixed(1));
        setClarityDb(relativeClarity);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported, continuing in simulated mode.', err);
      setMode('simulated');
      setIsListening(false);
    }
  };

  const stopMicCapture = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setMode('simulated');
  };

  useEffect(() => {
    return () => {
      stopMicCapture();
    };
  }, []);

  // Determine status color
  const isWithinTarget = currentDb >= targetMin && currentDb <= targetMax;
  const isBelowTarget = currentDb < targetMin;
  const isAboveTarget = currentDb > targetMax;

  // Clarity M rules:
  // Operational reference: 0 dB
  // Acceptable band: -6 to +6 dB
  // Limit: Avoid exceeding -18 dB on external circumference
  const isClarityOk = clarityDb >= -6 && clarityDb <= +6;
  const isClarityExtreme = clarityDb > 6 || clarityDb < -12;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
              Medição Acústica & TC Clarity M
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                CO-160-T
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Auditório: Alvo 70–77 dB (Voz) e 80 dB (Música) • Referência 0 dB no Clarity
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 text-xs">
          {mode === 'mic' && isListening ? (
            <button
              onClick={stopMicCapture}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              Microfone Ativo (Parar)
            </button>
          ) : (
            <button
              onClick={startMicCapture}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
              title="Permite que o assistente do operador use o celular como decibelímetro no auditório"
            >
              <Mic className="w-3.5 h-3.5" />
              Usar Microfone do Dispositivo
            </button>
          )}

          <div className="flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700">
            <button
              onClick={() => {
                setSelectedTarget('voz');
                if (mode === 'simulated') setCurrentDb(74);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                selectedTarget === 'voz'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Voz (70–77 dB)
            </button>
            <button
              onClick={() => {
                setSelectedTarget('musica');
                if (mode === 'simulated') setCurrentDb(80);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                selectedTarget === 'musica'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Música/Vídeo (80 dB)
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Meters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decibelímetro Auditório */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">Decibelímetro (Auditório)</span>
            </div>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                isWithinTarget
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isBelowTarget
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
              }`}
            >
              {isWithinTarget ? 'Nível Ideal' : isBelowTarget ? 'Abaixo do Alvo' : 'Atenção: Muito Alto!'}
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-center gap-2">
            <span
              className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${
                isWithinTarget ? 'text-emerald-400' : isBelowTarget ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {currentDb}
            </span>
            <span className="text-sm font-semibold text-slate-500">dB SPL</span>
            <span className="text-xs text-slate-500 ml-2">Pico: {peakDb} dB</span>
          </div>

          {/* Bar Gauge */}
          <div className="space-y-1.5">
            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              {/* Target zone highlight */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                style={{
                  left: `${((targetMin - 50) / 45) * 100}%`,
                  width: `${((targetMax - targetMin) / 45) * 100}%`,
                }}
              />
              {/* Level indicator */}
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  isWithinTarget
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : isBelowTarget
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-rose-500 to-rose-400'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, ((currentDb - 50) / 45) * 100))}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50 dB</span>
              <span className="text-emerald-400 font-semibold">
                Alvo {selectedTarget === 'voz' ? '70-77' : '80'} dB
              </span>
              <span>95 dB</span>
            </div>
          </div>

          {/* Manual control if simulated */}
          {mode === 'simulated' && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Simulador dB:</span>
              <input
                type="range"
                min="55"
                max="90"
                value={currentDb}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentDb(val);
                  setPeakDb((prev) => Math.max(prev, val));
                  setClarityDb(Number(((val - 74) / 4).toFixed(1)));
                }}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Medidor TC Clarity M */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300">Medidor TC Clarity M (Bancada)</span>
            </div>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                isClarityOk
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {isClarityOk ? 'Faixa Adequada (-6 a +6 dB)' : 'Ajustar Nível'}
            </span>
          </div>

          <div className="my-2 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${
                  isClarityOk ? 'text-cyan-400' : 'text-rose-400'
                }`}
              >
                {clarityDb > 0 ? `+${clarityDb}` : clarityDb}
              </span>
              <span className="text-sm font-semibold text-slate-500">dB FS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
              Referência do Salão: <strong>0 dB</strong> • Nível &apos;TEST&apos;
            </p>
          </div>

          {/* Clarity Circular Warning Banner */}
          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Regra de Operação do Clarity:</strong>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Manter modulação na faixa de <strong>-6 a +6 dB</strong>. Evitar rigorosamente ultrapassar a marca de{' '}
                <strong className="text-amber-400">-18</strong> na circunferência externa do visor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Acoustic Coverage Calculator & CO-160-T Reference */}
      <div className="pt-1">
        <button
          onClick={() => setShowCalculator((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-slate-100 font-bold">Calculadora Acústica de Cobertura & Padrões CO-160-T</div>
              <div className="text-[11px] text-slate-400 font-normal">Estime a queda de SPL no fundo do auditório e confira os limites de conforto acústico</div>
            </div>
          </div>
          {showCalculator ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showCalculator && (
          <div className="mt-3 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl animate-in fade-in duration-200">
            {/* Interactive Calculator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Simulador de Pressão Sonora no Fundo do Auditório
                </span>
                <span className="text-[11px] text-slate-400">Lei do Inverso do Quadrado + Delay DBX</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Reference SPL */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="text-slate-400 font-medium block">SPL na Tribuna / Frente:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={65}
                      max={85}
                      value={refSpl}
                      onChange={(e) => setRefSpl(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <span className="font-bold text-emerald-400 text-sm w-12 text-right">{refSpl} dB</span>
                  </div>
                </div>

                {/* Front Distance */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="text-slate-400 font-medium block">Distância Frente / PA:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={4}
                      max={15}
                      value={distFront}
                      onChange={(e) => setDistFront(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <span className="font-bold text-slate-200 text-sm w-12 text-right">{distFront} m</span>
                  </div>
                </div>

                {/* Back Distance */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="text-slate-400 font-medium block">Distância Fundo Auditório:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={15}
                      max={50}
                      value={distBack}
                      onChange={(e) => setDistBack(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <span className="font-bold text-slate-200 text-sm w-12 text-right">{distBack} m</span>
                  </div>
                </div>
              </div>

              {/* Delay Speakers Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-200 font-semibold block">Linha de Caixas de Delay Ativa (DBX Venu360)</span>
                  <span className="text-slate-400 text-[11px]">Compensa atenuação natural nas últimas fileiras com atraso de milissegundos alinhado.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasDelaySpeakers((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    hasDelaySpeakers
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {hasDelaySpeakers ? 'DELAY LIGADO' : 'SEM DELAY (CAMPO LIVRE)'}
                </button>
              </div>

              {/* Calculation Result */}
              {(() => {
                const theoreticalDrop = 20 * Math.log10(Math.max(1, distBack) / Math.max(1, distFront));
                const estimatedSpl = hasDelaySpeakers
                  ? Math.round(refSpl - Math.min(3, theoreticalDrop * 0.25))
                  : Math.round(refSpl - theoreticalDrop);
                const isAcceptable = estimatedSpl >= 70 && estimatedSpl <= 77;

                return (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Nível Estimado Chegando ao Fundo:</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className={`text-2xl font-black ${isAcceptable ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {estimatedSpl} dB SPL
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({hasDelaySpeakers ? `Queda suave de ~${refSpl - estimatedSpl} dB com reforço de delay` : `Queda acústica de ~${Math.round(theoreticalDrop)} dB sem delay`})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isAcceptable
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {isAcceptable ? '✓ Dentro da Faixa Alvo (70-77 dB)' : 'Atenção: Compensar na mesa Qu-16'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* CO-160-T Target Reference Table */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Tabela Oficial de Referência de Pressão Sonora (CO-160-T)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Discursos / Fala</span>
                  <div className="text-emerald-400 font-extrabold text-sm mt-0.5">70 a 77 dB SPL</div>
                  <p className="text-[10px] text-slate-400 mt-1">Alvo ideal: 73 a 75 dB. Medir no centro do auditório.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Cânticos & Vídeos</span>
                  <div className="text-cyan-400 font-extrabold text-sm mt-0.5">78 a 80 dB SPL</div>
                  <p className="text-[10px] text-slate-400 mt-1">Máximo de 80 dB. Evitar que música abafe canto da congregação.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Mesa TC Clarity M</span>
                  <div className="text-blue-400 font-extrabold text-sm mt-0.5">0 dB FS (Ref)</div>
                  <p className="text-[10px] text-slate-400 mt-1">Faixa aceitável de -6 a +6 dB. Não ultrapassar -18 na circunferência.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/30">
                  <span className="text-[10px] text-rose-400 font-semibold block uppercase">Alerta de Fadiga</span>
                  <div className="text-rose-400 font-extrabold text-sm mt-0.5">&gt; 82 dB SPL</div>
                  <p className="text-[10px] text-slate-400 mt-1">Desconforto para idosos e crianças. Reduzir fader Master imediatamente.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
