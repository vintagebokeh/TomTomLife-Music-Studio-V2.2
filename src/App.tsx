import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/Header';
import { BlueprintStudio } from './components/blueprint/BlueprintStudio';
import { EngineView } from './components/engine/EngineView';
import { RenderView } from './components/render/RenderView';
import { CompareView } from './components/compare/CompareView';
import { LibraryView } from './components/library/LibraryView';
import { SourceReferenceView } from './components/source/SourceReferenceView';
import { AiSectionAssistant } from './components/ai/AiSectionAssistant';
import { AiDirectorModal } from './components/ai/AiDirectorModal';
import { ToastContainer } from './components/common/ToastContainer';

const StudioContent: React.FC = () => {
  const { activeTab, songData } = useStudio();

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip flex flex-col bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar Navigation */}
      <Header />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full min-w-0 max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6">
        {activeTab === 'blueprint' && <BlueprintStudio />}
        {activeTab === 'engine' && <EngineView />}
        {activeTab === 'render' && <RenderView />}
        {activeTab === 'compare' && <CompareView />}
        {activeTab === 'library' && <LibraryView />}
        {activeTab === 'source' && <SourceReferenceView />}
      </main>

      {/* Scoped AI Section Assistant Panel */}
      <AiSectionAssistant />

      {/* AI Director Whole Song Redesign Modal */}
      <AiDirectorModal />

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Quiet Production Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800/80 py-4 px-3 sm:px-4 md:px-6 xl:px-8 2xl:px-10 bg-white/60 dark:bg-neutral-950/60 backdrop-blur-xs text-xs text-neutral-500 flex flex-col lg:flex-row items-center justify-between gap-2 min-w-0">
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 min-w-0">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            TomTomLife Music Studio V2.2
          </span>
          <span>·</span>
          <span>Workflow-Driven Multi-Engine Workspace</span>
        </div>
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-3 gap-y-1 font-mono text-[11px] text-neutral-400 min-w-0 text-center lg:text-right">
          <span>Active Track: {songData.trackName}</span>
          <span>·</span>
          <span className="tabular-nums">{songData.durationIntent}s</span>
          <span>·</span>
          <span>{songData.status}</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <StudioContent />
    </StudioProvider>
  );
}
