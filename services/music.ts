
import { ALL_NOTES, SCALE_FORMULAS, DEGREE_NAMES, MUSIC_KEYS, NASHVILLE_DEGREE_NAMES, INTERVALS, INTERVAL_NAMES, CHORD_TYPES, CHORD_FORMULAS, SCALE_TYPES } from '../constants';
import { Note, MusicKey, ScaleType, Scale, Question, FretboardNote, QuizSettings, PerformanceData, QuizMode } from '../types';

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

const getNoteNameFromUniqueId = (id: string | null): MusicKey => {
    return (id ? id.replace(/-?\d.*$/, '') : 'C') as MusicKey;
}

const getWeightedRandom = <T,>(items: T[], performanceData: Record<string | number, {correct: number, incorrect: number}>, keyExtractor: (item: T) => string | number): T => {
    if (items.length === 0) throw new Error("Cannot select from an empty array.");
    if (items.length === 1) return items[0];

    const weights = items.map(item => {
        const key = keyExtractor(item);
        const stat = performanceData[key] || { correct: 0, incorrect: 0 };
        return (stat.incorrect + 1) / (stat.correct + 1);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return items[i];
        }
    }

    return items[items.length - 1]; // Fallback
};

export const generateQuizQuestions = (
  settings: Pick<QuizSettings, 'key' | 'scaleType' | 'quizMode' | 'practiceKeys' | 'practiceDegrees' | 'questionCount'>,
  performance?: PerformanceData
): Question[] => {
  const { quizMode, questionCount } = settings;
  
  // Simon Memory Game is a special case: it has one "question" which is just the note pool.
  // The Quiz component handles the sequence logic.
  if (quizMode === 'Simon Memory Game') {
      const questionKey = MUSIC_KEYS[Math.floor(Math.random() * MUSIC_KEYS.length)];
      const scaleType = 'Major'; // As per spec description
      const scale = getScale(questionKey, scaleType);
      
      return [{
          id: 0,
          prompt: `Memorize the sequence from ${questionKey} ${scaleType}`,
          correctAnswers: scale.notes, // This is the note pool for the sequence
          key: questionKey,
          scaleType,
          quizMode: 'Simon Memory Game',
      }];
  } else {
    // All other modes generate a pool of questions for survival gameplay.
    const questions: Question[] = [];
    for (let i = 0; i < questionCount; i++) {
      let questionKey: MusicKey;
      let rootUniqueId: string | undefined = undefined;
      let scaleType = settings.scaleType;

      const isPracticeMode = ['Practice', 'Nashville Numbers', 'Degree Training', 'Intervals', 'Chord Builder'].includes(quizMode);

      // Determine Key and Scale Type based on mode
      if (['Time Attack', 'Key Notes', 'BPM Challenge', 'BPM Roulette', 'Scale Detective'].includes(quizMode)) {
        questionKey = MUSIC_KEYS[Math.floor(Math.random() * MUSIC_KEYS.length)];
        scaleType = SCALE_TYPES[Math.floor(Math.random() * SCALE_TYPES.length)];
      } else if (isPracticeMode) {
        const keysToUse = settings.practiceKeys && settings.practiceKeys.length > 0 ? settings.practiceKeys : ['C'];
        // The root note for practice is now just the note name, not an octave-specific ID.
        rootUniqueId = performance ? getWeightedRandom(keysToUse, performance.byKey, k => k) : keysToUse[Math.floor(Math.random() * keysToUse.length)];
        questionKey = rootUniqueId as MusicKey;
      } else { // Fallback (shouldn't be hit with new structure)
        questionKey = settings.key === 'Random'
          ? MUSIC_KEYS[Math.floor(Math.random() * MUSIC_KEYS.length)]
          : settings.key as MusicKey;
      }
      
      let question: Question | null = null;
      let currentQuizMode = quizMode;
      
      if (quizMode === 'Randomizer Roulette' || quizMode === 'BPM Roulette') {
          const availableModes: ('Degree Training' | 'Nashville Numbers' | 'Intervals' | 'Chord Builder')[] = ['Degree Training', 'Nashville Numbers', 'Intervals', 'Chord Builder'];
          currentQuizMode = availableModes[Math.floor(Math.random() * availableModes.length)];
      }

      switch(currentQuizMode) {
        case 'Key Notes': {
          const scale = getScale(questionKey, scaleType);
          question = {
            id: i,
            prompt: `Find all notes in ${questionKey} ${scaleType}`,
            correctAnswers: scale.notes,
            key: questionKey,
            scaleType,
            quizMode: currentQuizMode,
          };
          break;
        }
        case 'Chord Builder': {
          const rootNote = questionKey;
          const chordType = performance ? getWeightedRandom(CHORD_TYPES, performance.byChord, t => t) : CHORD_TYPES[Math.floor(Math.random() * CHORD_TYPES.length)];
          const formula = CHORD_FORMULAS[chordType];
          const rootIndex = getNoteIndex(rootNote);
          const chordNotes = formula.map(interval => getNoteFromIndex(rootIndex + interval));

          question = {
            id: i,
            prompt: `Build the ${rootNote} ${chordType} chord`,
            correctAnswers: chordNotes,
            key: rootNote,
            scaleType,
            chordType,
            quizMode: currentQuizMode,
            rootUniqueId
          };
          break;
        }
        case 'Scale Detective': {
          const scale = getScale(questionKey, scaleType);
          const missingNoteIndex = Math.floor(Math.random() * scale.notes.length);
          const missingNote = scale.notes[missingNoteIndex];
          const contextNotes = scale.notes.filter((_, index) => index !== missingNoteIndex);

          question = {
              id: i,
              prompt: 'Find the missing note in the scale.',
              correctAnswers: [missingNote],
              contextNotes: contextNotes,
              key: questionKey,
              scaleType: scaleType,
              quizMode: currentQuizMode,
          };
          break;
        }
        case 'Intervals': {
          const rootNote = questionKey;
          const intervalName = performance ? getWeightedRandom(INTERVAL_NAMES, performance.byInterval, name => name) : INTERVAL_NAMES[Math.floor(Math.random() * INTERVAL_NAMES.length)];
          const semitones = INTERVALS[intervalName];
          const rootIndex = getNoteIndex(rootNote);
          const intervalNote = getNoteFromIndex(rootIndex + semitones);

          question = {
            id: i,
            prompt: `Play the ${intervalName} of ${rootNote}`,
            correctAnswers: [intervalNote],
            key: rootNote,
            scaleType,
            intervalName,
            quizMode: currentQuizMode,
            rootUniqueId
          };
          break;
        }
        default: { // All single-note degree modes
          const scale = getScale(questionKey, scaleType);
          const degreesToPractice = 
            (currentQuizMode === 'Degree Training' && settings.practiceDegrees && settings.practiceDegrees.length > 0)
            ? settings.practiceDegrees
            : Array.from({ length: 7 }, (_, i) => i + 1);

          const degree = performance ? getWeightedRandom(degreesToPractice, performance.byDegree, d => d) : degreesToPractice[Math.floor(Math.random() * degreesToPractice.length)];
          const correctAnswer = scale.notes[degree - 1];

          let promptText: string;
          if (currentQuizMode === 'Nashville Numbers') {
              const degreeName = NASHVILLE_DEGREE_NAMES[scaleType][degree];
              promptText = `Play the ${degreeName} of ${questionKey} ${scaleType}`;
          } else {
              promptText = `Play the ${DEGREE_NAMES[degree]} of ${questionKey} ${scaleType}`;
          }

          question = {
            id: i,
            prompt: promptText,
            degree,
            correctAnswers: [correctAnswer],
            key: questionKey,
            scaleType,
            quizMode: currentQuizMode,
            rootUniqueId
          };
          break;
        }
      }
      if (question) {
        questions.push(question);
      }
    }

    return shuffleArray(questions);
  }
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

// --- Unique Note ID Helpers ---

// Converts a unique note ID like 'C4' or 'F#3' to a MIDI number
const noteIdToMidi = (noteId: string): number => {
    const match = noteId.match(/([A-G][b#]?)(-?\d+)/);
    if (!match) return 0;
    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    const noteIndex = ALL_NOTES.indexOf(noteName as Note);
    return (octave + 1) * 12 + noteIndex;
};

// Converts a MIDI number to a unique note ID like 'C4'
const midiToNoteId = (midiNumber: number): string => {
    const noteName = ALL_NOTES[midiNumber % 12];
    const octave = Math.floor(midiNumber / 12) - 1;
    return `${noteName}${octave}`;
};

/**
 * Calculates the concrete, unique answers (e.g., ['G4']) for a given question
 * based on its abstract correct answers (e.g., ['G']) and its root context.
 */
export const getUniqueAnswersForQuestion = (question: Question): string[] => {
    if (!question.rootUniqueId || !/\d/.test(question.rootUniqueId)) {
        // For non-octave-specific questions, or questions where the root is just a note name,
        // the answers are just the note names.
        return question.correctAnswers;
    }
    
    const rootMidi = noteIdToMidi(question.rootUniqueId);
    const rootNoteName = getNoteNameFromUniqueId(question.rootUniqueId);
    const rootNoteIndex = ALL_NOTES.indexOf(rootNoteName);

    return question.correctAnswers.map(answerNoteName => {
        const answerNoteIndex = ALL_NOTES.indexOf(answerNoteName);
        let semitoneDifference = answerNoteIndex - rootNoteIndex;
        // Adjust for notes that cross the octave boundary (e.g., root is B, answer is C)
        if (semitoneDifference < -6) { // Heuristic: if more than a tritone away, it's probably the next octave up
            semitoneDifference += 12;
        } else if (semitoneDifference > 6) { // Heuristic: if more than a tritone away down, it's the octave down
            semitoneDifference -= 12;
        }
        const targetMidi = rootMidi + semitoneDifference;
        return midiToNoteId(targetMidi);
    });
};