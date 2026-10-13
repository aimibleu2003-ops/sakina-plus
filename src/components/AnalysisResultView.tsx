import React, { useState, useRef } from 'react';
import {
  Heart,
  Sparkles,
  BookOpen,
  Volume2,
  Copy,
  Check,
  Share2,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Activity,
  Brain,
  ShieldCheck,
  Compass,
  Smile,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import { GuidanceResult } from '../types';
import { QuranReciterPlayer } from './QuranReciterPlayer';

interface AnalysisResultViewProps {
  result: GuidanceResult;
  onReset: () => void;
  onSaveToJournal: (result: GuidanceResult, score?: number) => void;
  isSaved: boolean;
  onTriggerBreathing: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  result,
  onReset,
  onSaveToJournal,
  isSaved,
  onTriggerBreathing,
}) => {
  const [copiedDuaa, setCopiedDuaa] = useState(false);
  const [copiedTranscription, setCopiedTranscription] = useState(false);
  const [moodScore, setMoodScore] = useState<number | undefined>(result.postMoodScore);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const { transcription, emotionalAnalysis, quranicGuidance, practicalRemedies } = result;

  const handleCopyDuaa = () => {
    navigator.clipboard.writeText(quranicGuidance.propheticDuaa.duaaArabic);
    setCopiedDuaa(true);
    setTimeout(() => setCopiedDuaa(false), 2000);
  };

  const handleCopyTranscription = () => {
    navigator.clipboard.writeText(transcription);
    setCopiedTranscription(true);
    setTimeout(() => setCopiedTranscription(false), 2000);
  };

  const handleSelectMood = (score: number) => {
    setMoodScore(score);
    onSaveToJournal(result, score);
  };

  // Generate / Play TTS of comforting counselor message
  const handleToggleTts = async () => {
    if (ttsAudioUrl && ttsAudioRef.current) {
      if (isPlayingTts) {
        ttsAudioRef.current.pause();
        setIsPlayingTts(false);
      } else {
        ttsAudioRef.current.play();
        setIsPlayingTts(true);
      }
      return;
    }

    try {
      setIsGeneratingTts(true);
      // Combine comfort affirmation and core guidance
      const script = `${quranicGuidance.heartAffirmation}. وتذكر دائماً: ${quranicGuidance.coreMessage}. ولا تنسَ دعاءك: ${quranicGuidance.propheticDuaa.duaaArabic}`;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, voiceName: 'Kore' }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        setTtsAudioUrl(audioSrc);
        setIsGeneratingTts(false);
        // Play
        setTimeout(() => {
          if (ttsAudioRef.current) {
            ttsAudioRef.current.play();
            setIsPlayingTts(true);
          }
        }, 100);
      } else {
        setIsGeneratingTts(false);
      }
    } catch (e) {
      console.error('Error generating TTS:', e);
      setIsGeneratingTts(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-right pb-16">
      {/* Top Action & Status Bar */}
      <div className="glass-panel rounded-3xl p-5 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-emerald-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100 font-cairo">
              تم احتواء شكواك بعون الله ولطفه
            </h3>
            <p className="text-xs text-stone-400">
              حللت مشاعرك نفسياً واستُنبطت لك آيات الشفاء والسكينة من كتاب الله
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => onSaveToJournal(result, moodScore)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? 'محفوظة في الدفتر' : 'حفظ الجلسة'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بوح جديد</span>
          </button>
        </div>
      </div>

      {/* Comforting Affirmation / Whisper */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-1 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-amber-300 tracking-wide uppercase mb-1">
                همسة مواساة لقلبك المحزون:
              </p>
              <p className="text-base sm:text-lg text-stone-100 font-medium leading-relaxed font-cairo">
                "{quranicGuidance.heartAffirmation}"
              </p>
            </div>
          </div>

          {/* TTS Audio Button */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={handleToggleTts}
              disabled={isGeneratingTts}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isGeneratingTts ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>جارٍ تجهيز الصوت الدافئ...</span>
                </>
              ) : isPlayingTts ? (
                <>
                  <Pause className="w-4 h-4 text-amber-300" />
                  <span>إيقاف صوت المواساة</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-300" />
                  <span>استمع لرسالة السكينة بصوت مريح</span>
                </>
              )}
            </button>
            {ttsAudioUrl && (
              <audio
                ref={ttsAudioRef}
                src={ttsAudioUrl}
                onEnded={() => setIsPlayingTts(false)}
                className="hidden"
              />
            )}
          </div>
        </div>
      </div>

      {/* 1. Transcribed User Vent */}
      <div className="glass-panel rounded-3xl p-6 border border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            ما بحتَ به واستمعنا إليه:
          </span>
          <button
            onClick={handleCopyTranscription}
            className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors"
          >
            {copiedTranscription ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTranscription ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>
        <p className="text-sm text-stone-300 leading-relaxed italic bg-stone-900/60 p-4 rounded-2xl border border-stone-800/80">
          "{transcription}"
        </p>
      </div>

      {/* 2. Empathetic Psychological Analysis */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-teal-500/20 shadow-lg space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-400" />
            <h4 className="text-lg font-bold text-stone-100 font-cairo">
              التحليل النفسي الرفيق لحالتك
            </h4>
          </div>
          <span className="text-xs text-stone-400 font-medium">
            تفكيك المشاعر وفهم الجهاز العصبي
          </span>
        </div>

        {/* Emotion Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Emotion Card */}
          <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 flex flex-col justify-between">
            <span className="text-xs text-stone-400 mb-1">الشعور الجوهري الحاضر:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-emerald-300 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800/60">
                {emotionalAnalysis.primaryEmotion}
              </span>
            </div>
            {emotionalAnalysis.cognitivePattern && (
              <p className="text-[11px] text-stone-400 mt-2">
                النمط الذهني المصاحب: <span className="text-amber-300">{emotionalAnalysis.cognitivePattern}</span>
              </p>
            )}
          </div>

          {/* Emotional Intensity Gauge */}
          <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800">
            <div className="flex justify-between items-center text-xs text-stone-400 mb-2">
              <span>شدة الثقل النفسي المقدرة:</span>
              <span className="font-mono font-bold text-amber-300">
                {emotionalAnalysis.emotionIntensity}%
              </span>
            </div>
            <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, emotionalAnalysis.emotionIntensity))}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-2">
              طبيعي جداً أن يثقل هذا الشعور صدرك؛ فالألم استجابة فطرية بشرية.
            </p>
          </div>
        </div>

        {/* Subconscious Drivers */}
        {emotionalAnalysis.subconsciousDrivers && emotionalAnalysis.subconsciousDrivers.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-stone-400 mb-2.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>جذور الشعور ومحركاته في العمق الباطني:</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emotionalAnalysis.subconsciousDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="bg-stone-900/60 rounded-xl p-3 border border-stone-800 text-xs text-stone-200 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Psychological Insight */}
        <div className="bg-stone-900/80 rounded-2xl p-4 border border-teal-500/20">
          <h5 className="text-xs font-bold text-teal-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>رؤية نفسية رحيمة (لماذا تشعر بهذا؟):</span>
          </h5>
          <p className="text-sm text-stone-300 leading-relaxed font-cairo">
            {emotionalAnalysis.psychologicalInsight}
          </p>
        </div>
      </div>

      {/* 3. Divine Quranic Guidance & Verses */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h4 className="text-lg sm:text-xl font-bold text-stone-100 font-cairo">
              بلسم القرآن الكريم لقلبك
            </h4>
          </div>
          <span className="text-xs text-amber-300 font-medium">
            "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ"
          </span>
        </div>

        {/* Core Divine Message */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-emerald-950/60 border border-amber-600/30">
          <p className="text-xs font-bold text-amber-300 mb-1">
            الرسالة الإلهية الكبرى لقلبك اليوم:
          </p>
          <p className="text-base text-stone-100 font-semibold leading-relaxed font-cairo">
            {quranicGuidance.coreMessage}
          </p>
        </div>

        {/* Verses List */}
        <div className="space-y-6">
          {quranicGuidance.verses.map((verse, idx) => (
            <div
              key={idx}
              className="bg-stone-900/90 rounded-3xl p-5 sm:p-6 border border-amber-500/30 shadow-lg space-y-4"
            >
              {/* Surah & Ayah Badge */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-200 border border-amber-600/40 text-xs font-bold">
                  {verse.surahName} • الآية {verse.ayahNumber}
                </span>
                <span className="text-[11px] text-stone-400">
                  سورة رقم ({verse.surahNumber})
                </span>
              </div>

              {/* Ayah Text in Calligraphic Quranic Font */}
              <div className="p-5 rounded-2xl bg-stone-950/80 border border-amber-500/20 text-center">
                <p className="font-quran text-xl sm:text-2xl text-amber-200 font-bold leading-loose">
                  "{verse.ayahText}"
                </p>
              </div>

              {/* Recitation Player */}
              <QuranReciterPlayer
                surahNumber={verse.surahNumber}
                ayahNumber={verse.ayahNumber}
                surahName={verse.surahName}
                initialAudioUrl={verse.audioUrl}
              />

              {/* Message to Heart */}
              <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800 text-right space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Heart className="w-3.5 h-3.5" />
                  <span>رسالة الآية لجرحك ووجعك الحالي:</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-cairo">
                  {verse.heartMessage}
                </p>

                {verse.spiritualContext && (
                  <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                    <span className="text-stone-300 font-medium">سياق السكينة: </span>
                    {verse.spiritualContext}
                  </p>
                )}

                {verse.reflectionQuestion && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-200 font-medium">
                    <span className="font-bold">سؤال تدبر لقلبك: </span>
                    {verse.reflectionQuestion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Practical Remedies & Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Psychological Remedies */}
        <div className="glass-panel rounded-3xl p-6 border border-teal-500/20 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
              <h5 className="text-sm font-bold text-stone-100 flex items-center gap-1.5 font-cairo">
                <Brain className="w-4 h-4 text-teal-400" />
                تمارين نفسية وسلوكية فورية
              </h5>
              <span className="text-[10px] text-teal-400 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
                علم النفس
              </span>
            </div>

            <div className="space-y-3.5 mb-4">
              {practicalRemedies.psychologicalExercises.map((ex, idx) => (
                <div key={idx} className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
                  <h6 className="text-xs font-bold text-teal-300 mb-1">
                    {ex.title}
                  </h6>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {ex.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Guided Breathing */}
          <button
            onClick={onTriggerBreathing}
            className="w-full py-2.5 rounded-xl bg-teal-950/80 hover:bg-teal-900/80 text-teal-200 border border-teal-700/50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            فتح تمرين التنفس التفاعلي (4-7-8) الآن
          </button>
        </div>

        {/* Spiritual Remedies */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
            <h5 className="text-sm font-bold text-stone-100 flex items-center gap-1.5 font-cairo">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              خطوات إيمانية وروحية لتفريج الكرب
            </h5>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              يقين وتوكل
            </span>
          </div>

          <div className="space-y-3.5">
            {practicalRemedies.spiritualSteps.map((step, idx) => (
              <div key={idx} className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
                <h6 className="text-xs font-bold text-emerald-300 mb-1">
                  {step.action}
                </h6>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {step.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Prophetic Duaa Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-amber-500/40 shadow-xl bg-gradient-to-b from-stone-900 to-amber-950/40 relative">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-900/30">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h4 className="text-base font-bold text-stone-100 font-cairo">
              الدعاء النبوي المأثور لتفريج هذا الهم
            </h4>
          </div>
          <button
            onClick={handleCopyDuaa}
            className="text-xs px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedDuaa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDuaa ? 'تم نسخ الدعاء' : 'نسخ الدعاء'}</span>
          </button>
        </div>

        {/* Duaa Arabic text */}
        <div className="p-5 rounded-2xl bg-stone-950/80 border border-amber-500/20 text-center mb-4">
          <p className="font-quran text-lg sm:text-xl text-amber-200 font-bold leading-loose">
            "{quranicGuidance.propheticDuaa.duaaArabic}"
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-300">
          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <span className="font-bold text-amber-300 block mb-0.5">فضل الدعاء:</span>
            <span>{quranicGuidance.propheticDuaa.translationOrContext}</span>
          </div>
          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <span className="font-bold text-emerald-300 block mb-0.5">كيف تستحضر قلبك:</span>
            <span>{quranicGuidance.propheticDuaa.howToRecite}</span>
          </div>
        </div>
      </div>

      {/* 6. Post-Session Mood Feedback */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 text-center">
        <h5 className="text-sm font-bold text-stone-100 mb-1 font-cairo">
          كيف تجد قلبك وروحك الآن بعد البوح والاستماع لكلام الله؟
        </h5>
        <p className="text-xs text-stone-400 mb-4">
          تقييمك يسجل في دفتر السكينة لمتابعة راحتك النفسية وانشراح صدرك
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { score: 1, label: 'ما زلت مثقلاً', emoji: '🌧️' },
            { score: 2, label: 'أهدأ قليلاً', emoji: '⛅' },
            { score: 3, label: 'شعرت بتفريغ الهم', emoji: '🌤️' },
            { score: 4, label: 'طمأنينة وراحة', emoji: '🌿' },
            { score: 5, label: 'سكينة وانشراح تام', emoji: '✨' },
          ].map((item) => (
            <button
              key={item.score}
              onClick={() => handleSelectMood(item.score)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                moodScore === item.score
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400 scale-105'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {moodScore && (
          <p className="text-xs text-emerald-400 font-medium mt-3">
            الحمد لله الذي بنعمته تتم الصالحات. تم حفظ تقييمك في دفتر السكينة.
          </p>
        )}
      </div>
    </div>
  );
};
