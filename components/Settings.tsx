import React, { useState } from 'react';
import { DEFAULT_QUIZ_SETTINGS, KEYS, SCALE_TYPES, MUSIC_KEYS } from '../constants';
import { QuizSettings, Handedness, MusicKey } from '../types';

interface SettingsProps {
  onStartQuiz: (settings: QuizSettings) => void;
  onStartInputTester: (settings: QuizSettings) => void;
}

const OptionButton: React.FC<{ value: string, current: string, onClick: () => void, children: React.ReactNode }> = ({ value, current, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 w-full ${
        current === value ? 'bg-orange-500 text-white shadow-md transform scale-105' : 'bg-stone-800 hover:bg-stone-700'
      }`}
    >
      {children}
    </button>
);

const Settings: React.FC<SettingsProps> = ({ onStartQuiz, onStartInputTester }) => {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);

  const handleSettingChange = <K extends keyof QuizSettings,>(key: K, value: QuizSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handlePracticeKeyToggle = (keyToToggle: MusicKey) => {
    setSettings(prev => {
        const currentKeys = prev.practiceKeys || [];
        const isSelected = currentKeys.includes(keyToToggle);
        let newKeys;
        if (isSelected) {
            newKeys = currentKeys.filter(k => k !== keyToToggle);
        } else {
            newKeys = [...currentKeys, keyToToggle].sort((a,b) => MUSIC_KEYS.indexOf(a) - MUSIC_KEYS.indexOf(b));
        }

        if (newKeys.length === 0) {
            return prev; // Don't allow unselecting all keys
        }

        return { ...prev, practiceKeys: newKeys };
    });
  };

  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-700/50 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">Quiz Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <OptionButton value="Practice" current={settings.quizMode} onClick={() => handleSettingChange('quizMode', 'Practice')}>Practice</OptionButton>
            <OptionButton value="Time Attack" current={settings.quizMode} onClick={() => handleSettingChange('quizMode', 'Time Attack')}>Time Attack</OptionButton>
            <OptionButton value="BPM Challenge" current={settings.quizMode} onClick={() => handleSettingChange('quizMode', 'BPM Challenge')}>BPM</OptionButton>
            <OptionButton value="Nashville Numbers" current={settings.quizMode} onClick={() => handleSettingChange('quizMode', 'Nashville Numbers')}>Nashville</OptionButton>
          </div>
        </div>
        
        {settings.quizMode === 'Practice' || settings.quizMode === 'Nashville Numbers' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Keys to Practice <span className="font-normal text-stone-400">(select one or more)</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {MUSIC_KEYS.map(k => (
                  <button
                    key={k}
                    onClick={() => handlePracticeKeyToggle(k)}
                    className={`py-2 px-2 rounded-md text-xs font-semibold transition-colors duration-200 w-full ${
                      (settings.practiceKeys || []).includes(k)
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-stone-800 hover:bg-stone-700'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="scale" className="block text-sm font-medium text-stone-300 mb-2">Scale</label>
              <select id="scale" value={settings.scaleType} onChange={e => handleSettingChange('scaleType', e.target.value as QuizSettings['scaleType'])} className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500">
                {SCALE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {settings.quizMode !== 'BPM Challenge' && (
                <div>
                  <label htmlFor="key" className="block text-sm font-medium text-stone-300 mb-2">Key</label>
                  <select id="key" value={settings.key} onChange={e => handleSettingChange('key', e.target.value as QuizSettings['key'])} className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500">
                    {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              )}
              <div className={settings.quizMode === 'BPM Challenge' ? 'col-span-2' : ''}>
                <label htmlFor="scale" className="block text-sm font-medium text-stone-300 mb-2">Scale</label>
                <select id="scale" value={settings.scaleType} onChange={e => handleSettingChange('scaleType', e.target.value as QuizSettings['scaleType'])} className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500">
                  {SCALE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
             {settings.quizMode === 'Time Attack' && (
                <div className="space-y-4 pt-4">
                    <div>
                        <label htmlFor="timeAttackDuration" className="block text-sm font-medium text-stone-300 mb-2">Total Time: <span className="font-bold text-orange-400">{settings.timeAttackDuration}s</span></label>
                        <input id="timeAttackDuration" type="range" min="30" max="300" step="15" value={settings.timeAttackDuration} onChange={e => handleSettingChange('timeAttackDuration', parseInt(e.target.value, 10))} className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                    </div>
                    <div>
                        <label htmlFor="secondsPerQuestion" className="block text-sm font-medium text-stone-300 mb-2">Time Per Question: <span className="font-bold text-orange-400">{settings.secondsPerQuestion}s</span></label>
                        <input id="secondsPerQuestion" type="range" min="3" max="20" step="1" value={settings.secondsPerQuestion} onChange={e => handleSettingChange('secondsPerQuestion', parseInt(e.target.value, 10))} className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                    </div>
                     <div>
                        <label htmlFor="questionCount" className="block text-sm font-medium text-stone-300 mb-2">Max Questions: <span className="font-bold text-orange-400">{settings.questionCount}</span></label>
                        <input id="questionCount" type="range" min="10" max="100" step="5" value={settings.questionCount} onChange={e => handleSettingChange('questionCount', parseInt(e.target.value, 10))} className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                    </div>
                </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">Instrument</label>
          <div className="grid grid-cols-3 gap-2">
            <OptionButton value="Piano" current={settings.instrument} onClick={() => handleSettingChange('instrument', 'Piano')}>Piano</OptionButton>
            <OptionButton value="Guitar" current={settings.instrument} onClick={() => handleSettingChange('instrument', 'Guitar')}>Guitar</OptionButton>
            <OptionButton value="Bass" current={settings.instrument} onClick={() => handleSettingChange('instrument', 'Bass')}>Bass</OptionButton>
          </div>
        </div>
        
        {(settings.instrument === 'Guitar' || settings.instrument === 'Bass') && (
            <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Handedness</label>
                <div className="grid grid-cols-2 gap-2">
                    <OptionButton value="Right" current={settings.handedness} onClick={() => handleSettingChange('handedness', 'Right')}>Right</OptionButton>
                    <OptionButton value="Left" current={settings.handedness} onClick={() => handleSettingChange('handedness', 'Left')}>Left</OptionButton>
                </div>
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">Input Method</label>
          <div className="grid grid-cols-3 gap-2">
            <OptionButton value="Virtual Instrument" current={settings.inputMethod} onClick={() => handleSettingChange('inputMethod', 'Virtual Instrument')}>On-screen</OptionButton>
            <OptionButton value="MIDI" current={settings.inputMethod} onClick={() => handleSettingChange('inputMethod', 'MIDI')}>MIDI</OptionButton>
            <OptionButton value="Audio" current={settings.inputMethod} onClick={() => handleSettingChange('inputMethod', 'Audio')}>Mic</OptionButton>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-stone-700 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onStartQuiz(settings)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          Start Quiz
        </button>
        <button
          onClick={() => onStartInputTester(settings)}
          className="w-full sm:w-auto bg-stone-600 hover:bg-stone-500 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          Test Input
        </button>
      </div>
    </div>
  );
};

export default Settings;