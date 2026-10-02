export type Language = 'th' | 'en';
export type ThemeMode = 'dark' | 'light';

export type WorkspaceTab = 
  | 'source'
  | 'blueprint'
  | 'engine'
  | 'render'
  | 'compare'
  | 'library';

export type SongStatus = 'Draft' | 'Locked' | 'Rendered';

export type LyricsLanguage = 'auto' | 'thai' | 'english' | 'japanese' | 'chinese' | 'korean';

export type LyricSectionType = 
  | 'intro'
  | 'verse1'
  | 'prechorus'
  | 'chorus'
  | 'verse2'
  | 'bridge'
  | 'finalchorus'
  | 'outro'
  | 'custom';

export interface LyricSection {
  id: string;
  type: LyricSectionType;
  title: string;
  text: string;
  locked: boolean;
}

export interface ArrangementNode {
  id: string;
  lyricSectionId: string;
  name: string;
  role: string;
  targetSeconds: number;
  locked: boolean;
}

export type TagCategory = 
  | 'Genre' 
  | 'Mood' 
  | 'Instruments' 
  | 'Vocals' 
  | 'Rhythm' 
  | 'Production' 
  | 'Era';

export interface SongData {
  projectTitle: string;
  trackName: string;
  version: string;
  status: SongStatus;
  brief: string;
  profile: string;
  theme: string;
  selectedTags: Record<TagCategory, string[]>;
  customTags: string[];
  musicDirection: string;
  lyricsLanguage: LyricsLanguage;
  canonicalLyrics: LyricSection[];
  arrangement: ArrangementNode[];
  durationIntent: number;
  seed: number;
  instrumental: boolean;
}

export type EngineFamilyId = 'yue2' | 'minimax_music3';

export type WorkflowPresetId = 
  | 'yue2-song-full'
  | 'yue2-instrumental-lora'
  | 'yue2-score-editor'
  | 'minimax3-allinone-thai'
  | 'minimax3-text-to-music'
  | 'minimax3-caption-lyrics';

export interface ModelSpec {
  role: string;
  filename: string;
  size?: string;
  quantization?: string;
}

export interface ParameterDefinition {
  key: string;
  labelTh: string;
  labelEn: string;
  type: 'number' | 'select' | 'boolean' | 'text';
  tier: 'basic' | 'advanced' | 'internal';
  defaultValue: any;
  options?: { value: any; labelTh: string; labelEn: string }[];
  min?: number;
  max?: number;
  step?: number;
  descriptionTh?: string;
  descriptionEn?: string;
}

export interface WorkflowPreset {
  id: WorkflowPresetId;
  name: string;
  familyId: EngineFamilyId;
  summaryTh: string;
  summaryEn: string;
  exposedInputsTh: string[];
  exposedInputsEn: string[];
  modelsUsed: ModelSpec[];
  parameters: ParameterDefinition[];
  internalParamsCount: number;
  mockWorkflowPath: string;
  isInstrumentalOnly?: boolean;
  hasScoreEditor?: boolean;
  evidenceStatus?: 'workflow-verified' | 'workflow-discovered' | string;
  internalDefaults?: Record<string, any>;
}

export interface EngineFamily {
  id: EngineFamilyId;
  name: string;
  badge: string;
  descriptionTh: string;
  descriptionEn: string;
  presets: WorkflowPreset[];
}

export type RenderStatus = 'queued' | 'processing' | 'verifying' | 'completed' | 'failed';

export interface RenderJob {
  id: string;
  createdAt: string;
  blueprintVersion: string;
  trackName: string;
  familyId: EngineFamilyId;
  presetId: WorkflowPresetId;
  presetName: string;
  seed: number;
  duration: number;
  format: 'MP3 V0' | 'WAV 24-bit' | 'FLAC';
  status: RenderStatus;
  progress: number;
  audioSampleRate?: string;
  waveformSample: number[];
  audioFrequency?: number;
  promptId?: string;
  audioUrl?: string;
  isLive?: boolean;
  error?: string;
  verificationNote?: string;
  lastCheckedAt?: string;
  parametersSnapshot: Record<string, any>;
  promptSnippet: string;
}

export interface CompareEvaluation {
  id: string;
  date: string;
  trackName: string;
  renderA: RenderJob;
  renderB: RenderJob;
  ratings: {
    styleMatch: number;
    lyricsClarity: number;
    thaiPronunciation: number;
    vocalQuality: number;
    arrangementFlow: number;
    emotionImpact: number;
    durationFidelity: number;
  };
  preferred: 'A' | 'B' | 'Tie';
  notes: string;
}

export interface LibraryVersion {
  id: string;
  projectId: string;
  projectName: string;
  trackId: string;
  trackName: string;
  version: string;
  status: SongStatus;
  createdAt: string;
  songSnapshot: SongData;
  renderIds: string[];
  preference?: 'A' | 'B' | 'Tie';
  tags: string[];
  duration: number;
}

export interface ReferenceCard {
  id: string;
  category: 'factory' | 'custom';
  familyTarget: EngineFamilyId;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  artistProfileTh: string;
  artistProfileEn: string;
  themeTh: string;
  themeEn: string;
  tags: Record<TagCategory, string[]>;
  musicDirectionTh: string;
  musicDirectionEn: string;
  sampleLyricsExcerptTh: string;
  sampleLyricsExcerptEn: string;
  arrangementTemplateName: string;
  defaultDuration: number;
}

export type AiAssistTarget = 
  | 'profile'
  | 'theme'
  | 'tags'
  | 'style'
  | 'lyrics'
  | 'arrangement';
