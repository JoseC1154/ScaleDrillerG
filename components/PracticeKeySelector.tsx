
import React from 'react';
import { Note, Instrument } from '../types';
import { ALL_NOTES } from '../constants';

interface PracticeKeySelectorProps {
    selectedKeys: Note[];
    onToggleKey: (key: Note) => void;
    instrument: Instrument; // Kept for future compatibility
}

const PracticeKeySelector: React.FC<PracticeKeySelectorProps> = ({ selectedKeys, onToggleKey }) => {
  
  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {ALL_NOTES.map(note => {
          const isSelected = selectedKeys.includes(note);
          return (
            <button
              key={note}
              onClick={() => onToggleKey(note)}
              className={`py-2 px-1 rounded-lg text-sm font-semibold transition-colors duration-200 w-full border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              {note}
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default PracticeKeySelector;