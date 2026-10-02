import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Sparkles, X, AlertTriangle, CheckSquare, Square, Loader2, Music2 } from 'lucide-react';

export const AiDirectorModal: React.FC = () => {
  const {
    t,
    directorModalOpen,
    setDirectorModalOpen,
    directorDraft,
    directorLoading,
    generateDirectorDraft,
    confirmDirectorReplace,
  } = useStudio();

  const [brief, setBrief] = useState<string>('');
  const [keepProfile, setKeepProfile] = useState<boolean>(true);
  const [preserveLocked, setPreserveLocked] = useState<boolean>(true);

  if (!directorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {t.aiDirectorModalTitle}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t.aiDirectorModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDirectorModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Options: Keep Profile & Preserve Locked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setKeepProfile(!keepProfile)}
              className="flex items-center gap-2.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer text-left"
            >
              {keepProfile ? (
                <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <span>{t.keepProfileCheckbox}</span>
            </button>

            <button
              onClick={() => setPreserveLocked(!preserveLocked)}
              className="flex items-center gap-2.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer text-left"
            >
              {preserveLocked ? (
                <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <span>{t.preserveLockedCheckbox}</span>
            </button>
          </div>

          {/* Natural Language Song Brief */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {t.directorBriefLabel}
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              placeholder={t.directorBriefPlaceholder}
              className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Action: Generate Draft */}
          <div className="flex justify-end">
            <button
              onClick={() => generateDirectorDraft(brief, keepProfile, preserveLocked)}
              disabled={directorLoading}
              className="flex items-center gap-2 py-2 px-4 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {directorLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{t.directorPreviewBtn}</span>
            </button>
          </div>

          {/* Preview of Proposed Song Components */}
          {directorDraft && (
            <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Proposed Song Blueprint Preview
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* Theme & Track Name */}
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-1">
                  <span className="font-semibold text-neutral-500">Track & Theme:</span>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">
                    {directorDraft.trackName}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">{directorDraft.theme}</div>
                </div>

                {/* Proposed Tags */}
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-1">
                  <span className="font-semibold text-neutral-500">Proposed Tags:</span>
                  <div className="flex flex-wrap gap-1 text-[11px] text-neutral-700 dark:text-neutral-300">
                    {Object.values(directorDraft.selectedTags).flat().slice(0, 6).join(' · ')}
                  </div>
                </div>

                {/* Proposed Style */}
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-1 md:col-span-2">
                  <span className="font-semibold text-neutral-500">Music Direction:</span>
                  <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono text-[11px]">
                    {directorDraft.musicDirection}
                  </div>
                </div>

                {/* Lyrics Excerpt */}
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-1 md:col-span-2">
                  <span className="font-semibold text-neutral-500">Lyrics Vision (Chorus Excerpt):</span>
                  <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line font-mono text-[11px]">
                    {directorDraft.canonicalLyrics.find((s) => s.type === 'chorus')?.text}
                  </div>
                </div>

              </div>

              {/* Warning Banner */}
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  {t.directorWarning}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <button
            onClick={() => setDirectorModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {t.cancel}
          </button>

          <button
            onClick={confirmDirectorReplace}
            disabled={!directorDraft}
            className="flex items-center gap-2 py-2 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{t.directorReplaceConfirmBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
