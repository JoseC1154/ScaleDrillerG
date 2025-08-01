
export type Note = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';
export type MusicKey = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'Db' | 'Ab' | 'Eb' | 'Bb' | 'F';
export type Key = MusicKey | 'Random';
export type ScaleType = 'Major' | 'Minor';
export type QuizMode = 'Practice' | 'Time Attack' | 'BPM Challenge' | 'Nashville Numbers';
export type InputMethod = 'Virtual Instrument' | 'MIDI' | 'Audio';
export type Instrument = 'Piano' | 'Guitar' | 'Bass';
export type Handedness = 'Right' | 'Left';

export interface QuizSettings {
  key: Key;
  scaleType: ScaleType;
  quizMode: QuizMode;
  inputMethod: InputMethod;
  instrument: Instrument;
  handedness: Handedness;
  bpm: number; // for BPM Challenge
  questionCount: number; 
  practiceKeys: MusicKey[]; // For Practice mode
  timeAttackDuration: number; // for Time Attack
  secondsPerQuestion: number; // for Time Attack
}

export interface Scale {
  key: MusicKey;
  type: ScaleType;
  notes: Note[];
}

export interface Question {
  id: number;
  prompt: string;
  degree: number;
  correctAnswer: Note;
  key: MusicKey;
  scaleType: ScaleType;
}

export interface FretboardNote {
  note: Note;
  string: number;
  fret: number;
}