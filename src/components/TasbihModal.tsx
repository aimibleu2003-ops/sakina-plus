import React, { useState } from 'react';
import { X, RotateCcw, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface TasbihModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DhikrItem {
  id: string;
  arabic: string;
  virtue: string;
  target: number;
}

const ADHKAR: DhikrItem[] = [
  {
    id: 'yunus',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    virtue: 'دعوة ذي النون في بطن الحوت: ما دعا بها مكروب إلا فرّج الله عنه كربه.',
    target: 33,
  },
  {
    id: 'hasbuna',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    virtue: 'قالها إبراهيم عليه السلام حين أُلقي في النار، وقالها النبي ﷺ في أشد أوقات الخوف.',
    target: 33,
  },
  {
    id: 'hawqala',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    virtue: 'كنز من كنوز الجنة، وباب عظيم لتسليم الأقدار ورفع العجز النفسي.',
    target: 33,
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
    virtue: '«من لزم الاستغفار جعل الله له من كل ضيق مخرجاً ومن كل همّ فرجاً».',
    target: 100,
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    virtue: '«إذن تُكفى همَّك ويُغفر لك ذنبُك».',
    target: 100,
  },
];

export const TasbihModal: React.FC<TasbihModalProps> = ({ isOpen, onClose }) => {
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem>(ADHKAR[0]);
  const [count, setCount] = useState(0);

  if (!isOpen) return null;

  const handleTap = () => {
    // Subtle haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (e) {}
    }
    setCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  const isTargetReached = count >= selectedDhikr.target && selectedDhikr.target > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-stone-900 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-rose-400" />
          <h3 className="text-xl font-bold text-stone-100 font-cairo">
            مسبحة السكينة وتفريج الكرب
          </h3>
        </div>
        <p className="text-xs text-stone-400 mb-5">
          "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" • كرر الذكر بيقين وحضور قلب
        </p>

        {/* Dhikr Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-5">
          {ADHKAR.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedDhikr(item);
                setCount(0);
              }}
              className={`text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedDhikr.id === item.id
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 font-bold'
                  : 'bg-stone-900/80 text-stone-400 border border-stone-800 hover:text-stone-200'
              }`}
            >
              {item.arabic.split(' ').slice(0, 3).join(' ')}...
            </button>
          ))}
        </div>

        {/* Active Dhikr Display Card */}
        <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 mb-6 text-center">
          <p className="font-quran text-lg sm:text-xl text-amber-300 font-bold leading-relaxed mb-2">
            "{selectedDhikr.arabic}"
          </p>
          <p className="text-[11px] text-stone-400 leading-normal">
            {selectedDhikr.virtue}
          </p>
        </div>

        {/* Interactive Counting Button */}
        <div className="relative mb-6">
          <button
            type="button"
            onClick={handleTap}
            className={`w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-2xl border-4 ${
              isTargetReached
                ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-400/60 shadow-emerald-950/80'
                : 'bg-gradient-to-br from-stone-800 via-stone-900 to-amber-950/80 border-amber-500/40 shadow-amber-950/60'
            }`}
          >
            <span className="text-5xl font-extrabold text-stone-100 font-mono tracking-wider">
              {count}
            </span>
            <span className="text-xs text-amber-300/80 mt-1">
              الهدف: {selectedDhikr.target}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              انقر هنا للعد
            </span>
          </button>

          {isTargetReached && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold mt-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>مبارك! أتممت الورد المستهدف، تقبل الله منك</span>
            </div>
          )}
        </div>

        {/* Reset Counter Button */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة تصفير العداد
          </button>
        </div>
      </div>
    </div>
  );
};
