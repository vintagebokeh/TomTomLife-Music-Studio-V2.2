import React from 'react';
import { useStudio } from '../context/StudioContext';
import { WorkspaceTab } from '../types';
import { Sun, Moon, RotateCcw, Undo2, Redo2 } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    t,
    canUndo,
    canRedo,
    undo,
    redo,
    resetDemo,
    songData,
    aiProvider,
    setAiProvider,
    aiProviders,
    aiModel,
    setAiModel,
    aiModels,
    aiModelsLoading,
    backendOnline,
    backendHealth,
    refreshBackendStatus,
  } = useStudio();

  const activeAiProvider = aiProviders.find((provider) => provider.id === aiProvider);

  const navItems: { key: WorkspaceTab; label: string }[] = [
    { key: 'source', label: t.navSource },
    { key: 'blueprint', label: t.navBlueprint },
    { key: 'engine', label: t.navEngine },
    { key: 'render', label: t.navRender },
    { key: 'compare', label: t.navCompare },
    { key: 'library', label: t.navLibrary },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-colors">
      <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 xl:px-8 2xl:px-10 min-h-14 py-2 flex flex-wrap items-center gap-x-3 lg:gap-x-4 gap-y-2">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0 order-1">
          <button
            onClick={() => setActiveTab('blueprint')}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <span className="font-bold text-base sm:text-lg tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              TomTomLife <span className="text-amber-500 font-mono text-xs sm:text-sm font-semibold">V2.2</span>
            </span>
          </button>
          <span className="hidden lg:inline text-xs text-neutral-400 dark:text-neutral-500 font-mono tabular-nums">
            {songData.version}
          </span>
        </div>

        {/* Zone 2: Clean Text Navigation Tabs */}
        <nav className="order-3 xl:order-2 w-full xl:w-auto xl:flex-1 min-w-0 flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-3 lg:gap-x-5 gap-y-1 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`relative py-1.5 px-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors rounded-sm focus-visible:outline-none ${
                  isActive
                    ? 'text-neutral-950 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Essential Controls (Undo/Redo, TH/EN, Theme, Reset Demo) */}
        <div className="order-2 xl:order-3 ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0 min-w-0">
          
          {/* Undo / Redo */}
          <div className="hidden md:flex items-center border border-neutral-200 dark:border-neutral-800 rounded-md p-0.5 bg-neutral-50 dark:bg-neutral-900">
            <button
              onClick={undo}
              disabled={!canUndo}
              title={t.undo}
              className={`p-1.5 rounded transition-colors ${
                canUndo
                  ? 'text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 cursor-pointer'
                  : 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title={t.redo}
              className={`p-1.5 rounded transition-colors ${
                canRedo
                  ? 'text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 cursor-pointer'
                  : 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Provider / Model / Backend Status */}
          <div className="hidden lg:flex items-center gap-1 border border-neutral-200 dark:border-neutral-800 rounded-md px-1.5 py-0.5 bg-neutral-50 dark:bg-neutral-900"
            title={(activeAiProvider?.online ? activeAiProvider.name + ' online' : 'AI provider offline') + ' · 3012 gateway'}>
            <button
              onClick={refreshBackendStatus}
              className="flex items-center gap-1 px-1 py-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              title={activeAiProvider?.online ? 'AI provider online · click to refresh' : 'AI provider offline · click to retry'}
            >
              <span className={'w-1.5 h-1.5 rounded-full ' + (activeAiProvider?.online ? 'bg-emerald-500' : 'bg-red-500')} />
              AI
            </button>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="max-w-[135px] bg-transparent text-[10px] font-mono font-semibold text-neutral-700 dark:text-neutral-300 outline-none"
              aria-label="Workspace AI provider"
              title="AI provider"
            >
              {aiProviders.length ? aiProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              )) : <option value={aiProvider}>Loading provider…</option>}
            </select>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              disabled={aiModelsLoading || !aiModels.length}
              className="max-w-[220px] bg-transparent text-[10px] font-mono text-neutral-700 dark:text-neutral-300 outline-none"
              aria-label="Workspace AI model"
              title={(activeAiProvider?.name || aiProvider) + ' · ' + aiModel}
            >
              {aiModels.length ? aiModels.map((model) => {
                const name = model.name || model.model || '';
                const size = model.details?.parameter_size ? ' · ' + model.details.parameter_size : '';
                return <option key={name} value={name}>{model.label || name}{size}</option>;
              }) : <option value={aiModel}>{aiModelsLoading ? 'Loading models…' : aiModel}</option>}
            </select>
          </div>
          {/* Language Toggle TH / EN */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-md p-0.5 bg-neutral-50 dark:bg-neutral-900 text-xs font-medium">
            <button
              onClick={() => setLanguage('th')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'th'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              TH
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'en'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle Light / Dark */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-600" />}
          </button>

          {/* Reset Demo button */}
          <button
            onClick={resetDemo}
            title={t.resetDemo}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[11px] font-mono">{language === 'th' ? 'รีเซ็ต' : 'Reset'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
