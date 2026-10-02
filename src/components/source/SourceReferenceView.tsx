import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { referenceCards } from '../../data/mockData';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Layers,
  Clock,
  Music2,
  BookmarkCheck,
} from 'lucide-react';

export const SourceReferenceView: React.FC = () => {
  const {
    t,
    language,
    applyReferenceToWorkspace,
  } = useStudio();

  const [activeGroup, setActiveGroup] = useState<'all' | 'factory' | 'custom'>('all');

  const filteredCards = referenceCards.filter((card) => {
    if (activeGroup === 'all') return true;
    return card.category === activeGroup;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t.sourceTitle}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.sourceSubtitle}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-md text-xs font-medium">
          <button
            onClick={() => setActiveGroup('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeGroup === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All References ({referenceCards.length})
          </button>
          <button
            onClick={() => setActiveGroup('factory')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeGroup === 'factory'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.tabFactoryDemos}
          </button>
          <button
            onClick={() => setActiveGroup('custom')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeGroup === 'custom'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.tabCustomReferences}
          </button>
        </div>
      </div>

      {/* Reference Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xs space-y-4"
          >
            <div className="space-y-3">
              
              {/* Header & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {language === 'th' ? card.titleTh : card.titleEn}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {language === 'th' ? card.descriptionTh : card.descriptionEn}
                  </p>
                </div>

                <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase">
                  {card.familyTarget === 'yue2' ? 'YuE2' : 'MiniMax 3'}
                </span>
              </div>

              {/* Template Specs */}
              <div className="space-y-2 text-xs">
                
                {/* Profile & Theme */}
                <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">{t.profileDnaLabel}:</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {language === 'th' ? card.artistProfileTh : card.artistProfileEn}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-500 font-medium">{t.themeLabel}:</span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {language === 'th' ? card.themeTh : card.themeEn}
                    </span>
                  </div>
                </div>

                {/* Tags preview */}
                <div className="flex flex-wrap gap-1">
                  {Object.values(card.tags)
                    .flat()
                    .slice(0, 5)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                {/* Lyrics Excerpt */}
                <div className="p-2.5 rounded-lg bg-neutral-50/80 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 line-clamp-2 italic">
                  "{language === 'th' ? card.sampleLyricsExcerptTh : card.sampleLyricsExcerptEn}"
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-neutral-400" />
                    {card.arrangementTemplateName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {card.defaultDuration}s
                  </span>
                </div>

              </div>

            </div>

            {/* Apply Action Button */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => applyReferenceToWorkspace(card.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>{t.applyRefToWorkspace}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
