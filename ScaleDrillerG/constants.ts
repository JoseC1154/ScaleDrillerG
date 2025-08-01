import { Note, Key, MusicKey, ScaleType, QuizSettings } from './types';

export const ALL_NOTES: Note[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const MUSIC_KEYS: MusicKey[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const KEYS: Key[] = [...MUSIC_KEYS, 'Random'];


export const SCALE_TYPES: ScaleType[] = ['Major', 'Minor'];

export const SCALE_FORMULAS: Record<ScaleType, number[]> = {
  Major: [2, 2, 1, 2, 2, 2, 1], // W-W-H-W-W-W-H
  Minor: [2, 1, 2, 2, 1, 2, 2], // W-H-W-W-H-W-W
};

// Standard tuning from thinnest string to thickest
export const GUITAR_TUNING: Note[] = ['E', 'B', 'G', 'D', 'A', 'E'];
export const BASS_TUNING: Note[] = ['G', 'D', 'A', 'E'];

export const DEGREE_NAMES: { [key: number]: string } = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
  6: '6th',
  7: '7th',
};

export const NASHVILLE_DEGREE_NAMES: {
  Major: { [key: number]: string };
  Minor: { [key: number]: string };
} = {
  Major: {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
  },
  Minor: {
    1: '1',
    2: '2',
    3: 'b3',
    4: '4',
    5: '5',
    6: 'b6',
    7: 'b7',
  },
};

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  key: 'C',
  scaleType: 'Major',
  quizMode: 'Practice',
  inputMethod: 'Virtual Instrument',
  instrument: 'Piano',
  handedness: 'Right',
  bpm: 100,
  questionCount: 20,
  practiceKeys: ['C'],
  timeAttackDuration: 60,
  secondsPerQuestion: 8,
};