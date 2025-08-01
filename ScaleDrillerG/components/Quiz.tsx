import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { QuizSettings, Note, Question, Scale } from '../types';
import { generateQuizQuestions, getScale } from '../services/music';
import { useMidi } from '../hooks/useMidi';
import { useAudioPitch } from '../hooks/useAudioPitch';
import Piano from './Piano';
import Fretboard from './Fretboard';
import HelpModal from './HelpModal';

interface QuizProps {
  settings: QuizSettings;
  onQuit: () => void;
}

const BPM_QUESTION_TIME = 7;
const BPM_LEVEL_UP_THRESHOLD = 30;

const Quiz: React.FC<QuizProps> = ({ settings, onQuit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'feedback' | 'finished'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [lastPlayedNote, setLastPlayedNote] = useState<Note | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [scoreChange, setScoreChange] = useState<{ value: number, id: number } | null>(null);
  
  // Time Attack State
  const [timer, setTimer] = useState(settings.timeAttackDuration);
  
  // Universal Question Timer State
  const [questionTimer, setQuestionTimer] = useState(settings.secondsPerQuestion);

  // BPM Challenge State
  const isBPMMode = settings.quizMode === 'BPM Challenge';
  const [beats, setBeats] = useState(50);
  const [level, setLevel] = useState(1);
  const [currentBpm, setCurrentBpm] = useState(60);
  const [beatsEarnedThisLevel, setBeatsEarnedThisLevel] = useState(0);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
        audioCtxRef.current?.close();
    }
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.01);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    oscillator.start(audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    oscillator.stop(audioCtx.currentTime + duration);
  }, []);

  const playCorrectSound = useCallback(() => playTone(523.25, 0.2, 'triangle'), [playTone]);
  const playIncorrectSound = useCallback(() => playTone(138.59, 0.3, 'sawtooth'), [playTone]);
  const playTickSound = useCallback(() => playTone(1200, 0.05, 'triangle', 0.1), [playTone]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const scale: Scale | null = useMemo(() => {
    if (!currentQuestion) return null;
    return getScale(currentQuestion.key, currentQuestion.scaleType);
  }, [currentQuestion]);
  
  const advanceToNextQuestion = useCallback(() => {
    const nextState = () => {
        setFeedback(null);
        setLastPlayedNote(null);
    };

    if (isBPMMode) {
        if (beats > 0) {
            if (currentQuestionIndex >= questions.length - 5) {
                const newQuestions = generateQuizQuestions({ ...settings, key: 'Random' }, 20);
                setQuestions(q => [...q, ...newQuestions.map((nq, i) => ({...nq, id: q.length + i}))]);
            }
            setCurrentQuestionIndex(i => i + 1);
            setGameState('playing');
        } else {
            setGameState('finished');
        }
    } else {
        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(i => i + 1);
            setGameState('playing');
        } else {
            setGameState('finished');
        }
    }
    nextState();
  }, [currentQuestionIndex, questions.length, isBPMMode, beats, settings]);

  useEffect(() => {
    const questionSettings = isBPMMode ? { ...settings, key: 'Random' as const } : settings;
    const count = isBPMMode ? 50 : settings.questionCount;
    setQuestions(generateQuizQuestions(questionSettings, count));
  }, [settings, isBPMMode]);

  // Total Timer for Time Attack
  useEffect(() => {
    if (settings.quizMode !== 'Time Attack' || gameState !== 'playing') return;
    
    const intervalId = window.setInterval(() => {
        setTimer(t => {
            if (t <= 1) {
                clearInterval(intervalId);
                setGameState('finished');
                return 0;
            }
            playTickSound();
            return t - 1;
        });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [settings.quizMode, gameState, playTickSound]);

  // BPM Challenge Ticking
  useEffect(() => {
    if (!isBPMMode || gameState !== 'playing') return;
    
    playTickSound(); // Play first tick immediately

    const intervalTime = (60 / currentBpm) * 1000;
    const interval = setInterval(() => {
        playTickSound();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isBPMMode, gameState, currentBpm, playTickSound]);

  const handleTimeAttackTimeOut = useCallback(() => {
      if (gameState !== 'playing') return;
      setTimer(t => Math.max(0, t - 5));
      setScoreChange({ value: -5, id: Date.now() });
      setFeedback('incorrect');
      playIncorrectSound();
      setGameState('feedback');
      setTimeout(advanceToNextQuestion, 1500);
  }, [gameState, playIncorrectSound, advanceToNextQuestion]);
  
  const handleBpmTimeOut = useCallback(() => {
    if (gameState !== 'playing') return;
    setBeats(b => b - 5);
    setScoreChange({ value: -5, id: Date.now() });
    setFeedback('incorrect');
    playIncorrectSound();
    setGameState('feedback');
    setTimeout(advanceToNextQuestion, 1500);
  }, [gameState, playIncorrectSound, advanceToNextQuestion]);

  // Per-Question Timers
  useEffect(() => {
      if (gameState !== 'playing' || (settings.quizMode !== 'Time Attack' && !isBPMMode)) return;

      const timeoutHandler = isBPMMode ? handleBpmTimeOut : handleTimeAttackTimeOut;
      
      const intervalId = setInterval(() => {
          setQuestionTimer(prev => {
              if (prev <= 1) {
                  clearInterval(intervalId);
                  timeoutHandler();
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);

      return () => clearInterval(intervalId);
  }, [gameState, settings.quizMode, isBPMMode, handleBpmTimeOut, handleTimeAttackTimeOut, currentQuestionIndex]);
  
  // Reset question timer on new question
  useEffect(() => {
    if (settings.quizMode === 'Time Attack') {
      setQuestionTimer(settings.secondsPerQuestion);
    } else if (isBPMMode) {
      setQuestionTimer(BPM_QUESTION_TIME);
    }
  }, [currentQuestionIndex, settings, isBPMMode]);

  // BPM Level Up Logic
  useEffect(() => {
    if (isBPMMode && beatsEarnedThisLevel >= BPM_LEVEL_UP_THRESHOLD) {
      setLevel(l => l + 1);
      setCurrentBpm(b => b + 10);
      setBeatsEarnedThisLevel(b => b - BPM_LEVEL_UP_THRESHOLD);
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 1500);
    }
  }, [isBPMMode, beatsEarnedThisLevel]);

  // Check for game over in BPM mode after state update
  useEffect(() => {
    if (isBPMMode && beats <= 0 && gameState !== 'finished') {
        setGameState('finished');
    }
  }, [beats, isBPMMode, gameState]);

  const handleAnswer = useCallback((playedNote: Note) => {
    if (gameState !== 'playing' || !currentQuestion) return;
    setLastPlayedNote(playedNote);
    
    const isCorrect = playedNote === currentQuestion.correctAnswer;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    isCorrect ? playCorrectSound() : playIncorrectSound();
    
    if (isBPMMode) {
        if (isCorrect) {
            setBeats(b => b + 3);
            setBeatsEarnedThisLevel(b => b + 3);
            setScoreChange({ value: 3, id: Date.now() });
            setScore(s => s + 1);
        } else {
            setBeats(b => b - 5);
            setScoreChange({ value: -5, id: Date.now() });
        }
    } else { // Time Attack or other modes
        if (isCorrect) {
            setScore(s => s + 1);
            if (settings.quizMode === 'Time Attack') {
                setTimer(t => t + 3);
                setScoreChange({ value: 3, id: Date.now() });
            }
        }
    }

    setGameState('feedback');
    setTimeout(advanceToNextQuestion, 1500);
  }, [gameState, currentQuestion, settings, playCorrectSound, playIncorrectSound, advanceToNextQuestion, isBPMMode]);
  
  useMidi(settings.inputMethod === 'MIDI', handleAnswer);
  useAudioPitch(settings.inputMethod === 'Audio', handleAnswer);

  const renderInstrument = () => {
    const getActiveNotes = () => {
        if (feedback === 'correct') return { correctNote: currentQuestion.correctAnswer, incorrectNote: null };
        if (feedback === 'incorrect') return { correctNote: currentQuestion.correctAnswer, incorrectNote: lastPlayedNote };
        return { correctNote: null, incorrectNote: null };
    };
    const { correctNote, incorrectNote } = getActiveNotes();
    const commonProps = {
      onNotePlayed: settings.inputMethod === 'Virtual Instrument' ? handleAnswer : () => {},
      highlightedNotes: (showHelp && scale) ? scale.notes : [],
      correctNote,
      incorrectNote,
    };
    
    switch (settings.instrument) {
      case 'Piano': return <Piano {...commonProps} />;
      case 'Guitar':
      case 'Bass': return <Fretboard instrument={settings.instrument} {...commonProps} handedness={settings.handedness} />;
      default: return null;
    }
  };

  if (questions.length === 0 || !currentQuestion) {
    return <div className="text-center p-8">Loading quiz...</div>;
  }
  
  if (gameState === 'finished') {
    if (isBPMMode) {
        return (
          <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-8 rounded-xl text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-2 text-red-500">BEATS DROPPED!</h2>
            <p className="text-xl mb-4">You survived until...</p>
            <div className='flex justify-center gap-8'>
                <div>
                    <div className='text-stone-400 text-sm'>FINAL LEVEL</div>
                    <div className='text-4xl font-bold text-orange-400'>{level}</div>
                </div>
                <div>
                    <div className='text-stone-400 text-sm'>PEAK BPM</div>
                    <div className='text-4xl font-bold text-orange-400'>{currentBpm}</div>
                </div>
            </div>
            <button onClick={onQuit} className="mt-8 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg">Try Again</button>
          </div>
        );
    }
    return (
      <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-8 rounded-xl text-center shadow-2xl">
        <h2 className="text-3xl font-bold mb-4">Quiz Finished!</h2>
        <p className="text-xl mb-6">Your score: <span className="font-bold text-orange-400">{score} / {questions.length}</span></p>
        <button onClick={onQuit} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg">Play Again</button>
      </div>
    );
  }

  const feedbackClass = feedback === 'correct' ? 'bg-green-500/20 border-green-500' : feedback === 'incorrect' ? 'bg-red-500/20 border-red-500' : 'bg-black/30 border-transparent';
  const questionTimeSeconds = isBPMMode ? BPM_QUESTION_TIME : settings.secondsPerQuestion;

  const renderHeader = () => {
    if (isBPMMode) {
        return (
            <div className="mb-4 text-stone-300 relative">
                <div className="grid grid-cols-3 gap-2 text-center items-end">
                    <div>
                        <div className="text-xs text-stone-400">BEATS</div>
                        <div className="text-3xl font-bold text-orange-400 relative">
                            {beats}
                             {scoreChange && (
                                <span
                                    key={scoreChange.id}
                                    className={`absolute -top-6 right-0 text-2xl font-bold animate-float-up ${scoreChange.value > 0 ? 'text-green-400' : 'text-red-500'}`}
                                    style={{textShadow: '0 0 5px black'}}
                                >
                                    {scoreChange.value > 0 ? `+${scoreChange.value}` : scoreChange.value}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-stone-400">LEVEL</div>
                        <div className="text-4xl font-bold text-stone-100">{level}</div>
                    </div>
                     <div>
                        <div className="text-xs text-stone-400">BPM</div>
                        <div className="text-3xl font-bold text-stone-100">{currentBpm}</div>
                    </div>
                </div>
                <div className="col-span-3 mt-2">
                    <div className="w-full bg-stone-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-400 to-amber-300 h-2 rounded-full" style={{width: `${Math.min(100, (beatsEarnedThisLevel / BPM_LEVEL_UP_THRESHOLD) * 100)}%`, transition: 'width 0.5s ease-in-out'}}></div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 flex gap-2">
                    <button onClick={onQuit} title="Quit" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
       <header className="flex justify-between items-center mb-4 text-stone-300">
        <div>
          <span className="font-bold text-lg text-stone-100">Score: {score}</span>
          <span className="text-stone-400 ml-4">Q: {currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        <div className="relative">
          {settings.quizMode === 'Time Attack' && (
            <span className="font-bold text-lg text-amber-400">Time: {timer}s</span>
          )}
          {settings.quizMode === 'Time Attack' && scoreChange && (
            <span
                key={scoreChange.id}
                className={`absolute left-full ml-2 text-xl font-bold animate-float-up ${scoreChange.value > 0 ? 'text-green-400' : 'text-red-500'}`}
                style={{textShadow: '0 0 5px black'}}
            >
                {scoreChange.value > 0 ? `+${scoreChange.value}` : scoreChange.value}
            </span>
          )}
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowHelp(true)} title="Help" className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            </button>
            <button onClick={onQuit} title="Quit" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>
      </header>
    );
  };

  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-4 sm:p-6 rounded-xl shadow-2xl w-full mx-auto">
      {showHelp && scale && <HelpModal scale={scale} onClose={() => setShowHelp(false)} />}
      {renderHeader()}

      <div className={`text-center p-6 my-4 rounded-lg border transition-colors duration-300 relative overflow-hidden ${feedbackClass} ${isLevelingUp ? 'animate-level-up' : ''}`}>
        {(settings.quizMode === 'Time Attack' || isBPMMode) && gameState === 'playing' && (
            <div 
                className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" 
                style={{ width: `${(questionTimer / questionTimeSeconds) * 100}%`, transition: 'width 1s linear' }}
            ></div>
        )}
        <p className="text-2xl sm:text-3xl font-semibold text-stone-100 min-h-[48px] flex items-center justify-center">
            {isLevelingUp ? 'LEVEL UP!' : currentQuestion.prompt}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        {renderInstrument()}
      </div>
    </div>
  );
};

export default Quiz;