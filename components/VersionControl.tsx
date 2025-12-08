
import React, { useState } from 'react';
import { GitBranch, Terminal, FileText, CheckCircle, Clock, ChevronRight, X, DownloadCloud, ListChecks, Loader2, CircleDashed } from 'lucide-react';
import { Iteration } from '../types';
import { INITIAL_ITERATIONS } from '../services/mockData';

interface VersionControlProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURE_MATRIX = [
  {
    category: "1. Core Architecture (TDD)",
    items: [
      { id: 'arch-1', label: "5-Layer DDD-Lite Structure", status: 'DONE' },
      { id: 'arch-2', label: "Repository Pattern (Factory)", status: 'DONE' },
      { id: 'arch-3', label: "Supabase Integration (Real DB)", status: 'DONE' },
      { id: 'arch-4', label: "Vector Store Interface (SeekDB)", status: 'TODO' },
    ]
  },
  {
    category: "2. Synapse Canvas (QA View)",
    items: [
      { id: 'qa-1', label: "Masonry/Waterfall Layout", status: 'DONE' },
      { id: 'qa-2', label: "L0-L2 Learning Level Filters", status: 'DONE' },
      { id: 'qa-3', label: "Markdown Content Rendering", status: 'DONE' },
      { id: 'qa-4', label: "Smart Input (RegEx for [[ & @)", status: 'WIP' },
      { id: 'qa-5', label: "Asset/Link Autocomplete Logic", status: 'TODO' },
    ]
  },
  {
    category: "3. Helix Strategy (OKR View)",
    items: [
      { id: 'okr-1', label: "Objective & KR Visualization", status: 'DONE' },
      { id: 'okr-2', label: "Visual Dependency Lines", status: 'DONE' },
      { id: 'okr-3', label: "Interactive Status Updates", status: 'TODO' },
      { id: 'okr-4', label: "Create OKR Modal", status: 'TODO' },
    ]
  },
  {
    category: "4. Neural Graph (3D Nexus)",
    items: [
      { id: 'grp-1', label: "Double Helix Math Projection", status: 'DONE' },
      { id: 'grp-2', label: "Holographic Node Tooltips", status: 'DONE' },
      { id: 'grp-3', label: "Clean Structural Rungs (White)", status: 'DONE' },
      { id: 'grp-4', label: "Shift+Click Node Deletion", status: 'DONE' },
      { id: 'grp-5', label: "Data-Driven Link Visualization", status: 'TODO' },
    ]
  },
  {
    category: "5. Sedimentation Protocol",
    items: [
      { id: 'sed-1', label: "Failure Queue UI", status: 'DONE' },
      { id: 'sed-2', label: "Transmutation Service (Fail->QA)", status: 'DONE' },
      { id: 'sed-3', label: "5W2H Analysis Editor", status: 'WIP' },
    ]
  }
];

