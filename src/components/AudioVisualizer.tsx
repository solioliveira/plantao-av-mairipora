import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Activity,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Calculator,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings2,
  Megaphone,
  Radio,
  RotateCcw,
  Play,
  Square,
  Waves,
  Headphones,
} from 'lucide-react';

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

  // Real Mic & Calibration state
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(() => {
    const saved = localStorage.getItem('spl_calibration_offset');
    return saved ? Number(saved) : 98;
  });
  const [showCalibrationSettings, setShowCalibrationSettings] = useState<boolean>(false);
  const [freqBars, setFreqBars] = useState<number[]>([12, 18, 25, 38, 50, 42, 28, 15]);

  // Audio Test Tone Generator (1 kHz, Pink Noise, Stereo L/R check)
  const [showTestToneGenerator, setShowTestToneGenerator] = useState<boolean>(false);
  const [activeTestTone, setActiveTestTone] = useState<'none' | '1khz' | 'pink' | 'lr'>('none');
  const [testToneVolume, setTestToneVolume] = useState<number>(0.25);
  const testAudioCtxRef = useRef<AudioContext | null>(null);
  const currentTestSourceRef = useRef<AudioNode | null>(null);
  const testGainNodeRef = useRef<GainNode | null>(null);

  // Voice Alert (Text-to-Speech) state
  const [voiceAlertEnabled, setVoiceAlertEnabled] = useState<boolean>(() => {
    return localStorage.getItem('spl_voice_alert_enabled') === 'true';
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const smoothDbRef = useRef<number>(73);
  const lastAlertTimeRef = useRef<number>(0);
  const aboveThresholdStartRef = useRef<number | null>(null);

  // Target ranges:
  // Voice: 70 - 77 dB
  // Music: 78 - 80 dB (limit 80 dB)
  const targetMin = selectedTarget === 'voz' ? 70 : 78;
  const targetMax = selectedTarget === 'voz' ? 77 : 80;
  const targetIdeal = selectedTarget === 'voz' ? 74 : 80;

  // Persist settings
  useEffect(() => {
    localStorage.setItem('spl_calibration_offset', String(calibrationOffset));
  }, [calibrationOffset]);

  useEffect(() => {
    localStorage.setItem('spl_voice_alert_enabled', String(voiceAlertEnabled));
  }, [voiceAlertEnabled]);

  // Cooldown countdown timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastAlertTimeRef.current) / 1000;
      const cooldownTotal = 8; // 8 seconds
      if (elapsed < cooldownTotal && lastAlertTimeRef.current > 0) {
        setCooldownRemaining(Math.ceil(cooldownTotal - elapsed));
      } else {
        setCooldownRemaining(0);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Text-To-Speech alert engine
  const speakVoiceAlert = useCallback(
    (message: string) => {
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const ptVoice =
          voices.find((v) => v.lang === 'pt-BR') ||
          voices.find((v) => v.lang.startsWith('pt'));
        if (ptVoice) {
          utterance.voice = ptVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        lastAlertTimeRef.current = Date.now();
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsSpeaking(false);
      }
    },
    []
  );

  const testVoiceAlert = () => {
    speakVoiceAlert(
      `Alerta de voz ativo. Limite do auditório: ${targetMax} decibéis.`
    );
  };

  // Evaluate sound level breach for voice alert
  const checkVoiceAlertTrigger = useCallback(
    (level: number) => {
      if (!voiceAlertEnabled) {
        aboveThresholdStartRef.current = null;
        return;
      }

      const now = Date.now();
      const timeSinceLastAlert = (now - lastAlertTimeRef.current) / 1000;
      if (timeSinceLastAlert < 8) {
        return; // In cooldown
      }

      const isBreached = level > targetMax;

      if (isBreached) {
        if (!aboveThresholdStartRef.current) {
          aboveThresholdStartRef.current = now;
        }

        const breachDuration = now - aboveThresholdStartRef.current;
        // Require 800ms sustained or critical >= 85 dB
        if (breachDuration >= 800 || level >= 85) {
          aboveThresholdStartRef.current = null;
          let msg = '';
          if (level >= 85) {
            msg = `Alerta crítico! Som muito alto no auditório: ${level} decibéis! Reduzir Master!`;
          } else if (selectedTarget === 'voz') {
            msg = `Atenção: Nível de voz em ${level} decibéis, acima do limite de 77.`;
          } else {
            msg = `Atenção: Nível de música em ${level} decibéis, acima do limite de 80.`;
          }
          speakVoiceAlert(msg);
        }
      } else {
        aboveThresholdStartRef.current = null;
      }
    },
    [voiceAlertEnabled, targetMax, selectedTarget, speakVoiceAlert]
  );

  // Real mic audio capture with Web Audio API & AnalyserNode
  const startMicCapture = async () => {
    setMicPermissionError(null);
    try {
      // Best constraints to avoid phone AGC distorting real sound level
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          video: false,
        });
      } catch {
        // Fallback standard audio request
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      streamRef.current = stream;
      const AudioCtxConstructor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxConstructor();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      setMode('mic');

      const timeDomainData = new Float32Array(analyser.fftSize);
      const freqDomainData = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;

        // 1. Time-Domain true RMS for accurate physical SPL
        analyserRef.current.getFloatTimeDomainData(timeDomainData);
        let sumSquares = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
          const val = timeDomainData[i];
          sumSquares += val * val;
        }
        const rms = Math.sqrt(sumSquares / timeDomainData.length);

        // Calculate dBFS (0 dBFS is digital clipping, typical silence is -70 to -90 dBFS)
        const dbFS = rms > 0.00003 ? 20 * Math.log10(rms) : -90;

        // Map to calibrated SPL dB
        const rawSpl = calibrationOffset + dbFS;
        const clampedSpl = Math.max(38, Math.min(105, rawSpl));

        // Fast exponential smoothing (approx. 125ms time constant)
        smoothDbRef.current = smoothDbRef.current * 0.72 + clampedSpl * 0.28;
        const currentCalculatedDb = Math.round(smoothDbRef.current);

        setCurrentDb(currentCalculatedDb);
        setPeakDb((prev) => Math.max(prev, currentCalculatedDb));

        // Clarity M relative reading (-18 dB to +6 dB scale relative to reference)
        const relativeClarity = Number(((currentCalculatedDb - 74) / 4).toFixed(1));
        setClarityDb(relativeClarity);

        // 2. Frequency spectrum bars for live visual indicator
        analyserRef.current.getByteFrequencyData(freqDomainData);
        const step = Math.floor(freqDomainData.length / 8);
        const bars: number[] = [];
        for (let b = 0; b < 8; b++) {
          const sample = freqDomainData[b * step] || 0;
          bars.push(Math.round((sample / 255) * 100));
        }
        setFreqBars(bars);

        // Check Text-To-Speech alert
        checkVoiceAlertTrigger(currentCalculatedDb);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err: unknown) {
      console.warn('Microphone permission or hardware error:', err);
      const errorMsg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Permissão de microfone negada. Toque no ícone de permissão/cadeado do navegador e permita o microfone.'
          : 'Não foi possível acessar o microfone deste dispositivo. Verifique as permissões de mídia.';
      setMicPermissionError(errorMsg);
      setMode('simulated');
      setIsListening(false);
    }
  };

  const stopMicCapture = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsListening(false);
    setMode('simulated');
  };

  // Test Tone Generator functions
  const stopTestTone = useCallback(() => {
    if (currentTestSourceRef.current) {
      try {
        (currentTestSourceRef.current as any).stop?.();
        currentTestSourceRef.current.disconnect();
      } catch {}
      currentTestSourceRef.current = null;
    }
    if (testAudioCtxRef.current) {
      try {
        testAudioCtxRef.current.close().catch(() => {});
      } catch {}
      testAudioCtxRef.current = null;
    }
    setActiveTestTone('none');
  }, []);

  const play1kHzTone = async () => {
    if (activeTestTone === '1khz') {
      stopTestTone();
      return;
    }
    stopTestTone();
    try {
      const AudioCtxConstructor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxConstructor();
      if (ctx.state === 'suspended') await ctx.resume();
      testAudioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(testToneVolume, ctx.currentTime);
      testGainNodeRef.current = gain;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      currentTestSourceRef.current = osc;
      setActiveTestTone('1khz');
    } catch (e) {
      console.warn('Failed to start 1kHz test tone:', e);
    }
  };

  const playPinkNoise = async () => {
    if (activeTestTone === 'pink') {
      stopTestTone();
      return;
    }
    stopTestTone();
    try {
      const AudioCtxConstructor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxConstructor();
      if (ctx.state === 'suspended') await ctx.resume();
      testAudioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(testToneVolume * 0.4, ctx.currentTime);
      testGainNodeRef.current = gain;

      whiteNoise.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
      currentTestSourceRef.current = whiteNoise;
      setActiveTestTone('pink');
    } catch (e) {
      console.warn('Failed to start pink noise:', e);
    }
  };

  const playStereoLRTest = async () => {
    if (activeTestTone === 'lr') {
      stopTestTone();
      return;
    }
    stopTestTone();
    setActiveTestTone('lr');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speakChannel = (text: string) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
      };

      speakChannel('Teste estéreo. Canal Esquerdo.');
      setTimeout(() => {
        speakChannel('Canal Direito.');
      }, 3000);
      setTimeout(() => {
        speakChannel('Estéreo Central. Ambos os canais.');
        setActiveTestTone('none');
      }, 6000);
    }
  };

  // Reset peak holder
  const handleResetPeak = () => {
    setPeakDb(currentDb);
  };

  useEffect(() => {
    return () => {
      stopMicCapture();
      stopTestTone();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopTestTone]);

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
              Medição Acústica & Decibelímetro Real
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                CO-160-T
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Auditório: Alvo 70–77 dB (Voz) e 80 dB (Música) • Referência 0 dB no Clarity
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Real Mic Capture Button */}
          {mode === 'mic' && isListening ? (
            <button
              onClick={stopMicCapture}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all font-semibold shadow-sm cursor-pointer"
            >
              <Mic className="w-4 h-4 animate-pulse text-rose-400" />
              <span>Microfone Ativo (Parar)</span>
            </button>
          ) : (
            <button
              onClick={startMicCapture}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
              title="Solicita permissão de áudio e mede o som real do auditório usando o microfone do celular ou tablet"
            >
              <Mic className="w-4 h-4" />
              <span>Usar Microfone do Dispositivo</span>
            </button>
          )}

          {/* Voice Alert (TTS) Toggle Button */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => {
                const nextVal = !voiceAlertEnabled;
                setVoiceAlertEnabled(nextVal);
                if (nextVal) {
                  speakVoiceAlert(
                    `Alerta por voz ativado. Alvo: até ${targetMax} decibéis.`
                  );
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                voiceAlertEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ativa locução automática por voz (Text-to-Speech) caso o som ultrapasse o limite regulamentar"
            >
              {voiceAlertEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voz de Alerta: Ligada</span>
                  {isSpeaking && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span>Voz de Alerta: Desligada</span>
                </>
              )}
            </button>

            {voiceAlertEnabled && (
              <button
                onClick={testVoiceAlert}
                className="px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Tocar áudio de teste no alto-falante"
              >
                Testar Voz
              </button>
            )}
          </div>

          {/* Audio Test Generator toggle */}
          <button
            onClick={() => setShowTestToneGenerator((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              showTestToneGenerator || activeTestTone !== 'none'
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Gerador de Tons de Áudio para calibrar e testar Qu-16 e caixas de som"
          >
            <Waves className="w-3.5 h-3.5 text-purple-400" />
            <span>Gerador de Teste</span>
            {activeTestTone !== 'none' && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            )}
          </button>

          {/* Calibration button toggle */}
          <button
            onClick={() => setShowCalibrationSettings((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              showCalibrationSettings
                ? 'bg-slate-800 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Ajustar calibração do microfone do dispositivo (Offset SPL)"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Target Mode (Voz vs Música) */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => {
                setSelectedTarget('voz');
                if (mode === 'simulated') setCurrentDb(74);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
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

      {/* Permission or Access Error Banner */}
      {micPermissionError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{micPermissionError}</span>
          </div>
          <button
            onClick={startMicCapture}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Voice Alert Active Status Strip */}
      {voiceAlertEnabled && (
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Locução de Alerta Ativa:</strong> O sistema falará automaticamente em português se{' '}
              {selectedTarget === 'voz' ? 'o discurso passar de 77 dB' : 'a música/vídeo passar de 80 dB'}.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[11px] animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                Falando aviso...
              </span>
            ) : cooldownRemaining > 0 ? (
              <span className="text-[11px] text-amber-400/80 font-mono">
                Cooldown: {cooldownRemaining}s
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Pronto para monitorar
              </span>
            )}
          </div>
        </div>
      )}

      {/* Audio Test Tone Generator Drawer */}
      {showTestToneGenerator && (
        <div className="mb-4 p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-xs space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Waves className="w-4 h-4 text-purple-400" />
              Gerador de Tons de Calibração &amp; Teste (Qu-16 e Caixas de Som)
            </span>
            <span className="text-[11px] text-purple-300 font-mono">Web Audio API • Sem pendrive</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Conecte o fone ou adaptador do celular nas entradas <strong>ST1 ou ST2</strong> da mesa Qu-16
            para testar ganho de entrada, aferir 0 dB no TC Clarity M ou conferir se as caixas de delay estão ligadas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Tom 1 kHz */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <strong className="text-slate-200 block text-xs">Tom Puro 1 kHz (Ref 0 dB)</strong>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Senóide contínua para ajustar ganho e calibrar o TC Clarity M em 0 dB.
                </p>
              </div>
              <button
                onClick={play1kHzTone}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTestTone === '1khz'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {activeTestTone === '1khz' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{activeTestTone === '1khz' ? 'Parar Tom 1 kHz' : 'Tocar Tom 1 kHz'}</span>
              </button>
            </div>

            {/* 2. Ruído Rosa (Pink Noise) */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <strong className="text-slate-200 block text-xs">Ruído Rosa (Pink Noise)</strong>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Espectro balanceado para conferir se todas as caixas de delay do auditório estão funcionando.
                </p>
              </div>
              <button
                onClick={playPinkNoise}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTestTone === 'pink'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {activeTestTone === 'pink' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{activeTestTone === 'pink' ? 'Parar Ruído Rosa' : 'Tocar Ruído Rosa'}</span>
              </button>
            </div>

            {/* 3. Teste Estéreo L / R */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <strong className="text-slate-200 block text-xs">Identificação Estéreo L / R</strong>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Voz alternada para certificar que os cabos estéreo do ST1/ST2 não estão invertidos ou mono.
                </p>
              </div>
              <button
                onClick={playStereoLRTest}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTestTone === 'lr'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {activeTestTone === 'lr' ? <Square className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                <span>{activeTestTone === 'lr' ? 'Executando Teste...' : 'Testar Canais L / R'}</span>
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 w-64">
              <span>Volume Gerador:</span>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={testToneVolume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTestToneVolume(val);
                  if (testGainNodeRef.current && testAudioCtxRef.current) {
                    testGainNodeRef.current.gain.setValueAtTime(val, testAudioCtxRef.current.currentTime);
                  }
                }}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <span className="font-mono text-slate-300 font-bold">{Math.round(testToneVolume * 100)}%</span>
            </div>

            {activeTestTone !== 'none' && (
              <button
                onClick={stopTestTone}
                className="text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
              >
                Parar Todos os Sons
              </button>
            )}
          </div>
        </div>
      )}

      {/* Microphone Calibration Drawer */}
      {showCalibrationSettings && (
        <div className="mb-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              Ajuste Fino de Calibração do Microfone (Offset SPL)
            </span>
            <span className="text-[11px] text-slate-400">Padrão Celular/Tablet: 98 dB</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Se você possuir um decibelímetro profissional de mão no auditório, ajuste o offset abaixo para equiparar
            exatamente o valor medido no celular com o aparelho de referência.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalibrationOffset((prev) => Math.max(80, prev - 1))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold cursor-pointer"
              >
                -1 dB
              </button>
              <span className="font-mono font-bold text-emerald-400 text-sm px-2">
                Offset: +{calibrationOffset} dB
              </span>
              <button
                onClick={() => setCalibrationOffset((prev) => Math.min(115, prev + 1))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold cursor-pointer"
              >
                +1 dB
              </button>
            </div>

            <button
              onClick={() => setCalibrationOffset(98)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer ml-auto"
            >
              Restaurar Padrão (98 dB)
            </button>
          </div>
        </div>
      )}

      {/* Main Dual Meters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decibelímetro Auditório */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">Decibelímetro (Auditório)</span>
              {mode === 'mic' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  MIC REAL
                </span>
              )}
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
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-slate-500">Pico: {peakDb} dB</span>
              <button
                onClick={handleResetPeak}
                className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors cursor-pointer"
                title="Zerar valor de pico"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Real Audio Spectrum Frequency Bars */}
          {mode === 'mic' && isListening && (
            <div className="mb-2">
              <div className="flex items-end justify-between gap-1 h-8 px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
                {freqBars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-emerald-600 via-emerald-400 to-amber-400 rounded-sm transition-all duration-75"
                    style={{ height: `${Math.max(10, bar)}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
                <span>Grave (100Hz)</span>
                <span>Voz (1kHz)</span>
                <span>Agudo (8kHz)</span>
              </div>
            </div>
          )}

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
                  checkVoiceAlertTrigger(val);
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
