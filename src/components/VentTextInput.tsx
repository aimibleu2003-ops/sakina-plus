import React from 'react';
import { MessageSquareText, Sparkles, Tag } from 'lucide-react';

interface VentTextInputProps {
  text: string;
  onChangeText: (text: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  disabled?: boolean;
}

const CATEGORIES = [
  { id: 'ضيق صدر وحزن', label: 'ضيق صدر وحزن', color: 'border-amber-600/40 text-amber-300' },
  { id: 'قلق وتفكير زائد بالمستقبل', label: 'قلق وخوف من القادم', color: 'border-cyan-600/40 text-cyan-300' },
  { id: 'مشاكل علاقات وخيبة أمل', label: 'خذلان وظلم في العلاقات', color: 'border-rose-600/40 text-rose-300' },
  { id: 'فقدان وشعور بالوحدة', label: 'وحدة وشوق وفقد', color: 'border-purple-600/40 text-purple-300' },
  { id: 'تأنيب ضمير وخوف من التقصير', label: 'تأنيب ضمير وذنوب', color: 'border-emerald-600/40 text-emerald-300' },
  { id: 'ابتلاء وضيق في الرزق أو العمل', label: 'ضيق رزق ومعيشة', color: 'border-yellow-600/40 text-yellow-300' },
  { id: 'فضفضة عامة', label: 'فضفضة عامة', color: 'border-stone-600/40 text-stone-300' },
];

const STARTER_PROMPTS = [
  'أشعر بثقل وضيق في صدري يمنعني من الراحة والنوم...',
  'تتزاحم في رأسي مخاوف شديدة من المستقبل وأشعر بالعجز...',
  'تعرضت لموقف خذلان مؤلم وأجد صعوبة بالغة في التسامح والتجاوز...',
  'أشعر بتقصير شديد وذنبي يثقل قلبي وأحتاج أملاً يطهرني...',
];

export const VentTextInput: React.FC<VentTextInputProps> = ({
  text,
  onChangeText,
  selectedCategory,
  onSelectCategory,
  disabled,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-stone-800 shadow-lg text-right">
      {/* Category selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-stone-400 flex items-center gap-1.5 mb-2.5">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          <span>اختر ما يصف جوهر كربك (اختياري لمساعدة التحليل الذكي):</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectCategory(selectedCategory === cat.id ? '' : cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-emerald-100 border border-emerald-500 shadow-sm shadow-emerald-900/50'
                  : 'bg-stone-900/90 text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-stone-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea for written venting */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-emerald-400" />
            <span>اكتب ما يدور في خاطرك (إن كنت تفضل الكتابة أو تريد إضافة تفاصيل لصوتك):</span>
          </label>
          <span className="text-[11px] text-stone-500">{text.length} حرف</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="افتح قلبك هنا.. ما الذي يرهق روحك اليوم؟ ما الذي تخشى حدوثه؟ أو ما الجرح الذي يؤرقك؟ اكتب كل شيء بكل عفوية..."
          className="w-full bg-stone-900/90 border border-stone-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl p-4 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition-all resize-y leading-relaxed"
        />
      </div>

      {/* Starter Prompts */}
      <div>
        <p className="text-[11px] text-stone-500 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>بدايات قد تلهمك للبوح:</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onChangeText(text ? `${text}\n${prompt}` : prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800/80 transition-colors text-right cursor-pointer"
            >
              "{prompt.slice(0, 36)}..."
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
