
import React, { useState } from 'react';
import { X, Target, Zap, Plus, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Question, Objective, EntityType, LearningLevel, KeyResult } from '../types';

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuestion: (q: Question) => Promise<void>;
  onCreateObjective: (o: Objective) => Promise<void>;
}

export const CreationModal: React.FC<CreationModalProps> = ({ 
  isOpen, onClose, onCreateQuestion, onCreateObjective 
}) => {
  const [activeTab, setActiveTab] = useState<'QA' | 'OKR'>('QA');
  
  // QA State
  const [qTitle, setQTitle] = useState('');
  const [qContent, setQContent] = useState('');
  const [qLevel, setQLevel] = useState<LearningLevel>(LearningLevel.L0_TOOL);
  const [qTags, setQTags] = useState('');

  // OKR State
  const [oTitle, setOTitle] = useState('');
  const [oDesc, setODesc] = useState('');
  const [keyResults, setKeyResults] = useState<Partial<KeyResult>[]>([{ title: '', metric: '' }]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const timestamp = new Date().toISOString();

    if (activeTab === 'QA') {
        const newQuestion: Question = {
            id: `q-${Date.now()}`,
            type: EntityType.QUESTION,
            title: qTitle,
            content: qContent,
            level: qLevel,
            tags: qTags.split(',').map(t => t.trim()).filter(t => t),
            linkedQuestionIds: [], // In real app, would parse from content [[...]]
            linkedOKRIds: [], // In real app, would parse
            status: 'Draft',
            createdAt: timestamp,
            updatedAt: timestamp
        };
        await onCreateQuestion(newQuestion);
    } else {
        const newObjective: Objective = {
            id: `o-${Date.now()}`,
            type: EntityType.OBJECTIVE,
            title: oTitle,
            description: oDesc,
            linkedQuestionIds: [],
            keyResults: keyResults.filter(kr => kr.title).map((kr, idx) => ({
                id: `kr-${Date.now()}-${idx}`,
                type: EntityType.KEY_RESULT,
                title: kr.title || 'Untitled',
                metric: kr.metric || 'Boolean',
                status: 'Pending',
                linkedQuestionIds: [],
                createdAt: timestamp,
                updatedAt: timestamp
            })),
            createdAt: timestamp,
            updatedAt: timestamp
        };
        await onCreateObjective(newObjective);
    }
    // Reset and Close
    onClose();
    setQTitle(''); setQContent(''); setOTitle(''); setODesc(''); setKeyResults([{ title: '', metric: '' }]);
  };

  // Law of Resistance: Check Metabolic Cost
  const hasLinks = activeTab === 'QA' 
    ? (qContent.includes('[[') || qContent.includes('@') || qContent.length > 20) 
    : (oTitle.length > 5 && keyResults.some(kr => kr.title));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[800px] bg-cosmic-bg border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-white/10">
            <button 
                onClick={() => setActiveTab('QA')}
                className={`flex-1 py-6 flex items-center justify-center space-x-2 transition-all ${activeTab === 'QA' ? 'bg-white/5 text-cosmic-blue shadow-[inset_0_-2px_0_#2E5CFF]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
                <Zap size={18} />
                <span className="font-serif font-bold tracking-widest">COGNITION CORE</span>
            </button>
            <button 
                onClick={() => setActiveTab('OKR')}
                className={`flex-1 py-6 flex items-center justify-center space-x-2 transition-all ${activeTab === 'OKR' ? 'bg-white/5 text-cosmic-purple shadow-[inset_0_-2px_0_#7B2EFF]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
                <Target size={18} />
                <span className="font-serif font-bold tracking-widest">ACTION CORE</span>
            </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {activeTab === 'QA' ? (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Question / Concept</label>
                        <input 
                            value={qTitle}
                            onChange={e => setQTitle(e.target.value)}
                            placeholder="e.g. How does the Attention Mechanism work?" 
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cosmic-blue focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Learning Level</label>
                             <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
                                {[LearningLevel.L0_TOOL, LearningLevel.L1_PATTERN, LearningLevel.L2_SELF].map(lvl => (
                                    <button 
                                        key={lvl} 
                                        onClick={() => setQLevel(lvl)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${qLevel === lvl ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        L{lvl}
                                    </button>
                                ))}
                             </div>
                        </div>
                        <div className="flex-1">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tags</label>
                             <input 
                                value={qTags}
                                onChange={e => setQTags(e.target.value)}
                                placeholder="comma, separated" 
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cosmic-blue focus:outline-none transition-colors text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Analysis</label>
                             <span className={`text-[10px] flex items-center ${hasLinks ? 'text-cosmic-cyan' : 'text-cosmic-crimson'}`}>
                                 <LinkIcon size={10} className="mr-1"/> {hasLinks ? 'LINKED' : 'UNLINKED COST'}
                             </span>
                        </div>
                        <textarea 
                            value={qContent}
                            onChange={e => setQContent(e.target.value)}
                            rows={6}
                            placeholder="Supports Markdown. Link other nodes with [[...]]" 
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cosmic-blue focus:outline-none transition-colors font-mono text-sm"
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Objective Title</label>
                        <input 
                            value={oTitle}
                            onChange={e => setOTitle(e.target.value)}
                            placeholder="e.g. Master Vector Databases" 
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cosmic-purple focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                        <textarea 
                            value={oDesc}
                            onChange={e => setODesc(e.target.value)}
                            rows={3}
                            placeholder="Why does this matter? What is the strategy?" 
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cosmic-purple focus:outline-none transition-colors text-sm"
                        />
                    </div>
                    <div>
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Key Results</label>
                         <div className="space-y-3">
                            {keyResults.map((kr, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <input 
                                        value={kr.title}
                                        onChange={e => {
                                            const newKRs = [...keyResults];
                                            newKRs[idx].title = e.target.value;
                                            setKeyResults(newKRs);
                                        }}
                                        placeholder="Key Result Outcome" 
                                        className="flex-[2] bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-cosmic-purple focus:outline-none text-sm"
                                    />
                                    <input 
                                        value={kr.metric}
                                        onChange={e => {
                                            const newKRs = [...keyResults];
                                            newKRs[idx].metric = e.target.value;
                                            setKeyResults(newKRs);
                                        }}
                                        placeholder="Metric" 
                                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-cosmic-purple focus:outline-none text-sm"
                                    />
                                    <button 
                                        onClick={() => setKeyResults(keyResults.filter((_, i) => i !== idx))}
                                        className="p-2 text-gray-500 hover:text-cosmic-crimson transition-colors"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => setKeyResults([...keyResults, { title: '', metric: '' }])}
                                className="flex items-center text-xs text-cosmic-purple font-bold tracking-wider hover:text-white transition-colors"
                            >
                                <Plus size={14} className="mr-1"/> ADD KR
                            </button>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                disabled={!hasLinks}
                className={`px-8 py-2 rounded-xl text-sm font-bold tracking-wider flex items-center shadow-lg transition-all ${
                    hasLinks 
                        ? (activeTab === 'QA' ? 'bg-cosmic-blue hover:bg-cosmic-blue/80 text-white' : 'bg-cosmic-purple hover:bg-cosmic-purple/80 text-white') 
                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
            >
                {activeTab === 'QA' ? 'CRYSTALLIZE THOUGHT' : 'INITIATE PROTOCOL'}
            </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>
    </div>
  );
};
