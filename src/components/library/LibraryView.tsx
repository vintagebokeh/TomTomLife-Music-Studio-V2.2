import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  FolderGit2,
  GitFork,
  ArrowUpRight,
  Clock,
  Tag,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const {
    t,
    libraryVersions,
    forkVersion,
    loadVersionToWorkspace,
    songData,
  } = useStudio();

  const [selectedVerId, setSelectedVerId] = useState<string>(libraryVersions[0]?.id || '');

  const activeVersion = libraryVersions.find((v) => v.id === selectedVerId) || libraryVersions[0];

  return (
    <div className="space-y-6 pb-20">
      
      {/* View Header */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t.libraryTitle}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.librarySubtitle}
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-500">
          Project Hierarchy: <strong className="text-neutral-900 dark:text-neutral-100">{songData.projectTitle}</strong>
        </div>
      </div>

      {/* Main Grid: Versions List on Left, Snapshot Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Versions List */}
        <div className="lg:col-span-1 space-y-2.5">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Version Timeline ({libraryVersions.length})
          </span>

          <div className="space-y-2">
            {libraryVersions.map((ver) => {
              const isSelected = ver.id === selectedVerId;
              return (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVerId(ver.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs ring-1 ring-amber-500/40'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                      {ver.version}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {ver.status}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-1 line-clamp-1">
                    {ver.trackName}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ver.duration}s
                    </span>
                    {ver.preference && (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        Win: {ver.preference === 'A' ? 'YuE2' : 'MiniMax'}
                      </span>
                    )}
                    <span>{ver.createdAt.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Version Snapshot Inspector */}
        {activeVersion && (
          <div className="lg:col-span-2 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
            
            {/* Snapshot Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {activeVersion.version}
                  </span>
                  <span className="text-xs text-neutral-400">· {activeVersion.createdAt}</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {activeVersion.trackName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => forkVersion(activeVersion.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <GitFork className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.forkVersionBtn}</span>
                </button>

                <button
                  onClick={() => loadVersionToWorkspace(activeVersion.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{t.loadToWorkspaceBtn}</span>
                </button>
              </div>
            </div>

            {/* Snapshot Details */}
            <div className="space-y-4 text-xs">
              
              {/* Profile & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 space-y-1">
                  <span className="font-semibold text-neutral-500">{t.profileDnaLabel}:</span>
                  <div className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {activeVersion.songSnapshot.profile}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 space-y-1">
                  <span className="font-semibold text-neutral-500">{t.themeLabel}:</span>
                  <div className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {activeVersion.songSnapshot.theme}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <span className="font-semibold text-neutral-500">Music Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(activeVersion.songSnapshot.selectedTags)
                    .flat()
                    .map((tg) => (
                      <span
                        key={tg}
                        className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]"
                      >
                        {tg}
                      </span>
                    ))}
                </div>
              </div>

              {/* Music Direction */}
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 space-y-1">
                <span className="font-semibold text-neutral-500">{t.musicDirectionTitle}:</span>
                <p className="font-mono text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {activeVersion.songSnapshot.musicDirection}
                </p>
              </div>

              {/* Arrangement Structure */}
              <div className="space-y-1.5">
                <span className="font-semibold text-neutral-500">
                  Arrangement Flow ({activeVersion.songSnapshot.arrangement.length} nodes · {activeVersion.duration}s):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeVersion.songSnapshot.arrangement.map((node) => (
                    <div
                      key={node.id}
                      className="p-2 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800"
                    >
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{node.name}</div>
                      <div className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                        {node.targetSeconds}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
