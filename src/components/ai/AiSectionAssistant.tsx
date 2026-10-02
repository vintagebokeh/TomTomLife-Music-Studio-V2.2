import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { AiAssistTarget } from '../../types';
import { Sparkles, X, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const AiSectionAssistant: React.FC = () => {
  const {
    t,
    aiDrawerOpen,
    setAiDrawerOpen,
    aiTarget,
    setAiTarget,
    aiDraft,
    aiDraftLoading,
    generateScopedDraft,
    applyScopedDraft,
    aiProvider,
    setAiProvider,
    aiProviders,
    aiModel,
    setAiModel,
    aiModels,
    aiModelsLoading,
    backendOnline,
    refreshBackendStatus,
  } = useStudio();

  const [promptText, setPromptText] = useState<string>('');
  const activeProvider = aiProviders.find((provider) => provider.id === aiProvider);

  const targetOptions: { key: AiAssistTarget; label: string }[] = [
    { key: 'style', label: 'Music Direction & Style' },
    { key: 'lyrics', label: 'Canonical Lyrics' },
    { key: 'arrangement', label: 'Arrangement Structure' },
    { key: 'tags', label: 'Music Tags' },
    { key: 'theme', label: 'Core Theme' },
    { key: 'profile', label: 'Artist Profile & DNA' },
  ];

  if (!aiDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col transition-all animate-in slide-in-from-right duration-250">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.aiAssistantTitle}
            </h3>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              Scoped Assistance Engine
            </span>
          </div>
        </div>
        <button
          onClick={() => setAiDrawerOpen(false)}
          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        
        {/* Live AI provider + model + backend status */}
        <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                {aiProvider === 'comfyui' ? 'COMFYUI LOCAL AI' : 'OLLAMA / MUSIC LAB AI'}
              </span>
              <span className="block text-[10px] text-neutral-400 mt-0.5">
                {aiProvider === 'comfyui'
                  ? '3012 → ComfyUI → Pixaroma AI Prompt'
                  : '3012 → Ollama / Music Lab'}
              </span>
            </div>
            <button onClick={refreshBackendStatus} className="text-[10px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              <span className={'inline-block w-1.5 h-1.5 rounded-full mr-1 ' + (activeProvider?.online ? 'bg-emerald-500' : 'bg-red-500')} />
              {activeProvider?.online ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2">
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
              aria-label="AI provider selector"
            >
              {aiProviders.length ? aiProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              )) : <option value={aiProvider}>Loading provider…</option>}
            </select>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              disabled={aiModelsLoading || !aiModels.length}
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs font-mono text-neutral-800 dark:text-neutral-200 outline-none"
              aria-label="AI model selector"
            >
              {aiModels.length ? aiModels.map((model) => {
                const name = model.name || model.model || '';
                return <option key={name} value={name}>{model.label || name}{model.details?.parameter_size ? ' · ' + model.details.parameter_size : ''}</option>;
              }) : <option value={aiModel}>{aiModelsLoading ? 'Loading models…' : aiModel}</option>}
            </select>
          </div>
          {aiProvider === 'comfyui' && (
            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
              Verified local model · qwen3.5_4b_int8_convrot.safetensors
            </div>
          )}
        </div>
        {/* Scoped Context Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-300/90 leading-relaxed">
            {t.aiAssistantNotice}
          </p>
        </div>

        {/* Target Section Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {t.aiTargetSelectLabel}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {targetOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setAiTarget(opt.key)}
                className={`px-2.5 py-1.5 text-xs text-left rounded-md border transition-all ${
                  aiTarget === opt.key
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt / Instruction Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {t.aiPromptLabel}
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={3}
            placeholder="e.g. เพิ่มความหวานและกลิ่นอายแจ๊ส, ปรับเนื้อเพลงให้เน้นความเหงาตอนดึก..."
            className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Generate Draft Button */}
        <button
          onClick={() => generateScopedDraft(promptText)}
          disabled={aiDraftLoading}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {aiDraftLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{t.generateDraftBtn}</span>
        </button>

        {/* Draft Inspection Card */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span>{t.draftReady}</span>
            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 uppercase">
              [{aiTarget}]
            </span>
          </span>

          {aiDraft ? (
            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-950/70 text-xs font-mono whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 max-h-56 overflow-y-auto leading-relaxed">
              {aiDraft}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400 dark:text-neutral-500">
              {t.noDraftYet}
            </div>
          )}
        </div>

      </div>

      {/* Footer: Apply Scoped Target Only */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
        <button
          onClick={applyScopedDraft}
          disabled={!aiDraft || aiDraftLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          <span>{t.applyTargetOnlyBtn} [{aiTarget.toUpperCase()}] Only</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
