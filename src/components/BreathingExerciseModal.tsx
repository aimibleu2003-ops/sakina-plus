import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Wind, Sparkles } from 'lucide-react';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Switch Phase
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          // exhale finished -> next cycle
          setPhase('inhale');
          setCycleCount((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(4);
  };

  const handlePause = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReset = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('inhale');
    setCountdown(4);
    setCycleCount(0);
  };

  if (!isOpen) return null;

  const phaseDetails = {
    inhale: {
      text: 'شهيق هادئ من الأنف',
      subtext: 'استشعر رحمة الله ونور الطمأنينة يملأ صدرك',
      dhikr: 'سُبْحَانَ اللَّهِ',
      color: 'from-emerald-500 to-teal-400',
      scale: 'scale-125',
    },
    hold: {
      text: 'حبس النفس بسكينة',
      subtext: 'سلّم كل أمرك لخالقك وتيقن أنه بيده الفرج',
      dhikr: 'الْحَمْدُ لِلَّهِ',
      color: 'from-amber-500 to-yellow-400',
      scale: 'scale-125',
    },
    exhale: {
      text: 'زفير بطيء من الفم',
      subtext: 'أطلق كل الهموم والأثقال، تبرّأ من حولك إلى حول الله',
      dhikr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
      color: 'from-cyan-500 to-blue-400',
      scale: 'scale-90',
    },
  }[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-stone-900 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wind className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-stone-100 font-cairo">
            تمرين السكينة والتفريغ (4-7-8)
          </h3>
        </div>
        <p className="text-xs text-stone-400 mb-6 max-w-xs mx-auto">
          يهدئ الجهاز العصبي فوراً ويزيل ضيق الصدر عبر تنظيم الأكسجين واقتران النفس بالذكر.
        </p>

        {/* Guided Breathing Visual Circle */}
        <div className="relative w-56 h-56 mx-auto mb-6 flex items-center justify-center">
          {/* Animated Background Ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${phaseDetails.color} opacity-20 blur-xl transition-all duration-1000 ${
              isActive ? phaseDetails.scale : 'scale-100'
            }`}
          />

          {/* Main Breathing Core */}
          <div
            className={`w-44 h-44 rounded-full bg-gradient-to-tr ${phaseDetails.color} flex flex-col items-center justify-center shadow-2xl transition-all duration-1000 ease-in-out border-4 border-stone-900/60 ${
              isActive ? phaseDetails.scale : 'scale-100'
            }`}
          >
            <span className="text-4xl font-extrabold text-stone-950 font-mono">
              {countdown}
            </span>
            <span className="text-xs font-bold text-stone-900 mt-1">
              {phaseDetails.text}
            </span>
          </div>
        </div>

        {/* Phase Info & Dhikr */}
        <div className="mb-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-amber-300 font-quran text-lg font-bold mb-2 shadow-inner">
            {phaseDetails.dhikr}
          </div>
          <p className="text-xs text-stone-300 font-medium">
            {phaseDetails.subtext}
          </p>
          {cycleCount > 0 && (
            <p className="text-[11px] text-emerald-400 mt-2">
              أتممت {cycleCount} دورات تنفس مباركة
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer"
            >
              <Play className="w-4 h-4 ml-0.5" />
              ابدأ التمرين
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold flex items-center gap-2 border border-stone-700 cursor-pointer"
            >
              إيقاف مؤقت
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 cursor-pointer"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