export const VersionControl: React.FC<VersionControlProps> = ({ isOpen, onClose }) => {
  const [iterations, setIterations] = useState<Iteration[]>(INITIAL_ITERATIONS);
  const [selectedIteration, setSelectedIteration] = useState<Iteration>(INITIAL_ITERATIONS[INITIAL_ITERATIONS.length - 1]);
  const [activeTab, setActiveTab] = useState<'LOG' | 'CONTEXT' | 'FEATURES'>('FEATURES');

  if (!isOpen) return null;

  const handleCommit = () => {
    // Mock Commit
    const newIteration: Iteration = {
      id: `it-${Date.now()}`,
      hash: Math.random().toString(16).substring(2, 8),
      timestamp: new Date().toLocaleString(),
      message: 'WIP: Syncing Context File',
      changes: { added: 2, modified: 1, sedimented: 0 },
      contextSummary: '# Iteration [Current]\n\n- **Status**: Synced.\n- **Action**: Created .gitignore and .ai-context.md.\n- **Outcome**: Project structure is now fully compliant with PRD.'
    };
    setIterations([newIteration, ...iterations]);
    setSelectedIteration(newIteration);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE': return <CheckCircle size={14} className="text-cosmic-cyan" />;
      case 'WIP': return <Loader2 size={14} className="text-cosmic-gold animate-spin-slow" />;
      case 'TODO': return <CircleDashed size={14} className="text-cosmic-crimson" />;
      default: return <CircleDashed size={14} className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Holographic Console */}
      <div className="w-[900px] h-[600px] bg-cosmic-bg/95 border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden relative backdrop-blur-2xl">
        {/* Gloss Sheen */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent"></div>
        
        {/* Sidebar: Commit History */}
        <div className="w-1/3 border-r border-white/10 bg-black/20 flex flex-col">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-serif font-medium flex items-center">
              <GitBranch size={16} className="mr-2 text-cosmic-purple"/> 
              Neural History
            </h3>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400">Main</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {iterations.map((it) => (
              <div 
                key={it.id}
                onClick={() => setSelectedIteration(it)}
                className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                  selectedIteration.id === it.id 
                    ? 'bg-white/10 border-white/20 shadow-lg' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-[10px] text-cosmic-gold opacity-80">{it.hash}</span>
                  <span className="text-[10px] text-gray-500">{it.timestamp.split(' ')[0]}</span>
                </div>
                <div className="text-sm text-white font-medium truncate mb-2">{it.message}</div>
                <div className="flex space-x-3 text-[10px] text-gray-400">
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan mr-1"></span>+{it.changes.added}</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-cosmic-gold mr-1"></span>~{it.changes.modified}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10">
            <button 
              onClick={handleCommit}
              className="w-full py-2 bg-gradient-to-r from-cosmic-blue to-cosmic-purple rounded-lg text-white text-xs font-bold tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center shadow-glow"
            >
              <DownloadCloud size={14} className="mr-2" />
              SNAPSHOT STATE
            </button>
          </div>
        </div>

        {/* Main Content: The "Manifest" Viewer */}
        <div className="flex-1 flex flex-col bg-black/40">
          
          {/* Header tabs */}
          <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between">
            <div className="flex space-x-6">
              <button 
                onClick={() => setActiveTab('FEATURES')}
                className={`flex items-center text-xs font-medium pb-4 pt-4 border-b-2 transition-colors ${activeTab === 'FEATURES' ? 'text-white border-cosmic-cyan' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                <ListChecks size={14} className="mr-2"/>
                Feature Matrix
              </button>
              <button 
                onClick={() => setActiveTab('LOG')}
                className={`flex items-center text-xs font-medium pb-4 pt-4 border-b-2 transition-colors ${activeTab === 'LOG' ? 'text-white border-cosmic-purple' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                <Terminal size={14} className="mr-2"/>
                Iteration Log
              </button>
              <button 
                onClick={() => setActiveTab('CONTEXT')}
                className={`flex items-center text-xs font-medium pb-4 pt-4 border-b-2 transition-colors ${activeTab === 'CONTEXT' ? 'text-white border-cosmic-gold' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                <FileText size={14} className="mr-2"/>
                Context
              </button>
            </div>
            
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X size={18}/>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-gray-300">
            
            {activeTab === 'FEATURES' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                {FEATURE_MATRIX.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-cosmic-blue text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">
                      {section.category}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {section.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-gray-300 text-xs">{item.label}</span>
                          <div className="flex items-center space-x-2 bg-black/30 px-2 py-1 rounded border border-white/5">
                            {getStatusIcon(item.status)}
                            <span className={`text-[10px] font-bold tracking-wider ${
                              item.status === 'DONE' ? 'text-cosmic-cyan' : 
                              item.status === 'WIP' ? 'text-cosmic-gold' : 'text-cosmic-crimson'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'LOG' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center mb-6 text-cosmic-purple">
                   <Terminal size={16} className="mr-2"/>
                   <span className="text-xs uppercase tracking-widest font-bold">Execution Report</span>
                </div>
                {/* Simulated Markdown Rendering */}
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap bg-transparent border-none p-0 text-gray-300 font-mono">
                    {selectedIteration.contextSummary}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'CONTEXT' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex justify-between items-center mb-4">
                    <div className="text-cosmic-gold text-xs uppercase tracking-widest font-bold">Project Neural Context</div>
                    <div className="text-[10px] text-gray-500">Read-Only</div>
                 </div>
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-xs">
<pre className="whitespace-pre-wrap text-cosmic-blue/80">{`# QA-OS Neural Context
> This file acts as the central synchronization point for Human-AI collaboration.

## 1. Project Identity
- **Name**: QA-OS (Helix Edition)
- **Core Metaphor**: DNA Double Helix (Cognition + Action).
- **Aesthetic**: Cosmic Glass (Deep Void, Apple-style Glass, Nebular Glows).
- **Status**: Pre-Alpha / Visualization Phase.

## 2. Active Configuration
- **Framework**: React 18 + Tailwind CSS.
- **Visualization**: D3.js (Helix Mode).
- **Theme Constraints**: 
  - Background: #050510 (Deep Void).
  - Accents: Electric Blue (QA), Nebular Purple (OKR), Gold (Highlights).
  - Shapes: Squircles (Rounded-3xl), Glass Textures.

## 3. Iteration Log
- **Current Hash**: 2b9c44
- **Focus**: Feature Audit.
- **Recent Changes**:
  - [x] Defined Feature Matrix based on PRD.
  - [x] Audited current codebase capabilities.
  - [x] Updated VersionControl UI to show real roadmap.

## 4. Known Issues & Todo
- [ ] Connect to real GitHub API (Currently Simulated).
- [ ] Implement vector search for "Smart Input".
- [ ] Mobile responsive layout optimization.

## 5. User Directives
- "Use the .ai-context.md file to track what I am doing right now."
- "Generate a summary report for every iteration."
`}</pre>
                 </div>
              </div>
            )}
          </div>
          
          {/* Footer Status */}
          <div className="h-10 border-t border-white/10 flex items-center px-6 justify-between bg-black/60 text-[10px] text-gray-500">
            <div className="flex items-center">
               <Clock size={12} className="mr-2" />
               Last Synced: Just now
            </div>
            <div className="flex items-center">
              master <ChevronRight size={10} className="mx-1"/> {selectedIteration.hash}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
