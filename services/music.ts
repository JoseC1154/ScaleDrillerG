
import { ALL_NOTES, SCALE_FORMULAS, DEGREE_NAMES, MUSIC_KEYS, NASHVILLE_DEGREE_NAMES } from '../constants';
import { Note, MusicKey, ScaleType, Scale, Question, FretboardNote, QuizSettings } from '../types';

const getNoteIndex = (note: Note): number => ALL_NOTES.indexOf(note);

const getNoteFromIndex = (index: number): Note => ALL_NOTES[index % ALL_NOTES.length];

export const getScale = (key: MusicKey, scaleType: ScaleType): Scale => {
  const rootIndex = getNoteIndex(key);
  const formula = SCALE_FORMULAS[scaleType];
  const scaleNotes: Note[] = [key];
  let currentIndex = rootIndex;

  for (const interval of formula.slice(0, -1)) {
    currentIndex += interval;
    scaleNotes.push(getNoteFromIndex(currentIndex));
  }
  
  return { key, type: scaleType, notes: scaleNotes };
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateQuizQuestions = (
  settings: Pick<QuizSettings, 'key' | 'scaleType' | 'quizMode' | 'practiceKeys'>,
  count: number
): Question[] => {
  const { key, scaleType, quizMode, practiceKeys } = settings;
  const questions: Question[] = [];
  const degrees = Array.from({ length: 7 }, (_, i) => i + 1);

  for (let i = 0; i < count; i++) {
    let questionKey: MusicKey;

    if (quizMode === 'Practice' || quizMode === 'Nashville Numbers') {
      const keysToUse = practiceKeys && practiceKeys.length > 0 ? practiceKeys : [MUSIC_KEYS[0]]; // Fallback
      questionKey = keysToUse[Math.floor(Math.random() * keysToUse.length)];
    } else { // Time Attack or BPM Challenge
      if (key === 'Random') {
        questionKey = MUSIC_KEYS[Math.floor(Math.random() * MUSIC_KEYS.length)];
      } else {
        questionKey = key as MusicKey;
      }
    }
    
    const scale = getScale(questionKey, scaleType);
    const degree = degrees[Math.floor(Math.random() * degrees.length)];
    const correctAnswer = scale.notes[degree - 1];

    let promptText: string;
    if (quizMode === 'Nashville Numbers') {
        const degreeName = scaleType === 'Major' 
            ? NASHVILLE_DEGREE_NAMES.Major[degree] 
            : NASHVILLE_DEGREE_NAMES.Minor[degree];
        promptText = `Play the ${degreeName} of ${questionKey} ${scaleType}`;
    } else {
        promptText = `Play the ${DEGREE_NAMES[degree]} of ${questionKey} ${scaleType}`;
    }

    questions.push({
      id: i,
      prompt: promptText,
      degree,
      correctAnswer,
      key: questionKey,
      scaleType,
    });
  }

  return shuffleArray(questions);
};

export const getFretboardNotes = (tuning: Note[], fretCount: number = 12): FretboardNote[] => {
    const notes: FretboardNote[] = [];
    tuning.forEach((openNote, stringIndex) => {
        const openNoteIndex = getNoteIndex(openNote);
        for (let fret = 0; fret <= fretCount; fret++) {
            const noteIndex = openNoteIndex + fret;
            notes.push({
                note: getNoteFromIndex(noteIndex),
                string: stringIndex,
                fret: fret
            });
        }
    });
    return notes;
};

export const frequencyToNote = (frequency: number): { note: Note, octave: number, centsOff: number } | null => {
    if (frequency <= 0) return null;
    
    const A4 = 440;
    const A4_INDEX = getNoteIndex('A');
    const semitonesFromA4 = 12 * Math.log2(frequency / A4);
    const noteIndexRaw = A4_INDEX + semitonesFromA4;
    const roundedNoteIndex = Math.round(noteIndexRaw);
    
    const centsOff = Math.round(100 * (noteIndexRaw - roundedNoteIndex));
    
    const octave = Math.floor(roundedNoteIndex / 12) + 4;
    const note = getNoteFromIndex(roundedNoteIndex);

    return { note, octave, centsOff };
};