
import React from 'react';
import { 
  LayoutGrid, 
  Target, 
  Network, 
  AlertTriangle, 
  GitBranch, 
  Search,
  Plus,
  Crown
} from 'lucide-react';
import { ViewMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  toggleCreateModal: () => void;
  onOpenGit: () => void; // New Prop
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView,
  toggleCreateModal,
  onOpenGit
}) => {
  const navItems = [
    { id: ViewMode.QA_FIRST, icon: LayoutGrid, label: 'Canvas', color: 'text-cosmic-blue', glow: 'shadow-cosmic-blue/50' },
    { id: ViewMode.OKR_FIRST, icon: Target, label: 'Strategy', color: 'text-cosmic-purple', glow: 'shadow-cosmic-purple/50' },
    { id: ViewMode.GRAPH, icon: Network, label: 'Helix', color: 'text-cosmic-cyan', glow: 'shadow-cosmic-cyan/50' },
    { id: ViewMode.FAILURE_QUEUE, icon: AlertTriangle, label: 'Sediment', color: 'text-cosmic-crimson', glow: 'shadow-cosmic-crimson/50' },
  ];

  // Determine if the current view needs full height (no scrolling container)
  const isFullHeightView = currentView === ViewMode.GRAPH;

  return (
    <div className="flex h-screen w-full font-sans selection:bg-cosmic-blue/30 overflow-hidden relative">
      
      {/* Ambient background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cosmic-blue/20 rounded-full blur-[120px] pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cosmic-purple/20 rounded-full blur-[120px] pointer-events-none animate-float-slow" style={{ animationDelay: '2s' }}></div>

      {/* 1. Helix Navigation Strand (Left) */}
      <nav className="relative w-24 flex flex-col items-center py-10 z-50">
        
        {/* Brand Node */}
        <div className="relative mb-16 group cursor-pointer">
           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center shadow-glass backdrop-blur-md">
             <Crown className="text-cosmic-gold drop-shadow-md" size={20} strokeWidth={1.5} />
           </div>
        </div>

        {/* Navigation Nodes - Glass Beads */}
        <div className="flex-1 flex flex-col space-y-10 relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent z-0"></div>

          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className="relative group flex items-center justify-center w-14 h-14 focus:outline-none z-10"
              >
                {/* Active Indicator (Glowing Orb behind) */}
                <div className={`
                  absolute inset-0 rounded-full transition-all duration-500 blur-md
                  ${isActive ? `opacity-60 bg-${item.color.split('-')[1]}-${item.color.split('-')[2]}` : 'opacity-0'}
                `}></div>

                {/* The Glass Bead */}
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  backdrop-blur-xl border 
                  ${isActive 
                    ? 'bg-white/10 border-white/40 scale-110 shadow-orb' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                `}>
                  {/* Gloss Highlight */}
                  <div className="absolute top-0 inset-x-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

                  <item.icon 
                    size={isActive ? 18 : 16} 
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`relative z-20 transition-all duration-300 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-400 group-hover:text-white'}`} 
                  />
                </div>

                {/* Floating Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 translate-x-2 group-hover:translate-x-0 duration-300">
                  <div className="bg-cosmic-bg/80 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] font-medium tracking-widest text-white rounded-full shadow-lg">
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Git Status - NOW FUNCTIONAL BUTTON */}
        <div className="mt-auto z-10">
          <button 
            onClick={onOpenGit}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer shadow-inner group"
          >
            <GitBranch size={14} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* 2. Main Content - The "Apple Glass" Super Retina Display */}
      <main className="flex-1 flex flex-col relative overflow-hidden apple-glass my-4 mr-4 rounded-[2.5rem] shadow-2xl z-10">
        
        {/* Header - Transparent & Floating */}
        <header className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-12 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-3xl font-serif text-white tracking-wide drop-shadow-md opacity-90">
              {currentView === ViewMode.GRAPH ? 'Neural Helix' : currentView.replace('_', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-6 pointer-events-auto">
             {/* Spotlight Search */}
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search size={16} className="text-white/40 group-focus-within:text-white/80 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search Neural Net" 
                  className="bg-black/20 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:bg-black/40 focus:border-white/30 focus:w-72 w-56 transition-all placeholder-white/20 shadow-inner backdrop-blur-sm"
                />
             </div>

             <button 
               onClick={toggleCreateModal}
               className="w-10 h-10 rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/20 flex items-center justify-center text-white hover:scale-105 hover:bg-white/20 transition-all duration-300 shadow-glass"
             >
               <Plus size={20} strokeWidth={1.5} />
             </button>
          </div>
        </header>

        {/* Content Viewport */}
        {/* If View is Graph, we use flex-col to fill height, else we use overflow scrolling */}
        {isFullHeightView ? (
          <div className="flex-1 w-full h-full pt-24 pb-12 px-12 relative flex flex-col">
            <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/5 bg-black/20 backdrop-blur-sm">
               {children}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pt-28 px-12 pb-10 relative scroll-smooth custom-scrollbar">
            {children}
          </div>
        )}

      </main>
    </div>
  );
};
