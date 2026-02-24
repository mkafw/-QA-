
import React from 'react';
import { 
  LayoutGrid, 
  Target, 
  Network, 
  AlertTriangle, 
  GitBranch, 
  Search,
  Plus,
  Crown,
  Home,
  Settings
} from 'lucide-react';
import { ViewMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  toggleCreateModal: () => void;
  onOpenGit: () => void;
  onOpenSearch: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView,
  toggleCreateModal,
  onOpenGit,
  onOpenSearch
}) => {
  const navItems = [
    { id: ViewMode.DASHBOARD, icon: Home, label: 'Home', color: 'text-white' },
    { id: ViewMode.QA_FIRST, icon: LayoutGrid, label: 'Canvas', color: 'text-cosmic-blue' },
    { id: ViewMode.OKR_FIRST, icon: Target, label: 'Strategy', color: 'text-cosmic-purple' },
    { id: ViewMode.GRAPH, icon: Network, label: 'Helix', color: 'text-cosmic-cyan' },
    { id: ViewMode.FAILURE_QUEUE, icon: AlertTriangle, label: 'Sediment', color: 'text-cosmic-crimson' },
    { id: ViewMode.SETTINGS, icon: Settings, label: 'Settings', color: 'text-gray-400' },
  ];

  const isFullHeightView = currentView === ViewMode.GRAPH;

  return (
    // Changed h-screen to h-[100dvh] for mobile browsers
    <div className="flex flex-col md:flex-row h-[100dvh] w-full font-sans selection:bg-cosmic-blue/30 overflow-hidden relative bg-black">
      
      {/* Ambient background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cosmic-blue/40 rounded-full blur-[150px] pointer-events-none animate-pulse-glow opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cosmic-purple/30 rounded-full blur-[150px] pointer-events-none animate-pulse-glow opacity-50" style={{ animationDelay: '2s' }}></div>

      {/* 
        RESPONSIVE NAVIGATION STRAND 
        Mobile: Fixed Bottom Bar
        Desktop: Fixed Left Column
      */}
      <nav className="
        fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-6
        md:relative md:h-full md:w-24 md:flex-col md:py-10 md:bg-transparent md:border-t-0 md:justify-start
      ">
        
        {/* Brand Node (Desktop Only) */}
        <div className="hidden md:block relative mb-16 group cursor-pointer">
           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center shadow-glass backdrop-blur-md transition-all group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
             <Crown className="text-cosmic-gold drop-shadow-md group-hover:text-white transition-colors" size={20} strokeWidth={1.5} />
           </div>
        </div>

        {/* Navigation Nodes */}
        <div className="flex flex-row md:flex-col items-center justify-between w-full md:w-auto md:space-y-10 relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent z-0"></div>

          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className="relative group flex flex-col items-center justify-center md:w-14 md:h-14 focus:outline-none z-10"
              >
                {/* Active Indicator Orb (Desktop) */}
                <div className={`
                  hidden md:block absolute inset-0 rounded-full transition-all duration-500 blur-md
                  ${isActive ? `opacity-80 bg-${item.color.split('-')[1]}-${item.color.split('-')[2]}` : 'opacity-0'}
                `}></div>

                {/* The Glass Bead (Desktop) / Icon (Mobile) */}
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  md:backdrop-blur-xl md:border 
                  ${isActive 
                    ? 'text-white md:bg-white/10 md:border-white/60 md:scale-110 md:shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : 'text-gray-500 md:bg-white/5 md:border-white/10 md:hover:bg-white/10'}
                `}>
                  <item.icon 
                    size={isActive ? 24 : 20} 
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`relative z-20 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,1)]' : ''}`} 
                  />
                </div>
                
                {/* Mobile Label */}
                <span className={`md:hidden text-[9px] mt-1 font-medium tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {item.label}
                </span>

                {/* Desktop Tooltip */}
                <div className="hidden md:block absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 translate-x-2 group-hover:translate-x-0 duration-300">
                  <div className="bg-cosmic-bg/80 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] font-medium tracking-widest text-white rounded-full shadow-lg">
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Git Status (Desktop) */}
        <div className="hidden md:block mt-auto z-10">
          <button 
            onClick={onOpenGit}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer shadow-inner group"
          >
            <GitBranch size={14} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* 
        MAIN CONTENT VIEWPORT 
        Adjusted margins and rounded corners for mobile/desktop split
      */}
      <main className="flex-1 flex flex-col relative overflow-hidden apple-glass md:my-4 md:mr-4 rounded-none md:rounded-[2.5rem] shadow-2xl z-10 pb-20 md:pb-0">
        
        {/* Header - Adaptive */}
        <header className="absolute top-0 left-0 right-0 h-16 md:h-24 flex items-center justify-between px-6 md:px-12 z-20 pointer-events-none">
          <div className="pointer-events-auto flex items-center">
             {/* Git Button for Mobile */}
             <button onClick={onOpenGit} className="md:hidden mr-4 text-gray-400">
                 <GitBranch size={20} />
             </button>
             <h1 className="text-xl md:text-3xl font-serif text-white tracking-wide drop-shadow-md opacity-90 truncate">
               {currentView === ViewMode.GRAPH ? 'Neural Helix' : currentView.replace('_', ' ')}
             </h1>
          </div>
          
           <div className="flex items-center space-x-4 md:space-x-6 pointer-events-auto">
              {/* Spotlight Search - Hidden on small mobile */}
              <button 
                onClick={onOpenSearch}
                className="relative group hidden sm:block"
              >
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <Search size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
                 </div>
                 <div className="bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs font-medium text-white/40 group-hover:text-white/60 group-hover:bg-black/40 transition-all cursor-text shadow-inner backdrop-blur-sm w-32 md:w-56">
                   Search...
                 </div>
              </button>

              <button 
                onClick={toggleCreateModal}
               className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/20 flex items-center justify-center text-white hover:scale-105 hover:bg-white/20 transition-all duration-300 shadow-glass"
             >
               <Plus size={18} strokeWidth={1.5} />
             </button>
          </div>
        </header>

        {/* Content Viewport */}
        {isFullHeightView ? (
          <div className="flex-1 w-full h-full pt-16 md:pt-24 pb-0 md:pb-12 px-0 md:px-12 relative flex flex-col">
            <div className="flex-1 relative md:rounded-3xl overflow-hidden border-t md:border border-white/5 bg-black/20 backdrop-blur-sm">
               {children}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pt-20 md:pt-28 px-4 md:px-12 pb-10 relative scroll-smooth custom-scrollbar">
            {children}
          </div>
        )}

      </main>
    </div>
  );
};
