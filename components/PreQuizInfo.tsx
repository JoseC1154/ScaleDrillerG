
import React, { useState } from 'react';
import { QuizMode } from '../types';

interface PreQuizInfoProps {
  quizMode: QuizMode;
  onReady: () => void;
  onSkipChange: (skip: boolean) => void;
}

const getModeInfo = (mode: QuizMode): { title: string; description: string } => {
  switch (mode) {
    case 'Simon Memory Game':
      return { title: 'Simon Memory Game', description: "Memorize an ever-growing sequence of notes. Play it back correctly to advance to the next round." };
    case 'Key Notes':
      return { title: 'Key Notes', description: "Find all the notes in the given scale. Answer as many as you can before your 'beats' run out!" };
    case 'Scale Detective':
      return { title: 'Scale Detective', description: "A two-part challenge: first find the missing note in a scale, then identify the scale's root key." };
    case 'Time Attack':
      return { title: 'Time Attack', description: 'A fast-paced drill. Answer 40 single-note questions, each with a 15-second time limit.' };
    case 'BPM Challenge':
      return { title: 'BPM Challenge', description: 'A survival mode. Answer questions against a metronome that speeds up as you level up. Dont let your beats drop to zero!' };
    case 'Chord Builder':
        return { title: 'Chord Builder', description: 'You are given a root note and chord type (Major or Minor). Find all notes that form the chord.' };
    case 'Intervals':
        return { title: 'Intervals', description: 'You are given a root note and an interval name (e.g., "Major 3rd"). Play the note that completes the interval.'};
    case 'Randomizer Roulette':
        return { title: 'Randomizer Roulette', description: 'A random mix of questions from all other modes to keep you on your toes. Survive as long as you can!'};
    case 'BPM Roulette':
        return { title: 'BPM Roulette', description: 'The ultimate challenge! A random mix of questions combined with the intense, ever-increasing timer from BPM Challenge.'};
    default:
      return { title: mode.replace(/([A-Z])/g, ' $1').trim(), description: "Play the correct note or notes based on the prompt. Don't let your 'beats' run out!" };
  }
};

const PreQuizInfo: React.FC<PreQuizInfoProps> = ({ quizMode, onReady, onSkipChange }) => {
  const [skip, setSkip] = useState(false);
  const { title, description } = getModeInfo(quizMode);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkip(e.target.checked);
    onSkipChange(e.target.checked);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-8 max-w-lg w-full text-center shadow-2xl">
        <h2 className="text-3xl font-bold text-orange-400 mb-3">How to Play: {title}</h2>
        <p className="text-stone-300 mb-8 text-lg">{description}</p>
        
        <button
          onClick={onReady}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105"
        >
          Ready!
        </button>

        <div className="mt-6">
            <label className="flex items-center justify-center gap-2 text-stone-400 cursor-pointer">
                <input
                    type="checkbox"
                    checked={skip}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 rounded bg-stone-700 border-stone-600 text-orange-600 focus:ring-orange-500"
                />
                Don't show this again
            </label>
        </div>
      </div>
    </div>
  );
};

export default PreQuizInfo;
