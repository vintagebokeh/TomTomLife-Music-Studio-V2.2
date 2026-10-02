import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { RenderJob } from '../../types';
import {
  Play,
  Pause,
  Download,
  GitCompare,
  RotateCw,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  AudioWaveform,
  ChevronDown,
  ChevronRight,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';

export const RenderView: React.FC = () => {
  const {
    t,
    language,
    songData,
    renderJobs,
    isSingleRendering,
    startSingleRender,
    startAbRender,
    refreshRenderJob,
    refreshPendingRenderJobs,
    dismissRenderJob,
    clearFailedRenderJobs,
    setActiveTab,
    showToast,
  } = useStudio();

  const [outputFormat, setOutputFormat] = useState<'MP3 V0' | 'WAV 24-bit' | 'FLAC'>('FLAC');
  const [playingJobId, setPlayingJobId] = useState<string | null>(null);
  const [showFailed, setShowFailed] = useState(false);
  const [checkingAll, setCheckingAll] = useState(false);
  const [checkingJobId, setCheckingJobId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const failedJobs = renderJobs.filter((job) => job.status === 'failed');
  const pendingJobs = renderJobs.filter((job) => job.status === 'queued' || job.status === 'processing' || job.status === 'verifying');

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlayback = (job: RenderJob) => {
    if (!job.audioUrl) {
      showToast(language === 'th' ? 'งานนี้ยังไม่มีไฟล์เสียงจริง' : 'No live audio file is available for this job.', 'warning');
      return;
    }
    if (playingJobId === job.id) {
      audioRef.current?.pause();
      setPlayingJobId(null);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(job.audioUrl);
    audioRef.current = audio;
    audio.onended = () => setPlayingJobId(null);
    audio.onerror = () => {
      setPlayingJobId(null);
      showToast(language === 'th' ? 'เปิดไฟล์เสียงจาก 3012 ไม่สำเร็จ' : 'Could not play audio from backend 3012.', 'warning');
    };
    audio.play().then(() => setPlayingJobId(job.id)).catch(() => {
      setPlayingJobId(null);
      showToast(language === 'th' ? 'เบราว์เซอร์ไม่อนุญาตให้เล่นเสียง' : 'Browser blocked audio playback.', 'warning');
    });
  };

  const handleDownload = (job: RenderJob) => {
    if (!job.audioUrl) {
      showToast(language === 'th' ? 'ยังไม่มีไฟล์เสียงให้ดาวน์โหลด' : 'No audio file available yet.', 'warning');
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = job.audioUrl;
    anchor.download = (job.trackName || 'TomTomLife') + '-' + job.familyId + '.flac';
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AudioWaveform className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t.renderTitle}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.renderSubtitle}
          </p>
        </div>

        {/* Render Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Format Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
            <span className="text-neutral-500 font-medium">{t.renderFormatLabel}:</span>
            <select
              value={outputFormat}
              disabled
              onChange={(e) => setOutputFormat(e.target.value as any)}
              className="bg-transparent font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
            >
              <option value="FLAC">FLAC · Live verified</option>
            </select>
          </div>

          {/* Render Single */}
          <button
            onClick={startSingleRender}
            disabled={isSingleRendering}
            className={`flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs ${isSingleRendering ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSingleRendering ? (language === 'th' ? 'กำลังเรนเดอร์...' : 'Rendering...') : t.renderSingleBtn}</span>
          </button>

          {/* Render A/B Concurrently */}
          <button
            onClick={startAbRender}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.renderAbBtn}</span>
          </button>
        </div>
      </div>

      {/* Blueprint Parameters Snapshot Banner */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-neutral-500">Track:</span>{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">{songData.trackName}</strong>
          </div>
          <div>
            <span className="text-neutral-500">Blueprint:</span>{' '}
            <span className="font-mono text-amber-600 dark:text-amber-400">{songData.version}</span>
          </div>
          <div>
            <span className="text-neutral-500">Target Duration:</span>{' '}
            <span className="font-mono font-semibold">{songData.durationIntent}s</span>
          </div>
          <div>
            <span className="text-neutral-500">Seed:</span>{' '}
            <span className="font-mono">{songData.seed}</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-neutral-400">
          {language === 'th' ? 'คิว' : 'Queue'}: {renderJobs.filter((j) => j.status === 'queued').length} {language === 'th' ? 'รอ' : 'Queued'} · {renderJobs.filter((j) => j.status === 'processing').length} {language === 'th' ? 'กำลังประมวลผล' : 'Processing'} · {renderJobs.filter((j) => j.status === 'verifying').length} {language === 'th' ? 'รอตรวจหลักฐาน' : 'Verifying'} · {renderJobs.filter((j) => j.status === 'completed').length} {language === 'th' ? 'เสร็จ' : 'Completed'} · {failedJobs.length} {language === 'th' ? 'ล้มเหลว' : 'Failed'}
        </div>
      </div>

      {/* Render Queue Items */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {t.completedJobs} & {t.activeJobs}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {pendingJobs.length > 0 && (
              <button
                onClick={async () => {
                  setCheckingAll(true);
                  try { await refreshPendingRenderJobs(true); } finally { setCheckingAll(false); }
                }}
                disabled={checkingAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 disabled:opacity-50 transition-colors"
                title={language === 'th' ? 'เช็ค prompt_id กับ backend / ComfyUI history และ audio output จริง' : 'Verify prompt_id against backend, ComfyUI history, and real audio output'}
              >
                <RotateCw className={`w-3.5 h-3.5 ${checkingAll ? 'animate-spin' : ''}`} />
                <span>{language === 'th' ? `ตรวจสอบสถานะจริง (${pendingJobs.length})` : `Verify real status (${pendingJobs.length})`}</span>
              </button>
            )}
            {failedJobs.length > 0 && (
              <>
                <button
                  onClick={() => setShowFailed((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-500/25 bg-rose-500/5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  {showFailed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>{language === 'th' ? `งานล้มเหลว (${failedJobs.length})` : `Failed jobs (${failedJobs.length})`}</span>
                </button>
                <button
                  onClick={() => {
                    clearFailedRenderJobs();
                    setShowFailed(false);
                    showToast(language === 'th' ? 'ล้างงานล้มเหลวออกจากหน้า Render แล้ว — Evidence Library ยังถูกเก็บไว้' : 'Failed jobs cleared from Render view — backend Evidence Library is preserved.', 'info');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-500 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                  title={language === 'th' ? 'ล้างเฉพาะประวัติบนหน้า Render ไม่ลบ Evidence Library' : 'Clears Render-page history only; Evidence Library is kept'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'th' ? 'ล้างจากหน้า Render' : 'Clear from Render'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {renderJobs.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-500">
            {t.noJobsYet}
          </div>
        ) : (
          renderJobs.map((job) => {
            const isPlaying = playingJobId === job.id;
            const isCompleted = job.status === 'completed';
            const isFailed = job.status === 'failed';
            const isVerifying = job.status === 'verifying';

            if (isFailed) {
              if (!showFailed) return null;
              return (
                <div
                  key={job.id}
                  className="px-3 py-2 rounded-lg border border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{job.presetName}</span>
                    <span className="text-[10px] font-mono text-neutral-400 shrink-0">{job.createdAt}</span>
                    <span className="hidden md:inline text-[11px] font-mono text-rose-500/90 truncate">
                      {job.error || 'Unknown error'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="md:hidden text-[10px] font-mono text-rose-500/90 line-clamp-1 max-w-[220px]">
                      {job.error || 'Unknown error'}
                    </span>
                    <button
                      onClick={() => {
                        dismissRenderJob(job.id);
                        showToast(language === 'th' ? 'ซ่อนงานล้มเหลวออกจากหน้า Render แล้ว — หลักฐาน backend ยังอยู่' : 'Failed job hidden from Render view — backend evidence is preserved.', 'info');
                      }}
                      title={language === 'th' ? 'ซ่อนจากหน้า Render' : 'Hide from Render'}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={job.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                    : 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Job Metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        {job.presetName}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {job.format}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        LIVE COMFYUI
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Seed: {job.seed}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {job.createdAt}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 font-mono">
                      {job.promptSnippet}
                    </p>

                    {/* Progress Bar for Processing State */}
                    {!isCompleted && !isFailed && (
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full transition-all duration-300 ${isVerifying ? 'bg-sky-500' : 'bg-amber-500'}`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Audio Waveform Sample & Playback Controls */}
                  {isCompleted && (
                    <div className="flex items-center gap-4 shrink-0">
                      
                      {/* Mini Waveform Visualizer */}
                      <div className="hidden sm:flex items-center gap-0.5 h-8 w-32 px-2 rounded bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                        {job.waveformSample.map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-150 ${
                              isPlaying ? 'bg-amber-500 animate-pulse' : 'bg-neutral-400 dark:bg-neutral-600'
                            }`}
                            style={{ height: `${isPlaying ? Math.min(100, h * 1.2) : h * 0.7}%` }}
                          />
                        ))}
                      </div>

                      {/* Play / Pause Audition Button */}
                      <button
                        onClick={() => togglePlayback(job)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-amber-500 text-neutral-950 font-bold'
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? t.pause : t.listenPreview}</span>
                      </button>

                      {/* Download */}
                      <button
                        onClick={() => handleDownload(job)}
                        title={t.downloadAudio}
                        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Send to Compare */}
                      <button
                        onClick={() => setActiveTab('compare')}
                        title={t.sendToCompare}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <GitCompare className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden sm:inline">{t.navCompare}</span>
                      </button>

                    </div>
                  )}

                  {isFailed && (
                    <div className="max-w-sm text-xs text-rose-600 dark:text-rose-400 font-mono">
                      {language === 'th' ? 'เรนเดอร์ล้มเหลว: ' : 'Render failed: '}{job.error || 'Unknown error'}
                    </div>
                  )}

                  {!isCompleted && !isFailed && (
                    <div className={`flex flex-wrap items-center justify-end gap-2 text-xs font-mono font-semibold shrink-0 ${isVerifying ? 'text-sky-600 dark:text-sky-300' : 'text-amber-500'}`}>
                      {isVerifying ? <Clock className="w-4 h-4" /> : <RotateCw className="w-4 h-4 animate-spin" />}
                      <div className="text-right">
                        <div>
                          {isVerifying
                            ? (language === 'th' ? 'รอตรวจสอบหลักฐาน' : 'Awaiting evidence')
                            : job.status === 'queued'
                            ? (language === 'th' ? 'รอคิว...' : 'Queued...')
                            : (language === 'th' ? 'กำลังประมวลผล...' : 'Processing...')} {job.progress}%
                        </div>
                        {job.lastCheckedAt && (
                          <div className="text-[10px] font-normal text-neutral-400">
                            {language === 'th' ? 'ตรวจล่าสุด ' : 'Last checked '}{job.lastCheckedAt}
                          </div>
                        )}
                      </div>
                      {job.promptId && (
                        <button
                          onClick={async () => {
                            setCheckingJobId(job.id);
                            try { await refreshRenderJob(job.id); } finally { setCheckingJobId(null); }
                          }}
                          disabled={checkingJobId === job.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-md border border-current/25 hover:bg-current/10 disabled:opacity-50 transition-colors"
                        >
                          <RotateCw className={`w-3 h-3 ${checkingJobId === job.id ? 'animate-spin' : ''}`} />
                          <span>{language === 'th' ? 'เช็คตอนนี้' : 'Check now'}</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
