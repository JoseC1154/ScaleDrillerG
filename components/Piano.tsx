import React from 'react';
import { Note, Scale } from '../types';

interface PianoKeyProps {
  note: Note;
  isBlack: boolean;
  isHighlighted: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  onClick: (note: Note) => void;
  octave?: number;
  labelMode?: 'notes' | 'degrees';
  scale?: Scale | null;
}

const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlack, isHighlighted, isCorrect, isIncorrect, onClick, octave, labelMode, scale }) => {
  const keyClasses = `
    relative border border-gray-600 cursor-pointer transition-all duration-100 flex items-end justify-center pb-2
    ${isBlack ? 'bg-gray-800 text-white h-28 w-7 -ml-3.5 -mr-3.5 z-10 rounded-b-md' : 'bg-gray-100 text-black h-48 w-12'}
    ${isHighlighted && !isCorrect && !isIncorrect ? '!bg-orange-400 !border-orange-400' : ''}
    ${isCorrect ? (isBlack ? '!bg-green-400 !border-green-400' : '!bg-green-300 !border-green-300') : ''}
    ${isIncorrect ? (isBlack ? '!bg-red-500 !border-red-500' : '!bg-red-400 !border-red-400') : ''}
    ${isBlack ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
  `;

  let displayLabel: string = note;
  let showOctaveNumber = note === 'C' && octave !== undefined;

  if (labelMode === 'degrees' && scale) {
    const degreeIndex = scale.notes.indexOf(note);
    if (degreeIndex !== -1) {
      displayLabel = (degreeIndex + 1).toString();
      showOctaveNumber = false;
    }
  }
  
  return (
    <div className={keyClasses} onClick={() => onClick(note)}>
      <div className="flex flex-col items-center">
        <span className={`font-semibold ${displayLabel.length > 1 ? 'text-xs' : 'text-sm'} ${isHighlighted || isCorrect || isIncorrect ? 'text-black' : ''}`}>
          {displayLabel}
        </span>
        {showOctaveNumber && (
          <span className={`text-[10px] mt-0.5 font-medium ${isHighlighted || isCorrect || isIncorrect ? 'text-black opacity-70' : 'text-gray-500'}`}>
            C{octave}
          </span>
        )}
      </div>
    </div>
  );
};

interface PianoProps {
  onNotePlayed: (note: Note) => void;
  highlightedNotes?: Note[];
  correctNote?: Note | null;
  incorrectNote?: Note | null;
  labelMode?: 'notes' | 'degrees';
  scale?: Scale | null;
}

const Piano: React.FC<PianoProps> = ({ onNotePlayed, highlightedNotes = [], correctNote = null, incorrectNote = null, labelMode = 'notes', scale = null }) => {
  const pianoNoteNames: Note[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const pianoKeys: { note: Note, octave: number, uniqueKey: string }[] = [];

  // Generate 2 octaves of notes, for example, from C4 to B5
  for (let octave = 4; octave <= 5; octave++) {
    pianoNoteNames.forEach(note => {
      pianoKeys.push({
        note: note,
        octave: octave,
        uniqueKey: `${note}${octave}`
      });
    });
  }
  
  return (
    <div className="flex justify-center p-4 bg-stone-900/70 backdrop-blur-lg rounded-lg overflow-x-auto w-full">
      <div className="flex">
        {pianoKeys.map(({ note, octave, uniqueKey }) => (
          <PianoKey
            key={uniqueKey}
            note={note}
            isBlack={note.includes('b') || note.includes('#')}
            isHighlighted={highlightedNotes.includes(note)}
            isCorrect={correctNote === note}
            isIncorrect={incorrectNote === note}
            onClick={onNotePlayed}
            octave={octave}
            labelMode={labelMode}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
};

export default Piano;