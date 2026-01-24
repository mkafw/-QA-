

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { QAView } from './components/QAView';
import { OKRView } from './components/OKRView';
import { GraphView } from './components/GraphView';
import { FailureQueue } from './components/FailureQueue';
import { VersionControl } from './components/VersionControl';
import { CreationModal } from './components/CreationModal';
import { ViewMode } from './types';
import { useQASystem } from './hooks/useQASystem';

export default function App() {
  // CHANGED: Default view is now GRAPH (The Helix) to satisfy "Show me the effect" immediately.
  const [view, setView] = useState<ViewMode>(ViewMode.GRAPH);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGitOpen, setIsGitOpen] = useState(false);
  
  // Navigation State (Neural Pathway)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Hook handles all data and business logic
  const { data, loading, actions } = useQASystem();

  const handleSediment = async (failureId: string) => {
    const success = await actions.sedimentFailure(failureId);
    if (success) {
      setView(ViewMode.QA_FIRST); // Navigate to QA view upon success
    }
  };
  
  const handleGraphAction = (id: string, type: 'QUESTION'|'OBJECTIVE', action: 'SELECT'|'DELETE') => {
    if (action === 'DELETE') {
      if (confirm('Are you sure you want to delete this node from the neural net?')) {
        actions.deleteNode(id, type);
      }
    } else {
      // NAVIGATION LOGIC
      console.log('Navigating to node:', id);
      setActiveNodeId(id);
      if (type === 'QUESTION') {
        setView(ViewMode.QA_FIRST);
      } else {
        setView(ViewMode.OKR_FIRST);
      }
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-white p-12">Initializing Neural Core...</div>;

    switch(view) {
      case ViewMode.QA_FIRST:
        return <QAView 
          questions={data.questions} 
          highlightedId={activeNodeId}
          onAddQuestion={actions.addQuestion}
          onNavigateToGraph={() => setView(ViewMode.GRAPH)}
        />;
      case ViewMode.OKR_FIRST:
        return <OKRView 
          objectives={data.objectives} 
          highlightedId={activeNodeId}
          onToggleKR={actions.toggleKRStatus}
        />;
      case ViewMode.GRAPH:
        return <GraphView 
           questions={data.questions} 
           objectives={data.objectives} 
           onNodeAction={handleGraphAction}
        />;
      case ViewMode.FAILURE_QUEUE:
        return <FailureQueue failures={data.failures} onSediment={handleSediment} />;
      default:
        return <QAView questions={data.questions} />;
    }
  };

  return (
    <Layout 
      currentView={view} 
      onChangeView={(v) => { setView(v); setActiveNodeId(null); }}
      toggleCreateModal={() => setIsModalOpen(true)}
      onOpenGit={() => setIsGitOpen(true)}
    >
      {renderContent()}
      <VersionControl isOpen={isGitOpen} onClose={() => setIsGitOpen(false)} />
      <CreationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreateQuestion={actions.addQuestion}
        onCreateObjective={actions.addObjective}
        onCreateFailure={actions.addFailure}
      />
    </Layout>
  );
}