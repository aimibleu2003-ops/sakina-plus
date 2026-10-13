import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, UserCheck, RefreshCw } from 'lucide-react';
import { ReciterKey, ReciterOption } from '../types';

interface QuranReciterPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  initialAudioUrl?: string;
  surahName: string;
}

const RECITERS: ReciterOption[] = [
  { id: 'Alafasy_128kbps', name: 'مشاري العفاسي', folder: 'Alafasy_128kbps' },
  { id: 'Abdul_Basit_Mujawwad_128kbps', name: 'عبد الباسط (مجود)', folder: 'Abdul_Basit_Mujawwad_128kbps' },
  { id: 'MaherAlMuaiqly128kbps', name: 'ماهر المعيقلي', folder: 'MaherAlMuaiqly128kbps' },
  { id: 'Minshawy_Murattal_128kbps', name: 'محمد صديق المنشاوي', folder: 'Minshawy_Murattal_128kbps' },
];

export const QuranReciterPlayer: React.FC<QuranReciterPlayerProps> = ({
  surahNumber,
  ayahNumber,
  surahName,
}) => {
  const [selectedReciter, setSelectedReciter] = useState<ReciterKey>('Alafasy_128kbps');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pad surah/ayah number to 3 digits (e.g. 2 -> 002)
  const padZero = (n: number) => String(n).padStart(3, '0');
  const currentAudioUrl = `https://everyayah.com/data/${selectedReciter}/${padZero(surahNumber)}${padZero(ayahNumber)}.mp3`;

  useEffect(() => {
    // Reset player on verse or reciter change
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setProgress(0);
    setAudioError(false);
  }, [surahNumber, ayahNumber, selectedReciter]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setAudioError(false);
      audioRef.current
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Audio playback error:', err);
          setIsLoading(false);
          setIsPlaying(false);
          setAudioError(true);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
  };

  return (
    <div className="bg-stone-900/90 rounded-2xl p-4 border border-amber-500/20 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Reciter selector */}
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-stone-400 font-medium">القارئ:</span>
          <select
            value={selectedReciter}
            onChange={(e) => setSelectedReciter(e.target.value as ReciterKey)}
            className="bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-xl px-2.5 py-1.5 focus:border-amber-500 outline-none cursor-pointer"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-stone-400 flex items-center gap-1.5 self-end sm:self-auto">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>تلاوة الآية ({ayahNumber}) من {surahName}</span>
        </div>
      </div>

      {/* Audio Control Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
          title={isPlaying ? 'إيقاف مؤقت' : 'استمع للتلاوة'}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 ml-0.5 text-white" />
          )}
        </button>

        {/* Progress Bar */}
        <div
          onClick={handleSeek}
          className="flex-1 h-3 bg-stone-950 rounded-full overflow-hidden cursor-pointer relative border border-stone-800/80"
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <audio
          ref={audioRef}
          src={currentAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
          onError={() => {
            setAudioError(true);
            setIsPlaying(false);
            setIsLoading(false);
          }}
          className="hidden"
        />
      </div>

      {audioError && (
        <p className="text-[11px] text-amber-400/90 mt-2 text-right">
          تعذر تحميل التلاوة الصوتية تلقائياً للشبكة. يمكنك قراءة الآية الكريمة وتدبرها أعلاه.
        </p>
      )}
    </div>
  );
};
