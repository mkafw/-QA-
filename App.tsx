
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { QAView } from './components/QAView';
import { OKRView } from './components/OKRView';
import { GraphView } from './components/GraphView';
import { FailureQueue } from './components/FailureQueue';
import { VersionControl } from './components/VersionControl';
import { ViewMode } from './types';
import { useQASystem } from './hooks/useQASystem';

export default function App() {
  const [view, setView] = useState<ViewMode>(ViewMode.QA_FIRST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGitOpen, setIsGitOpen] = useState(false);

  // Hook handles all data and business logic
  const { data, loading, actions } = useQASystem();

  const handleSediment = async (failureId: string) => {
    const success = await actions.sedimentFailure(failureId);
    if (success) {
      setView(ViewMode.QA_FIRST); // Navigate to QA view upon success
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-white p-12">Initializing Neural Core...</div>;

    switch(view) {
      case ViewMode.QA_FIRST:
        return <QAView 
          questions={data.questions} 
          onNavigateToGraph={() => setView(ViewMode.GRAPH)}
        />;
      case ViewMode.OKR_FIRST:
        return <OKRView objectives={data.objectives} />;
      case ViewMode.GRAPH:
        return <GraphView questions={data.questions} objectives={data.objectives} />;
      case ViewMode.FAILURE_QUEUE:
        return <FailureQueue failures={data.failures} onSediment={handleSediment} />;
      default:
        return <QAView questions={data.questions} />;
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
      <VersionControl isOpen={isGitOpen} onClose={() => setIsGitOpen(false)} />
      {/* Modal omitted for brevity */}
    </Layout>
  );
}
