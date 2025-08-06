

import React, { useEffect } from 'react';

// Icons are defined locally to keep this component self-contained.
const TouchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-2h.208a6 6 0 0 1-5.012-2.7l-.196-.3c-.312-.479-1.407-2.388-3.286-5.728a1.5 1.5 0 0 1 .536-2.022a1.867 1.867 0 0 1 2.28.28l1.47 1.47" />
  </svg>
);
const MidiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="8.5" /><g fill="currentColor" stroke="none"><circle cx="9" cy="15.5" r="1.2" /><circle cx="15" cy="15.5" r="1.2" /><circle cx="7.5" cy="11.5" r="1.2" /><circle cx="16.5" cy="11.5" r="1.2" /><circle cx="12" cy="8" r="1.2" /></g>
  </svg>
);
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
  </svg>
);
const PianoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25h18v13.5H3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 5.25v8.25h2V5.25H6z" fill="currentColor" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 5.25v8.25h2V5.25h-2z" fill="currentColor" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 5.25v8.25h2V5.25h-2z" fill="currentColor"/>
  </svg>
);
const GuitarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16.13 3.87C16.13 3.87 14.2 2 11.5 2C8.8 2 7 3.87 7 3.87" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 3.87v5.63" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.13 3.87v5.63" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.56 22a5.5 5.5 0 0 0 5.5-5.5v-7h-11v7A5.5 5.5 0 0 0 11.56 22z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11.56" cy="14" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const BassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 4a1 1 0 0 0 1-1 1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 4a1 1 0 0 0 1-1 1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 2V10" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.4 11.89c-2.3.8-3.4 3.2-3.4 5.61 0 2.2 1.4 3.5 3 3.5h11c1.6 0 3-1.3 3-3.5 0-2.41-1.1-4.81-3.4-5.61" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 10h2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const FullscreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
    </svg>
);
const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
);
const ToggleDegreesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h12M6 15h12" />
    </svg>
);
const QuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);


interface SectionProps { title: string; children: React.ReactNode; }
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section>
    <h3 className="text-xl font-bold text-orange-400 mb-3 border-b-2 border-orange-500/30 pb-2">{title}</h3>
    <div className="space-y-4 text-stone-300">{children}</div>
  </section>
);

interface IconRowProps { icon: React.ReactNode; title: string; children: React.ReactNode; }
const IconRow: React.FC<IconRowProps> = ({ icon, title, children }) => (
  <div className="flex items-start gap-4">
    <div className="text-green-400 mt-1">{icon}</div>
    <div>
      <h4 className="font-semibold text-stone-100">{title}</h4>
      <p className="text-sm text-stone-400">{children}</p>
    </div>
  </div>
);

interface ModeDescProps { title: string; children: React.ReactNode; }
const ModeDesc: React.FC<ModeDescProps> = ({ title, children }) => (
    <div>
        <h4 className="font-semibold text-stone-100">{title}</h4>
        <p className="text-sm text-stone-400">{children}</p>
    </div>
);

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-stone-900 border border-stone-700 rounded-lg max-w-2xl w-full shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-700/50 flex-shrink-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-orange-400">App Guide</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <Section title="How to Play">
            <p>Welcome to Scale Driller! Your goal is to test your music theory knowledge as quickly and accurately as possible.</p>
            <ol className="list-decimal list-inside space-y-2 text-stone-400">
                <li><strong className="text-stone-200">Settings:</strong> On the main screen, choose a Level and a Mode. Configure the settings for that mode, like the key, scale type, or keys to practice.</li>
                <li><strong className="text-stone-200">Start Drilling:</strong> Hit the "Start Drilling" button to begin the quiz.</li>
                <li><strong className="text-stone-200">Answer Questions:</strong> Read the prompt at the top and use your selected input method (Touch, MIDI, or Mic) to play the correct notes on the instrument.</li>
                <li><strong className="text-stone-200">Check Your Score:</strong> Your score and progress are displayed at the top. In some modes, a timer will also be present.</li>
            </ol>
          </Section>

          <Section title="Icon Guide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-stone-200 mb-3">Global Controls</h4>
                    <IconRow icon={<InfoIcon />} title="App Guide">Opens this help guide.</IconRow>
                    <IconRow icon={<SettingsIcon />} title="Global Settings">Opens settings to change your instrument, input method, handedness, and test your inputs.</IconRow>
                    <IconRow icon={<FullscreenIcon />} title="Fullscreen">Toggles fullscreen mode for a more immersive experience.</IconRow>
                </div>
                 <div>
                    <h4 className="text-lg font-semibold text-stone-200 mb-3">In-Quiz Controls</h4>
                    <IconRow icon={<HelpIcon />} title="Scale Help">Shows all the notes in the current question's scale.</IconRow>
                    <IconRow icon={<ToggleDegreesIcon />} title="Toggle Labels">Switches the labels on the instrument between note names (C, D, E...) and scale degrees (1, 2, 3...).</IconRow>
                    <IconRow icon={<QuitIcon />} title="Quit Quiz">Exits the current quiz and returns to the main settings screen.</IconRow>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-stone-200 mb-3">Input Indicators</h4>
                    <IconRow icon={<TouchIcon />} title="Touch Input">Indicates that touch or mouse input is active.</IconRow>
                    <IconRow icon={<MidiIcon />} title="MIDI Input">Indicates that a MIDI controller is the active input method.</IconRow>
                    <IconRow icon={<MicIcon />} title="Microphone Input">Indicates your microphone or a connected external audio interface is the active input.</IconRow>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-stone-200 mb-3">Instrument Indicators</h4>
                    <IconRow icon={<PianoIcon />} title="Piano">Indicates the Piano is the selected instrument.</IconRow>
                    <IconRow icon={<GuitarIcon />} title="Guitar">Indicates the Guitar is the selected instrument.</IconRow>
                    <IconRow icon={<BassIcon />} title="Bass">Indicates the Bass is the selected instrument.</IconRow>
                </div>
            </div>
          </Section>

          <Section title="Game Modes">
            <ModeDesc title="Key Notes">Find and play all the notes belonging to the requested scale.</ModeDesc>
            <ModeDesc title="Scale Detective">A two-part challenge. First, find the one missing note from a nearly complete scale. Then, identify the root key of that scale.</ModeDesc>
            <ModeDesc title="Practice / Degree Training">Play the specific note that corresponds to the requested scale degree (e.g., the 3rd, 5th, etc.). You can select which keys and degrees to focus on.</ModeDesc>
            <ModeDesc title="Nashville Numbers">Similar to Degree Training, but uses the Nashville Numbering System for prompts (e.g., 'b3' for the minor third).</ModeDesc>
            <ModeDesc title="Time Attack">Answer as many single-note questions as you can before the total time runs out. Correct answers add a few seconds back to the clock!</ModeDesc>
            <ModeDesc title="BPM Challenge">A survival mode! Answer questions against a steadily increasing metronome (BPM). Correct answers earn you more 'beats' (your health), while wrong answers cost you. See how high you can level up!</ModeDesc>
            <ModeDesc title="Intervals">You are given a root note and an interval (e.g., Major 3rd). Play the note that correctly completes the interval.</ModeDesc>
          </Section>
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-700/50 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;