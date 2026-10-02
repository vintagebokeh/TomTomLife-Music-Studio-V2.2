import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Clock,
  Sparkles,
  BookmarkPlus,
  Plus,
  GripVertical,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from 'lucide-react';

export const ArrangementBuilder: React.FC = () => {
  const {
    songData,
    t,
    updateArrangementNode,
    adjustNodeDuration,
    reorderArrangementNodes,
    duplicateArrangementNode,
    deleteArrangementNode,
    addArrangementNode,
    aiArrange,
    saveArrangementTemplate,
  } = useStudio();

  const [aiBriefInput, setAiBriefInput] = useState<string>('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const totalSeconds = songData.arrangement.reduce((sum, node) => sum + node.targetSeconds, 0);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    reorderArrangementNodes(draggedIdx, index);
    setDraggedIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="space-y-4">
      {/* Arrangement Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.arrangementTitle}
            </h3>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 tabular-nums">
              {totalSeconds} {t.seconds} ({Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, '0')})
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.arrangementSubtitle}
          </p>
        </div>

        {/* Global Arrangement Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={aiBriefInput}
              onChange={(e) => setAiBriefInput(e.target.value)}
              placeholder={languageText(t.aiArrangeBtn)}
              className="text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none w-44 sm:w-56"
            />
            <button
              onClick={() => aiArrange(aiBriefInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/90 border border-amber-300/70 dark:border-amber-800/80 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t.aiArrangeBtn}</span>
            </button>
          </div>

          <button
            onClick={saveArrangementTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/90 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-neutral-500" />
            <span>{t.saveTemplateBtn}</span>
          </button>
        </div>
      </div>

      {/* Visual Timeline Meter Bar */}
      <div className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-md p-1 border border-neutral-200 dark:border-neutral-800">
        <div className="flex w-full h-3 rounded overflow-hidden gap-0.5">
          {songData.arrangement.map((node, i) => {
            const percent = totalSeconds > 0 ? (node.targetSeconds / totalSeconds) * 100 : 0;
            const colors = [
              'bg-amber-500/80',
              'bg-sky-500/80',
              'bg-emerald-500/80',
              'bg-indigo-500/80',
              'bg-rose-500/80',
              'bg-violet-500/80',
              'bg-teal-500/80',
              'bg-orange-500/80',
            ];
            return (
              <div
                key={node.id}
                style={{ width: `${percent}%` }}
                title={`${node.name}: ${node.targetSeconds}s (${Math.round(percent)}%)`}
                className={`${colors[i % colors.length]} h-full transition-all flex items-center justify-center text-[9px] font-mono text-white/90 overflow-hidden px-1`}
              >
                {percent > 8 && node.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Horizontal Scrollable Arrangement Cards */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
        {songData.arrangement.map((node, index) => (
          <div
            key={node.id}
            draggable={!node.locked}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`min-w-[210px] max-w-[230px] shrink-0 border rounded-lg p-3 flex flex-col justify-between transition-all select-none ${
              draggedIdx === index ? 'opacity-40 scale-95 border-amber-500' : ''
            } ${
              node.locked
                ? 'border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/40'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
            }`}
          >
            {/* Card Header: Drag Handle & Lock & Move buttons */}
            <div className="flex items-center justify-between gap-1 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5">
                <div
                  title={t.dragToReorder}
                  className={`cursor-grab active:cursor-grabbing p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 ${
                    node.locked ? 'cursor-not-allowed text-neutral-300 dark:text-neutral-700' : ''
                  }`}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 tabular-nums">
                  #{index + 1}
                </span>
              </div>

              {/* Move left / right & lock */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => index > 0 && reorderArrangementNodes(index, index - 1)}
                  disabled={index === 0 || node.locked}
                  title="Move Left"
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => index < songData.arrangement.length - 1 && reorderArrangementNodes(index, index + 1)}
                  disabled={index === songData.arrangement.length - 1 || node.locked}
                  title="Move Right"
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateArrangementNode(node.id, { locked: !node.locked })}
                  title={node.locked ? t.unlocked : t.locked}
                  className={`p-1 rounded transition-colors ${
                    node.locked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {node.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Editable Name & Linked Lyric Section */}
            <div className="py-2 space-y-1.5">
              <input
                type="text"
                value={node.name}
                disabled={node.locked}
                onChange={(e) => updateArrangementNode(node.id, { name: e.target.value })}
                className="w-full text-xs font-semibold bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none border-b border-transparent focus:border-neutral-300 dark:focus:border-neutral-700"
              />

              {/* Lyric section reference dropdown */}
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                <span>Lyrics Ref:</span>
                <select
                  value={node.lyricSectionId}
                  disabled={node.locked}
                  onChange={(e) => updateArrangementNode(node.id, { lyricSectionId: e.target.value })}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5 text-[10px] text-neutral-900 dark:text-neutral-100 max-w-[110px] truncate focus:outline-none"
                >
                  {songData.canonicalLyrics.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Musical Role */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                  {t.roleLabel}:
                </span>
                <textarea
                  value={node.role}
                  disabled={node.locked}
                  rows={2}
                  onChange={(e) => updateArrangementNode(node.id, { role: e.target.value })}
                  className="w-full text-[11px] bg-neutral-50/50 dark:bg-neutral-950/40 p-1.5 rounded border border-neutral-100 dark:border-neutral-800/80 text-neutral-700 dark:text-neutral-300 resize-none focus:outline-none"
                />
              </div>
            </div>

            {/* Target Duration & Increment/Decrement */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {node.targetSeconds}s
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustNodeDuration(node.id, -5)}
                  disabled={node.locked || node.targetSeconds <= 5}
                  title="-5 sec"
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-40"
                >
                  -5s
                </button>
                <button
                  onClick={() => adjustNodeDuration(node.id, 5)}
                  disabled={node.locked || node.targetSeconds >= 180}
                  title="+5 sec"
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-40"
                >
                  +5s
                </button>

                <button
                  onClick={() => duplicateArrangementNode(node.id)}
                  title={t.duplicate}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteArrangementNode(node.id)}
                  disabled={node.locked || songData.arrangement.length <= 1}
                  title={t.delete}
                  className="p-1 text-neutral-400 hover:text-rose-500 disabled:opacity-30"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <button
          onClick={addArrangementNode}
          className="min-w-[150px] shrink-0 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-500" />
          <span>{t.addArrangementNodeBtn}</span>
        </button>
      </div>
    </div>
  );
};

function languageText(val: string) {
  return val.includes('(') ? val.split('(')[0].trim() : val;
}
