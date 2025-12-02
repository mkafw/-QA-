

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { QAView } from './components/QAView';
import { OKRView } from './components/OKRView';
import { GraphView } from './components/GraphView';
import { FailureQueue } from './components/FailureQueue';
import { VersionControl } from './components/VersionControl';
import { ViewMode, Question, Objective, Failure, EntityType } from './types';
import { INITIAL_QUESTIONS, INITIAL_OKRS, INITIAL_FAILURES } from './services/mockData';

export default function App() {
  const [view, setView] = useState<ViewMode>(ViewMode.QA_FIRST);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [objectives, setObjectives] = useState<Objective[]>(INITIAL_OKRS);
  const [failures, setFailures] = useState<Failure[]>(INITIAL_FAILURES);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGitOpen, setIsGitOpen] = useState(false);

  // Failure Sedimentation Logic
  const handleSediment = (failureId: string) => {
    // 1. Mark failure as processed
    setFailures(prev => prev.map(f => f.id === failureId ? { ...f, status: 'Sedimented', convertedToQuestionId: `q-new-${Date.now()}` } : f));
    
    // 2. Create a new draft question from failure context
    const failure = failures.find(f => f.id === failureId);
    if (!failure) return;

    const newQuestion: Question = {
      id: `q-new-${Date.now()}`,
      type: EntityType.QUESTION,
      title: `Analysis: ${failure.description.substring(0, 40)}...`,
      content: `Derived from failure analysis:\n\n${failure.analysis5W2H}`,
      level: 0,
      tags: ['Failure-Sediment'],
      linkedQuestionIds: [],
      linkedOKRIds: failure.relatedKRId ? [failure.relatedKRId] : [], // Simplified linking
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setQuestions(prev => [newQuestion, ...prev]);
    setView(ViewMode.QA_FIRST); // Redirect to QA view to edit
  };

  const renderContent = () => {
    switch(view) {
      case ViewMode.QA_FIRST:
        return <QAView 
          questions={questions} 
          onNavigateToGraph={() => setView(ViewMode.GRAPH)}
        />;
      case ViewMode.OKR_FIRST:
        return <OKRView objectives={objectives} />;
      case ViewMode.GRAPH:
        return <GraphView questions={questions} objectives={objectives} />;
      case ViewMode.FAILURE_QUEUE:
        return <FailureQueue failures={failures} onSediment={handleSediment} />;
      default:
        return <QAView questions={questions} />;
    }
  };

  return (
    <Layout 
      currentView={view} 
      onChangeView={setView}
      toggleCreateModal={() => setIsModalOpen(true)}
      onOpenGit={() => setIsGitOpen(true)}
    >
      {renderContent()}

      {/* Version Control Hologram */}
      <VersionControl 
        isOpen={isGitOpen} 
        onClose={() => setIsGitOpen(false)} 
      />

      {/* Simple Create Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-glass-100 border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Create New Entity</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-neon-blue/10 border border-white/5 hover:border-neon-blue/30 transition-all group"
              >
                <span className="block font-bold text-white group-hover:text-neon-blue">Question Node</span>
                <span className="text-xs text-gray-500">I found a cognitive gap.</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-neon-purple/10 border border-white/5 hover:border-neon-purple/30 transition-all group"
              >
                <span className="block font-bold text-white group-hover:text-neon-purple">Objective Node</span>
                <span className="text-xs text-gray-500">I need to structure a goal.</span>
              </button>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="mt-6 w-full py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}