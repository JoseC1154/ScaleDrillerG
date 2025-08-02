import React, { useState, useCallback } from 'react';
import { QuizSettings, Note } from '../types';
import { useMidi } from '../hooks/useMidi';
import { useAudioPitch } from '../hooks/useAudioPitch';
import Piano from './Piano';
import Fretboard from './Fretboard';

interface InputTesterProps {
  settings: QuizSettings;
  onQuit: () => void;
}

const InputTester: React.FC<InputTesterProps> = ({ settings, onQuit }) => {
  const [lastNote, setLastNote] = useState<Note | null>(null);

  const handleNotePlayed = useCallback((note: Note) => {
    setLastNote(note);
  }, []);

  const { midiError } = useMidi(settings.inputMethod === 'MIDI', handleNotePlayed);
  const { audioError, isListening, lastDetectedNote } = useAudioPitch(settings.inputMethod === 'Audio', handleNotePlayed);

  const activeNote = settings.inputMethod === 'Audio' ? lastDetectedNote?.note ?? null : lastNote;
  
  const renderInstrument = () => {
    const highlightedNotes = activeNote ? [activeNote] : [];
    switch (settings.instrument) {
      case 'Piano':
        return <Piano onNotePlayed={handleNotePlayed} highlightedNotes={highlightedNotes} />;
      case 'Guitar':
      case 'Bass':
        return <Fretboard instrument={settings.instrument} onNotePlayed={handleNotePlayed} highlightedNotes={highlightedNotes} handedness={settings.handedness} labelMode="notes" scale={null} />;
      default:
        return null;
    }
  };

  const renderStatus = () => {
    if (settings.inputMethod === 'MIDI') {
      return midiError ? <p className="text-red-400">{midiError}</p> : <p className="text-green-400">MIDI input is active. Play a note on your device.</p>;
    }
    if (settings.inputMethod === 'Audio') {
      if (audioError) return <p className="text-red-400">{audioError}</p>;
      return isListening ? <p className="text-green-400">Microphone is active. Play or sing a note.</p> : <p className="text-yellow-400">Requesting microphone access...</p>;
    }
    return <p className="text-stone-400">Using on-screen instrument. Click a note to test.</p>;
  };

  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-6 sm:p-8 rounded-xl shadow-2xl w-full mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Input Tester</h2>
      <div className="text-center p-4 mb-4 bg-black/30 rounded-lg">
        <p className="text-stone-400 text-sm">Last Note Detected</p>
        <p className="text-5xl font-bold text-orange-400 h-16 flex items-center justify-center">{activeNote || '...'}</p>
        {renderStatus()}
      </div>
      
      <div className="my-6">
        {renderInstrument()}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onQuit}
          className="bg-stone-600 hover:bg-stone-500 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Back to Settings
        </button>
      </div>
    </div>
  );
};

export default InputTester;