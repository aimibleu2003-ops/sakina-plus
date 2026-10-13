import React, { useRef, useState, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface VoiceRecorderCardProps {
  onAudioReady: (audioBase64: string, audioMimeType: string, duration: number) => void;
  onClearAudio: () => void;
  isAnalyzing: boolean;
}

export const VoiceRecorderCard: React.FC<VoiceRecorderCardProps> = ({
  onAudioReady,
  onClearAudio,
  isAnalyzing,
}) => {
  const {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    audioBase64,
    audioMimeType,
    duration,
    volumeLevel,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Notify parent when audio is recorded
  useEffect(() => {
    if (audioBase64 && audioMimeType && !isRecording) {
      onAudioReady(audioBase64, audioMimeType, duration);
    }
  }, [audioBase64, audioMimeType, isRecording, duration, onAudioReady]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current || !audioUrl) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleReset = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    }
    cancelRecording();
    onClearAudio();
  };

  // Generate waveform bars based on volume level
  const waveformBars = Array.from({ length: 18 }).map((_, i) => {
    // Dynamic height based on current volumeLevel and position wave
    const wave = Math.sin((i / 18) * Math.PI) * 0.4 + 0.6;
    const heightPercent = isRecording && !isPaused
      ? Math.max(15, Math.min(100, Math.round((volumeLevel * wave + Math.random() * 0.15) * 100)))
      : 15;
    return heightPercent;
  });

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl relative overflow-hidden">
      {/* Decorative subtle ambient glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center text-center relative z-10">
        {/* Title & Comforting Prompt */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/40 text-emerald-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>مساحة آمنة وخاصة بالكامل</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 font-cairo">
            اشكُ همّك بالصوت.. أفرغ ما في صدرك
          </h2>
          <p className="text-sm text-stone-400 mt-1 max-w-md mx-auto">
            لا تتردد ولا تخف من البكاء أو الارتباك، الذكاء الاصطناعي يستمع لنبرتك ومحتواك ليحلل ألمك ويربطه بآيات الشفاء.
          </p>
        </div>

        {/* Error message if mic permission is blocked */}
        {error && (
          <div className="w-full max-w-md mb-5 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-2.5 text-right">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Audio Visualizer / Waveform when recording */}
        {isRecording && (
          <div className="w-full max-w-xs h-14 flex items-center justify-center gap-1 mb-6 px-4 py-2 rounded-2xl bg-stone-900/60 border border-stone-800">
            {waveformBars.map((height, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-gradient-to-t from-emerald-500 to-amber-300 rounded-full transition-all duration-75"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        )}

        {/* Central Record Button with Animated Ripples */}
        {!audioUrl ? (
          <div className="relative mb-6">
            {/* Glowing ripple effects when recording */}
            {isRecording && !isPaused && (
              <>
                <div className="absolute inset-0 -m-3 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <div className="absolute inset-0 -m-6 rounded-full bg-amber-500/10 animate-pulse" />
              </>
            )}

            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isAnalyzing}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-700 hover:from-emerald-500 hover:to-amber-600 text-white shadow-2xl shadow-emerald-900/60 flex flex-col items-center justify-center gap-1.5 border-2 border-emerald-400/30 transition-transform active:scale-95 disabled:opacity-50 group cursor-pointer"
              >
                <Mic className="w-8 h-8 text-amber-200 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-emerald-100">
                  اضغط للبوح
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                {/* Pause / Resume */}
                <button
                  type="button"
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="w-12 h-12 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center justify-center transition-all cursor-pointer"
                  title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
                >
                  {isPaused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
                </button>

                {/* Stop & Finish Button */}
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-rose-700 via-rose-800 to-amber-800 hover:from-rose-600 hover:to-amber-700 text-white shadow-2xl shadow-rose-950/80 flex flex-col items-center justify-center gap-1.5 border-2 border-rose-400/40 transition-transform active:scale-95 cursor-pointer"
                  title="إنهاء التسجيل"
                >
                  <Square className="w-7 h-7 text-amber-200 fill-amber-200" />
                  <span className="text-[11px] font-semibold text-rose-100">
                    إنهاء البوح
                  </span>
                </button>

                {/* Cancel / Discard */}
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="w-12 h-12 rounded-full bg-stone-800/80 hover:bg-rose-950/60 text-stone-400 hover:text-rose-300 border border-stone-700 flex items-center justify-center transition-all cursor-pointer"
                  title="إلغاء التسجيل"
                >
                  <MicOff className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Preview Player & Confirmation when Audio is Recorded */
          <div className="w-full max-w-md bg-stone-900/90 rounded-2xl p-5 border border-emerald-600/30 mb-6 shadow-xl text-right">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                تم تسجيل صوتك بنجاح ({formatTime(duration)})
              </span>
              <button
                type="button"
                onClick={handleReset}
                disabled={isAnalyzing}
                className="text-xs text-stone-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة التسجيل
              </button>
            </div>

            {/* Custom Audio Player Bar */}
            <div className="flex items-center gap-3 bg-stone-950/80 p-3 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={togglePreviewPlay}
                className="w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              >
                {isPlayingPreview ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              <div className="flex-1">
                <p className="text-xs font-medium text-stone-200">
                  استمع لما سجلته قبل الإرسال
                </p>
                <p className="text-[11px] text-stone-400">
                  {isPlayingPreview ? 'جارٍ التشغيل الآن...' : 'جاهز للتحليل النفسي واستنباط الآيات'}
                </p>
              </div>

              <audio
                ref={previewAudioRef}
                src={audioUrl}
                onEnded={() => setIsPlayingPreview(false)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Live Timer or Status indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 text-stone-300 font-mono text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>{isPaused ? 'التسجيل موقوف مؤقتاً' : 'جارٍ الاستماع إليك...'}</span>
            <span className="font-bold text-amber-300">({formatTime(duration)})</span>
          </div>
        )}

        {!isRecording && !audioUrl && (
          <p className="text-xs text-stone-400">
            يمكنك التحدث بالعامية أو الفصحى، بكل عفوية وصدق.
          </p>
        )}
      </div>
    </div>
  );
};
