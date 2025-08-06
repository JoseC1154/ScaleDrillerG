
export type Note = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';
export type MusicKey = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'Db' | 'Ab' | 'Eb' | 'Bb' | 'F';
export type Key = MusicKey | 'Random';
export type ScaleType = 'Major' | 'Minor';
export type QuizMode = 'Practice' | 'Time Attack' | 'BPM Challenge' | 'Nashville Numbers' | 'Degree Training' | 'Key Notes' | 'Intervals' | 'Scale Detective' | 'Chord Builder' | 'Randomizer Roulette' | 'BPM Roulette' | 'Simon Memory Game';
export type InputMethod = 'Touch' | 'MIDI' | 'Mic';
export type Instrument = 'Piano' | 'Guitar' | 'Bass';
export type Handedness = 'Right' | 'Left';

export interface QuizSettings {
  level: number;
  key: Key;
  scaleType: ScaleType;
  quizMode: QuizMode;
  inputMethod: InputMethod;
  instrument: Instrument;
  handedness: Handedness;
  bpm: number; 
  practiceKeys: Note[];
  practiceDegrees: number[]; // For Degree Training mode
  totalBeats: number;
  beatAward: number;
  beatPenalty: number;
  micSensitivity: number; // for Mic input gate
  audioInputDeviceId: string | null;
  questionCount: number; // Added to standardize quiz length
}

export interface Scale {
  key: MusicKey;
  type: ScaleType;
  notes: Note[];
}

export interface Question {
  id: number;
  prompt: string;
  degree?: number;
  correctAnswers: Note[]; // For Simon Memory Game, this is the pool of notes
  contextNotes?: Note[];
  key: MusicKey;
  scaleType: ScaleType;
  intervalName?: string;
  chordType?: 'Major' | 'Minor';
  quizMode: QuizMode;
  rootUniqueId?: string; // Optional: provides octave context for specific challenges
}

export interface FretboardNote {
  note: Note;
  string: number;
  fret: number;
}

// --- User Data and Performance Tracking ---

export interface PerformanceStat {
  correct: number;
  incorrect: number;
}

export interface PerformanceData {
  byKey: Partial<Record<MusicKey, PerformanceStat>>;
  byScale: Partial<Record<ScaleType, PerformanceStat>>;
  byDegree: Partial<Record<number, PerformanceStat>>;
  byInterval: Partial<Record<string, PerformanceStat>>;
  byChord: Partial<Record<'Major' | 'Minor', PerformanceStat>>;
}

export interface UserData {
  unlockedLevel: number;
  isKeySelectionUnlocked: boolean;
  performance: PerformanceData;
  unlockedModes: QuizMode[];
  preQuizInfoSeen: Partial<Record<QuizMode, boolean>>;
  simonHighScore: number;
}

export interface PerformanceUpdate {
  key?: MusicKey;
  scaleType?: ScaleType;
  degree?: number;
  intervalName?: string;
  chordType?: 'Major' | 'Minor';
  isCorrect: boolean;
  rootUniqueId?: string;
}

export interface QuizCompletionResult {
    score: number;
    totalQuestions: number;
    level: number;
    success: boolean;
    quizMode: QuizMode;
    bpmLevel?: number;
}