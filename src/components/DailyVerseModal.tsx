import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, RefreshCw } from 'lucide-react';
import { QuranReciterPlayer } from './QuranReciterPlayer';
import { DailyVerse } from '../types';

interface DailyVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyVerseModal: React.FC<DailyVerseModalProps> = ({ isOpen, onClose }) => {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVerse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/daily-verse');
      const data = await res.json();
      if (data && data.verse) {
        setVerse(data.verse);
      }
    } catch (e) {
      console.error('Failed to fetch daily verse:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !verse) {
      fetchVerse();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-stone-900 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-stone-100 font-cairo">
            آية السكينة وجبر القلوب
          </h3>
        </div>
        <p className="text-xs text-stone-400 mb-6">
          نفحة قرآنية مهدئة لقلبك المتعب تبث الأمل واليقين في روحك.
        </p>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
            <p className="text-xs text-stone-400">جارٍ استحضار آية السكينة...</p>
          </div>
        ) : verse ? (
          <div className="space-y-5">
            {/* Verse Card */}
            <div className="glass-card rounded-2xl p-6 border border-amber-500/30 text-center relative overflow-hidden">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-800/60">
                {verse.surahName} • الآية {verse.ayahNumber}
              </span>

              <p className="font-quran text-xl sm:text-2xl text-amber-200 font-bold leading-loose mb-3">
                "{verse.ayahText}"
              </p>

              <p className="text-xs font-semibold text-emerald-400">
                الموضوع: {verse.theme}
              </p>
            </div>

            {/* Recitation Player */}
            <QuranReciterPlayer
              surahNumber={verse.surahNumber}
              ayahNumber={verse.ayahNumber}
              surahName={verse.surahName}
              initialAudioUrl={verse.audioUrl}
            />

            {/* Reflection */}
            <div className="bg-stone-900/80 rounded-2xl p-4 border border-stone-800 text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>لفتة تدبرية لقلبك:</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {verse.reflection}
              </p>
            </div>

            {/* Refresh new verse */}
            <div className="flex justify-center pt-2">
              <button
                onClick={fetchVerse}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center gap-1.5 border border-stone-800 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                آية سكينة أخرى
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
