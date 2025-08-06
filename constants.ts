
import { Note, Key, MusicKey, ScaleType, QuizSettings, QuizMode } from './types';

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
  level: 1,
  key: 'C',
  scaleType: 'Major',
  quizMode: 'Simon Memory Game',
  inputMethod: 'Touch',
  instrument: 'Piano',
  handedness: 'Right',
  bpm: 70,
  practiceKeys: ['C'],
  practiceDegrees: [1, 2, 3, 4, 5, 6, 7],
  totalBeats: 30,
  beatAward: 5,
  beatPenalty: 5,
  micSensitivity: 20,
  audioInputDeviceId: null,
  questionCount: 40,
};

export const INTERVALS: { [name: string]: number } = {
    'Minor 2nd': 1,
    'Major 2nd': 2,
    'Minor 3rd': 3,
    'Major 3rd': 4,
    'Perfect 4th': 5,
    'Tritone': 6,
    'Perfect 5th': 7,
    'Minor 6th': 8,
    'Major 6th': 9,
    'Minor 7th': 10,
    'Major 7th': 11,
};
export const INTERVAL_NAMES = Object.keys(INTERVALS);

export const CHORD_TYPES: ('Major' | 'Minor')[] = ['Major', 'Minor'];
export const CHORD_FORMULAS: Record<'Major' | 'Minor', number[]> = {
    Major: [0, 4, 7], // Root, Major 3rd, Perfect 5th
    Minor: [0, 3, 7], // Root, Minor 3rd, Perfect 5th
};


export const LEVEL_KEYS: { [level: number]: MusicKey[] } = {
  1: ['C', 'G', 'F'],
  2: ['D', 'A', 'Bb', 'Eb'],
  3: ['E', 'B', 'F#', 'Db', 'Ab'],
  4: MUSIC_KEYS,
  5: MUSIC_KEYS,
};

export const LEVEL_MODES: { [level: number]: { mode: QuizMode, name: string }[] } = {
  1: [
    { mode: 'Simon Memory Game', name: 'Simon Game' },
    { mode: 'Key Notes', name: 'Key Notes' },
    { mode: 'Scale Detective', name: 'Detective'}
  ],
  2: [
    { mode: 'Practice', name: 'Practice' },
    { mode: 'Time Attack', name: 'Time Attack' },
    { mode: 'BPM Challenge', name: 'BPM' },
    { mode: 'Nashville Numbers', name: 'Nashville' },
    { mode: 'Degree Training', name: 'Degrees' },
  ],
  3: [
    { mode: 'Intervals', name: 'Intervals' }, 
    { mode: 'Chord Builder', name: 'Chords' }
  ],
  4: [
    { mode: 'Randomizer Roulette', name: 'Roulette' }
  ],
  5: [
      { mode: 'BPM Roulette', name: 'BPM Roulette' }
  ]
};