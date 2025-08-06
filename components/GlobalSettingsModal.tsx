
import React from 'react';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInputTester: () => void;
}

const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({ isOpen, onClose, onStartInputTester }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 max-w-md w-full shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-orange-400">Diagnostics</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="pt-4 border-t border-stone-700">
            <p className="text-sm text-stone-400 mb-4">Use the input tester to check if your MIDI controller, microphone, or audio interface is working correctly with the app.</p>
            <button
            onClick={onStartInputTester}
            className="w-full bg-stone-600 hover:bg-stone-500 text-white font-bold py-3 px-4 rounded-lg transition"
            >
            Test Input
            </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettingsModal;