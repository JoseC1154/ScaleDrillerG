
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { QuizSettings, Note, Question, Scale, MusicKey, UserData, PerformanceUpdate, QuizMode, QuizCompletionResult } from '../types';
import { generateQuizQuestions, getScale, getUniqueAnswersForQuestion } from '../services/music';
import { useMidi } from '../hooks/useMidi';
import { useAudioPitch } from '../hooks/useAudioPitch';
import Piano from './Piano';
import Fretboard from './Fretboard';
import HelpModal from './HelpModal';
import { MUSIC_KEYS } from '../constants';
import PreQuizInfo from './PreQuizInfo';
import Countdown from './Countdown';

interface QuizProps {
  settings: QuizSettings;
  onQuit: () => void;
  userData: UserData;
  onUpdatePerformance: (update: PerformanceUpdate) => void;
  onQuizComplete: (result: QuizCompletionResult) => void;
  onToggleSkipPreQuizInfo: (quizMode: QuizMode, skip: boolean) => void;
}

type InstrumentLabelMode = 'notes' | 'degrees';
type QuestionPart = 'find_note' | 'identify_root';
type GameState = 'playing' | 'feedback' | 'finished' | 'memory_display';
type QuizPhase = 'loading' | 'info' | 'countdown' | 'active';

interface FeedbackDetails {
    status: 'correct' | 'incorrect' | 'found';
    playedNote: string | null;
    correctAnswers: string[]; // Changed to string to handle unique IDs and note names
}

interface CompletionData {
    success: boolean;
    score: number;
    totalQuestions: number;
    finalMessage: string;
    unlockedItem: string | null;
    memoryLevel?: number;
    bpmLevel?: number;
    isNewHighScore?: boolean;
}


const QUESTION_BEAT_LIMIT = 10;
const MEMORY_NOTE_DISPLAY_TIME = 1000;
const MEMORY_NOTE_PAUSE_TIME = 300;
const MAX_MEMORY_LEVEL = 8;


