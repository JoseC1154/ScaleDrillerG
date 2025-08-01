import { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from '../types';
import { frequencyToNote } from '../services/music';

export const useAudioPitch = (enabled: boolean, onNotePlayed: (note: Note) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [lastDetectedNote, setLastDetectedNote] = useState<{ note: Note, centsOff: number } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);
  const animationFrameId = useRef<number | undefined>();

  const processAudio = useCallback(function loop(_time) {
    if (!analyserRef.current || !bufferRef.current || !audioContextRef.current) {
      return;
    }
    
    analyserRef.current.getFloatTimeDomainData(bufferRef.current);

    let bestCorrelation = 0;
    let bestOffset = -1;
    for (let offset = 80; offset < 1000; offset++) {
      let correlation = 0;
      for (let i = 0; i < 1000; i++) {
        correlation += bufferRef.current[i] * bufferRef.current[i + offset];
      }
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
    
    let noteFound = false;
    if (bestOffset !== -1) {
      const frequency = audioContextRef.current.sampleRate / bestOffset;
      const noteInfo = frequencyToNote(frequency);
      if (noteInfo && Math.abs(noteInfo.centsOff) < 35) {
        noteFound = true;
        setLastDetectedNote(prev => {
          if (prev?.note !== noteInfo.note) {
            onNotePlayed(noteInfo.note);
          }
          return { note: noteInfo.note, centsOff: noteInfo.centsOff };
        });
      }
    }

    if (!noteFound) {
      setLastDetectedNote(null);
    }
    
    if (audioContextRef.current) {
        animationFrameId.current = requestAnimationFrame(loop);
    }
  }, [onNotePlayed]);

  const stopListening = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = undefined;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
      mediaStreamSourceRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    mediaStreamSourceRef.current = null;
    bufferRef.current = null;
    setIsListening(false);
  }, []);
  
  const startListening = useCallback(async () => {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("getUserMedia not supported on your browser!");
        }

        stopListening(); // Stop any previous instance

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextConstructor) {
            throw new Error("Web Audio API is not supported in this browser.");
        }
        
        const context = new AudioContextConstructor();
        audioContextRef.current = context;

        const analyser = context.createAnalyser();
        analyser.fftSize = 4096;
        analyserRef.current = analyser;

        bufferRef.current = new Float32Array(analyser.fftSize);

        const source = context.createMediaStreamSource(stream);
        mediaStreamSourceRef.current = source;
        source.connect(analyser);

        setIsListening(true);
        setAudioError(null);
        animationFrameId.current = requestAnimationFrame(processAudio);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        setAudioError(err instanceof Error ? err.message : "An unknown error occurred.");
        setIsListening(false);
    }
  }, [processAudio, stopListening]);

  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [enabled, startListening, stopListening]);

  return { isListening, audioError, lastDetectedNote };
};