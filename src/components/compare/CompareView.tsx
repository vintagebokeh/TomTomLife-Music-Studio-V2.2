import React, { useState, useEffect, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  GitCompare,
  Play,
  Pause,
  RotateCcw,
  Star,
  Check,
  Save,
  Clock,
  AudioWaveform,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const CompareView: React.FC = () => {
  const {
    t,
    compareEvaluation,
    updateCompareEvaluation,
    savedEvaluations,
    saveCurrentEvaluation,
  } = useStudio();

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activePlayingTrack, setActivePlayingTrack] = useState<'A' | 'B' | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handlePlayToggle = (track: 'A' | 'B') => {
    const job = track === 'A' ? compareEvaluation.renderA : compareEvaluation.renderB;
    if (!job.audioUrl) return;

    if (isPlaying && activePlayingTrack === track) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(job.audioUrl);
    audioRef.current = audio;
    audio.currentTime = Math.max(0, currentTime);
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime || 0);
    audio.onplay = () => {
      setIsPlaying(true);
      setActivePlayingTrack(track);
    };
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      setActivePlayingTrack(null);
      setCurrentTime(0);
    };
    audio.play().catch(() => {
      setIsPlaying(false);
      setActivePlayingTrack(null);
    });
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current) {
      try { audioRef.current.currentTime = seconds; } catch {}
    }
  };

  const setRating = (key: keyof typeof compareEvaluation.ratings, rating: number) => {
    updateCompareEvaluation({
      ratings: {
        ...compareEvaluation.ratings,
        [key]: rating,
      },
    });
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const criteriaList: { key: keyof typeof compareEvaluation.ratings; label: string }[] = [
    { key: 'thaiPronunciation', label: t.critThaiPronounce },
    { key: 'lyricsClarity', label: t.critLyricsClarity },
    { key: 'styleMatch', label: t.critStyleMatch },
    { key: 'vocalQuality', label: t.critVocalQuality },
    { key: 'arrangementFlow', label: t.critArrangement },
    { key: 'emotionImpact', label: t.critEmotion },
    { key: 'durationFidelity', label: t.critDuration },
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* View Header */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t.compareTitle}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.compareSubtitle}
          </p>
        </div>

        <button
          onClick={saveCurrentEvaluation}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t.saveEvalBtn}</span>
        </button>
      </div>

      {/* Dual Deck Audio Player (A = YuE2, B = MiniMax 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* DECK A: YuE2 */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            activePlayingTrack === 'A' && isPlaying
              ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 shadow-md ring-1 ring-amber-500/50'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                A
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {compareEvaluation.renderA.presetName}
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Engine: YuE2 · LIVE ComfyUI
                </span>
              </div>
            </div>

            <button
              aria-label={activePlayingTrack === 'A' && isPlaying ? 'Pause Engine A preview' : 'Play Engine A preview'}
              onClick={() => handlePlayToggle('A')}
              disabled={!compareEvaluation.renderA.audioUrl}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                activePlayingTrack === 'A' && isPlaying
                  ? 'bg-amber-500 text-neutral-950 scale-105'
                  : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              {activePlayingTrack === 'A' && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          {/* Waveform summary A */}
          <div className="h-16 flex items-center gap-1 my-4 px-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-800/80">
            {compareEvaluation.renderA.waveformSample.map((val, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  activePlayingTrack === 'A' && isPlaying
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                style={{
                  height: `${activePlayingTrack === 'A' && isPlaying ? Math.min(100, val * 1.1) : val * 0.6}%`,
                }}
              />
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 space-y-1">
            <div className="flex justify-between">
              <span>Render: FL YuE2 · Acoustic Steps 32</span>
              <span className="font-mono">Output: {compareEvaluation.renderA.format} · LIVE</span>
            </div>
            <p className="line-clamp-2 italic text-neutral-400 font-mono">
              "{compareEvaluation.renderA.promptSnippet}"
            </p>
          </div>
        </div>

        {/* DECK B: MiniMax Music 3 */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            activePlayingTrack === 'B' && isPlaying
              ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 shadow-md ring-1 ring-amber-500/50'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                B
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {compareEvaluation.renderB.presetName}
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Engine: MiniMax Music 3 · LIVE ComfyUI
                </span>
              </div>
            </div>

            <button
              aria-label={activePlayingTrack === 'B' && isPlaying ? 'Pause Engine B preview' : 'Play Engine B preview'}
              onClick={() => handlePlayToggle('B')}
              disabled={!compareEvaluation.renderB.audioUrl}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                activePlayingTrack === 'B' && isPlaying
                  ? 'bg-amber-500 text-neutral-950 scale-105'
                  : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              {activePlayingTrack === 'B' && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          {/* Waveform summary B */}
          <div className="h-16 flex items-center gap-1 my-4 px-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-800/80">
            {compareEvaluation.renderB.waveformSample.map((val, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  activePlayingTrack === 'B' && isPlaying
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                style={{
                  height: `${activePlayingTrack === 'B' && isPlaying ? Math.min(100, val * 1.1) : val * 0.6}%`,
                }}
              />
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 space-y-1">
            <div className="flex justify-between">
              <span>Sampler: Euler · Simple · 30</span>
              <span className="font-mono">Output: {compareEvaluation.renderB.format} · LIVE</span>
            </div>
            <p className="line-clamp-2 italic text-neutral-400 font-mono">
              "{compareEvaluation.renderB.promptSnippet}"
            </p>
          </div>
        </div>

      </div>

      {/* Synchronized Playhead Scrub Bar */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            {t.syncScrub}
          </span>
          <span className="tabular-nums font-bold">
            {formatTime(currentTime)} / {formatTime(compareEvaluation.renderA.duration)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={compareEvaluation.renderA.duration}
          step={0.5}
          value={currentTime}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
        />
      </div>

      {/* Production Criteria Sliders / Star Ratings */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          {t.criteriaTitle}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteriaList.map((crit) => {
            const currentRating = compareEvaluation.ratings[crit.key];
            return (
              <div
                key={crit.key}
                className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between gap-2"
              >
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {crit.label}
                </span>

                {/* 5-Star Rating Buttons */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(crit.key, star)}
                      className={`p-1 rounded transition-transform hover:scale-110 cursor-pointer ${
                        star <= currentRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                      aria-label={`${crit.label} ${star} stars`}
                    >
                      <Star className={`w-4 h-4 ${star <= currentRating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                  <span className="ml-1 text-xs font-mono text-neutral-400 w-4 text-center tabular-nums">
                    {currentRating}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Preference & Notes */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        
        {/* Preference Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            {t.preferencePrompt}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => updateCompareEvaluation({ preferred: 'A' })}
              className={`p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                compareEvaluation.preferred === 'A'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {t.preferA}
            </button>
            <button
              onClick={() => updateCompareEvaluation({ preferred: 'B' })}
              className={`p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                compareEvaluation.preferred === 'B'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {t.preferB}
            </button>
            <button
              onClick={() => updateCompareEvaluation({ preferred: 'Tie' })}
              className={`p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                compareEvaluation.preferred === 'Tie'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {t.preferTie}
            </button>
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {t.evalNotesLabel}
          </label>
          <textarea
            value={compareEvaluation.notes}
            onChange={(e) => updateCompareEvaluation({ notes: e.target.value })}
            rows={3}
            placeholder={t.evalNotesPlaceholder}
            className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

      </div>

      {/* Evaluation History Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          {t.evalHistoryTitle} ({savedEvaluations.length})
        </h3>
        <div className="space-y-2">
          {savedEvaluations.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>{ev.trackName}</span>
                  <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 font-bold">
                    Winner: {ev.preferred === 'A' ? 'YuE2' : ev.preferred === 'B' ? 'MiniMax 3' : 'Tie'}
                  </span>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1 italic">
                  "{ev.notes}"
                </p>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                {ev.date}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
