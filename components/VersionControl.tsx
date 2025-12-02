
import React, { useState } from 'react';
import { GitBranch, Terminal, FileText, CheckCircle, Clock, ChevronRight, X, DownloadCloud } from 'lucide-react';
import { Iteration } from '../types';
import { INITIAL_ITERATIONS } from '../services/mockData';

interface VersionControlProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionControl: React.FC<VersionControlProps> = ({ isOpen, onClose }) => {
  const [iterations, setIterations] = useState<Iteration[]>(INITIAL_ITERATIONS);
  const [selectedIteration, setSelectedIteration] = useState<Iteration>(INITIAL_ITERATIONS[1]);
  const [activeTab, setActiveTab] = useState<'LOG' | 'CONTEXT'>('LOG');

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
                onClick={() => setActiveTab('LOG')}
                className={`flex items-center text-xs font-medium pb-4 pt-4 border-b-2 transition-colors ${activeTab === 'LOG' ? 'text-white border-cosmic-cyan' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                <Terminal size={14} className="mr-2"/>
                Iteration Report
              </button>
              <button 
                onClick={() => setActiveTab('CONTEXT')}
                className={`flex items-center text-xs font-medium pb-4 pt-4 border-b-2 transition-colors ${activeTab === 'CONTEXT' ? 'text-white border-cosmic-gold' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                <FileText size={14} className="mr-2"/>
                .ai-context.md
              </button>
            </div>
            
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X size={18}/>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-gray-300">
            {activeTab === 'LOG' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center mb-6 text-cosmic-cyan">
                   <CheckCircle size={16} className="mr-2"/>
                   <span className="text-xs uppercase tracking-widest font-bold">Successfully Sedimented</span>
                </div>
                {/* Simulated Markdown Rendering */}
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap bg-transparent border-none p-0 text-gray-300 font-mono">
                    {selectedIteration.contextSummary}
                  </pre>
                </div>
              </div>
            ) : (
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
- **Focus**: Visual Polish & Version Control UI.
- **Recent Changes**:
  - [x] Implemented .gitignore
  - [x] Created PRD/TDD/UI documents in prd/.
  - [x] Integrated "Holographic" Version Control UI.

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