const Quiz: React.FC<QuizProps> = ({ settings, userData, onQuit, onUpdatePerformance, onQuizComplete, onToggleSkipPreQuizInfo }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('loading');
  const [feedbackDetails, setFeedbackDetails] = useState<FeedbackDetails | null>(null);
  const [feedbackQuestion, setFeedbackQuestion] = useState<Question | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [scoreChange, setScoreChange] = useState<{ value: number, id: number } | null>(null);
  const [instrumentLabelMode, setInstrumentLabelMode] = useState<InstrumentLabelMode>('notes');
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  
  const [questionPart, setQuestionPart] = useState<QuestionPart>('find_note');
  const [selectedRootKey, setSelectedRootKey] = useState<MusicKey | null>(null);

  const [foundNotes, setFoundNotes] = useState<string[]>([]);
  const [incorrectNoteFeedback, setIncorrectNoteFeedback] = useState<string | null>(null);
  const [hadMistakeThisQuestion, setHadMistakeThisQuestion] = useState(false);

  // Beat system state
  const [beats, setBeats] = useState(settings.totalBeats);
  const [questionBeatTimer, setQuestionBeatTimer] = useState(QUESTION_BEAT_LIMIT);
  
  // BPM Challenge State
  const [bpmLevel, setBpmLevel] = useState(1);
  const [bpmCorrectAnswers, setBpmCorrectAnswers] = useState(0);
  const isBpmMode = settings.quizMode === 'BPM Challenge' || settings.quizMode === 'BPM Roulette';

  // Simon Memory Game State
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [memoryMasterSequence, setMemoryMasterSequence] = useState<Note[]>([]);
  const [memoryCurrentSequence, setMemoryCurrentSequence] = useState<Note[]>([]);
  const [memoryPlaybackIndex, setMemoryPlaybackIndex] = useState(0);
  const [memoryDisplayIndex, setMemoryDisplayIndex] = useState(0);
  const [displayHighlight, setDisplayHighlight] = useState<string | null>(null);
  const [simonCorrectFlash, setSimonCorrectFlash] = useState<string | null>(null);
  const isSimonGameMode = settings.quizMode === 'Simon Memory Game';
  const [simonKeySequence, setSimonKeySequence] = useState<MusicKey[]>([]);
  const [simonCurrentKeyIndex, setSimonCurrentKeyIndex] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(settings.bpm);
  const [simonScore, setSimonScore] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const activeQuestion = feedbackQuestion || currentQuestion;
  const isMultiNoteQuestion = activeQuestion?.correctAnswers.length > 1 && settings.quizMode !== 'Scale Detective' && settings.quizMode !== 'Simon Memory Game';

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

  const scale: Scale | null = useMemo(() => {
    if (!activeQuestion) return null;
    return getScale(activeQuestion.key, activeQuestion.scaleType);
  }, [activeQuestion]);

  const handleFinish = useCallback((success: boolean) => {
    const finalScore = isSimonGameMode ? simonScore : score;
    const totalQuestions = isSimonGameMode ? simonKeySequence.length * MAX_MEMORY_LEVEL : questions.length;
    let finalMessage = success ? "Quiz Complete!" : "BEATS DROPPED!";
    let unlockedItem: string | null = null;
    let isNewHighScore = false;
    
    if (isSimonGameMode) {
        finalMessage = success ? "Congratulations! All Keys Mastered!" : "GAME OVER";
        if (finalScore > userData.simonHighScore) {
            finalMessage = "New High Score!";
            isNewHighScore = true;
        }
    }

    if (success) {
        if (settings.quizMode === 'Simon Memory Game' && !userData.unlockedModes.includes('Key Notes')) {
            unlockedItem = 'New Mode Unlocked: Key Notes';
            finalMessage = 'Congratulations!';
        }
        if (settings.quizMode === 'Key Notes' && !userData.unlockedModes.includes('Scale Detective')) {
            unlockedItem = 'New Mode Unlocked: Scale Detective';
            finalMessage = 'Congratulations!';
        }
        if (settings.quizMode === 'Scale Detective') {
            finalMessage = 'LEVEL UP!';
        }
    }
    
    setCompletionData({ success, score: finalScore, totalQuestions, finalMessage, unlockedItem, memoryLevel: isSimonGameMode ? memoryLevel : undefined, bpmLevel, isNewHighScore });
    setGameState('finished');
    onQuizComplete({ score: finalScore, totalQuestions, level: settings.level, success, quizMode: settings.quizMode, bpmLevel: isBpmMode ? bpmLevel : undefined });
  }, [score, questions.length, settings, userData, onQuizComplete, memoryLevel, isSimonGameMode, bpmLevel, isBpmMode, simonScore, simonKeySequence.length]);

  const handleTryAgain = useCallback(() => {
    // Reset general state
    setScore(0);
    setCurrentQuestionIndex(0);
    setGameState('playing');
    setQuizPhase(userData.preQuizInfoSeen[settings.quizMode] ? 'countdown' : 'info');
    setFeedbackDetails(null);
    setFeedbackQuestion(null);
    setShowHelp(false);
    setScoreChange(null);
    setCompletionData(null);
    setQuestionPart('find_note');
    setSelectedRootKey(null);
    setFoundNotes([]);
    setIncorrectNoteFeedback(null);
    setHadMistakeThisQuestion(false);
    setBeats(settings.totalBeats);
    setQuestionBeatTimer(QUESTION_BEAT_LIMIT);
    setBpmLevel(1);
    setBpmCorrectAnswers(0);
    setMemoryLevel(1);
    setMemoryCurrentSequence([]);
    setMemoryPlaybackIndex(0);
    setMemoryDisplayIndex(0);
    setDisplayHighlight(null);
    setSimonCorrectFlash(null);

    // Reset mode-specific state
    if (isSimonGameMode) {
        const shuffledKeys = [...MUSIC_KEYS].sort(() => Math.random() - 0.5);
        setSimonKeySequence(shuffledKeys);
        setSimonCurrentKeyIndex(0);
        setCurrentBpm(settings.bpm);
        setSimonScore(0);
        
        const firstKey = shuffledKeys[0];
        const scale = getScale(firstKey, 'Major');
        setMemoryMasterSequence(scale.notes);

        setQuestions([{
            id: 0,
            prompt: `Memorize the sequence from ${firstKey} Major`,
            correctAnswers: scale.notes,
            key: firstKey,
            scaleType: 'Major',
            quizMode: 'Simon Memory Game',
        }]);
    } else {
        const generatedQuestions = generateQuizQuestions(settings, userData.performance);
        setQuestions(generatedQuestions);
    }
  }, [settings, isSimonGameMode, userData.performance, userData.preQuizInfoSeen]);

  const goToNextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
        handleFinish(true);
    } else {
        setCurrentQuestionIndex(nextIndex);
        setGameState('playing');
        setFeedbackDetails(null);
        setFeedbackQuestion(null);
        setFoundNotes([]);
        setQuestionPart('find_note');
        setSelectedRootKey(null);
        setHadMistakeThisQuestion(false);
        setQuestionBeatTimer(QUESTION_BEAT_LIMIT);
    }
  }, [currentQuestionIndex, questions.length, handleFinish]);


  useEffect(() => {
    // This effect resets the quiz state and should only run when the quiz settings change,
    // which signifies the start of a new quiz.
    setScore(0);
    setCurrentQuestionIndex(0);
    setMemoryLevel(1);
    setBeats(settings.totalBeats);
    setQuestionBeatTimer(QUESTION_BEAT_LIMIT);
    setBpmLevel(1);
    setBpmCorrectAnswers(0);
    setQuizPhase(userData.preQuizInfoSeen[settings.quizMode] ? 'countdown' : 'info');

    if (isSimonGameMode) {
        const shuffledKeys = [...MUSIC_KEYS].sort(() => Math.random() - 0.5);
        setSimonKeySequence(shuffledKeys);
        setSimonCurrentKeyIndex(0);
        setCurrentBpm(settings.bpm);
        setSimonScore(0);
        
        const firstKey = shuffledKeys[0];
        const scale = getScale(firstKey, 'Major');
        setMemoryMasterSequence(scale.notes);

        setQuestions([{
            id: 0,
            prompt: `Memorize the sequence from ${firstKey} Major`,
            correctAnswers: scale.notes,
            key: firstKey,
            scaleType: 'Major',
            quizMode: 'Simon Memory Game',
        }]);
    } else {
        const generatedQuestions = generateQuizQuestions(settings, userData.performance);
        setQuestions(generatedQuestions);
        setCurrentBpm(settings.bpm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]); // Intentionally omitting `userData` because it updates during the quiz
                  // and should not trigger a complete quiz reset.

  // Generate new sequence for Simon Game when level or key changes
  useEffect(() => {
      if (isSimonGameMode && memoryMasterSequence.length > 0 && quizPhase === 'active') {
          const newSequence = memoryMasterSequence.slice(0, memoryLevel);
          setMemoryCurrentSequence(newSequence);
          setMemoryPlaybackIndex(0);
          setMemoryDisplayIndex(0);
          setGameState('memory_display');
      }
  }, [isSimonGameMode, memoryLevel, memoryMasterSequence, quizPhase]);

  // Display sequence for Simon Game
  useEffect(() => {
    if (gameState !== 'memory_display' || !isSimonGameMode || quizPhase !== 'active') return;
    
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (memoryDisplayIndex >= memoryCurrentSequence.length) {
      setGameState('playing');
      setQuestionBeatTimer(QUESTION_BEAT_LIMIT * memoryCurrentSequence.length); // Give more time for longer sequences
      return;
    }

    const showTimer = setTimeout(() => {
      const noteToPlay = memoryCurrentSequence[memoryDisplayIndex];
      setDisplayHighlight(noteToPlay);
      const hideTimer = setTimeout(() => {
        setDisplayHighlight(null);
        const pauseTimer = setTimeout(() => setMemoryDisplayIndex(prev => prev + 1), MEMORY_NOTE_PAUSE_TIME);
        timers.push(pauseTimer);
      }, MEMORY_NOTE_DISPLAY_TIME);
      timers.push(hideTimer);
    }, 500);
    timers.push(showTimer);
    
    return () => timers.forEach(clearTimeout);
  }, [gameState, isSimonGameMode, memoryDisplayIndex, memoryCurrentSequence, quizPhase]);

  const handleQuestionTimeOut = useCallback(() => {
      if (gameState !== 'playing' || !currentQuestion || quizPhase !== 'active') return;
      onUpdatePerformance({ ...currentQuestion, isCorrect: false });
      playIncorrectSound();
      setBeats(b => Math.max(0, b - settings.beatPenalty));
      setScoreChange({ value: -settings.beatPenalty, id: Date.now() });

      if (isSimonGameMode) {
          handleFinish(false);
          return;
      }

      setFeedbackQuestion(currentQuestion);
      setFeedbackDetails({ status: 'incorrect', playedNote: null, correctAnswers: getUniqueAnswersForQuestion(currentQuestion) });
      setGameState('feedback');

      setTimeout(() => goToNextQuestion(), 1500);
  }, [gameState, playIncorrectSound, currentQuestion, onUpdatePerformance, settings.beatPenalty, goToNextQuestion, quizPhase, isSimonGameMode, handleFinish]);
  
  // Main BPM Timer
  useEffect(() => {
    if (gameState !== 'playing' || quizPhase !== 'active') return;

    let effectiveBpm = settings.bpm;
    if (isBpmMode) {
        effectiveBpm = settings.bpm + ((bpmLevel - 1) * 10);
    } else if (isSimonGameMode) {
        effectiveBpm = currentBpm;
    }
    const intervalTime = (60 / effectiveBpm) * 1000;

    const interval = setInterval(() => {
        playTickSound();
        setBeats(b => {
            if (b - 1 <= 0) {
                clearInterval(interval);
                handleFinish(false);
                return 0;
            }
            return b - 1;
        });
        
        setQuestionBeatTimer(t => {
            if (t - 1 <= 0) {
                handleQuestionTimeOut();
                return QUESTION_BEAT_LIMIT; 
            }
            return t - 1;
        });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [gameState, settings.bpm, playTickSound, handleFinish, handleQuestionTimeOut, isBpmMode, bpmLevel, quizPhase, isSimonGameMode, currentBpm]);

  const handleRootKeySelection = useCallback((selectedKey: MusicKey) => {
    if (gameState !== 'playing' || !currentQuestion || questionPart !== 'identify_root' || quizPhase !== 'active') return;
    
    setSelectedRootKey(selectedKey);
    const isCorrect = selectedKey === currentQuestion.key;
    onUpdatePerformance({ ...currentQuestion, isCorrect });

    if (isCorrect) {
        setScore(s => s + 1);
        setBeats(b => b + settings.beatAward);
        setScoreChange({ value: settings.beatAward, id: Date.now() });
        playCorrectSound();
    } else {
        setBeats(b => Math.max(0, b - settings.beatPenalty));
        setScoreChange({ value: -settings.beatPenalty, id: Date.now() });
        playIncorrectSound();
    }
    setFeedbackDetails({ status: isCorrect ? 'correct' : 'incorrect', playedNote: null, correctAnswers: getUniqueAnswersForQuestion(currentQuestion) });
    setFeedbackQuestion(currentQuestion);
    setGameState('feedback');
    setTimeout(() => goToNextQuestion(), 1500);
  }, [gameState, currentQuestion, questionPart, playCorrectSound, playIncorrectSound, onUpdatePerformance, settings, goToNextQuestion, quizPhase]);

  const handleAnswer = useCallback((playedUniqueNote: string) => {
    if (gameState !== 'playing' || !currentQuestion || quizPhase !== 'active') return;
    
    const playedNoteName = playedUniqueNote.replace(/-?\d.*$/, '') as Note;

    const getNoteCheck = () => {
        if (isSimonGameMode) return playedNoteName === memoryCurrentSequence[memoryPlaybackIndex];
        
        const answers = getUniqueAnswersForQuestion(currentQuestion);
        // If the answers are octave-specific (e.g., ['C4']), check against the full unique note ID.
        // Otherwise (e.g., ['C']), check against just the note name.
        const areAnswersOctaveSpecific = answers.length > 0 && /\d/.test(answers[0]);
        
        return areAnswersOctaveSpecific
            ? answers.includes(playedUniqueNote)
            : answers.includes(playedNoteName);
    };
    
    if (isMultiNoteQuestion) {
        if (incorrectNoteFeedback) return;
        const expectedAnswers = getUniqueAnswersForQuestion(currentQuestion);
        const areAnswersOctaveSpecific = expectedAnswers.length > 0 && /\d/.test(expectedAnswers[0]);
        const isCorrectNote = areAnswersOctaveSpecific
            ? expectedAnswers.includes(playedUniqueNote)
            : expectedAnswers.includes(playedNoteName);

        if (isCorrectNote) {
            const noteToAdd = areAnswersOctaveSpecific ? playedUniqueNote : playedNoteName;
            if (foundNotes.includes(noteToAdd)) return; // Already found

            const newFoundNotes = [...foundNotes, noteToAdd];
            setFoundNotes(newFoundNotes);
            playCorrectSound();
            
            if (new Set(newFoundNotes).size === new Set(expectedAnswers).size) { // Question Complete
                onUpdatePerformance({ ...currentQuestion, isCorrect: !hadMistakeThisQuestion });
                setScore(s => s + 1);
                setBeats(b => b + settings.beatAward);
                setScoreChange({ value: settings.beatAward, id: Date.now() });
                if (isBpmMode) {
                    const newCorrectCount = bpmCorrectAnswers + 1;
                    setBpmCorrectAnswers(newCorrectCount);
                    if (newCorrectCount > 0 && newCorrectCount % 5 === 0) setBpmLevel(lvl => lvl + 1);
                }
                setFeedbackQuestion(currentQuestion);
                setGameState('feedback');
                setFeedbackDetails({ status: 'correct', playedNote: null, correctAnswers: expectedAnswers });
                setTimeout(() => goToNextQuestion(), 1500);
            }
        } else {
            setHadMistakeThisQuestion(true);
            playIncorrectSound();
            setIncorrectNoteFeedback(playedUniqueNote);
            setBeats(b => Math.max(0, b - settings.beatPenalty));
            setScoreChange({ value: -settings.beatPenalty, id: Date.now() });
            setTimeout(() => setIncorrectNoteFeedback(null), 500);
        }
        return;
    }
    
    if (settings.quizMode === 'Scale Detective') {
        if (questionPart !== 'find_note') return;
        const isCorrect = getNoteCheck();
        setFeedbackQuestion(currentQuestion);
        setGameState('feedback');
        if (isCorrect) {
            playCorrectSound();
            setFoundNotes([playedUniqueNote]);
            setFeedbackDetails({ status: 'found', playedNote: playedUniqueNote, correctAnswers: getUniqueAnswersForQuestion(currentQuestion) });
            setTimeout(() => {
                setQuestionPart('identify_root');
                setFeedbackDetails(null);
                setFeedbackQuestion(null);
                setGameState('playing');
                setQuestionBeatTimer(QUESTION_BEAT_LIMIT);
            }, 1000);
        } else {
            playIncorrectSound();
            setFeedbackDetails({ status: 'incorrect', playedNote: playedUniqueNote, correctAnswers: getUniqueAnswersForQuestion(currentQuestion) });
            setTimeout(() => {
                setGameState('playing');
                setFeedbackDetails(null);
                setFeedbackQuestion(null);
                setQuestionBeatTimer(QUESTION_BEAT_LIMIT);
            }, 1000);
        }
        return;
    }

    if (isSimonGameMode) {
        const isCorrect = getNoteCheck();
        if (isCorrect) {
            playCorrectSound();
            setSimonCorrectFlash(playedUniqueNote);
            setTimeout(() => setSimonCorrectFlash(null), 300);

            const nextPlaybackIndex = memoryPlaybackIndex + 1;
            setMemoryPlaybackIndex(nextPlaybackIndex);

            if (nextPlaybackIndex >= memoryCurrentSequence.length) { 
                setSimonScore(s => s + 1);
                setBeats(b => b + settings.beatAward);
                setScoreChange({ value: settings.beatAward, id: Date.now() });
                onUpdatePerformance({ ...currentQuestion, isCorrect: !hadMistakeThisQuestion });
                setHadMistakeThisQuestion(false);
                
                const nextMemoryLevel = memoryLevel + 1;

                if (nextMemoryLevel > MAX_MEMORY_LEVEL) { // Key complete
                    const nextKeyIndex = simonCurrentKeyIndex + 1;
                    if (nextKeyIndex >= simonKeySequence.length) {
                        handleFinish(true); // All keys complete
                    } else { // Move to next key
                        const nextKey = simonKeySequence[nextKeyIndex];
                        const nextScale = getScale(nextKey, 'Major');
                        setSimonCurrentKeyIndex(nextKeyIndex);
                        setCurrentBpm(bpm => bpm + 15);
                        setMemoryMasterSequence(nextScale.notes);
                        setMemoryLevel(1); // Reset for new key
                        setQuestions([{
                            id: nextKeyIndex,
                            prompt: `Memorize the sequence from ${nextKey} Major`,
                            correctAnswers: nextScale.notes,
                            key: nextKey,
                            scaleType: 'Major',
                            quizMode: 'Simon Memory Game'
                        }]);
                        setCurrentQuestionIndex(0);
                    }
                } else {
                    setMemoryLevel(nextMemoryLevel);
                }
            }
        } else {
            playIncorrectSound();
            setIncorrectNoteFeedback(playedUniqueNote);
            setGameState('feedback'); // Prevent further input

            setBeats(b => Math.max(0, b - settings.beatPenalty));
            setScoreChange({ value: -settings.beatPenalty, id: Date.now() });
            onUpdatePerformance({ ...currentQuestion, isCorrect: false });
            
            // After 2 seconds, end the game.
            setTimeout(() => {
                handleFinish(false);
            }, 2000);
        }
        return;
    }
    
    // Standard single-note questions
    const isCorrect = getNoteCheck();
    onUpdatePerformance({ ...currentQuestion, isCorrect });
    if (isCorrect) {
        playCorrectSound();
        setScore(s => s + 1);
        setBeats(b => b + settings.beatAward);
        setScoreChange({ value: settings.beatAward, id: Date.now() });
        if (isBpmMode) {
            const newCorrectCount = bpmCorrectAnswers + 1;
            setBpmCorrectAnswers(newCorrectCount);
            if (newCorrectCount > 0 && newCorrectCount % 5 === 0) setBpmLevel(lvl => lvl + 1);
        }
    } else {
        playIncorrectSound();
        setBeats(b => Math.max(0, b - settings.beatPenalty));
        setScoreChange({ value: -settings.beatPenalty, id: Date.now() });
    }
    setFeedbackQuestion(currentQuestion);
    setGameState('feedback');
    setFeedbackDetails({ status: isCorrect ? 'correct' : 'incorrect', playedNote: playedUniqueNote, correctAnswers: getUniqueAnswersForQuestion(currentQuestion) });
    setTimeout(() => goToNextQuestion(), 1500);
  }, [gameState, currentQuestion, settings, playCorrectSound, playIncorrectSound, onUpdatePerformance, goToNextQuestion, isSimonGameMode, memoryCurrentSequence, memoryPlaybackIndex, handleFinish, isMultiNoteQuestion, incorrectNoteFeedback, foundNotes, hadMistakeThisQuestion, questionPart, isBpmMode, bpmCorrectAnswers, quizPhase, memoryLevel, simonKeySequence, simonCurrentKeyIndex, simonScore]);
  
  useMidi(settings.inputMethod === 'MIDI', handleAnswer);
  useAudioPitch(
    settings.inputMethod === 'Mic',
    handleAnswer,
    settings.audioInputDeviceId,
    settings.micSensitivity
  );

  const renderInstrument = () => {
    let correctNotes: string[] = [];
    let incorrectNote: string | null = incorrectNoteFeedback;
    let highlightedNotes: string[] = [];

    if (showHelp && scale) {
      highlightedNotes.push(...scale.notes);
    }
    if (gameState === 'memory_display' && displayHighlight) {
      highlightedNotes.push(displayHighlight);
    }
    if (isMultiNoteQuestion && (gameState === 'playing' || gameState === 'feedback')) {
        correctNotes.push(...foundNotes);
    }
    if (simonCorrectFlash) {
        correctNotes.push(simonCorrectFlash);
    }
    
    if (gameState === 'feedback' && feedbackDetails) {
        if (feedbackDetails.status === 'incorrect' && feedbackDetails.playedNote) {
            incorrectNote = feedbackDetails.playedNote;
        }
        
        // For Simon game, flash the whole sequence green on success.
        if (isSimonGameMode && feedbackDetails.status === 'correct') {
            correctNotes.push(...feedbackDetails.correctAnswers);
        } 
        // For all other modes, show the correct answers as green highlights during feedback.
        else if (!isSimonGameMode) {
           correctNotes.push(...feedbackDetails.correctAnswers);
        }
    }

    if (settings.quizMode === 'Scale Detective' && activeQuestion?.contextNotes) {
        const isShowingFullScale = questionPart === 'identify_root' || (gameState === 'feedback' && feedbackDetails?.status === 'correct');
        const contextUnique = getUniqueAnswersForQuestion({ ...activeQuestion, correctAnswers: activeQuestion.contextNotes });
        if (isShowingFullScale) {
            const allScaleNotes = getUniqueAnswersForQuestion({ ...activeQuestion, correctAnswers: [...activeQuestion.contextNotes, ...activeQuestion.correctAnswers] });
            correctNotes.push(...allScaleNotes);
        } else {
            highlightedNotes.push(...contextUnique);
            if (feedbackDetails?.status === 'found' && feedbackDetails.playedNote) {
                 correctNotes.push(feedbackDetails.playedNote);
            }
        }
    }
    
    const commonProps = {
      onNotePlayed: settings.inputMethod === 'Touch' ? handleAnswer : () => {},
      highlightedNotes: [...new Set(highlightedNotes)],
      correctNotes: [...new Set(correctNotes)],
      incorrectNote,
      labelMode: instrumentLabelMode,
      scale,
    };
    
    switch (settings.instrument) {
      case 'Piano': return <Piano {...commonProps} />;
      case 'Guitar':
      case 'Bass': return <Fretboard instrument={settings.instrument} {...commonProps} handedness={settings.handedness} onNotePlayed={handleAnswer} />;
      default: return null;
    }
  };

  if (quizPhase === 'info') {
    return <PreQuizInfo quizMode={settings.quizMode} onReady={() => setQuizPhase('countdown')} onSkipChange={(skip) => onToggleSkipPreQuizInfo(settings.quizMode, skip)} />;
  }

  if (quizPhase === 'countdown') {
    return <Countdown onComplete={() => setQuizPhase('active')} />;
  }

  if (questions.length === 0 || !activeQuestion) {
    return <div className="text-center p-8">Loading quiz...</div>;
  }
  
  if (gameState === 'finished' && completionData) {
    const total = isSimonGameMode ? simonKeySequence.length * MAX_MEMORY_LEVEL : completionData.totalQuestions;
    return (
      <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-8 rounded-xl text-center shadow-2xl w-full max-w-md">
        <h2 className={`text-3xl font-bold mb-2 ${completionData.success ? 'text-green-400' : 'text-red-500'}`}>
            {completionData.finalMessage}
        </h2>
        
        {isSimonGameMode ? (
            <div className="text-xl mb-4 text-stone-200">
                You completed <span className="text-orange-400 font-bold">{completionData.score}</span> rounds!
            </div>
        ) : completionData.bpmLevel ? (
            <div className="text-xl mb-4 text-stone-200">
                You reached <span className="text-fuchsia-400 font-bold">BPM Level {completionData.bpmLevel}</span>!
            </div>
        ) : (
            <div className="text-xl mb-4 text-stone-200" dangerouslySetInnerHTML={{ __html: `You answered <span class="text-orange-400 font-bold">${completionData.score}</span> out of <span class="text-orange-400 font-bold">${total}</span> questions correctly.` }}>
            </div>
        )}
        
        {completionData.unlockedItem && (
            <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg">
                <p className="text-lg font-bold text-green-300 animate-level-up">{completionData.unlockedItem}</p>
            </div>
        )}

        {completionData.success ? (
          <button
            onClick={onQuit}
            className="mt-8 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
          >
            Continue
          </button>
        ) : (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleTryAgain}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              Try Again
            </button>
            <button
              onClick={onQuit}
              className="flex-1 bg-stone-600 hover:bg-stone-500 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Main Menu
            </button>
          </div>
        )}
      </div>
    );
  }

  const feedbackClass = gameState !== 'feedback' ? 'bg-black/30 border-transparent' : 
    (feedbackDetails?.status === 'correct' ? 'bg-green-500/20 border-green-500' : 
     feedbackDetails?.status === 'found' ? 'bg-sky-500/20 border-sky-500' : 
     'bg-red-500/20 border-red-500');

  const renderHeader = () => {
    let effectiveBpm = settings.bpm;
    if (isBpmMode) {
        effectiveBpm = settings.bpm + ((bpmLevel - 1) * 10);
    } else if (isSimonGameMode) {
        effectiveBpm = currentBpm;
    }
    return (
       <header className="flex justify-between items-center text-stone-300">
        <div>
           {isBpmMode ? (
              <div className="font-bold text-lg text-fuchsia-400 animate-pulse">
                Level {bpmLevel} <span className="text-sm text-stone-400">({effectiveBpm} BPM)</span>
              </div>
            ) : isSimonGameMode ? (
                <div className="flex flex-col text-left text-xs gap-y-0.5">
                    <div className="font-bold text-base text-stone-100">Round: {memoryLevel}</div>
                    <div className="text-stone-400">
                        {simonKeySequence.length > 0 && <span className="font-semibold">Key: {simonKeySequence[simonCurrentKeyIndex]}</span>}
                        <span className="font-semibold ml-2">BPM: {currentBpm}</span>
                    </div>
                     <div className="text-stone-400">
                        <span className="font-semibold">Score: {simonScore}</span>
                        <span className="font-semibold ml-2">High Score: {userData.simonHighScore}</span>
                    </div>
                </div>
            ) : (
              <span className="font-bold text-lg text-stone-100">
                Q: {`${currentQuestionIndex + 1} / ${questions.length}`}
              </span>
            )}
        </div>
        <div className="text-3xl font-bold text-orange-400 relative">
            {beats}
            <span className="text-base font-normal text-stone-400 ml-1">Beats</span>
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
        <div className="flex gap-2">
            <button onClick={() => setShowHelp(true)} title="Help" className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full disabled:bg-stone-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            </button>
            <button
                onClick={() => setInstrumentLabelMode(p => p === 'notes' ? 'degrees' : 'notes')}
                title="Toggle Note/Degree Labels"
                className={`p-2 rounded-full transition-colors disabled:bg-stone-600 ${
                    instrumentLabelMode === 'degrees' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-stone-600 hover:bg-stone-500 text-stone-200'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h12M6 15h12" />
                </svg>
            </button>
            <button onClick={onQuit} title="Quit" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>
      </header>
    );
  };

  const getPrompt = () => {
      if (gameState === 'memory_display') return `Memorize... (Round ${memoryLevel})`;
      if (settings.quizMode === 'Scale Detective') {
          return questionPart === 'find_note' 
            ? "Find the missing note." 
            : `What is the root key of the ${activeQuestion.scaleType} scale?`;
      }
      if (isSimonGameMode) {
          return `Play the sequence! (${memoryPlaybackIndex}/${memoryCurrentSequence.length})`;
      }
      if (activeQuestion) return activeQuestion.prompt;
      return 'Loading...';
  };

  const questionTimeLimit = isSimonGameMode ? QUESTION_BEAT_LIMIT * memoryCurrentSequence.length : QUESTION_BEAT_LIMIT;

  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-4 sm:p-6 rounded-xl shadow-2xl w-full h-full flex flex-col">
      {showHelp && scale && <HelpModal scale={scale} onClose={() => setShowHelp(false)} />}
      
      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        <div className="flex-grow flex items-center justify-center">
             {renderInstrument()}
        </div>

        <div className="flex flex-col gap-4 lg:w-1/3 lg:max-w-md">
            {renderHeader()}
            
            <div className={`text-center p-6 my-auto rounded-lg border transition-colors duration-300 relative overflow-hidden ${feedbackClass}`}>
                <h3 className="text-xl font-bold text-stone-300 mb-4">{settings.quizMode.replace(/([A-Z])/g, ' $1').trim()}</h3>
                {gameState === 'playing' && (
                    <div 
                        className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" 
                        style={{ width: `${(questionBeatTimer / questionTimeLimit) * 100}%`, transition: `width ${(60 / currentBpm)}s linear` }}
                    ></div>
                )}
                <p className="text-2xl sm:text-3xl font-semibold text-stone-100 min-h-[48px] flex items-center justify-center">
                    {getPrompt()}
                </p>
                {isMultiNoteQuestion && gameState === 'playing' && (
                    <div className="text-sm text-stone-300 mt-2">
                        Found {foundNotes.length} of {activeQuestion.correctAnswers.length}
                    </div>
                )}
            </div>
            
            {settings.quizMode === 'Scale Detective' && questionPart === 'identify_root' && gameState === 'playing' && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {MUSIC_KEYS.map(key => (
                        <button
                            key={key}
                            onClick={() => handleRootKeySelection(key)}
                            className="py-3 px-2 rounded-md font-semibold transition-colors duration-200 bg-stone-800 hover:bg-stone-700 text-white"
                        >
                            {key}
                        </button>
                    ))}
                </div>
            )}

            {gameState === 'feedback' && settings.quizMode === 'Scale Detective' && selectedRootKey && feedbackQuestion && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {MUSIC_KEYS.map(key => {
                        const isCorrect = key === feedbackQuestion.key;
                        const isSelected = key === selectedRootKey;
                        let classes = 'bg-stone-800 text-white';
                        if (isCorrect) {
                            classes = 'bg-green-500 text-black transform scale-105';
                        } else if (isSelected && !isCorrect) {
                            classes = 'bg-red-500 text-black';
                        }
                        return (
                            <button
                                key={key}
                                disabled
                                className={`py-3 px-2 rounded-md font-semibold transition-all duration-200 ${classes}`}
                            >
                                {key}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;