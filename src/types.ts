export interface QuranVerse {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  spiritualContext: string;
  heartMessage: string;
  reflectionQuestion?: string;
  audioUrl?: string;
  audioUrlMujawwad?: string;
  audioUrlMuaiqly?: string;
}

export interface PropheticDuaa {
  duaaArabic: string;
  translationOrContext: string;
  howToRecite: string;
}

export interface PsychologicalExercise {
  title: string;
  description: string;
}

export interface SpiritualStep {
  action: string;
  benefit: string;
}

export interface EmotionalAnalysis {
  primaryEmotion: string;
  emotionIntensity: number; // 1-100
  subconsciousDrivers: string[];
  psychologicalInsight: string;
  cognitivePattern?: string;
}

export interface GuidanceResult {
  id?: string;
  timestamp?: number;
  transcription: string;
  category?: string;
  emotionalAnalysis: EmotionalAnalysis;
  quranicGuidance: {
    coreMessage: string;
    verses: QuranVerse[];
    propheticDuaa: PropheticDuaa;
    heartAffirmation: string;
  };
  practicalRemedies: {
    psychologicalExercises: PsychologicalExercise[];
    spiritualSteps: SpiritualStep[];
  };
  postMoodScore?: number; // 1-5 scale after session
}

export interface DailyVerse {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  theme: string;
  reflection: string;
  audioUrl: string;
}

export type ReciterKey = 'Alafasy_128kbps' | 'Abdul_Basit_Mujawwad_128kbps' | 'MaherAlMuaiqly128kbps' | 'Minshawy_Murattal_128kbps';

export interface ReciterOption {
  id: ReciterKey;
  name: string;
  folder: string;
}
