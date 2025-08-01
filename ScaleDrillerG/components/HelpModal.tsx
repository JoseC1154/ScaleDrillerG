import React from 'react';
import { Scale } from '../types';
import { DEGREE_NAMES } from '../constants';

interface HelpModalProps {
  scale: Scale;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ scale, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">{scale.key} {scale.type} Scale</h2>
        <div className="space-y-2">
          {scale.notes.map((note, index) => (
            <div key={note} className="flex justify-between items-center bg-stone-800 p-3 rounded-md">
              <span className="font-semibold text-lg text-stone-100">{note}</span>
              <span className="text-stone-400">{DEGREE_NAMES[index + 1]} Degree</span>
            </div>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HelpModal;