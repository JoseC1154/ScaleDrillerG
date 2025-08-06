
import React from 'react';
import { SCALE_TYPES, MUSIC_KEYS, DEGREE_NAMES, LEVEL_MODES, CHORD_TYPES } from '../constants';
import { QuizSettings, QuizMode, UserData, Note } from '../types';
import PracticeKeySelector from './PracticeKeySelector';

interface SettingsProps {
  settings: QuizSettings;
  onSettingChange: <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => void;
  onStartQuiz: () => void;
  userData: UserData;
  isDevModeUnlocked: boolean;
  onDevModeToggle: () => void;
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const OptionButton: React.FC<{ value: any, current: any, onClick: () => void, children: React.ReactNode, disabled?: boolean, title?: string }> = ({ value, current, onClick, children, disabled, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 w-full disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed relative ${
        current === value ? 'bg-orange-500 text-white shadow-md transform scale-105' : 'bg-stone-800 hover:bg-stone-700'
      }`}
    >
      {children}
    </button>
);

interface ModeDescriptionProps {
    title: string;
    description: string;
    rules: Partial<QuizSettings>;
}

const ModeDescription: React.FC<ModeDescriptionProps> = ({ title, description, rules }) => (
    <div className="text-center p-4 bg-stone-800/50 rounded-lg text-stone-400">
        <h4 className="font-bold text-lg text-orange-400 mb-2">{title}</h4>
        <p className="text-sm">{description}</p>
        <div className="mt-3 text-xs font-semibold text-stone-300 flex justify-center items-center gap-x-4">
            {rules.totalBeats && <span><span className="text-stone-500">Beats:</span> {rules.totalBeats}</span>}
            {rules.bpm && <span><span className="text-stone-500">BPM:</span> {rules.bpm}</span>}
            {rules.beatAward && <span className="text-green-400"><span className="text-stone-500">Award:</span> +{rules.beatAward}</span>}
            {rules.beatPenalty && <span className="text-red-400"><span className="text-stone-500">Penalty:</span> -{rules.beatPenalty}</span>}
        </div>
    </div>
);


const Settings: React.FC<SettingsProps> = ({ settings, onSettingChange, onStartQuiz, userData, isDevModeUnlocked, onDevModeToggle }) => {
  const { unlockedLevel, unlockedModes } = userData;

  const handleSettingChange = <K extends keyof QuizSettings,>(key: K, value: QuizSettings[K]) => {
    onSettingChange(key, value);
  };

  const handleLevelChange = (level: number) => {
    if (!isDevModeUnlocked && level > unlockedLevel) return;
    onSettingChange('level', level);
    
    const modesForNewLevel = LEVEL_MODES[level] || [];
    const availableModes = modesForNewLevel.filter(m => isDevModeUnlocked || unlockedModes.includes(m.mode));
    
    if (!availableModes.some(m => m.mode === settings.quizMode)) {
        const defaultMode = availableModes.length > 0 ? availableModes[0].mode : LEVEL_MODES[1][0].mode;
        onSettingChange('quizMode', defaultMode);
    }
  };
  
  const handlePracticeKeyToggle = (keyToToggle: Note) => {
    const currentKeys = settings.practiceKeys || [];
    const isSelected = currentKeys.includes(keyToToggle);
    let newKeys;
    if (isSelected) {
        newKeys = currentKeys.filter(k => k !== keyToToggle);
    } else {
        newKeys = [...currentKeys, keyToToggle];
    }

    if (newKeys.length === 0) {
        newKeys = [keyToToggle]; // Don't allow unselecting all keys, re-select the last one
    }

    onSettingChange('practiceKeys', newKeys);
  };

  const handlePracticeDegreeToggle = (degreeToToggle: number) => {
    const currentDegrees = settings.practiceDegrees || [];
    const isSelected = currentDegrees.includes(degreeToToggle);
    let newDegrees;
    if (isSelected) {
        newDegrees = currentDegrees.filter(d => d !== degreeToToggle);
    } else {
        newDegrees = [...currentDegrees, degreeToToggle].sort((a,b) => a - b);
    }

    if (newDegrees.length === 0) {
        return;
    }

    onSettingChange('practiceDegrees', newDegrees);
  };

  const modesForSelectedLevel = LEVEL_MODES[settings.level] || [];
  const isCurrentModeDisabled = !modesForSelectedLevel.some(m => m.mode === settings.quizMode) || (!isDevModeUnlocked && !unlockedModes.includes(settings.quizMode));

  const getModeRules = (mode: QuizMode): ModeDescriptionProps => {
    switch (mode) {
        case 'Simon Memory Game':
            return { title: 'Simon Memory Game', description: "A 'Simon Says' for music. Memorize an ever-growing sequence of notes from a random Major scale. Complete this to unlock 'Key Notes'.", rules: { totalBeats: 10, bpm: 70, beatAward: 5, beatPenalty: 5 } };
        case 'Key Notes':
            return { title: 'Key Notes', description: 'A fast-paced drill. Find all notes in 40 random scales before your beats run out.', rules: { totalBeats: 50, bpm: 70, beatAward: 5, beatPenalty: 5 } };
        case 'Scale Detective':
            return { title: 'Scale Detective', description: "Find the missing note, then identify the scale's root key. Complete 40 questions to level up!", rules: { totalBeats: 30, bpm: 70, beatAward: 5, beatPenalty: 5 } };
        default:
             return { title: settings.quizMode.replace(/([A-Z])/g, ' $1').trim(), description: 'Survive as long as you can! Answer questions before the beats run out.', rules: { totalBeats: 30, bpm: 70, beatAward: 5, beatPenalty: 5 } };
    }
  };

  const renderModeSpecificSettings = () => {
    
    if(isCurrentModeDisabled) {
        return (
            <div className="text-center p-8 bg-stone-800/50 rounded-lg text-stone-400">
                <p className="font-semibold text-stone-200 text-lg mb-2">Mode Locked</p>
                <p>Select your current level or a lower one to see available modes.</p>
            </div>
        );
    }

    const { title, description, rules } = getModeRules(settings.quizMode);

    const isPracticeMode = ['Practice', 'Degree Training', 'Intervals', 'Chord Builder', 'Nashville Numbers'].includes(settings.quizMode);
    
    return (
        <div className="space-y-4">
            <ModeDescription title={title} description={description} rules={rules} />

            {isPracticeMode && (
                 <div className="space-y-4 pt-4 border-t border-stone-800">
                    <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                        Notes to Practice <span className="font-normal text-stone-400">(select one or more)</span>
                    </label>
                    <PracticeKeySelector
                        selectedKeys={settings.practiceKeys}
                        onToggleKey={handlePracticeKeyToggle}
                        instrument={settings.instrument}
                    />
                    </div>
                    
                    {settings.quizMode === 'Degree Training' && (
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">
                        Degrees to Practice
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {Object.keys(DEGREE_NAMES).map(d => parseInt(d, 10)).map(degree => (
                            <button
                            key={degree}
                            onClick={() => handlePracticeDegreeToggle(degree)}
                            className={`py-2 px-2 rounded-md text-sm font-semibold transition-colors duration-200 w-full ${
                                (settings.practiceDegrees || []).includes(degree)
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-stone-800 hover:bg-stone-700'
                            }`}
                            >
                            {DEGREE_NAMES[degree]}
                            </button>
                        ))}
                        </div>
                    </div>
                    )}
                    
                    {['Practice', 'Degree Training'].includes(settings.quizMode) && (
                    <div>
                        <label htmlFor="scale" className="block text-sm font-medium text-stone-300 mb-2">Scale Type</label>
                        <select id="scale" value={settings.scaleType} onChange={e => handleSettingChange('scaleType', e.target.value as QuizSettings['scaleType'])} className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500">
                        {SCALE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    )}
                    
                    {settings.quizMode === 'Chord Builder' && (
                    <div>
                        <label htmlFor="chord-type" className="block text-sm font-medium text-stone-300 mb-2">Chord Type</label>
                        <select id="chord-type" value={settings.scaleType} onChange={e => handleSettingChange('scaleType', e.target.value as QuizSettings['scaleType'])} className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500">
                        {CHORD_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    )}
                </div>
            )}
        </div>
    );
  };

  const getUnlockTooltip = (level: number) => {
    if (level <= unlockedLevel || isDevModeUnlocked) return undefined;
    const requiredLevel = level - 1;
    return `Complete Level ${requiredLevel} 'Scale Detective' to unlock.`;
  };

  const getModeUnlockTooltip = (mode: QuizMode): string | undefined => {
    if (isDevModeUnlocked || unlockedModes.includes(mode)) return undefined;

    if (mode === 'Key Notes') return "Complete 'Simon Memory Game' to unlock.";
    if (mode === 'Scale Detective') return "Complete 'Key Notes' to unlock.";
    
    for (const level in LEVEL_MODES) {
        if (LEVEL_MODES[level].some(m => m.mode === mode)) {
            return `Reach Level ${level} to unlock.`;
        }
    }
    return 'Unlock this mode by playing more!';
  };

  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">Level</label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <OptionButton key={level} value={level} current={settings.level} onClick={() => handleLevelChange(level)} disabled={!isDevModeUnlocked && level > unlockedLevel} title={getUnlockTooltip(level)}>
                {!isDevModeUnlocked && level > unlockedLevel ? <LockIcon /> : null}{level}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6">
          <label className="block text-sm font-medium text-stone-300 mb-2">Mode</label>
          {modesForSelectedLevel.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {modesForSelectedLevel.map(({ mode, name }) => {
                const isLocked = !isDevModeUnlocked && !unlockedModes.includes(mode);
                
                return (
                  <OptionButton 
                    key={mode} 
                    value={mode} 
                    current={settings.quizMode} 
                    onClick={() => handleSettingChange('quizMode', mode)} 
                    disabled={isLocked}
                    title={getModeUnlockTooltip(mode)}
                  >
                    {isLocked ? <><LockIcon/>{name}</> : name}
                  </OptionButton>
                );
              })}
            </div>
          ) : (
             <div className="text-center p-4 bg-stone-800/50 rounded-lg text-stone-400">
                <p>More modes coming soon!</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
            {renderModeSpecificSettings()}
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-stone-700 flex flex-col gap-4">
        <button
          onClick={onStartQuiz}
          disabled={isCurrentModeDisabled}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-stone-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          Start Drilling
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-800">
        <h3 className="text-base font-medium text-stone-400 mb-2">Developer Settings</h3>
        <div className="bg-stone-800 p-3 rounded-lg flex justify-between items-center">
          <label htmlFor="dev-unlock" className="text-stone-200">Unlock All Features</label>
          <button
            id="dev-unlock"
            onClick={onDevModeToggle}
            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${isDevModeUnlocked ? 'bg-green-500' : 'bg-stone-600'}`}
            aria-pressed={isDevModeUnlocked}
          >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isDevModeUnlocked ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;