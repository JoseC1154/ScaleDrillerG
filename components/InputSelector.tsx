
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QuizSettings, InputMethod } from '../types';

// Main button icons
const MainTouchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-2h.208a6 6 0 0 1-5.012-2.7l-.196-.3c-.312-.479-1.407-2.388-3.286-5.728a1.5 1.5 0 0 1 .536-2.022a1.867 1.867 0 0 1 2.28.28l1.47 1.47" />
  </svg>
);
const MainMidiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="8.5" /><g fill="currentColor" stroke="none"><circle cx="9" cy="15.5" r="1.2" /><circle cx="15" cy="15.5" r="1.2" /><circle cx="7.5" cy="11.5" r="1.2" /><circle cx="16.5" cy="11.5" r="1.2" /><circle cx="12" cy="8" r="1.2" /></g>
  </svg>
);
const MainMicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

// Popover button icons
const TouchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-2h.208a6 6 0 0 1-5.012-2.7l-.196-.3c-.312-.479-1.407-2.388-3.286-5.728a1.5 1.5 0 0 1 .536-2.022a1.867 1.867 0 0 1 2.28.28l1.47 1.47" /></svg>
);
const MidiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="8.5" /><g fill="currentColor" stroke="none"><circle cx="9" cy="15.5" r="1.2" /><circle cx="15" cy="15.5" r="1.2" /><circle cx="7.5" cy="11.5" r="1.2" /><circle cx="16.5" cy="11.5" r="1.2" /><circle cx="12" cy="8" r="1.2" /></g></svg>
);
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" /></svg>
);


const OptionButton: React.FC<{ value: any, current: any, onClick: () => void, children: React.ReactNode, disabled?: boolean }> = ({ value, current, onClick, children, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-md font-medium transition-all duration-200 w-full flex items-center gap-2 justify-center text-sm ${
        current === value ? 'bg-orange-500 text-white shadow-md' : 'bg-stone-800 hover:bg-stone-700'
      }`}
    >
      {children}
    </button>
);

interface InputSelectorProps {
  settings: QuizSettings;
  onSettingChange: <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => void;
}

const InputSelector: React.FC<InputSelectorProps> = ({ settings, onSettingChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [devicesError, setDevicesError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'idle' | 'unavailable' | 'prompt' | 'error'>('idle');

    const getMainIcon = (method: InputMethod) => {
        switch (method) {
          case 'Touch': return <MainTouchIcon />;
          case 'MIDI': return <MainMidiIcon />;
          case 'Mic': return <MainMicIcon />;
          default: return null;
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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

    const enumerateAndSetDevices = useCallback(async () => {
        if (!navigator.mediaDevices?.enumerateDevices) {
            setDevicesError("Device enumeration is not supported by this browser.");
            setPermissionStatus('unavailable');
            return;
        }

        try {
            // This will trigger a permission prompt if not already granted.
            // We need a stream to get device labels.
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
            setAudioDevices(audioInputDevices);
            setDevicesError(null);
            setPermissionStatus('granted');

            // If no device is selected, or the selected one is gone, select the first available one.
            if ((!settings.audioInputDeviceId || !audioInputDevices.some(d => d.deviceId === settings.audioInputDeviceId)) && audioInputDevices.length > 0) {
              onSettingChange('audioInputDeviceId', audioInputDevices[0].deviceId);
            }
            // Stop the stream now we have the labels
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error("Error enumerating devices:", err);
            if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
                setDevicesError("Microphone permission denied.");
                setPermissionStatus('denied');
            } else {
                setDevicesError("Could not access audio devices.");
                setPermissionStatus('error');
            }
        }
    }, [onSettingChange, settings.audioInputDeviceId]);


    useEffect(() => {
        if (isOpen && settings.inputMethod === 'Mic') {
            if (navigator.permissions?.query) {
                navigator.permissions.query({ name: 'microphone' as PermissionName }).then(status => {
                    setPermissionStatus(status.state);
                    if (status.state === 'granted') {
                        enumerateAndSetDevices();
                    }
                    status.onchange = () => {
                        setPermissionStatus(status.state);
                        if (status.state === 'granted') {
                            enumerateAndSetDevices();
                        } else {
                            setAudioDevices([]);
                        }
                    };
                });
            } else {
                // Fallback for browsers that don't support Permissions API
                enumerateAndSetDevices();
            }
        }
    }, [isOpen, settings.inputMethod, enumerateAndSetDevices]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(prev => !prev)}
                className="p-2 rounded-full text-green-200 transition-colors"
                style={{ filter: 'drop-shadow(0 0 2px #4ade80) drop-shadow(0 0 6px #4ade80)' }}
                title={`Selected Input: ${settings.inputMethod}`}
            >
                {getMainIcon(settings.inputMethod)}
            </button>

            {isOpen && (
                <div
                    ref={popoverRef}
                    className="absolute top-full mt-2 left-0 bg-stone-900/80 backdrop-blur-lg border border-stone-700 rounded-lg p-4 shadow-2xl w-64 z-50 space-y-4"
                >
                    <div>
                        <label className="block text-xs font-medium text-stone-400 mb-2">Input Method</label>
                        <div className="space-y-2">
                            <OptionButton value="Touch" current={settings.inputMethod} onClick={() => onSettingChange('inputMethod', 'Touch')}>
                                <TouchIcon /> <span>Touch</span>
                            </OptionButton>
                            <OptionButton value="MIDI" current={settings.inputMethod} onClick={() => onSettingChange('inputMethod', 'MIDI')}>
                                <MidiIcon /> <span>MIDI</span>
                            </OptionButton>
                            <OptionButton value="Mic" current={settings.inputMethod} onClick={() => onSettingChange('inputMethod', 'Mic')}>
                                <MicIcon /> <span>Microphone</span>
                            </OptionButton>
                        </div>
                    </div>

                    {settings.inputMethod === 'Mic' && (
                        <div className="border-t border-stone-700 pt-3 mt-3">
                            <label htmlFor="audio-device" className="block text-xs font-medium text-stone-400 mb-2">Audio Device</label>
                            {permissionStatus === 'granted' && audioDevices.length > 0 && (
                                <select
                                    id="audio-device"
                                    value={settings.audioInputDeviceId || ''}
                                    onChange={e => onSettingChange('audioInputDeviceId', e.target.value)}
                                    className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500 text-sm"
                                >
                                    {audioDevices.map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {permissionStatus === 'granted' && audioDevices.length === 0 && (
                                <p className="text-sm text-stone-400">No audio input devices found.</p>
                            )}
                             {(permissionStatus === 'denied' || permissionStatus === 'error') && (
                                <p className="text-sm text-red-400">{devicesError}</p>
                            )}
                            {(permissionStatus === 'prompt' || permissionStatus === 'idle') && (
                                 <button onClick={enumerateAndSetDevices} className="text-sm text-yellow-400 hover:text-yellow-300 w-full text-left bg-yellow-900/50 p-2 rounded-md text-center">
                                    Connect Microphone
                                </button>
                            )}
                             {permissionStatus === 'unavailable' && (
                                <p className="text-sm text-red-400">{devicesError}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InputSelector;
