import React, { useState, useCallback, useEffect } from 'react';
import { DEFAULT_QUIZ_SETTINGS } from './constants';
import { QuizSettings as QuizSettingsType } from './types';
import Settings from './components/Settings';
import Quiz from './components/Quiz';
import InputTester from './components/InputTester';

type AppState = 'settings' | 'quiz' | 'input_tester';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('settings');
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType>(DEFAULT_QUIZ_SETTINGS);
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleStartQuiz = useCallback((settings: QuizSettingsType) => {
    setQuizSettings(settings);
    setAppState('quiz');
  }, []);

  const handleStartInputTester = useCallback((settings: QuizSettingsType) => {
    setQuizSettings(settings);
    setAppState('input_tester');
  }, []);

  const handleQuit = useCallback(() => {
    setAppState('settings');
  }, []);

  const handleFullScreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleInstallClick = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  }, [deferredPrompt]);

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);


  const renderContent = () => {
    switch (appState) {
      case 'quiz':
        return <Quiz settings={quizSettings} onQuit={handleQuit} />;
      case 'input_tester':
        return <InputTester settings={quizSettings} onQuit={handleQuit} />;
      case 'settings':
      default:
        return <Settings onStartQuiz={handleStartQuiz} onStartInputTester={handleStartInputTester} />;
    }
  };

  return (
    <div className="text-stone-100 min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Install PWA Button */}
      {showInstallPrompt && (
        <button
          onClick={handleInstallClick}
          className="absolute top-4 left-4 p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors z-50 flex items-center gap-2"
          title="Install Scale Driller"
          aria-label="Install Scale Driller as an app"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="hidden sm:inline">Install</span>
        </button>
      )}

      {/* Fullscreen Button */}
      <button
        onClick={handleFullScreenToggle}
        className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/60 hover:bg-stone-800/80 text-stone-200 transition-colors z-50"
        title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        aria-label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullScreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4v4m12 0V4h-4M8 20H4v-4m12 0v4h-4" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
          </svg>
        )}
      </button>

      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-orange-400 tracking-tighter drop-shadow-lg">
          Scale Driller
        </h1>
        <p className="text-stone-300 mt-2 text-lg">
          Your personal music theory trainer.
        </p>
      </header>
      <main className="w-full max-w-4xl flex items-center justify-center">
        {renderContent()}
      </main>
      <footer className="w-full max-w-4xl text-center mt-8 text-stone-500 text-sm">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;