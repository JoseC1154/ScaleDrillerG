
import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { ALL_NOTES } from '../constants';

const midiToNote = (midiNumber: number): Note => {
  return ALL_NOTES[midiNumber % 12];
};

export const useMidi = (enabled: boolean, onNotePlayed: (note: Note) => void) => {
  const [isMidiSupported, setIsMidiSupported] = useState(false);
  const [midiError, setMidiError] = useState<string | null>(null);
  const [lastPlayedNote, setLastPlayedNote] = useState<Note | null>(null);
  
  const handleMidiMessage = useCallback((message: MIDIMessageEvent) => {
    const [command, noteNumber, velocity] = message.data;
    if (command === 144 && velocity > 0) {
      const note = midiToNote(noteNumber);
      setLastPlayedNote(note);
      onNotePlayed(note);
    }
  }, [onNotePlayed]);

  useEffect(() => {
    if (!enabled) return;

    const setupMidi = async () => {
        if (navigator.requestMIDIAccess) {
            setIsMidiSupported(true);
            try {
                const midiAccess = await navigator.requestMIDIAccess();
                
                midiAccess.inputs.forEach(input => {
                    // @ts-ignore
                    input.onmidimessage = null;
                });

                if (midiAccess.inputs.size === 0) {
                    setMidiError("No MIDI input devices found.");
                    return;
                }
                
                setMidiError(null);
                midiAccess.inputs.forEach(input => {
                    input.onmidimessage = handleMidiMessage;
                });

                midiAccess.onstatechange = () => setupMidi();

            } catch (err) {
                console.error("Could not access your MIDI devices.", err);
                setMidiError("MIDI access denied or not available.");
                setIsMidiSupported(false);
            }
        } else {
            setMidiError("Web MIDI API is not supported in this browser.");
            setIsMidiSupported(false);
        }
    };
    
    setupMidi();

  }, [enabled, handleMidiMessage]);

  return { isMidiSupported, midiError, lastPlayedNote };
};