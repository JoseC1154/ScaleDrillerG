import React from 'react';
import { Note, Handedness } from '../types';
import { getFretboardNotes } from '../services/music';
import { GUITAR_TUNING, BASS_TUNING } from '../constants';

interface FretProps {
    note: Note;
    fretNum: number;
    isHighlighted: boolean;
    isCorrect: boolean;
    isIncorrect: boolean;
    onClick: (note: Note) => void;
    showInlay: boolean;
}

const Fret: React.FC<FretProps> = ({ note, fretNum, isHighlighted, isCorrect, isIncorrect, onClick, showInlay }) => {
    const isDoubleMarkerFret = fretNum === 12;

    const baseClasses = 'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 z-10';
    let stateClasses = 'bg-transparent text-stone-400 hover:bg-white/20 hover:text-white';

    if (isCorrect) {
        stateClasses = '!bg-green-400 !text-black ring-2 ring-white transform scale-105';
    } else if (isIncorrect) {
        stateClasses = '!bg-red-500 !text-black ring-2 ring-white transform scale-105';
    } else if (isHighlighted) {
        stateClasses = '!bg-orange-400 !text-black shadow-lg transform scale-105';
    }

    return (
        <div className="relative flex-1 flex items-center justify-center h-10 sm:h-12">
            {/* Inlays */}
            {showInlay && !isDoubleMarkerFret && (
                <div className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-200 bg-opacity-40 rounded-full z-0"></div>
            )}
            {showInlay && isDoubleMarkerFret && (
                <>
                    <div className="absolute -translate-y-3 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-200 bg-opacity-40 rounded-full z-0"></div>
                    <div className="absolute translate-y-3 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-200 bg-opacity-40 rounded-full z-0"></div>
                </>
            )}

            {/* Note Marker Button */}
            <button
                onClick={() => onClick(note)}
                aria-label={`Play note ${note}`}
                className={`${baseClasses} ${stateClasses}`}
            >
                {note}
            </button>
        </div>
    );
};


interface FretboardProps {
  instrument: 'Guitar' | 'Bass';
  onNotePlayed: (note: Note) => void;
  highlightedNotes?: Note[];
  correctNote?: Note | null;
  incorrectNote?: Note | null;
  handedness: Handedness;
}

const Fretboard: React.FC<FretboardProps> = ({ instrument, onNotePlayed, highlightedNotes = [], correctNote = null, incorrectNote = null, handedness }) => {
  const tuning = instrument === 'Guitar' ? GUITAR_TUNING : BASS_TUNING;
  const fretCount = 12;
  const allNotes = getFretboardNotes(tuning, fretCount);
  // String thickness from thin to thick, to match the tuning array order.
  const stringThicknessMap = instrument === 'Guitar' ? [1.5, 1.8, 2.2, 3.0, 3.8, 4.5] : [2.5, 3.2, 4.0, 4.8];
  const fretMarkers = [3, 5, 7, 9, 12];

  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-2 sm:p-4 rounded-lg shadow-lg w-full min-w-[700px] overflow-x-auto">
        <div className={`flex ${handedness === 'Left' ? 'flex-row-reverse' : ''}`}>
            {/* Fretboard Neck */}
            <div className="flex-1 bg-gradient-to-r from-[#4a2e20] to-[#6f4533] rounded-md">
                <div className="relative flex flex-col">
                    {tuning.map((openNote, stringIndex) => {
                        const inlayStringIndex = instrument === 'Guitar' ? 2 : 1; // G string on guitar, D on bass

                        const baseOpenStringClasses = 'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 z-20';
                        let stateOpenStringClasses = 'bg-transparent text-stone-300 hover:bg-white/20 hover:text-white';
                        
                        if (correctNote === openNote) {
                            stateOpenStringClasses = '!bg-green-400 !text-black ring-2 ring-white transform scale-105';
                        } else if (incorrectNote === openNote) {
                            stateOpenStringClasses = '!bg-red-500 !text-black ring-2 ring-white transform scale-105';
                        } else if (highlightedNotes.includes(openNote)) {
                            stateOpenStringClasses = '!bg-orange-400 !text-black shadow-lg transform scale-105';
                        }

                        return (
                        <div key={stringIndex} className={`relative flex items-center h-10 sm:h-12 ${handedness === 'Left' ? 'flex-row-reverse' : ''}`}>
                            {/* String line */}
                            <div className="absolute w-full bg-gradient-to-r from-gray-500 to-gray-400 z-0" style={{ height: `${stringThicknessMap[stringIndex]}px`}}></div>
                            
                            {/* Nut & Open String */}
                            <div className="relative w-12 flex items-center justify-center h-full">
                                <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100 z-10" style={handedness === 'Right' ? { right: 0 } : { left: 0 }}></div>
                                <button
                                    onClick={() => onNotePlayed(openNote)}
                                    aria-label={`Play open string ${openNote}`}
                                    className={`${baseOpenStringClasses} ${stateOpenStringClasses}`}
                                >
                                    {openNote}
                                </button>
                            </div>

                            {/* Frets */}
                            <div className="flex-1 flex">
                                {Array.from({ length: fretCount }).map((_, fretIndex) => {
                                    const fretNum = fretIndex + 1;
                                    const noteInfo = allNotes.find(n => n.string === stringIndex && n.fret === fretNum);
                                    if (!noteInfo) return null;
                                    return (
                                        <div key={fretNum} className="flex-1 relative flex items-center justify-center">
                                            <Fret
                                                note={noteInfo.note}
                                                fretNum={fretNum}
                                                isHighlighted={highlightedNotes.includes(noteInfo.note)}
                                                isCorrect={correctNote === noteInfo.note}
                                                isIncorrect={incorrectNote === noteInfo.note}
                                                onClick={onNotePlayed}
                                                showInlay={stringIndex === inlayStringIndex && fretMarkers.includes(fretNum)}
                                            />
                                            <div className="absolute top-0 h-full w-0.5 bg-gradient-to-b from-gray-400 via-gray-300 to-gray-400 z-0" style={handedness === 'Right' ? { right: 0 } : { left: 0 }}></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Fretboard;