
import React from 'react';

type ActiveView = 'drill' | 'report' | 'guide';

interface BottomNavBarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const NavButton: React.FC<{
  label: string;
  view: ActiveView;
  activeView: ActiveView;
  onClick: (view: ActiveView) => void;
  children: React.ReactNode;
}> = ({ label, view, activeView, onClick, children }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-orange-400' : 'text-stone-400 hover:text-orange-300'
      }`}
      aria-label={`Go to ${label}`}
    >
      {children}
      <span className={`text-xs font-medium`}>{label}</span>
    </button>
  );
};

const DrillIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const GuideIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, onViewChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-stone-900/80 backdrop-blur-lg border-t border-stone-700/50 flex justify-around items-center z-40">
      <NavButton label="Drill" view="drill" activeView={activeView} onClick={onViewChange}>
        <DrillIcon />
      </NavButton>
      <NavButton label="Report" view="report" activeView={activeView} onClick={onViewChange}>
        <ReportIcon />
      </NavButton>
      <NavButton label="Guide" view="guide" activeView={activeView} onClick={onViewChange}>
        <GuideIcon />
      </NavButton>
    </nav>
  );
};

export default BottomNavBar;