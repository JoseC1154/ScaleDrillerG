
import React, { useState, useRef, useEffect } from 'react';
import { QuizSettings, Instrument, Handedness } from '../types';

const PianoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25h18v13.5H3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 5.25v8.25h2V5.25H6z" fill="currentColor" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 5.25v8.25h2V5.25h-2z" fill="currentColor" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 5.25v8.25h2V5.25h-2z" fill="currentColor"/>
  </svg>
);
const GuitarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16.13 3.87C16.13 3.87 14.2 2 11.5 2C8.8 2 7 3.87 7 3.87" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 3.87v5.63" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.13 3.87v5.63" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.56 22a5.5 5.5 0 0 0 5.5-5.5v-7h-11v7A5.5 5.5 0 0 0 11.56 22z" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="11.56" cy="14" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const BassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 4a1 1 0 0 0 1-1 1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 4a1 1 0 0 0 1-1 1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 2V10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.4 11.89c-2.3.8-3.4 3.2-3.4 5.61 0 2.2 1.4 3.5 3 3.5h11c1.6 0 3-1.3 3-3.5 0-2.41-1.1-4.81-3.4-5.61" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 10h2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const MainPianoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25h18v13.5H3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 5.25v8.25h2V5.25H6z" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 5.25v8.25h2V5.25h-2z" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 5.25v8.25h2V5.25h-2z" fill="currentColor"/>
    </svg>
);
const MainGuitarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16.13 3.87C16.13 3.87 14.2 2 11.5 2C8.8 2 7 3.87 7 3.87" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 3.87v5.63" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.13 3.87v5.63" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.56 22a5.5 5.5 0 0 0 5.5-5.5v-7h-11v7A5.5 5.5 0 0 0 11.56 22z" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="11.56" cy="14" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const MainBassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 4a1 1 0 0 0 1-1 1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 4a1 1 0 0 0 1-1 1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 2V10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.4 11.89c-2.3.8-3.4 3.2-3.4 5.61 0 2.2 1.4 3.5 3 3.5h11c1.6 0 3-1.3 3-3.5 0-2.41-1.1-4.81-3.4-5.61" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 10h2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const OptionButton: React.FC<{ value: any, current: any, onClick: () => void, children: React.ReactNode, disabled?: boolean, small?: boolean }> = ({ value, current, onClick, children, disabled, small }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-md font-medium transition-all duration-200 w-full flex items-center gap-2 justify-center ${small ? 'text-xs' : 'text-sm'} ${
        current === value ? 'bg-orange-500 text-white shadow-md' : 'bg-stone-800 hover:bg-stone-700'
      }`}
    >
      {children}
    </button>
);


interface InstrumentSelectorProps {
  settings: QuizSettings;
  onSettingChange: <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => void;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({ settings, onSettingChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const { instrument, handedness } = settings;

    const handleInstrumentChange = (newInstrument: Instrument) => {
        onSettingChange('instrument', newInstrument);
    };

    const handleHandednessChange = (newHandedness: Handedness) => {
        onSettingChange('handedness', newHandedness);
    };

    const getMainIcon = (instr: Instrument) => {
        switch (instr) {
            case 'Piano': return <MainPianoIcon />;
            case 'Guitar': return <MainGuitarIcon />;
            case 'Bass': return <MainBassIcon />;
            default: return null;
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(prev => !prev)}
                className="p-2 rounded-full text-green-200 transition-colors"
                style={{ filter: 'drop-shadow(0 0 2px #4ade80) drop-shadow(0 0 6px #4ade80)'}}
                title={`Selected Instrument: ${instrument}`}
            >
                {getMainIcon(instrument)}
            </button>

            {isOpen && (
                <div
                    ref={popoverRef}
                    className="absolute top-full mt-2 left-0 bg-stone-900/80 backdrop-blur-lg border border-stone-700 rounded-lg p-4 shadow-2xl w-56 z-50 space-y-4"
                >
                    <div>
                        <label className="block text-xs font-medium text-stone-400 mb-2">Instrument</label>
                        <div className="space-y-2">
                             <OptionButton value="Piano" current={instrument} onClick={() => handleInstrumentChange('Piano')}>
                                <PianoIcon/> <span>Piano</span>
                            </OptionButton>
                            <OptionButton value="Guitar" current={instrument} onClick={() => handleInstrumentChange('Guitar')}>
                                <GuitarIcon/> <span>Guitar</span>
                            </OptionButton>
                            <OptionButton value="Bass" current={instrument} onClick={() => handleInstrumentChange('Bass')}>
                                <BassIcon/> <span>Bass</span>
                            </OptionButton>
                        </div>
                    </div>

                    {(instrument === 'Guitar' || instrument === 'Bass') && (
                        <div className="border-t border-stone-700 pt-3 mt-3">
                            <label className="block text-xs font-medium text-stone-400 mb-2">Handedness</label>
                            <div className="grid grid-cols-2 gap-2">
                                <OptionButton value="Right" current={handedness} onClick={() => handleHandednessChange('Right')} small>Right</OptionButton>
                                <OptionButton value="Left" current={handedness} onClick={() => handleHandednessChange('Left')} small>Left</OptionButton>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InstrumentSelector;