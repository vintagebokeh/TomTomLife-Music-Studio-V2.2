import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { LyricsLanguage } from '../../types';
import {
  Lock,
  Unlock,
  Sparkles,
  Copy,
  Trash2,
  Plus,
  Music,
} from 'lucide-react';

export const LyricsEditor: React.FC = () => {
  const {
    songData,
    updateSongData,
    t,
    updateLyricText,
    toggleLyricLock,
    duplicateLyricSection,
    deleteLyricSection,
    addLyricSection,
    aiRewriteSection,
    aiGenerateLyricsAll,
  } = useStudio();

  const languageOptions: { value: LyricsLanguage; label: string }[] = [
    { value: 'thai', label: 'ไทย (Thai)' },
    { value: 'english', label: 'English' },
    { value: 'auto', label: 'อัตโนมัติ (Auto-Detect)' },
    { value: 'japanese', label: '日本語 (Japanese)' },
    { value: 'chinese', label: '中文 (Chinese)' },
    { value: 'korean', label: '한국어 (Korean)' },
  ];

  const fitTextareaToContent = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 44)}px`;
  };

  return (
    <div className="space-y-4">
      {/* Studio Header & Global Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.lyricsStudioTitle}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.lyricsStudioSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2.5 py-1">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {t.lyricsLanguageLabel}:
            </span>
            <select
              value={songData.lyricsLanguage}
              onChange={(e) => updateSongData({ lyricsLanguage: e.target.value as LyricsLanguage })}
              className="bg-transparent text-xs text-neutral-900 dark:text-neutral-100 font-medium focus:outline-none cursor-pointer"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Global Generate Lyrics (Lyrics Only) */}
          <button
            onClick={aiGenerateLyricsAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/90 border border-amber-300/70 dark:border-amber-800/80 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.generateLyricsBtn}</span>
          </button>
        </div>
      </div>

      {/* Lyric Section Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {songData.canonicalLyrics.map((sec, idx) => (
          <div
            key={sec.id}
            className={`flex flex-col border rounded-lg p-3.5 transition-all ${
              sec.locked
                ? 'border-neutral-300 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/40 opacity-90'
                : 'border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/70 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-neutral-400 dark:text-neutral-500 tabular-nums">
                  0{idx + 1}
                </span>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {sec.title}
                </span>
                {sec.locked && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    [{t.locked}]
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* AI Rewrite Section (Lyrics only) */}
                <button
                  onClick={() => aiRewriteSection(sec.id)}
                  disabled={sec.locked}
                  title={t.aiRewriteSection}
                  className={`p-1 rounded transition-colors ${
                    sec.locked
                      ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>

                {/* Duplicate Section */}
                <button
                  onClick={() => duplicateLyricSection(sec.id)}
                  title={t.duplicate}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Lock / Unlock */}
                <button
                  onClick={() => toggleLyricLock(sec.id)}
                  title={sec.locked ? t.unlocked : t.locked}
                  className={`p-1 rounded transition-colors ${
                    sec.locked
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  {sec.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                {/* Delete Section */}
                <button
                  onClick={() => deleteLyricSection(sec.id)}
                  disabled={sec.locked}
                  title={t.delete}
                  className={`p-1 rounded transition-colors ${
                    sec.locked
                      ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                      : 'text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lyric Text Area (Only sung words) */}
            <textarea
              ref={fitTextareaToContent}
              value={sec.text}
              onChange={(e) => updateLyricText(sec.id, e.target.value)}
              disabled={sec.locked}
              rows={1}
              placeholder={t.lyricPlaceholder}
              className={`w-full min-h-[2.75rem] bg-transparent resize-y overflow-y-auto text-xs sm:text-sm font-sans leading-relaxed focus:outline-none transition-colors ${
                sec.locked
                  ? 'text-neutral-500 dark:text-neutral-400 cursor-not-allowed select-none'
                  : 'text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Add Lyric Section Button */}
      <div className="pt-1">
        <button
          onClick={addLyricSection}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addSectionBtn}</span>
        </button>
      </div>
    </div>
  );
};
