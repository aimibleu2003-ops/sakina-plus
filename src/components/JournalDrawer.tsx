import React from 'react';
import { X, Trash2, BookOpen, Clock, Heart, Eye } from 'lucide-react';
import { GuidanceResult } from '../types';

interface JournalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: GuidanceResult[];
  onSelectEntry: (entry: GuidanceResult) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}

export const JournalDrawer: React.FC<JournalDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectEntry,
  onDeleteEntry,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'سابقاً';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-stone-950 border-l border-amber-900/30 p-6 flex flex-col text-right shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-stone-100 font-cairo">
              دفتر السكينة والبوح
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-900 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {entries.length === 0 ? (
            <div className="py-20 text-center text-stone-500">
              <BookOpen className="w-10 h-10 mx-auto text-stone-600 mb-2 opacity-50" />
              <p className="text-sm font-medium">لا توجد جلسات بوح محفوظة بعد</p>
              <p className="text-xs text-stone-500 mt-1">
                عندما تبوح بهمك وتتلقى التحليل والآيات، يمكنك حفظها للرجوع إليها متى ضاق صدرك.
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 hover:border-emerald-600/40 transition-all text-right group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-500" />
                    {formatDate(entry.timestamp)}
                  </span>
                  <div className="flex items-center gap-1">
                    {entry.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                        {entry.category}
                      </span>
                    )}
                    <button
                      onClick={() => entry.id && onDeleteEntry(entry.id)}
                      className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                      title="حذف الجلسة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary emotion badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/40">
                    {entry.emotionalAnalysis.primaryEmotion}
                  </span>
                  {entry.postMoodScore && (
                    <span className="text-[11px] text-amber-300 flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      الراحة: {entry.postMoodScore}/5
                    </span>
                  )}
                </div>

                {/* Vent snippet */}
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed mb-3">
                  "{entry.transcription || 'تسجيل صوتي'}"
                </p>

                {/* Quranic core message snippet */}
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80 mb-3">
                  <p className="text-[11px] text-amber-200 font-medium line-clamp-1 font-quran">
                    بلسم القرآن: {entry.quranicGuidance.coreMessage}
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    onSelectEntry(entry);
                    onClose();
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  مراجعة تفاصيل الجلسة والآيات
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {entries.length > 0 && (
          <div className="pt-3 border-t border-stone-800 flex justify-between items-center">
            <span className="text-xs text-stone-500">
              إجمالي الجلسات: {entries.length}
            </span>
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              مسح جميع الجلسات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
