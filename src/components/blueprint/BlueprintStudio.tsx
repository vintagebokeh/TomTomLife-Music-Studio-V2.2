import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { TagCategory, SongStatus } from '../../types';
import { tagOptions } from '../../data/mockData';
import { LyricsEditor } from './LyricsEditor';
import { ArrangementBuilder } from './ArrangementBuilder';
import {
  Sparkles,
  Music,
  Plus,
  Compass,
  FileMusic,
  Layers,
  Check,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const BlueprintStudio: React.FC = () => {
  const {
    songData,
    updateSongData,
    t,
    toggleTag,
    addCustomTag,
    removeCustomTag,
    aiSuggestTags,
    aiEditStyleOnly,
    setAiDrawerOpen,
    setAiTarget,
    setDirectorModalOpen,
  } = useStudio();

  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [activeTagCategory, setActiveTagCategory] = useState<TagCategory>('Genre');

  const categories: { key: TagCategory; label: string }[] = [
    { key: 'Genre', label: t.catGenre },
    { key: 'Mood', label: t.catMood },
    { key: 'Instruments', label: t.catInstruments },
    { key: 'Vocals', label: t.catVocals },
    { key: 'Rhythm', label: t.catRhythm },
    { key: 'Production', label: t.catProduction },
    { key: 'Era', label: t.catEra },
  ];

  const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customTagInput.trim()) {
        addCustomTag(customTagInput.trim());
        setCustomTagInput('');
      }
    }
  };

  const statusOptions: SongStatus[] = ['Draft', 'Locked', 'Rendered'];

  const selectedCountTotal = Object.values(songData.selectedTags).flat().length + songData.customTags.length;

  return (
    <div className="space-y-6 pb-20">
      
      {/* SECTION A: Project Header & Status */}
      <section className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {t.projectInfo}
              </span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              
              {/* Status Segmented Picker */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-md text-[11px] font-medium">
                {statusOptions.map((st) => (
                  <button
                    key={st}
                    onClick={() => updateSongData({ status: st })}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      songData.status === st
                        ? st === 'Locked'
                          ? 'bg-rose-500 text-white font-semibold'
                          : st === 'Rendered'
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-amber-500 text-neutral-950 font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    {st === 'Draft' ? t.draft : st === 'Rendered' ? t.rendered : t.locked}
                  </button>
                ))}
              </div>

              {/* Instrumental Toggle */}
              <button
                onClick={() => updateSongData({ instrumental: !songData.instrumental })}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  songData.instrumental
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {songData.instrumental ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{songData.instrumental ? 'Instrumental Mode' : 'Vocals Enabled'}</span>
              </button>
            </div>

            {/* Track Name & Project Title */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <input
                type="text"
                value={songData.trackName}
                onChange={(e) => updateSongData({ trackName: e.target.value })}
                className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 bg-transparent focus:outline-none border-b border-transparent focus:border-amber-500 transition-colors w-full sm:w-auto"
                placeholder={t.trackNameLabel}
              />
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                in <input
                  type="text"
                  value={songData.projectTitle}
                  onChange={(e) => updateSongData({ projectTitle: e.target.value })}
                  className="bg-transparent font-medium text-neutral-600 dark:text-neutral-400 focus:outline-none border-b border-transparent focus:border-neutral-400"
                />
              </span>
            </div>
          </div>

          {/* AI Director Button (Whole Song Redesign) & Assistant Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setAiTarget('style');
                setAiDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.aiAssistantTitle}</span>
            </button>

            <button
              onClick={() => setDirectorModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.aiDirectorBtn}</span>
            </button>
          </div>

        </div>

        {/* SECTION B: Profile / DNA & Theme / Mood Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
              <span>{t.profileDnaLabel}</span>
              <button
                onClick={() => {
                  setAiTarget('profile');
                  setAiDrawerOpen(true);
                }}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3" /> AI Assist
              </button>
            </label>
            <input
              type="text"
              value={songData.profile}
              onChange={(e) => updateSongData({ profile: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
              <span>{t.themeLabel}</span>
              <button
                onClick={() => {
                  setAiTarget('theme');
                  setAiDrawerOpen(true);
                }}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3" /> AI Assist
              </button>
            </label>
            <input
              type="text"
              value={songData.theme}
              onChange={(e) => updateSongData({ theme: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>
      </section>

      {/* SECTION C: Structured Music Tag Palette */}
      <section className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t.tagPaletteTitle}
              </h3>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                ({selectedCountTotal} {t.selectedTagsCount})
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.tagPaletteSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={aiSuggestTags}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/70 dark:border-amber-800/80 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t.suggestTagsBtn}</span>
            </button>
          </div>
        </div>

        {/* Category Tabs for Tag Selection */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 min-w-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTagCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeTagCategory === cat.key
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
              {songData.selectedTags[cat.key]?.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-700 dark:bg-neutral-300 text-white dark:text-neutral-900">
                  {songData.selectedTags[cat.key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Interactive Tag Chips Grid for Active Category */}
        <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-neutral-50/70 dark:bg-neutral-950/40 border border-neutral-150 dark:border-neutral-800/60 min-h-[56px] items-center">
          {tagOptions[activeTagCategory]?.map((tag) => {
            const isSelected = songData.selectedTags[activeTagCategory]?.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(activeTagCategory, tag)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <span>{tag}</span>
                {isSelected ? <Check className="w-3 h-3 text-amber-500" /> : <Plus className="w-3 h-3 text-neutral-400" />}
              </button>
            );
          })}
        </div>

        {/* Selected Tags Strip & Custom Tag Input */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Active Selection:
            </span>
            {Object.entries(songData.selectedTags).flatMap(([cat, tags]) =>
              tags.map((t) => (
                <button
                  key={`${cat}-${t}`}
                  onClick={() => toggleTag(cat as TagCategory, t)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-colors group"
                >
                  <span>{t}</span>
                  <X className="w-3 h-3 text-neutral-400 group-hover:text-rose-500" />
                </button>
              ))
            )}
            {songData.customTags.map((ct) => (
              <button
                key={ct}
                onClick={() => removeCustomTag(ct)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-colors group"
              >
                <span>{ct}</span>
                <X className="w-3 h-3 text-neutral-400 group-hover:text-rose-500" />
              </button>
            ))}
          </div>

          {/* Add Custom Tag */}
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleCustomTagKeyDown}
              placeholder={t.addCustomTagPlaceholder}
              className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none w-48 sm:w-56"
            />
            <button
              onClick={() => {
                if (customTagInput.trim()) {
                  addCustomTag(customTagInput.trim());
                  setCustomTagInput('');
                }
              }}
              className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION D: Music Direction & Style Editor (Scoped AI Edit Style Only) */}
      <section className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t.musicDirectionTitle}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.musicDirectionSubtitle}
            </p>
          </div>

          <button
            onClick={aiEditStyleOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/70 dark:border-amber-800/80 rounded-md transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.aiEditStyleOnlyBtn}</span>
          </button>
        </div>

        <textarea
          value={songData.musicDirection}
          onChange={(e) => updateSongData({ musicDirection: e.target.value })}
          rows={4}
          placeholder={t.musicDirectionPlaceholder}
          className="w-full text-xs sm:text-sm font-mono p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
        />
      </section>

      {/* SECTION E: Canonical Lyrics Studio */}
      <section className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        <LyricsEditor />
      </section>

      {/* SECTION F: Arrangement Builder */}
      <section className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        <ArrangementBuilder />
      </section>

    </div>
  );
};
