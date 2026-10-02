import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { engineRegistry, sampleAbcScore } from '../../data/mockData';
import { formatLyricsForYuE2, formatLyricsForMiniMax, formatStyleForYuE2, formatStyleForMiniMax } from '../../utils/formatters';
import {
  Cpu,
  Settings2,
  FileCode2,
  Info,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  Layers,
  Sparkles,
  VolumeX,
  X,
  FileText,
  Copy,
} from 'lucide-react';

export const EngineView: React.FC = () => {
  const {
    t,
    language,
    songData,
    selectedFamilyId,
    setSelectedFamilyId,
    selectedPresetId,
    setSelectedPresetId,
    parameterVisibility,
    setParameterVisibility,
    workflowInfoDrawerOpen,
    setWorkflowInfoDrawerOpen,
    engineParamOverrides,
    setEngineParamOverride,
    showToast,
  } = useStudio();

  const [activeFormatTab, setActiveFormatTab] = useState<'lyrics' | 'style' | 'score'>('lyrics');
  const [abcScoreText, setAbcScoreText] = useState<string>(sampleAbcScore);

  const currentFamily = engineRegistry.find((f) => f.id === selectedFamilyId) || engineRegistry[0];
  const currentPreset = currentFamily.presets.find((p) => p.id === selectedPresetId) || currentFamily.presets[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t.copied, 'success');
  };

  // Filter parameters by visibility tier
  const visibleParams = currentPreset.parameters.filter((p) => {
    if (parameterVisibility === 'basic') return p.tier === 'basic';
    if (parameterVisibility === 'advanced') return p.tier === 'basic' || p.tier === 'advanced';
    return true; // 'internal' shows all
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* View Header */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t.engineTitle}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.engineSubtitle}
          </p>
        </div>

        {/* Workflow Info Drawer Trigger */}
        <button
          onClick={() => setWorkflowInfoDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.workflowInfoBtn}</span>
        </button>
      </div>

      {/* Engine Family & Preset Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Engine Family Selector */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
            <span>{t.engineFamilyLabel}</span>
            <span className="text-[10px] font-mono text-neutral-400">{language === 'th' ? '2 ตระกูลเอนจิน' : '2 Engine Families'}</span>
          </label>
          <div className="space-y-2">
            {engineRegistry.map((family) => {
              const isSelected = family.id === selectedFamilyId;
              return (
                <div
                  key={family.id}
                  onClick={() => setSelectedFamilyId(family.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {family.name}
                    </span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {language === 'th' ? family.descriptionTh : family.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Workflow Preset Selector */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
            <span>{t.workflowPresetLabel}</span>
            <span className="text-[10px] font-mono text-neutral-400">{currentFamily.presets.length} {language === 'th' ? 'เวิร์กโฟลว์' : 'Presets'}</span>
          </label>
          <div className="space-y-2">
            {currentFamily.presets.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {preset.name}
                    </span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {language === 'th' ? preset.summaryTh : preset.summaryEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Input Surface Summary Card */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 space-y-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            {t.inputSurfaceTitle}
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(language === 'th' ? currentPreset.exposedInputsTh : currentPreset.exposedInputsEn).map((inp) => (
            <span
              key={inp}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-neutral-900 border border-amber-500/30 text-neutral-800 dark:text-neutral-200 shadow-xs"
            >
              {inp}
            </span>
          ))}
          {currentPreset.isInstrumentalOnly && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <VolumeX className="w-3 h-3" />
              <span>Instrumental Only (Lyrics Ignored)</span>
            </span>
          )}
        </div>
      </div>

      {/* Common Inputs & Models Used Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Common Inputs Card */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <FileText className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              {t.commonInputsCardTitle}
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-500">{language === 'th' ? 'เพลง:' : 'Track:'}</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{songData.trackName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-500">{language === 'th' ? 'ความยาวเป้าหมาย:' : 'Target Duration:'}</span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{songData.durationIntent} {t.seconds}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-500">Seed:</span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{songData.seed}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-500">{language === 'th' ? 'ภาษาเนื้อร้อง:' : 'Lyrics Language:'}</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase">{songData.lyricsLanguage}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">{language === 'th' ? 'จำนวนท่อน Arrangement:' : 'Arrangement Sections:'}</span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{songData.arrangement.length} nodes</span>
            </div>
          </div>
        </div>

        {/* Models Used Card */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              {t.modelsUsedTitle}
            </h3>
          </div>
          <div className="space-y-2">
            {currentPreset.modelsUsed.map((m) => (
              <div
                key={m.filename}
                className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">{m.role}</div>
                  <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">{m.filename}</div>
                </div>
                {m.size && (
                  <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                    {m.size} {m.quantization ? `· ${m.quantization}` : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Engine Details & Parameters with Visibility Controls */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.engineDetailsTitle}
            </h3>
          </div>

          {/* Visibility Level Filter (Basic / Advanced / Internal) */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-md text-xs font-medium">
            <button
              onClick={() => setParameterVisibility('basic')}
              className={`px-2.5 py-1 rounded transition-colors ${
                parameterVisibility === 'basic'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t.visibilityBasic}
            </button>
            <button
              onClick={() => setParameterVisibility('advanced')}
              className={`px-2.5 py-1 rounded transition-colors ${
                parameterVisibility === 'advanced'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t.visibilityAdvanced}
            </button>
            <button
              onClick={() => setParameterVisibility('internal')}
              className={`px-2.5 py-1 rounded transition-colors ${
                parameterVisibility === 'internal'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t.visibilityInternal}
            </button>
          </div>
        </div>

        {/* Dynamic Parameter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visibleParams.map((param) => {
            const currentValue = engineParamOverrides[param.key] ?? param.defaultValue;
            return (
              <div
                key={param.key}
                className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {language === 'th' ? param.labelTh : param.labelEn}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    [{param.tier}]
                  </span>
                </div>

                {param.type === 'number' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={param.min ?? 0}
                      max={param.max ?? 100}
                      step={param.step ?? 1}
                      value={currentValue}
                      onChange={(e) => setEngineParamOverride(param.key, parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 w-12 text-right tabular-nums">
                      {currentValue}
                    </span>
                  </div>
                )}

                {param.type === 'select' && (
                  <select
                    value={currentValue}
                    onChange={(e) => setEngineParamOverride(param.key, e.target.value)}
                    className="w-full text-xs p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    {param.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {language === 'th' ? opt.labelTh : opt.labelEn}
                      </option>
                    ))}
                  </select>
                )}

                {param.type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(currentValue)}
                      onChange={(e) => setEngineParamOverride(param.key, e.target.checked)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs text-neutral-700 dark:text-neutral-300">
                      {currentValue ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                )}

                {param.descriptionTh && (
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {language === 'th' ? param.descriptionTh : param.descriptionEn}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Format Transformations & Previews Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t.formatPreviewTitle}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {language === 'th' ? 'แปลงข้อมูล Canonical เป็นรูปแบบเฉพาะเอนจิน' : 'Engine-specific compilation of canonical song data'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-md text-xs font-medium">
            <button
              onClick={() => setActiveFormatTab('lyrics')}
              className={`px-3 py-1 rounded transition-colors ${
                activeFormatTab === 'lyrics'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t.tabLyricsFormat}
            </button>
            <button
              onClick={() => setActiveFormatTab('style')}
              className={`px-3 py-1 rounded transition-colors ${
                activeFormatTab === 'style'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t.tabStyleFormat}
            </button>
            {selectedFamilyId === 'yue2' && (
              <button
                onClick={() => setActiveFormatTab('score')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeFormatTab === 'score'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {t.tabScoreEditor}
              </button>
            )}
          </div>
        </div>

        {/* Tab Content: Lyrics Mapping */}
        {activeFormatTab === 'lyrics' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {language === 'th' ? 'รูปแบบสำหรับ: ' : 'Formatted for: '}<strong className="text-neutral-800 dark:text-neutral-200">{currentFamily.name}</strong>
              </span>
              <button
                onClick={() =>
                  handleCopy(selectedFamilyId === 'yue2' ? formatLyricsForYuE2(songData) : formatLyricsForMiniMax(songData))
                }
                className="flex items-center gap-1 hover:text-amber-500 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'คัดลอก' : 'Copy'}</span>
              </button>
            </div>
            {selectedFamilyId === 'yue2' && songData.canonicalLyrics.some((sec) => sec.type === 'prechorus') && (
              <div className="px-3 py-2 rounded-md border border-amber-500/25 bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-300">
                {language === 'th'
                  ? 'YuE2 Safe Mapping: Pre-Chorus ถูกแปลงเป็น [Verse] เฉพาะตอนส่งเอนจิน; โครงสร้าง Canonical ยังเก็บ Pre-Chorus ไว้ครบ'
                  : 'YuE2 Safe Mapping: Pre-Chorus is emitted as [Verse] for this verified workflow; the canonical Pre-Chorus remains preserved.'}
              </div>
            )}
            <pre className="p-4 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-xs whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-neutral-800">
              {selectedFamilyId === 'yue2' ? formatLyricsForYuE2(songData) : formatLyricsForMiniMax(songData)}
            </pre>
          </div>
        )}

        {/* Tab Content: Style / Music Direction Mapping */}
        {activeFormatTab === 'style' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {language === 'th' ? 'รูปแบบสำหรับ: ' : 'Formatted for: '}<strong className="text-neutral-800 dark:text-neutral-200">{currentFamily.name}</strong>
              </span>
              <button
                onClick={() =>
                  handleCopy(selectedFamilyId === 'yue2' ? formatStyleForYuE2(songData) : formatStyleForMiniMax(songData))
                }
                className="flex items-center gap-1 hover:text-amber-500 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'คัดลอก' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-xs whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-neutral-800">
              {selectedFamilyId === 'yue2' ? formatStyleForYuE2(songData) : formatStyleForMiniMax(songData)}
            </pre>
          </div>
        )}

        {/* Tab Content: ABC Score Editor Artifact */}
        {activeFormatTab === 'score' && selectedFamilyId === 'yue2' && (
          <div className="space-y-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-300">
              {t.abcNotice}
            </div>
            <textarea
              value={abcScoreText}
              onChange={(e) => setAbcScoreText(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-lg bg-neutral-950 text-emerald-400 font-mono text-xs whitespace-pre leading-relaxed border border-neutral-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

      </div>

      {/* Workflow Info Drawer */}
      {workflowInfoDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {t.workflowDrawerTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setWorkflowInfoDrawerOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t.workflowDrawerSubtitle}
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 font-medium">{language === 'th' ? 'เวิร์กโฟลว์ที่เลือก:' : 'Selected Workflow:'}</span>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">{currentPreset.name}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="w-3 h-3" />
                    {currentPreset.evidenceStatus === 'workflow-verified'
                      ? (language === 'th' ? 'Workflow-verified · ตรวจจากไฟล์จริง' : 'Workflow-verified · inspected from local file')
                      : (language === 'th' ? 'Workflow discovered · รอ index รายละเอียด' : 'Workflow discovered · bindings pending')}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 font-medium">{t.workflowPath}:</span>
                  <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400 break-all">
                    {currentPreset.mockWorkflowPath}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500">{t.exposedCount}:</span>
                    <div className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                      {currentPreset.parameters.length}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500">{t.internalCount}:</span>
                    <div className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                      {currentPreset.internalParamsCount}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 font-medium">{language === 'th' ? 'โมเดลในเวิร์กโฟลว์:' : 'Models Configured:'}</span>
                  <div className="space-y-1 mt-1">
                    {currentPreset.modelsUsed.map((m) => (
                      <div key={m.filename} className="font-mono text-[10px] text-neutral-700 dark:text-neutral-300">
                        • {m.role}: {m.filename}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setWorkflowInfoDrawerOpen(false)}
              className="w-full py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
