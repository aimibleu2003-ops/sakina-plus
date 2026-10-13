import React, { useState } from 'react';
import { Volume2, VolumeX, Wind, CloudRain, Heart, BookOpen, Clock, Sparkles } from 'lucide-react';
import { ambientSound } from '../utils/ambientAudio';

interface HeaderProps {
  onOpenBreathing: () => void;
  onOpenTasbih: () => void;
  onOpenJournal: () => void;
  onOpenDailyVerse: () => void;
  journalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBreathing,
  onOpenTasbih,
  onOpenJournal,
  onOpenDailyVerse,
  journalCount,
}) => {
  const [ambientMode, setAmbientMode] = useState<'none' | 'rain' | 'breeze'>('none');
  const [ambientMenuOpen, setAmbientMenuOpen] = useState(false);

  const toggleSound = (mode: 'rain' | 'breeze') => {
    if (ambientMode === mode) {
      ambientSound.stop();
      setAmbientMode('none');
    } else {
      ambientSound.play(mode);
      setAmbientMode(mode);
    }
    setAmbientMenuOpen(false);
  };

  const stopSound = () => {
    ambientSound.stop();
    setAmbientMode('none');
    setAmbientMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-amber-900/20 bg-stone-950/80">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-amber-900 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-500/20">
            <span className="font-quran text-2xl text-amber-200 select-none">س</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100 font-cairo">
                سَكِينَة
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 font-medium">
                بلسم بالقرآن
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block font-cairo">
              "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ" • تحليل نفسي وبث الهموم
            </p>
          </div>
        </div>

        {/* Quick Tools & Tranquility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ambient Sound Controller */}
          <div className="relative">
            <button
              onClick={() => setAmbientMenuOpen(!ambientMenuOpen)}
              title="أصوات السكينة والاسترخاء"
              className={`p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all ${
                ambientMode !== 'none'
                  ? 'bg-emerald-800/50 text-emerald-200 border border-emerald-500/40 shadow-sm shadow-emerald-900/50'
                  : 'bg-stone-900/80 text-stone-300 border border-stone-800 hover:bg-stone-800'
              }`}
            >
              {ambientMode === 'rain' ? (
                <>
                  <CloudRain className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">مطر هادئ</span>
                </>
              ) : ambientMode === 'breeze' ? (
                <>
                  <Wind className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">نسيم سكينة</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-stone-400" />
                  <span className="hidden md:inline">أصوات هادئة</span>
                </>
              )}
            </button>

            {/* Ambient Sound Dropdown */}
            {ambientMenuOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-xl glass-card border border-stone-700 p-2 shadow-2xl z-50">
                <p className="text-[11px] font-semibold text-stone-400 px-2 py-1 mb-1">
                  أصوات خلفية مهدئة للأعصاب:
                </p>
                <button
                  onClick={() => toggleSound('rain')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs flex items-center justify-between mb-1 ${
                    ambientMode === 'rain' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'hover:bg-stone-800/80 text-stone-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CloudRain className="w-3.5 h-3.5 text-emerald-400" />
                    مطر الرحمة الهادئ
                  </span>
                  {ambientMode === 'rain' && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                </button>
                <button
                  onClick={() => toggleSound('breeze')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs flex items-center justify-between mb-1 ${
                    ambientMode === 'breeze' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'hover:bg-stone-800/80 text-stone-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-amber-400" />
                    نسيم السكينة والليل
                  </span>
                  {ambientMode === 'breeze' && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                </button>
                {ambientMode !== 'none' && (
                  <button
                    onClick={stopSound}
                    className="w-full text-right px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 mt-1 border-t border-stone-800 pt-2"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    إيقاف الصوت
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Daily Verse Button */}
          <button
            onClick={onOpenDailyVerse}
            title="آية السكينة والتفكر"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">آية السكينة</span>
          </button>

          {/* Breathing Exercise Button */}
          <button
            onClick={onOpenBreathing}
            title="تمرين التنفس وتفريغ التوتر 4-7-8"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">تمرين التنفس</span>
          </button>

          {/* Tasbih Button */}
          <button
            onClick={onOpenTasbih}
            title="مسبحة تفريج الكرب"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">المسبحة</span>
          </button>

          {/* Journal History Button */}
          <button
            onClick={onOpenJournal}
            title="دفتر السكينة والبوح السابق"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium flex items-center gap-1.5 relative transition-all"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">دفتر السكينة</span>
            {journalCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {journalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
