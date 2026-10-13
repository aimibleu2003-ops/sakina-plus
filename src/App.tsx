import React, { useState, useEffect } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  RefreshCw,
  Heart,
  BookOpen,
  Shield,
  HelpCircle,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { GuidanceResult } from './types';
import { Header } from './components/Header';
import { VoiceRecorderCard } from './components/VoiceRecorderCard';
import { VentTextInput } from './components/VentTextInput';
import { AnalysisResultView } from './components/AnalysisResultView';
import { BreathingExerciseModal } from './components/BreathingExerciseModal';
import { TasbihModal } from './components/TasbihModal';
import { DailyVerseModal } from './components/DailyVerseModal';
import { JournalDrawer } from './components/JournalDrawer';

const LOCAL_STORAGE_KEY = 'sakina_journal_entries_v1';

export default function App() {
  const [audioData, setAudioData] = useState<{
    base64: string;
    mimeType: string;
    duration: number;
  } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GuidanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Journal entries stored in localStorage
  const [journalEntries, setJournalEntries] = useState<GuidanceResult[]>([]);

  // Modals state
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isTasbihOpen, setIsTasbihOpen] = useState(false);
  const [isDailyVerseOpen, setIsDailyVerseOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  // Load journal from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setJournalEntries(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load journal entries:', e);
    }
  }, []);

  // Save journal entries helper
  const saveEntriesToStorage = (entries: GuidanceResult[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleAudioReady = (base64: string, mimeType: string, duration: number) => {
    setAudioData({ base64, mimeType, duration });
    setError(null);
  };

  const handleClearAudio = () => {
    setAudioData(null);
  };

  // Submit vent for analysis and Quranic solutions
  const handleAnalyze = async () => {
    if (!audioData && !textInput.trim()) {
      setError('يرجى تسجيل صوتك بالبوح أو كتابة ما يثقل صدرك في المربع أدناه');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const payload = {
        text: textInput.trim() || undefined,
        audioBase64: audioData?.base64 || undefined,
        audioMimeType: audioData?.mimeType || undefined,
        category: selectedCategory || undefined,
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'حدث خطأ أثناء تحليل الشكوى. يرجى المحاولة ثانية.');
      }

      const result: GuidanceResult = await res.json();
      result.id = `session_${Date.now()}`;
      result.timestamp = Date.now();
      result.category = selectedCategory || 'فضفضة عامة';

      setAnalysisResult(result);

      // Auto-save session to journal
      const updated = [result, ...journalEntries];
      setJournalEntries(updated);
      saveEntriesToStorage(updated);

      // Scroll to top of results smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'تعذر الاتصال بخادم التحليل والسكينة. تأكد من اتصالك بالإنترنت ثم حاول ثانية.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setAudioData(null);
    setTextInput('');
    setSelectedCategory('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToJournal = (result: GuidanceResult, score?: number) => {
    const updated = journalEntries.map((item) =>
      item.id === result.id ? { ...item, postMoodScore: score ?? item.postMoodScore } : item
    );
    // If not found, add it
    if (!updated.some((item) => item.id === result.id)) {
      updated.unshift({ ...result, postMoodScore: score });
    }
    setJournalEntries(updated);
    saveEntriesToStorage(updated);
  };

  const handleDeleteEntry = (id: string) => {
    const filtered = journalEntries.filter((item) => item.id !== id);
    setJournalEntries(filtered);
    saveEntriesToStorage(filtered);
  };

  const handleClearAllEntries = () => {
    if (window.confirm('هل تود حقاً مسح جميع الجلسات المسجلة في دفتر السكينة؟')) {
      setJournalEntries([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 bg-islamic-pattern flex flex-col selection:bg-emerald-700 selection:text-white">
      {/* Sticky Header */}
      <Header
        onOpenBreathing={() => setIsBreathingOpen(true)}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        onOpenDailyVerse={() => setIsDailyVerseOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
        journalCount={journalEntries.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {!analysisResult ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Spiritual & Quranic Hero Header */}
            <div className="text-center space-y-3 pt-2 sm:pt-4">
              <div className="font-quran text-lg sm:text-xl text-amber-300 font-bold tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-100 font-cairo tracking-tight">
                اشكُ همومك وأحزانك.. ولتطمئن روحك
              </h2>

              <p className="font-quran text-base sm:text-lg text-emerald-300/90 max-w-xl mx-auto">
                "قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ"
              </p>

              <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
                سواء اخترت التسجيل بصوتك أو كتابة ما يثقل خاطرك؛ سنقوم بتحليل أبعاد ألمك النفسي، واستخراج بلسم الشفاء لك من آيات القرآن الكريم مع تلاوات خاشعة وخطوات عملية للراحة.
              </p>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-start gap-3 text-right">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-0.5">تنبيه:</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Voice Recorder Card */}
            <VoiceRecorderCard
              onAudioReady={handleAudioReady}
              onClearAudio={handleClearAudio}
              isAnalyzing={isAnalyzing}
            />

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-stone-800 w-full" />
              <span className="bg-stone-950 px-4 text-xs text-stone-500 font-medium">
                أو يمكنك الكتابة أدناه
              </span>
            </div>

            {/* Written Venting & Category Input */}
            <VentTextInput
              text={textInput}
              onChangeText={setTextInput}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              disabled={isAnalyzing}
            />

            {/* Submit Action Button */}
            <div className="flex flex-col items-center justify-center pt-2 gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!audioData && !textInput.trim())}
                className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-700 hover:from-emerald-500 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-emerald-400/30"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-200" />
                    <span>جارٍ الاستماع لقلبك واستنباط السكينة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-200" />
                    <span>أرسل شكواي واطلب الشفاء بالقرآن</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>خصوصيتك مصونة بالكامل، ولا يتم تخزين صوتك على خوادم عامة</span>
              </div>
            </div>

            {/* Loading Overlay Animation when Analyzing */}
            {isAnalyzing && (
              <div className="glass-panel rounded-3xl p-8 border border-emerald-500/40 text-center space-y-4 shadow-2xl animate-pulse">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white animate-bounce" />
                </div>
                <h4 className="text-lg font-bold text-stone-100 font-cairo">
                  نحن ننصت لشكواك ونستشعر ألمك...
                </h4>
                <div className="max-w-md mx-auto space-y-2 text-xs text-stone-300">
                  <p className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    تفكيك المشاعر وفهم مسببات الضيق النفسي بعلم النفس
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    البحث في آيات القرآن الكريم عما يطابق جرحك ويسكن روعك
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    تجهيز التلاوات الخاشعة والأدعية المأثورة والحلول العملية
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Detailed Results View */
          <AnalysisResultView
            result={analysisResult}
            onReset={handleReset}
            onSaveToJournal={handleSaveToJournal}
            isSaved={journalEntries.some((item) => item.id === analysisResult.id)}
            onTriggerBreathing={() => setIsBreathingOpen(true)}
          />
        )}
      </main>

      {/* Compassionate Healthcare Disclaimer & Footer */}
      <footer className="mt-auto border-t border-stone-800/80 bg-stone-950/80 py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-stone-400">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>سَكِينَة - رفيقك الروحي والنفسي عند ضيق الصدر وبث الأحزان</span>
          </p>
          <p className="text-[11px] leading-relaxed text-stone-500">
            تنبيه: هذا التطبيق مساحة إيمانية ونفسية مساندة للتفريغ واستلهام السكينة من كلام الله تعالى. لا يُغني عن الرعاية الطبية أو النفسية المتخصصة في حالات الأزمات الحادة والاكتئاب السريري.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <BreathingExerciseModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <TasbihModal
        isOpen={isTasbihOpen}
        onClose={() => setIsTasbihOpen(false)}
      />

      <DailyVerseModal
        isOpen={isDailyVerseOpen}
        onClose={() => setIsDailyVerseOpen(false)}
      />

      <JournalDrawer
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
        onSelectEntry={(entry) => setAnalysisResult(entry)}
        onDeleteEntry={handleDeleteEntry}
        onClearAll={handleClearAllEntries}
      />
    </div>
  );
}
