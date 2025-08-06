
import React, { useState, useCallback, useEffect } from 'react';
import { DEFAULT_QUIZ_SETTINGS, LEVEL_KEYS, LEVEL_MODES } from './constants';
import { QuizSettings as QuizSettingsType, UserData, PerformanceUpdate, QuizMode, QuizCompletionResult } from './types';
import { loadUserData, saveUserData, updatePerformanceStat, getAccuracy } from './services/userData';
import Settings from './components/Settings';
import Quiz from './components/Quiz';
import InputTester from './components/InputTester';
import GlobalSettingsModal from './components/GlobalSettingsModal';
import InputSelector from './components/InputSelector';
import InstrumentSelector from './components/InstrumentSelector';
import InfoModal from './components/InfoModal';
import PerformanceModal from './components/PerformanceModal';
import BottomNavBar from './components/BottomNavBar';

type AppState = 'settings' | 'quiz' | 'input_tester';
type ActiveView = 'drill' | 'report' | 'guide';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('settings');
  const [settings, setSettings] = useState<QuizSettingsType>(DEFAULT_QUIZ_SETTINGS);
  const [activeQuizSettings, setActiveQuizSettings] = useState<QuizSettingsType | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('drill');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDevModeUnlocked, setIsDevModeUnlocked] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    setUserData(loadUserData());
    
    // PWA Install prompt handling
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleSettingChange = useCallback(<K extends keyof QuizSettingsType>(key: K, value: QuizSettingsType[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDevModeToggle = useCallback(() => {
    setIsDevModeUnlocked(prev => !prev);
  }, []);

  const getModeRules = (mode: QuizMode): Partial<QuizSettingsType> => {
    const baseRules: Partial<QuizSettingsType> = {
      questionCount: 40,
      beatAward: 5,
      beatPenalty: 5,
      totalBeats: 30,
      bpm: 70,
    };

    switch (mode) {
      case 'Simon Memory Game':
        return { ...baseRules, key: 'Random', scaleType: 'Major', totalBeats: 10 };
      case 'Key Notes':
        return { ...baseRules, totalBeats: 50, key: 'Random', scaleType: 'Random' as any };
      default:
        // All other modes currently use the same base rules.
        return baseRules;
    }
  };

  const handleStartQuiz = useCallback(() => {
    if (!userData) return;
    if (!isDevModeUnlocked && !userData.unlockedModes.includes(settings.quizMode)) return;

    const finalSettings: QuizSettingsType = {
        ...settings,
        ...getModeRules(settings.quizMode),
    };
    
    setActiveQuizSettings(finalSettings);
    setAppState('quiz');
  }, [settings, userData, isDevModeUnlocked]);


  const handleStartInputTester = useCallback(() => {
    setAppState('input_tester');
  }, []);

  const handleStartInputTesterAndCloseModal = useCallback(() => {
    handleStartInputTester();
    setIsGlobalSettingsOpen(false);
  }, [handleStartInputTester]);

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
  
  const handlePerformanceUpdate = useCallback((update: PerformanceUpdate) => {
      setUserData(prevData => {
          if (!prevData) return null;
          const newData = updatePerformanceStat(prevData, update);
          saveUserData(newData);
          return newData;
      });
  }, []);
  
  const handleToggleSkipPreQuizInfo = useCallback((quizMode: QuizMode, skip: boolean) => {
    setUserData(prevData => {
        if (!prevData) return null;
        const newSeen = { ...prevData.preQuizInfoSeen, [quizMode]: skip };
        const newData = { ...prevData, preQuizInfoSeen: newSeen };
        saveUserData(newData);
        return newData;
    });
  }, []);


  const handleQuizComplete = useCallback((result: QuizCompletionResult) => {
    setUserData(prevData => {
        if (!prevData) return null;

        let newData = { ...prevData };
        
        // High Score Logic for Simon Game
        if (result.quizMode === 'Simon Memory Game' && result.score > newData.simonHighScore) {
            newData = { ...newData, simonHighScore: result.score };
        }

        // Mode Unlock Logic based on success
        if (result.success) {
            if (result.quizMode === 'Simon Memory Game' && !newData.unlockedModes.includes('Key Notes')) {
                newData.unlockedModes = Array.from(new Set([...newData.unlockedModes, 'Key Notes']));
            }
            if (result.quizMode === 'Key Notes' && !newData.unlockedModes.includes('Scale Detective')) {
                newData.unlockedModes = Array.from(new Set([...newData.unlockedModes, 'Scale Detective']));
            }
        }

        // Level Up Logic: tied to completing Scale Detective
        const currentUnlockedLevel = newData.unlockedLevel;
        if (result.success && result.quizMode === 'Scale Detective' && currentUnlockedLevel < 5) {
            const nextLevel = currentUnlockedLevel + 1;
            const modesForNewLevel: QuizMode[] = (LEVEL_MODES[nextLevel] || []).map(m => m.mode);
            const newUnlockedModes: QuizMode[] = Array.from(new Set([...newData.unlockedModes, ...modesForNewLevel]));
            
            newData = {
                ...newData,
                unlockedLevel: nextLevel,
                unlockedModes: newUnlockedModes,
            };
            alert(`Congratulations! You've unlocked Level ${nextLevel}!`);
        }

        saveUserData(newData);
        return newData;
    });
  }, []);


  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);


  const renderDrillContent = () => {
    if (!userData) return <div className="text-center">Loading user data...</div>;

    switch (appState) {
      case 'quiz':
        return <Quiz settings={activeQuizSettings!} onQuit={handleQuit} userData={userData} onUpdatePerformance={handlePerformanceUpdate} onQuizComplete={handleQuizComplete} onToggleSkipPreQuizInfo={handleToggleSkipPreQuizInfo} />;
      case 'input_tester':
        return <InputTester settings={settings} onQuit={handleQuit} onSettingChange={handleSettingChange} />;
      case 'settings':
      default:
        return <Settings settings={settings} onSettingChange={handleSettingChange} onStartQuiz={handleStartQuiz} userData={userData} isDevModeUnlocked={isDevModeUnlocked} onDevModeToggle={handleDevModeToggle} />;
    }
  };

  const showHeader = appState === 'settings' && activeView === 'drill';

  return (
    <div className="text-stone-100 h-screen flex flex-col">
      {/* TOP BAR for buttons (non-scrolling) */}
      <div className="w-full flex items-center justify-between p-4 flex-shrink-0">
          <div className="flex items-center gap-2 z-10">
              <InputSelector settings={settings} onSettingChange={handleSettingChange} />
              <InstrumentSelector settings={settings} onSettingChange={handleSettingChange} />
          </div>
          <div className="flex items-center gap-2 z-10">
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  title="Install App"
                  aria-label="Install Scale Driller App"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </button>
              )}
              <button
              onClick={() => setIsGlobalSettingsOpen(true)}
              className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-800/80 text-stone-200 transition-colors"
              title="Settings"
              aria-label="Open Settings"
              >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              </button>
              <button
              onClick={handleFullScreenToggle}
              className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-800/80 text-stone-200 transition-colors"
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
          </div>
      </div>
      
      {/* SCROLLABLE MAIN CONTENT */}
      <main className="flex-1 w-full overflow-y-auto px-4 pb-24">
        {showHeader && (
            <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-orange-400 tracking-tighter drop-shadow-lg">
                Scale Driller
            </h1>
            <p className="text-stone-300 mt-2 text-lg">
                Your personal music theory trainer.
            </p>
            </header>
        )}
        
        <div className={`w-full flex items-center justify-center ${showHeader ? 'max-w-4xl mx-auto' : 'max-w-full'}`}>
            {renderDrillContent()}
        </div>
      </main>

      <GlobalSettingsModal
        isOpen={isGlobalSettingsOpen}
        onClose={() => setIsGlobalSettingsOpen(false)}
        onStartInputTester={handleStartInputTesterAndCloseModal}
      />

      {activeView === 'guide' && (
        <InfoModal
            isOpen={true}
            onClose={() => setActiveView('drill')}
        />
      )}
      {activeView === 'report' && (
        <PerformanceModal
            isOpen={true}
            onClose={() => setActiveView('drill')}
            userData={userData}
        />
      )}

      <BottomNavBar activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
};

export default App;