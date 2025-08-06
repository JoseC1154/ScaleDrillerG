
import { UserData, PerformanceStat, MusicKey, ScaleType, PerformanceUpdate, QuizMode } from '../types';

const USER_DATA_KEY = 'scale-driller-userData';

export const getInitialUserData = (): UserData => ({
  unlockedLevel: 1,
  isKeySelectionUnlocked: false,
  unlockedModes: ['Simon Memory Game'], // Start with only Simon Game unlocked
  performance: {
    byKey: {},
    byScale: {},
    byDegree: {},
    byInterval: {},
    byChord: {},
  },
  preQuizInfoSeen: {},
  simonHighScore: 0,
});

export const loadUserData = (): UserData => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (data) {
      const parsedData: UserData = JSON.parse(data);
      // Basic validation and merging with default to handle schema changes
      const initialData = getInitialUserData();
      return {
        ...initialData,
        ...parsedData,
        performance: {
          ...initialData.performance,
          ...(parsedData.performance || {}),
        },
        // Ensure new users or corrupted data get the correct starting modes
        unlockedModes: Array.isArray(parsedData.unlockedModes) && parsedData.unlockedModes.length > 0 ? parsedData.unlockedModes : initialData.unlockedModes,
        preQuizInfoSeen: parsedData.preQuizInfoSeen || {},
        simonHighScore: parsedData.simonHighScore || 0,
      };
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
  return getInitialUserData();
};

export const saveUserData = (userData: UserData): void => {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const updatePerformanceStat = (currentData: UserData, update: PerformanceUpdate): UserData => {
  const newData = { ...currentData, performance: { ...currentData.performance } };

  const updateStat = (obj: any, key: string | number) => {
    const stat = obj[key] || { correct: 0, incorrect: 0 };
    if (update.isCorrect) {
      stat.correct++;
    } else {
      stat.incorrect++;
    }
    obj[key] = stat;
  };

  if (update.key) {
    const byKey = { ...newData.performance.byKey };
    updateStat(byKey, update.key);
    newData.performance.byKey = byKey;
  }
  if (update.scaleType) {
    const byScale = { ...newData.performance.byScale };
    updateStat(byScale, update.scaleType);
    newData.performance.byScale = byScale;
  }
  if (update.degree) {
    const byDegree = { ...newData.performance.byDegree };
    updateStat(byDegree, update.degree);
    newData.performance.byDegree = byDegree;
  }
  if (update.intervalName) {
      const byInterval = { ...newData.performance.byInterval };
      updateStat(byInterval, update.intervalName);
      newData.performance.byInterval = byInterval;
  }
  if (update.chordType) {
      const byChord = { ...newData.performance.byChord };
      updateStat(byChord, update.chordType);
      newData.performance.byChord = byChord;
  }

  return newData;
};

export const getAccuracy = (stat: PerformanceStat | undefined): number => {
  if (!stat || (stat.correct === 0 && stat.incorrect === 0)) return -1; // -1 to indicate not practiced
  return Math.round((stat.correct / (stat.correct + stat.incorrect)) * 100);
};

export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy < 0) return 'text-stone-500'; // Not practiced
  if (accuracy < 50) return 'text-red-400';
  if (accuracy < 80) return 'text-yellow-400';
  return 'text-green-400';
};

export const getAccuracyBgColor = (accuracy: number): string => {
  if (accuracy < 0) return 'bg-stone-700';
  if (accuracy < 50) return 'bg-red-500';
  if (accuracy < 80) return 'bg-yellow-500';
  return 'bg-green-500';
};