
import React, { useState, useRef } from 'react';
import { Question, LearningLevel } from '../types';
import { 
  Link as LinkIcon, 
  Target, 
  Image as ImageIcon, 
  Send,
  MoreHorizontal,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';

interface QAViewProps {
  questions: Question[];
  onAddQuestion?: (q: Partial<Question>) => void;
  onNavigateToGraph?: () => void;
}

// Mock Asset Library
const MOCK_ASSETS = [
  { id: 'img1', name: 'error_trace.png', url: 'https://placehold.co/600x400/1a1a1a/FFF?text=Error+Log' },
  { id: 'img2', name: 'arch_v1.png', url: 'https://mermaid.ink/img/pako:eNpVkM1qwzAQhF9F7LkF8gI-FNoSyuZgQyCXIsvaWAvZylIyxiG8e9V_2qTnHma-Wc1oZ0ZLCw6-Oayf1hX2yvD2IYeR_s4x_x4Xj2_vjzG8fTzG5XU8PcaEK2U44dmh0-6A87-W84B2o_14N9pYjC8w_oJ2o43F-Azjb2g32liMLzD-hnatDVU4-fB6yD7fO9joBw01lFhQ85QdFmTU0CJ35O4cM2rIqKHFjNwdY0YNGTW0mJG7Y8yoIaOGFjNyd4wZNWQs0eLw5D_XyL0uK6hRUiJ3yT-P3Z8fQ79lGg' },
  { id: 'img3', name: 'agent_flow.jpg', url: 'https://placehold.co/600x400/2a1a3a/FFF?text=Agent+Flow' },
];

export const QAView: React.FC<QAViewProps> = ({ questions }) => {
  const [activeLevel, setActiveLevel] = useState<LearningLevel | 'ALL'>('ALL');
  const [inputContent, setInputContent] = useState('');
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // LAW OF RESISTANCE: Check for "Cognitive Cost"
  const hasPaidCost = inputContent.includes('[[') || inputContent.includes('@');
  const canSubmit = inputContent.trim().length > 0 && hasPaidCost;

  const filtered = activeLevel === 'ALL' 
    ? questions 
    : questions.filter(q => q.level === activeLevel);

  // --- Input Logic ---
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputContent(val);
    if (val.endsWith('@')) { setShowAssetMenu(true); setShowLinkMenu(false); }
    else if (val.endsWith('[[')) { setShowLinkMenu(true); setShowAssetMenu(false); }
    else { if (!val.includes('@')) setShowAssetMenu(false); if (!val.includes('[[')) setShowLinkMenu(false); }
  };

  const insertToken = (token: string, type: 'asset' | 'link') => {
    if (type === 'asset') { setInputContent(prev => prev.replace(/@$/, '') + `@${token} `); setShowAssetMenu(false); }
    else { setInputContent(prev => prev.replace(/\[\[$/, '') + `[[${token}]] `); setShowLinkMenu(false); }
    inputRef.current?.focus();
  };

  const getLevelBadge = (level: LearningLevel) => {
    switch(level) {
      case LearningLevel.L0_TOOL: return { label: 'L0 Tool', color: 'bg-white/10 text-white' };
      case LearningLevel.L1_PATTERN: return { label: 'L1 Pattern', color: 'bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30' };
      case LearningLevel.L2_SELF: return { label: 'L2 Self', color: 'bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/30' };
      default: return { label: 'Unknown', color: 'bg-gray-800' };
    }
  };

  return (
    <div className="relative min-h-full flex flex-col">
      
      {/* Filters */}
      <div className="fixed top-8 right-12 z-30 flex items-center pointer-events-none">
         <div className="pointer-events-auto bg-black/30 backdrop-blur-xl border border-white/10 rounded-full p-1 flex space-x-1 shadow-2xl">
            {['ALL', LearningLevel.L0_TOOL, LearningLevel.L1_PATTERN, LearningLevel.L2_SELF].map((lvl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLevel(lvl as any)}
                className={`px-4 py-1.5 text-[10px] font-medium tracking-wider rounded-full transition-all ${
                  activeLevel === lvl 
                    ? 'bg-white text-black shadow-lg scale-105' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {typeof lvl === 'string' ? lvl : `L${lvl}`}
              </button>
            ))}
         </div>
      </div>

      {/* Masonry Canvas */}
      <div className="flex-1 pb-48">
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 mx-auto max-w-7xl">
          {filtered.map(q => {
            const badge = getLevelBadge(q.level);
            // Check implicit crystallization (if it links to any OKR)
            const isCrystallized = q.linkedOKRIds.length > 0;

            return (
              <div key={q.id} className="break-inside-avoid relative group">
                {/* Crystal Platter Card */}
                <div className={`
                    relative bg-white/5 border rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-500 hover:-translate-y-1
                    ${isCrystallized 
                        ? 'border-cosmic-gold/30 shadow-[0_0_20px_rgba(255,229,128,0.1)]' 
                        : 'border-white/10 hover:bg-white/10 hover:shadow-glass'}
                `}>
                  
                  {/* Gloss Sheen */}
                  <div className="gloss-sheen"></div>

                  {/* Asset Display */}
                  {q.assets && q.assets.length > 0 && (
                    <div className="relative h-48 w-full overflow-hidden border-b border-white/5">
                      <img src={q.assets[0]} alt="Asset" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out" />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] text-white border border-white/10 flex items-center shadow-lg">
                        <ImageIcon size={10} className="mr-1"/> IMG
                      </div>
                    </div>
                  )}

                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-medium border border-transparent ${badge.color}`}>
                        {badge.label}
                      </span>
                      <button className="text-white/30 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    <h3 className={`text-lg font-medium mb-2 leading-tight transition-colors ${isCrystallized ? 'text-cosmic-gold' : 'text-white group-hover:text-cosmic-blue'}`}>
                      {q.title}
                    </h3>
                    
                    <div className="text-xs text-gray-400 mb-6 leading-relaxed font-light">
                      {q.content}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                       <div className="flex space-x-3">
                         {q.linkedOKRIds.length > 0 && <Target size={14} className="text-cosmic-purple hover:drop-shadow-[0_0_5px_currentColor] transition-all cursor-pointer" />}
                         {q.linkedQuestionIds.length > 0 && <LinkIcon size={14} className="text-cosmic-gold hover:drop-shadow-[0_0_5px_currentColor] transition-all cursor-pointer" />}
                       </div>
                       
                       <div className="flex gap-1.5">
                         {q.tags.map(t => (
                           <span key={t} className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] text-gray-400 border border-transparent hover:border-white/20 transition-colors cursor-pointer">
                             #{t}
                           </span>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Spotlight Input */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50">
        <div className="pointer-events-auto w-full max-w-2xl mx-6">
          <div className="relative group">
            
            {/* Glow Bloom */}
            <div className={`absolute -inset-1 bg-gradient-to-r rounded-2xl blur opacity-20 transition-opacity duration-500 ${hasPaidCost ? 'from-cosmic-blue via-cosmic-purple to-cosmic-cyan group-hover:opacity-40' : 'from-gray-500 to-gray-700 opacity-5'}`}></div>

            <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              
              {/* Context Menu Popups (Simplified) */}
              {(showAssetMenu || showLinkMenu) && (
                <div className="border-b border-white/5 bg-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                   {showAssetMenu && MOCK_ASSETS.map(a => (
                     <div key={a.id} onClick={() => insertToken(a.name, 'asset')} className="p-2 hover:bg-white/10 cursor-pointer flex items-center text-xs text-gray-300">
                       <img src={a.url} className="w-6 h-6 rounded mr-3 object-cover"/> {a.name}
                     </div>
                   ))}
                </div>
              )}

              <div className="flex items-center p-4">
                {hasPaidCost ? (
                    <Sparkles size={20} className="text-cosmic-gold animate-pulse-glow mr-4" strokeWidth={1.5} />
                ) : (
                    <Lock size={20} className="text-gray-500 mr-4" strokeWidth={1.5} />
                )}
                
                <textarea
                  ref={inputRef}
                  value={inputContent}
                  onChange={handleInput}
                  placeholder={hasPaidCost ? "The Neural Net is listening..." : "Pay Cognitive Cost: Link [[...]] or Asset @..."}
                  className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none resize-none h-[24px] overflow-hidden"
                  rows={1}
                />
                <button 
                  disabled={!canSubmit}
                  className={`ml-3 p-1.5 rounded-full transition-all ${canSubmit ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-gray-600 cursor-not-allowed'}`}
                >
                  {canSubmit ? <Send size={14} /> : <Unlock size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
