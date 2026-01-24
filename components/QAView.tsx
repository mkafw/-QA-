
import React, { useState, useRef, useEffect } from 'react';
import { Question, LearningLevel, EntityType } from '../types';
import { 
  Link as LinkIcon, 
  Target, 
  Image as ImageIcon, 
  Send,
  MoreHorizontal,
  Sparkles,
  Lock,
  Unlock,
  Loader2,
  Zap
} from 'lucide-react';
import { DomainRules } from '../services/DomainRules';

interface QAViewProps {
  questions: Question[];
  highlightedId?: string | null;
  onAddQuestion?: (q: Question) => Promise<boolean>;
  onNavigateToGraph?: () => void;
}

export const QAView: React.FC<QAViewProps> = ({ questions, highlightedId, onAddQuestion }) => {
  const [activeLevel, setActiveLevel] = useState<LearningLevel | 'ALL'>('ALL');
  const [inputContent, setInputContent] = useState('');
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (highlightedId && cardRefs.current.has(highlightedId)) {
        const el = cardRefs.current.get(highlightedId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [highlightedId]);

  // LAW OF RESISTANCE: Enforced via Domain Service
  const hasPaidCost = DomainRules.validateCognitiveCost(inputContent);
  const canSubmit = inputContent.trim().length > 0 && hasPaidCost;

  const filtered = activeLevel === 'ALL' 
    ? questions 
    : questions.filter(q => q.level === activeLevel);

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

  const handleSubmit = async () => {
    if (!canSubmit || !onAddQuestion) return;
    setIsSubmitting(true);
    
    const title = inputContent.split('\n')[0].substring(0, 50) + (inputContent.length > 50 ? '...' : '');
    
    const newQuestion: Question = {
        id: `q-${Date.now()}`,
        type: EntityType.QUESTION,
        title: title,
        content: inputContent,
        level: LearningLevel.L0_TOOL,
        tags: ['Quick'],
        linkedQuestionIds: [],
        linkedOKRIds: [],
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const success = await onAddQuestion(newQuestion);
    if (success) {
        setInputContent('');
    }
    setIsSubmitting(false);
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

      <div className="flex-1 pb-48">
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 mx-auto max-w-7xl">
          {filtered.map(q => {
            const badge = getLevelBadge(q.level);
            const isCrystallized = q.linkedOKRIds.length > 0;
            const isHighlighted = highlightedId === q.id;

            return (
              <div 
                key={q.id} 
                ref={(el) => { if (el) cardRefs.current.set(q.id, el); }}
                className={`break-inside-avoid relative group transition-all duration-700 ${isHighlighted ? 'scale-105 z-20' : ''}`}
              >
                <div className={`
                    relative bg-white/5 border rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-500 hover:-translate-y-1
                    ${isHighlighted 
                        ? 'border-cosmic-blue shadow-[0_0_40px_rgba(46,92,255,0.4)] bg-cosmic-blue/10' 
                        : isCrystallized 
                            ? 'border-cosmic-gold/30 shadow-[0_0_20px_rgba(255,229,128,0.1)]' 
                            : 'border-white/10 hover:bg-white/10 hover:shadow-glass'}
                `}>
                  <div className="gloss-sheen"></div>
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
                    
                    <div className="text-xs text-gray-400 mb-6 leading-relaxed font-light whitespace-pre-wrap">
                      {q.content}
                    </div>

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

      <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50">
        <div className="pointer-events-auto w-full max-w-2xl mx-6">
          <div className="relative group">
            <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-20 transition-all duration-500 ${canSubmit ? 'bg-cosmic-blue opacity-40' : 'bg-white'}`}></div>
            <div className="relative bg-cosmic-bg/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <textarea 
                ref={inputRef}
                value={inputContent}
                onChange={handleInput}
                className="w-full bg-transparent text-white px-6 py-4 focus:outline-none text-sm placeholder-white/30 resize-none font-mono"
                placeholder="Type '[[ ' to link nodes or '@ ' to add assets..."
                rows={canSubmit ? 3 : 1}
              />
              
              <div className="flex justify-between items-center px-4 py-2 border-t border-white/5 bg-black/20">
                <div className="flex space-x-2 text-[10px] text-gray-500 font-medium">
                  <span className={inputContent.includes('[[') ? 'text-cosmic-gold' : ''}>[[ LINK ]]</span>
                  <span className={inputContent.includes('@') ? 'text-cosmic-purple' : ''}>@ ASSET</span>
                </div>
                <div className="flex items-center space-x-3">
                   <div className={`flex items-center space-x-1 text-[10px] uppercase tracking-wider transition-colors ${hasPaidCost ? 'text-cosmic-cyan' : 'text-cosmic-crimson'}`}>
                      {hasPaidCost ? <Unlock size={10} /> : <Lock size={10} />}
                      <span>{hasPaidCost ? 'Cost Paid' : 'Link Required'}</span>
                   </div>

                   <button 
                     onClick={handleSubmit}
                     disabled={!canSubmit || isSubmitting}
                     className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${canSubmit ? 'bg-cosmic-blue text-white shadow-[0_0_15px_#2E5CFF]' : 'bg-white/10 text-gray-500'}`}
                   >
                     {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14} />}
                   </button>
                </div>
              </div>
            </div>
            
            {showLinkMenu && (
                 <div className="absolute bottom-full left-0 mb-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2">
                     <div className="p-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-white/5">Suggested Links</div>
                     {questions.slice(0, 3).map(q => (
                         <div key={q.id} onClick={() => insertToken(q.id, 'link')} className="p-3 hover:bg-white/10 cursor-pointer flex items-center space-x-2 text-white/80 text-xs">
                             <Zap size={12} className="text-cosmic-gold"/>
                             <span className="truncate">{q.title}</span>
                         </div>
                     ))}
                 </div>
            )}
            
             {showAssetMenu && (
                 <div className="absolute bottom-full left-0 mb-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2">
                     <div className="p-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-white/5">Available Assets</div>
                     <div onClick={() => insertToken('https://placehold.co/600x400', 'asset')} className="p-3 hover:bg-white/10 cursor-pointer flex items-center space-x-2 text-white/80 text-xs">
                         <ImageIcon size={12} className="text-cosmic-purple"/>
                         <span className="truncate">arch_diagram_v1.png</span>
                     </div>
                 </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
