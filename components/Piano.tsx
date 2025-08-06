
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Note, Scale } from '../types';
import { ALL_NOTES } from '../constants';

interface PianoKeyProps {
  note: Note;
  isBlack: boolean;
  isHighlighted: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  onClick: (note: string) => void;
  octave?: number;
  labelMode?: 'notes' | 'degrees';
  scale?: Scale | null;
  uniqueKey: string;
}

const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlack, isHighlighted, isCorrect, isIncorrect, onClick, octave, labelMode, scale, uniqueKey }) => {
  const keyClasses = `
    relative border border-gray-600 cursor-pointer transition-all duration-100 flex items-end justify-center pb-2
    ${isBlack ? 'bg-gray-800 text-white h-28 w-7 -ml-3.5 -mr-3.5 z-10 rounded-b-md' : 'bg-gray-100 text-black h-48 w-12'}
    ${isHighlighted && !isCorrect && !isIncorrect ? '!bg-orange-400 !border-orange-600' : ''}
    ${isCorrect ? (isBlack ? '!bg-green-400 !border-green-400' : '!bg-green-300 !border-green-300') : ''}
    ${isIncorrect ? (isBlack ? '!bg-red-500 !border-red-500' : '!bg-red-400 !border-red-400') : ''}
    ${isBlack ? 'hover:bg-gray-700' : 'hover:bg-gray-700'}
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
    <div className={keyClasses} onClick={() => onClick(uniqueKey)}>
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
  onNotePlayed: (note: string) => void;
  highlightedNotes?: string[];
  correctNotes?: string[];
  incorrectNote?: string | null;
  labelMode?: 'notes' | 'degrees';
  scale?: Scale | null;
}

const WHITE_KEY_WIDTH_PX = 48; // from w-12
const START_MIDI_NOTE = 36; // Start from C2

const Piano: React.FC<PianoProps> = ({ onNotePlayed, highlightedNotes = [], correctNotes = [], incorrectNote = null, labelMode = 'notes', scale = null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numberOfKeys, setNumberOfKeys] = useState(25); // Default to ~2 octaves

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        // Calculate how many white keys can fit in the container
        const numWhiteKeysThatFit = Math.floor(containerWidth / WHITE_KEY_WIDTH_PX);
        
        let keysToRenderCount = 0;
        let whiteKeyCount = 0;
        let currentMidi = START_MIDI_NOTE;

        // Count how many total keys (black and white) we can render
        // until we reach the number of white keys that can fit.
        while (whiteKeyCount < numWhiteKeysThatFit && currentMidi < 109) { // 108 = C8
          const note = ALL_NOTES[currentMidi % 12];
          const isBlack = note.includes('b') || note.includes('#');
          if (!isBlack) {
            whiteKeyCount++;
          }
          keysToRenderCount++;
          currentMidi++;
        }
        
        // Ensure we render at least one full octave
        setNumberOfKeys(Math.max(12, keysToRenderCount));
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const pianoKeys = useMemo(() => {
    const keys: { note: Note; octave: number; uniqueKey: string }[] = [];
    for (let i = 0; i < numberOfKeys; i++) {
        const midiNumber = START_MIDI_NOTE + i;
        if (midiNumber > 108) break; // C8 is MIDI 108
        const note = ALL_NOTES[midiNumber % 12];
        const octave = Math.floor(midiNumber / 12) - 1;
        keys.push({
            note,
            octave,
            uniqueKey: `${note}${octave}`,
        });
    }
    return keys;
  }, [numberOfKeys]);

  const { correctUniqueIds, correctNoteNames } = useMemo(() => {
    const uniqueIds = new Set<string>();
    const noteNames = new Set<string>();
    correctNotes.forEach(cn => {
        // A unique piano ID will always have a digit. A note name won't.
        if (/\d/.test(cn)) {
            uniqueIds.add(cn);
        } else {
            noteNames.add(cn);
        }
    });
    return { correctUniqueIds: uniqueIds, correctNoteNames: noteNames };
  }, [correctNotes]);

  const { highlightedUniqueIds, highlightedNoteNames } = useMemo(() => {
    const uniqueIds = new Set<string>();
    const noteNames = new Set<string>();
    highlightedNotes.forEach(hn => {
        if (/\d/.test(hn)) {
            uniqueIds.add(hn);
        } else {
            noteNames.add(hn);
        }
    });
    return { highlightedUniqueIds: uniqueIds, highlightedNoteNames: noteNames };
  }, [highlightedNotes]);
  
  return (
    <div ref={containerRef} className="flex justify-center p-4 bg-stone-900/70 backdrop-blur-lg rounded-lg overflow-hidden w-full">
      <div className="flex flex-nowrap">
        {pianoKeys.map(({ note, octave, uniqueKey }) => {
          const isCorrect = correctUniqueIds.has(uniqueKey) || correctNoteNames.has(note);
          const isHighlighted = highlightedUniqueIds.has(uniqueKey) || highlightedNoteNames.has(note);
          
          return (
            <PianoKey
              key={uniqueKey}
              note={note}
              isBlack={note.includes('b') || note.includes('#')}
              isHighlighted={isHighlighted}
              isCorrect={isCorrect}
              isIncorrect={incorrectNote === uniqueKey}
              onClick={onNotePlayed}
              octave={octave}
              labelMode={labelMode}
              scale={scale}
              uniqueKey={uniqueKey}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Piano;