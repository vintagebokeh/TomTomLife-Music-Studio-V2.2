import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Language,
  ThemeMode,
  WorkspaceTab,
  SongData,
  EngineFamilyId,
  WorkflowPresetId,
  TagCategory,
  LyricSection,
  ArrangementNode,
  RenderJob,
  CompareEvaluation,
  LibraryVersion,
  AiAssistTarget,
} from '../types';
import {
  initialSongData,
  engineRegistry,
  initialRenderJobs,
  initialCompareEvaluation,
  initialLibraryVersions,
  referenceCards,
} from '../data/mockData';
import { translations, TranslationSchema } from '../i18n/translations';
import { formatLyricsForYuE2, formatLyricsForMiniMax, formatStyleForYuE2, formatStyleForMiniMax } from '../utils/formatters';

interface AiModelOption {
  name: string;
  label?: string;
  source?: string;
  verified?: boolean;
  model?: string;
  remote_model?: string;
  cloud?: boolean;
  details?: {
    parameter_size?: string;
    quantization_level?: string;
    context_length?: number;
  };
}

interface AiProviderOption {
  id: 'comfyui' | 'ollama' | string;
  name: string;
  online?: boolean;
  default_model?: string;
  models?: AiModelOption[];
  capabilities?: Record<string, boolean>;
}

interface BackendHealth {
  ok?: boolean;
  service?: string;
  version?: string;
  comfy_backend?: string;
  ai_lab_backend?: string;
  comfy?: any;
  ai_lab?: any;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface StudioContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  t: TranslationSchema;

  // Live backend / AI
  apiBaseUrl: string;
  aiProviders: AiProviderOption[];
  aiProvider: string;
  setAiProvider: (provider: string) => void;
  aiModels: AiModelOption[];
  aiModelsLoading: boolean;
  aiModel: string;
  setAiModel: (model: string) => void;
  backendHealth: BackendHealth | null;
  backendOnline: boolean;
  refreshBackendStatus: () => Promise<void>;

  // Workspace Song Data
  songData: SongData;
  updateSongData: (updater: Partial<SongData> | ((prev: SongData) => SongData)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetDemo: () => void;

  // Tag Palette
  toggleTag: (category: TagCategory, tag: string) => void;
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  aiSuggestTags: () => void;

  // Music Direction
  aiEditStyleOnly: () => void;

  // Lyrics Studio
  updateLyricText: (id: string, text: string) => void;
  toggleLyricLock: (id: string) => void;
  duplicateLyricSection: (id: string) => void;
  deleteLyricSection: (id: string) => void;
  addLyricSection: () => void;
  aiRewriteSection: (id: string) => void;
  aiGenerateLyricsAll: () => void;

  // Arrangement Builder
  updateArrangementNode: (id: string, updates: Partial<ArrangementNode>) => void;
  adjustNodeDuration: (id: string, delta: number) => void;
  reorderArrangementNodes: (startIndex: number, endIndex: number) => void;
  duplicateArrangementNode: (id: string) => void;
  deleteArrangementNode: (id: string) => void;
  addArrangementNode: () => void;
  aiArrange: (brief?: string) => void;
  saveArrangementTemplate: () => void;

  // Engine & Presets
  selectedFamilyId: EngineFamilyId;
  setSelectedFamilyId: (id: EngineFamilyId) => void;
  selectedPresetId: WorkflowPresetId;
  setSelectedPresetId: (id: WorkflowPresetId) => void;
  parameterVisibility: 'basic' | 'advanced' | 'internal';
  setParameterVisibility: (v: 'basic' | 'advanced' | 'internal') => void;
  workflowInfoDrawerOpen: boolean;
  setWorkflowInfoDrawerOpen: (open: boolean) => void;
  engineParamOverrides: Record<string, any>;
  setEngineParamOverride: (key: string, value: any) => void;

  // Render Queue
  renderJobs: RenderJob[];
  startSingleRender: () => void;
  startAbRender: () => void;
  refreshRenderJob: (id: string) => Promise<void>;
  refreshPendingRenderJobs: (notify?: boolean) => Promise<void>;
  dismissRenderJob: (id: string) => void;
  clearFailedRenderJobs: () => void;

  // Compare Studio
  compareEvaluation: CompareEvaluation;
  updateCompareEvaluation: (updates: Partial<CompareEvaluation>) => void;
  savedEvaluations: CompareEvaluation[];
  saveCurrentEvaluation: () => void;

  // Library
  libraryVersions: LibraryVersion[];
  forkVersion: (verId: string) => void;
  loadVersionToWorkspace: (verId: string) => void;

  // Source / References
  applyReferenceToWorkspace: (refId: string) => void;

  // AI Section Assistant (scoped)
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  aiTarget: AiAssistTarget;
  setAiTarget: (target: AiAssistTarget) => void;
  aiDraft: string | null;
  aiDraftLoading: boolean;
  generateScopedDraft: (prompt: string) => void;
  applyScopedDraft: () => void;

  // AI Director (whole song redesign)
  directorModalOpen: boolean;
  setDirectorModalOpen: (open: boolean) => void;
  directorDraft: SongData | null;
  directorLoading: boolean;
  generateDirectorDraft: (brief: string, keepProfile: boolean, preserveLocked: boolean) => void;
  confirmDirectorReplace: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const StudioContext = createContext<StudioContextType | null>(null);

const STORAGE_KEYS = {
  LANG: 'tomtomlife_lang_v2',
  THEME: 'tomtomlife_theme_v2',
  SONG: 'tomtomlife_song_v2',
  ENGINE_FAMILY: 'tomtomlife_family_v2',
  ENGINE_PRESET: 'tomtomlife_preset_v2',
  RENDERS: 'tomtomlife_renders_v2',
  EVALS: 'tomtomlife_evals_v2',
  LIBRARY: 'tomtomlife_lib_v2',
  AI_PROVIDER: 'tomtomlife_ai_provider_v2',
  AI_MODEL: 'tomtomlife_ai_model_v2',
};

const API_BASE_URL = 'http://127.0.0.1:3012';

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language: Default TH
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'en' ? 'en' : 'th';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    document.documentElement.lang = lang;
    document.title = lang === 'th' ? translations.th.appTitle : translations.en.appTitle;
  }, []);

  // 2. Theme: Default dark DAW aesthetic
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'light' ? 'light' : 'dark';
  });

  const setTheme = useCallback((tMode: ThemeMode) => {
    setThemeState(tMode);
    localStorage.setItem(STORAGE_KEYS.THEME, tMode);
    if (tMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.lang = language;
    document.title = language === 'th' ? translations.th.appTitle : translations.en.appTitle;
  }, [theme, language]);

  // 2.5 Live backend / AI model registry
  const apiBaseUrl = API_BASE_URL;
  const [aiProviders, setAiProviders] = useState<AiProviderOption[]>([]);
  const [aiProvider, setAiProviderState] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.AI_PROVIDER) || 'comfyui');
  const [aiModels, setAiModels] = useState<AiModelOption[]>([]);
  const [aiModelsLoading, setAiModelsLoading] = useState<boolean>(true);
  const [aiModel, setAiModelState] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.AI_MODEL) || 'qwen3.5_4b_int8_convrot.safetensors');
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const setAiModel = useCallback((model: string) => {
    setAiModelState(model);
    localStorage.setItem(STORAGE_KEYS.AI_MODEL, model);
  }, []);

  const setAiProvider = useCallback((provider: string) => {
    setAiProviderState(provider);
    localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, provider);
    const found = aiProviders.find((item) => item.id === provider);
    const list = Array.isArray(found?.models) ? found!.models! : [];
    setAiModels(list);
    const names = list.map((item) => item.name || item.model).filter(Boolean) as string[];
    if (names.length) {
      const preferred = found?.default_model && names.includes(found.default_model)
        ? found.default_model
        : (provider === 'ollama' && names.includes('gpt-oss:120b-cloud') ? 'gpt-oss:120b-cloud' : names[0]);
      setAiModel(preferred);
    }
  }, [aiProviders, setAiModel]);

  const refreshBackendStatus = useCallback(async () => {
    setAiModelsLoading(true);
    try {
      const [healthRes, providersRes] = await Promise.all([
        fetch(API_BASE_URL + '/api/health', { cache: 'no-store' }),
        fetch(API_BASE_URL + '/api/ai/providers', { cache: 'no-store' }),
      ]);
      if (!healthRes.ok) throw new Error('Health HTTP ' + healthRes.status);
      const health = await healthRes.json();
      setBackendHealth(health);
      setBackendOnline(Boolean(health?.ok && health?.comfy));

      if (providersRes.ok) {
        const providerData = await providersRes.json();
        const providers: AiProviderOption[] = Array.isArray(providerData?.providers) ? providerData.providers : [];
        setAiProviders(providers);
        const selected = providers.find((item) => item.id === aiProvider)
          || providers.find((item) => item.id === providerData?.default_provider)
          || providers[0];
        if (selected) {
          if (selected.id !== aiProvider) {
            setAiProviderState(selected.id);
            localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, selected.id);
          }
          const list = Array.isArray(selected.models) ? selected.models : [];
          setAiModels(list);
          const names = list.map((item) => item.name || item.model).filter(Boolean) as string[];
          if (names.length && !names.includes(aiModel)) {
            const preferred = selected.default_model && names.includes(selected.default_model)
              ? selected.default_model
              : (selected.id === 'ollama' && names.includes('gpt-oss:120b-cloud') ? 'gpt-oss:120b-cloud' : names[0]);
            setAiModel(preferred);
          }
        }
      }
    } catch (error) {
      setBackendOnline(false);
      setBackendHealth(null);
      console.warn('TomTomLife backend health check failed', error);
    } finally {
      setAiModelsLoading(false);
    }
  }, [aiProvider, aiModel, setAiModel]);

  useEffect(() => {
    refreshBackendStatus();
  }, []);
  // 3. Navigation
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('blueprint');

  // 4. Song Workspace & Undo/Redo
  const [songData, setSongDataState] = useState<SongData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SONG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialSongData;
  });

  const [undoStack, setUndoStack] = useState<SongData[]>([]);
  const [redoStack, setRedoStack] = useState<SongData[]>([]);

  const pushToUndo = useCallback((prev: SongData) => {
    setUndoStack((stack) => [...stack.slice(-20), JSON.parse(JSON.stringify(prev))]);
    setRedoStack([]);
  }, []);

  const updateSongData = useCallback((updater: Partial<SongData> | ((prev: SongData) => SongData)) => {
    setSongDataState((prev) => {
      pushToUndo(prev);
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem(STORAGE_KEYS.SONG, JSON.stringify(next));
      return next;
    });
  }, [pushToUndo]);

  const undo = useCallback(() => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      const previousState = prevUndo[prevUndo.length - 1];
      const newUndo = prevUndo.slice(0, prevUndo.length - 1);
      setRedoStack((prevRedo) => [...prevRedo, JSON.parse(JSON.stringify(songData))]);
      setSongDataState(previousState);
      localStorage.setItem(STORAGE_KEYS.SONG, JSON.stringify(previousState));
      return newUndo;
    });
  }, [songData]);

  const redo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const nextState = prevRedo[prevRedo.length - 1];
      const newRedo = prevRedo.slice(0, prevRedo.length - 1);
      setUndoStack((prevUndo) => [...prevUndo, JSON.parse(JSON.stringify(songData))]);
      setSongDataState(nextState);
      localStorage.setItem(STORAGE_KEYS.SONG, JSON.stringify(nextState));
      return newRedo;
    });
  }, [songData]);

  // 5. Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 6. Reset Demo
  const resetDemo = useCallback(() => {
    pushToUndo(songData);
    setSongDataState(initialSongData);
    localStorage.setItem(STORAGE_KEYS.SONG, JSON.stringify(initialSongData));
    showToast(language === 'th' ? 'รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว' : 'Demo data reset successfully', 'info');
  }, [songData, language, pushToUndo, showToast]);

  // 7. Tag Palette
  const toggleTag = useCallback((category: TagCategory, tag: string) => {
    updateSongData((prev) => {
      const currentList = prev.selectedTags[category] || [];
      const exists = currentList.includes(tag);
      const updatedList = exists ? currentList.filter((t) => t !== tag) : [...currentList, tag];
      return {
        ...prev,
        selectedTags: {
          ...prev.selectedTags,
          [category]: updatedList,
        },
      };
    });
  }, [updateSongData]);

  const addCustomTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    updateSongData((prev) => {
      if (prev.customTags.includes(trimmed)) return prev;
      return {
        ...prev,
        customTags: [...prev.customTags, trimmed],
      };
    });
    showToast(language === 'th' ? `เพิ่มแท็ก "${trimmed}" แล้ว` : `Added tag "${trimmed}"`, 'success');
  }, [updateSongData, language, showToast]);

  const removeCustomTag = useCallback((tag: string) => {
    updateSongData((prev) => ({
      ...prev,
      customTags: prev.customTags.filter((t) => t !== tag),
    }));
  }, [updateSongData]);

  const aiSuggestTags = useCallback(() => {
    setAiTarget('tags');
    setAiDrawerOpen(true);
    setAiDraft(null);
    setAiDraftPayload(null);
    showToast(language === 'th' ? 'เปิด Live AI สำหรับ Tags แล้ว' : 'Opened Live AI for Tags', 'info');
  }, [language, showToast]);

  // 8. Music Direction (Style Only AI)
  const aiEditStyleOnly = useCallback(() => {
    setAiTarget('style');
    setAiDrawerOpen(true);
    setAiDraft(null);
    setAiDraftPayload(null);
    showToast(language === 'th' ? 'เปิด Live AI สำหรับ Style แล้ว' : 'Opened Live AI for Style', 'info');
  }, [language, showToast]);

  // 9. Lyrics Studio
  const updateLyricText = useCallback((id: string, text: string) => {
    updateSongData((prev) => ({
      ...prev,
      canonicalLyrics: prev.canonicalLyrics.map((sec) => (sec.id === id ? { ...sec, text } : sec)),
    }));
  }, [updateSongData]);

  const toggleLyricLock = useCallback((id: string) => {
    updateSongData((prev) => ({
      ...prev,
      canonicalLyrics: prev.canonicalLyrics.map((sec) => (sec.id === id ? { ...sec, locked: !sec.locked } : sec)),
    }));
  }, [updateSongData]);

  const duplicateLyricSection = useCallback((id: string) => {
    updateSongData((prev) => {
      const idx = prev.canonicalLyrics.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const target = prev.canonicalLyrics[idx];
      const newSec: LyricSection = {
        ...target,
        id: 'sec-' + Math.random().toString(36).substring(2, 8),
        title: `${target.title} (Copy)`,
        locked: false,
      };
      const list = [...prev.canonicalLyrics];
      list.splice(idx + 1, 0, newSec);
      return { ...prev, canonicalLyrics: list };
    });
    showToast(language === 'th' ? 'ทำสำเนาท่อนเนื้อเพลงเรียบร้อย' : 'Duplicated lyric section', 'info');
  }, [updateSongData, language, showToast]);

  const deleteLyricSection = useCallback((id: string) => {
    updateSongData((prev) => {
      const target = prev.canonicalLyrics.find((s) => s.id === id);
      if (target?.locked) {
        showToast(language === 'th' ? 'ท่อนนี้ถูกล็อกไว้ ไม่สามารถลบได้' : 'Section is locked, cannot delete', 'warning');
        return prev;
      }
      return {
        ...prev,
        canonicalLyrics: prev.canonicalLyrics.filter((s) => s.id !== id),
        arrangement: prev.arrangement.filter((arr) => arr.lyricSectionId !== id),
      };
    });
    showToast(language === 'th' ? 'ลบท่อนเนื้อเพลงแล้ว' : 'Deleted lyric section', 'info');
  }, [updateSongData, language, showToast]);

  const addLyricSection = useCallback(() => {
    updateSongData((prev) => {
      const newSec: LyricSection = {
        id: 'sec-' + Math.random().toString(36).substring(2, 8),
        type: 'custom',
        title: `Custom Section ${prev.canonicalLyrics.length + 1}`,
        text: language === 'th' ? 'พิมพ์คำร้องที่นี่...' : 'Enter lyric line here...',
        locked: false,
      };
      return {
        ...prev,
        canonicalLyrics: [...prev.canonicalLyrics, newSec],
      };
    });
    showToast(language === 'th' ? 'เพิ่มท่อนเนื้อร้องใหม่แล้ว' : 'Added new lyric section', 'success');
  }, [updateSongData, language, showToast]);

  const aiRewriteSection = useCallback((id: string) => {
    const sec = songData.canonicalLyrics.find((item) => item.id === id);
    if (sec?.locked) {
      showToast(language === 'th' ? 'ท่อนนี้ถูกล็อกไว้' : 'Section is locked', 'warning');
      return;
    }
    setAiTarget('lyrics');
    setAiDrawerOpen(true);
    setAiDraft(null);
    setAiDraftPayload(null);
    showToast(
      language === 'th'
        ? 'เปิด Live AI สำหรับ Lyrics · ระบุให้แก้เฉพาะท่อน ' + (sec?.title || '')
        : 'Opened Live AI for Lyrics · request only ' + (sec?.title || 'this section'),
      'info'
    );
  }, [songData.canonicalLyrics, language, showToast]);

  const aiGenerateLyricsAll = useCallback(() => {
    setAiTarget('lyrics');
    setAiDrawerOpen(true);
    setAiDraft(null);
    setAiDraftPayload(null);
    showToast(language === 'th' ? 'เปิด Live AI สำหรับ Lyrics แล้ว' : 'Opened Live AI for Lyrics', 'info');
  }, [language, showToast]);

  // 10. Arrangement Builder
  const updateArrangementNode = useCallback((id: string, updates: Partial<ArrangementNode>) => {
    updateSongData((prev) => {
      const updatedNodes = prev.arrangement.map((n) => (n.id === id ? { ...n, ...updates } : n));
      const totalSec = updatedNodes.reduce((acc, curr) => acc + curr.targetSeconds, 0);
      return { ...prev, arrangement: updatedNodes, durationIntent: totalSec };
    });
  }, [updateSongData]);

  const adjustNodeDuration = useCallback((id: string, delta: number) => {
    updateSongData((prev) => {
      const node = prev.arrangement.find((n) => n.id === id);
      if (node?.locked) {
        showToast(language === 'th' ? 'ท่อนนี้ถูกล็อกไว้ ไม่สามารถปรับเวลาได้' : 'Section locked, cannot adjust time', 'warning');
        return prev;
      }
      const updatedNodes = prev.arrangement.map((n) => {
        if (n.id === id) {
          const newSec = Math.max(5, Math.min(180, n.targetSeconds + delta));
          return { ...n, targetSeconds: newSec };
        }
        return n;
      });
      const totalSec = updatedNodes.reduce((acc, curr) => acc + curr.targetSeconds, 0);
      return { ...prev, arrangement: updatedNodes, durationIntent: totalSec };
    });
  }, [updateSongData, language, showToast]);

  const reorderArrangementNodes = useCallback((startIndex: number, endIndex: number) => {
    updateSongData((prev) => {
      const list = [...prev.arrangement];
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
      return { ...prev, arrangement: list };
    });
  }, [updateSongData]);

  const duplicateArrangementNode = useCallback((id: string) => {
    updateSongData((prev) => {
      const idx = prev.arrangement.findIndex((n) => n.id === id);
      if (idx === -1) return prev;
      const target = prev.arrangement[idx];
      const newNode: ArrangementNode = {
        ...target,
        id: 'arr-' + Math.random().toString(36).substring(2, 8),
        name: `${target.name} (Repeat)`,
        locked: false,
      };
      const list = [...prev.arrangement];
      list.splice(idx + 1, 0, newNode);
      const totalSec = list.reduce((acc, curr) => acc + curr.targetSeconds, 0);
      return { ...prev, arrangement: list, durationIntent: totalSec };
    });
    showToast(language === 'th' ? 'ทำสำเนาท่อนโครงสร้างแล้ว' : 'Duplicated arrangement node', 'info');
  }, [updateSongData, language, showToast]);

  const deleteArrangementNode = useCallback((id: string) => {
    updateSongData((prev) => {
      if (prev.arrangement.length <= 1) {
        showToast(language === 'th' ? 'ต้องมีท่อนโครงสร้างอย่างน้อย 1 ท่อน' : 'Must keep at least 1 section', 'warning');
        return prev;
      }
      const target = prev.arrangement.find((n) => n.id === id);
      if (target?.locked) {
        showToast(language === 'th' ? 'ท่อนนี้ถูกล็อกไว้ ไม่สามารถลบได้' : 'Section is locked, cannot delete', 'warning');
        return prev;
      }
      const list = prev.arrangement.filter((n) => n.id !== id);
      const totalSec = list.reduce((acc, curr) => acc + curr.targetSeconds, 0);
      return { ...prev, arrangement: list, durationIntent: totalSec };
    });
    showToast(language === 'th' ? 'ลบท่อนโครงสร้างแล้ว' : 'Deleted arrangement node', 'info');
  }, [updateSongData, language, showToast]);

  const addArrangementNode = useCallback(() => {
    updateSongData((prev) => {
      const defaultSec = prev.canonicalLyrics[0] || { id: 'sec-intro', title: 'Intro' };
      const newNode: ArrangementNode = {
        id: 'arr-' + Math.random().toString(36).substring(2, 8),
        lyricSectionId: defaultSec.id,
        name: `Interlude / New Section`,
        role: 'Acoustic Guitar Bridge or Solo',
        targetSeconds: 30,
        locked: false,
      };
      const list = [...prev.arrangement, newNode];
      const totalSec = list.reduce((acc, curr) => acc + curr.targetSeconds, 0);
      return { ...prev, arrangement: list, durationIntent: totalSec };
    });
    showToast(language === 'th' ? 'เพิ่มท่อนโครงสร้างใหม่แล้ว' : 'Added arrangement section', 'success');
  }, [updateSongData, language, showToast]);

  const aiArrange = useCallback((_brief?: string) => {
    setAiTarget('arrangement');
    setAiDrawerOpen(true);
    setAiDraft(null);
    setAiDraftPayload(null);
    showToast(language === 'th' ? 'เปิด Live AI สำหรับ Arrangement แล้ว' : 'Opened Live AI for Arrangement', 'info');
  }, [language, showToast]);

  const saveArrangementTemplate = useCallback(() => {
    showToast(
      language === 'th' ? `บันทึกเทมเพลตโครงสร้าง "${songData.arrangement.length} ท่อน (${songData.durationIntent} วินาที)" สำเร็จ` : `Saved arrangement template "${songData.arrangement.length} sections (${songData.durationIntent}s)"`,
      'success'
    );
  }, [songData.arrangement.length, songData.durationIntent, language, showToast]);

  // 11. Engine & Presets
  const [selectedFamilyId, setSelectedFamilyId] = useState<EngineFamilyId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENGINE_FAMILY) as EngineFamilyId;
    return saved === 'yue2' || saved === 'minimax_music3' ? saved : 'minimax_music3';
  });

  const [selectedPresetId, setSelectedPresetId] = useState<WorkflowPresetId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENGINE_PRESET) as WorkflowPresetId;
    return saved || 'minimax3-allinone-thai';
  });

  const [parameterVisibility, setParameterVisibility] = useState<'basic' | 'advanced' | 'internal'>('basic');
  const [workflowInfoDrawerOpen, setWorkflowInfoDrawerOpen] = useState<boolean>(false);
  const [engineParamOverrides, setEngineParamOverrides] = useState<Record<string, any>>({});

  const setEngineParamOverride = useCallback((key: string, value: any) => {
    setEngineParamOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectFamily = useCallback((familyId: EngineFamilyId) => {
    setSelectedFamilyId(familyId);
    localStorage.setItem(STORAGE_KEYS.ENGINE_FAMILY, familyId);
    const family = engineRegistry.find((f) => f.id === familyId);
    if (family && family.presets.length > 0) {
      setSelectedPresetId(family.presets[0].id);
      localStorage.setItem(STORAGE_KEYS.ENGINE_PRESET, family.presets[0].id);
    }
  }, []);

  const handleSelectPreset = useCallback((presetId: WorkflowPresetId) => {
    setSelectedPresetId(presetId);
    localStorage.setItem(STORAGE_KEYS.ENGINE_PRESET, presetId);
  }, []);

  // 12. Render Queue — LIVE via 3012 → ComfyUI
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RENDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((job) => job?.isLive === true);
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RENDERS, JSON.stringify(renderJobs));
  }, [renderJobs]);

  // Failed render housekeeping only affects the Render page/local history.
  // Backend Evidence Library is intentionally preserved for audit/debug evidence.
  const dismissRenderJob = useCallback((id: string) => {
    setRenderJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const clearFailedRenderJobs = useCallback(() => {
    setRenderJobs((prev) => prev.filter((job) => job.status !== 'failed'));
  }, []);

  const inspectRenderEvidence = useCallback(async (job: RenderJob): Promise<RenderJob> => {
    const checkedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!job.promptId) {
      return {
        ...job,
        status: 'verifying',
        verificationNote: 'No prompt_id is available yet; cannot verify against ComfyUI history.',
        lastCheckedAt: checkedAt,
      };
    }

    try {
      const statusRes = await fetch(API_BASE_URL + '/api/jobs/' + encodeURIComponent(job.promptId), { cache: 'no-store' });
      if (!statusRes.ok) {
        return {
          ...job,
          status: 'verifying',
          verificationNote: 'Status check HTTP ' + statusRes.status + '; result is not classified as failed.',
          lastCheckedAt: checkedAt,
        };
      }
      const statusData = await statusRes.json();
      const audioUrl = statusData?.audio_url ? API_BASE_URL + statusData.audio_url : undefined;
      const historyEntries = Object.values(statusData?.history || {}) as any[];
      const historyStatus = String(historyEntries[0]?.status?.status_str || '');

      if (audioUrl) {
        return {
          ...job,
          audioUrl,
          status: 'completed',
          progress: 100,
          error: undefined,
          verificationNote: 'Verified from backend audio output + ComfyUI history.',
          lastCheckedAt: checkedAt,
          isLive: true,
        };
      }

      if (statusData?.complete) {
        if (historyStatus === 'error') {
          return {
            ...job,
            status: 'failed',
            progress: 100,
            error: 'ComfyUI history reports a terminal error and no audio output was produced.',
            verificationNote: 'Terminal ComfyUI error verified from history.',
            lastCheckedAt: checkedAt,
          };
        }
        if (historyStatus === 'success') {
          return {
            ...job,
            status: 'failed',
            progress: 100,
            error: 'ComfyUI completed successfully but no audio output was found.',
            verificationNote: 'Terminal success history exists, but SaveAudio output is missing.',
            lastCheckedAt: checkedAt,
          };
        }
        return {
          ...job,
          status: 'verifying',
          verificationNote: 'Terminal history exists but audio evidence is not resolved yet.',
          lastCheckedAt: checkedAt,
        };
      }

      return {
        ...job,
        status: job.status === 'verifying' ? 'verifying' : 'processing',
        progress: Math.max(job.progress || 0, 8),
        error: undefined,
        verificationNote: 'ComfyUI has not reported a terminal result yet.',
        lastCheckedAt: checkedAt,
      };
    } catch (error) {
      return {
        ...job,
        status: 'verifying',
        verificationNote: 'Status check unavailable: ' + (error instanceof Error ? error.message : String(error)),
        lastCheckedAt: checkedAt,
      };
    }
  }, []);

  const refreshRenderJob = useCallback(async (id: string) => {
    const target = renderJobs.find((job) => job.id === id);
    if (!target) return;
    const verified = await inspectRenderEvidence(target);
    setRenderJobs((prev) => prev.map((job) => job.id === id ? verified : job));
    showToast(
      verified.status === 'completed'
        ? (language === 'th' ? 'ตรวจหลักฐานแล้ว: งานสำเร็จและพบไฟล์เสียงจริง' : 'Evidence verified: render completed with real audio output.')
        : verified.status === 'failed'
        ? (language === 'th' ? 'ตรวจหลักฐานแล้ว: งานล้มเหลวจริง' : 'Evidence verified: render failed.')
        : (language === 'th' ? 'ยังไม่มีหลักฐานปลายทาง งานจะอยู่ในสถานะรอตรวจสอบต่อ' : 'No terminal evidence yet. The job remains pending verification.'),
      verified.status === 'completed' ? 'success' : 'info'
    );
  }, [renderJobs, inspectRenderEvidence, language, showToast]);

  const refreshPendingRenderJobs = useCallback(async (notify = true) => {
    const pending = renderJobs.filter((job) =>
      (job.status === 'queued' || job.status === 'processing' || job.status === 'verifying') && Boolean(job.promptId)
    );
    if (!pending.length) {
      if (notify) showToast(language === 'th' ? 'ไม่มีงานค้างที่มี prompt_id ให้ตรวจสอบ' : 'No pending jobs with prompt_id to verify.', 'info');
      return;
    }

    const verified = await Promise.all(pending.map((job) => inspectRenderEvidence(job)));
    const byId = new Map(verified.map((job) => [job.id, job]));
    setRenderJobs((prev) => prev.map((job) => byId.get(job.id) || job));

    if (notify) {
      const completedCount = verified.filter((job) => job.status === 'completed').length;
      const failedCount = verified.filter((job) => job.status === 'failed').length;
      const waitingCount = verified.length - completedCount - failedCount;
      showToast(
        language === 'th'
          ? `ตรวจหลักฐานแล้ว: สำเร็จ ${completedCount} · ล้มเหลว ${failedCount} · ยังรอ ${waitingCount}`
          : `Evidence check: ${completedCount} completed · ${failedCount} failed · ${waitingCount} still pending`,
        completedCount > 0 ? 'success' : 'info'
      );
    }
  }, [renderJobs, inspectRenderEvidence, language, showToast]);

  const didInitialRenderReconcileRef = useRef(false);
  useEffect(() => {
    const hasPending = renderJobs.some((job) =>
      (job.status === 'queued' || job.status === 'processing' || job.status === 'verifying') && Boolean(job.promptId)
    );
    if (!hasPending || didInitialRenderReconcileRef.current) return;
    didInitialRenderReconcileRef.current = true;
    const timer = window.setTimeout(() => { void refreshPendingRenderJobs(false); }, 1200);
    return () => window.clearTimeout(timer);
  }, [renderJobs, refreshPendingRenderJobs]);

  useEffect(() => {
    const hasPending = renderJobs.some((job) =>
      (job.status === 'queued' || job.status === 'processing' || job.status === 'verifying') && Boolean(job.promptId)
    );
    if (!hasPending) return;
    const timer = window.setInterval(() => { void refreshPendingRenderJobs(false); }, 60000);
    return () => window.clearInterval(timer);
  }, [renderJobs, refreshPendingRenderJobs]);

  const buildLivePayload = useCallback((familyId: EngineFamilyId, overrides: Record<string, any> = {}) => {
    const isYuE2 = familyId === 'yue2';
    const lyricsLanguageCodeMap: Record<string,string> = { auto:'auto', thai:'th', english:'en', japanese:'ja', chinese:'zh', korean:'ko' };
    const style = isYuE2 ? formatStyleForYuE2(songData) : formatStyleForMiniMax(songData);
    const lyrics = isYuE2 ? formatLyricsForYuE2(songData) : formatLyricsForMiniMax(songData);
    const advanced = isYuE2
      ? {
          max_score_tokens: Number(overrides.abc_max_tokens ?? overrides.max_score_tokens ?? 4096),
          acoustic_steps: Number(overrides.acoustic_steps ?? overrides.sampler_steps ?? 32),
          temperature: Number(overrides.music_temperature ?? overrides.temperature ?? 1),
          top_p: Number(overrides.music_top_p ?? overrides.top_p ?? 0.95),
          top_k: Number(overrides.music_top_k ?? overrides.top_k ?? 100),
          repetition_penalty: Number(overrides.music_repetition_penalty ?? overrides.repetition_penalty ?? 1.2),
          guidance: Number(overrides.music_cfg_scale ?? overrides.guidance ?? 1),
          tile_frames: Number(overrides.tile_frames ?? 1024),
          score_abc: String(overrides.score_abc || ''),
        }
      : {
          cfg_scale: Number(overrides.cfg_scale ?? 1.7),
          top_k: Number(overrides.top_k ?? 50),
          sampler_steps: Number(overrides.sampler_steps ?? 30),
          sampler_cfg: Number(overrides.sampler_cfg ?? 1.7),
          sampler_name: String(overrides.sampler ?? overrides.sampler_name ?? 'euler'),
          scheduler: String(overrides.scheduler ?? 'simple'),
          denoise: Number(overrides.denoise ?? 1),
          decode_mode: String(overrides.decode_mode ?? 'Low VRAM / Tiled'),
          tile_size: Number(overrides.tile_size ?? 1536),
          tile_overlap: Number(overrides.tile_overlap ?? 64),
          output_format: 'FLAC',
        };

    return {
      source: 'google-ai-studio-v2.2',
      project: {
        id: songData.projectTitle || 'tomtomlife-project',
        name: songData.trackName || songData.projectTitle || 'Untitled Track',
        version: Number(String(songData.version).match(/\d+/)?.[0] || 1),
      },
      orchestration: {
        requested_by: 'TomTomLife Music Studio V2.2',
        target_duration_seconds: songData.durationIntent,
        arrangement_sections: songData.arrangement.map((node) => ({
          id: node.id,
          label: node.name,
          target_seconds: node.targetSeconds,
          role: node.role,
        })),
        ai_director_model: aiProvider + ':' + aiModel,
      },
      engine: familyId,
      mode: songData.instrumental ? 'instrumental' : 'song',
      instrumental_strategy: songData.instrumental && isYuE2 ? 'strict' : undefined,
      lyrics_language: lyricsLanguageCodeMap[songData.lyricsLanguage] || 'auto',
      music_tags: {
        genre: songData.selectedTags.Genre || [],
        mood: songData.selectedTags.Mood || [],
        instruments: songData.selectedTags.Instruments || [],
        vocals: songData.selectedTags.Vocals || [],
        rhythm: songData.selectedTags.Rhythm || [],
        production: songData.selectedTags.Production || [],
        era: songData.selectedTags.Era || [],
      },
      style,
      lyrics,
      planning: isYuE2 ? String(overrides.planning_mode || 'full') : 'full',
      seed_behavior: 'fixed',
      seed: songData.seed,
      duration_seconds: songData.durationIntent,
      advanced,
    };
  }, [songData, aiProvider, aiModel]);

  const runLiveRender = useCallback(async (
    familyId: EngineFamilyId,
    presetId: WorkflowPresetId,
    presetName: string,
    overrides: Record<string, any> = {},
    suffix = ''
  ): Promise<RenderJob> => {
    const localId = 'render-live-' + familyId + '-' + Math.random().toString(36).substring(2, 8);
    const baseJob: RenderJob = {
      id: localId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + (suffix ? ' · ' + suffix : ''),
      blueprintVersion: songData.version,
      trackName: songData.trackName,
      familyId,
      presetId,
      presetName,
      seed: songData.seed,
      duration: songData.durationIntent,
      format: 'FLAC',
      status: 'queued',
      progress: 0,
      audioSampleRate: 'Live ComfyUI output',
      waveformSample: [18,28,36,51,67,78,72,61,83,91,86,74,65,58,70,82,88,76,59,43,30,20],
      parametersSnapshot: { ...overrides },
      promptSnippet: (familyId === 'yue2' ? formatStyleForYuE2(songData) : formatStyleForMiniMax(songData)).slice(0, 140) + '...',
      isLive: true,
    };

    setRenderJobs((prev) => [baseJob, ...prev]);
    let livePromptId = '';
    try {
      const response = await fetch(API_BASE_URL + '/api/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildLivePayload(familyId, overrides)),
      });
      if (!response.ok) throw new Error('Render submit HTTP ' + response.status);
      const submitted = await response.json();
      const promptId = String(submitted?.comfy?.prompt_id || '');
      if (!promptId) throw new Error('ComfyUI did not return prompt_id');
      livePromptId = promptId;

      let progress = 8;
      setRenderJobs((prev) => prev.map((job) =>
        job.id === localId ? { ...job, promptId, status: 'processing', progress } : job
      ));

      const deadline = Date.now() + 30 * 60 * 1000;
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const statusRes = await fetch(API_BASE_URL + '/api/jobs/' + encodeURIComponent(promptId), { cache: 'no-store' });
        if (!statusRes.ok) throw new Error('Render status HTTP ' + statusRes.status);
        const statusData = await statusRes.json();
        if (statusData?.complete) {
          const audioUrl = statusData.audio_url ? API_BASE_URL + statusData.audio_url : undefined;
          const completed: RenderJob = {
            ...baseJob,
            promptId,
            audioUrl,
            status: audioUrl ? 'completed' : 'failed',
            progress: 100,
            error: audioUrl ? undefined : 'ComfyUI completed without an audio output',
            isLive: true,
          };
          setRenderJobs((prev) => prev.map((job) => job.id === localId ? completed : job));
          return completed;
        }
        progress = Math.min(92, progress + 4);
        setRenderJobs((prev) => prev.map((job) =>
          job.id === localId ? { ...job, promptId, status: 'processing', progress } : job
        ));
      }
      const verifying: RenderJob = {
        ...baseJob,
        promptId: livePromptId,
        status: 'verifying',
        progress: 92,
        error: undefined,
        verificationNote: 'Fast polling window ended after 30 minutes. Timeout is not treated as failure; evidence will be checked later.',
        lastCheckedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLive: true,
      };
      setRenderJobs((prev) => prev.map((job) => job.id === localId ? verifying : job));
      return verifying;
    } catch (error) {
      const next: RenderJob = livePromptId
        ? {
            ...baseJob,
            promptId: livePromptId,
            status: 'verifying',
            progress: 92,
            error: undefined,
            verificationNote: 'Polling stopped before terminal evidence was confirmed: ' + (error instanceof Error ? error.message : String(error)),
            lastCheckedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isLive: true,
          }
        : {
            ...baseJob,
            status: 'failed',
            progress: 100,
            error: error instanceof Error ? error.message : String(error),
          };
      setRenderJobs((prev) => prev.map((job) => job.id === localId ? next : job));
      return next;
    }
  }, [songData, buildLivePayload]);

  const singleRenderInFlightRef = useRef(false);
  const [isSingleRendering, setIsSingleRendering] = useState(false);

  const startSingleRender = useCallback(async () => {
    if (singleRenderInFlightRef.current) {
      showToast(
        language === 'th' ? 'มีงานเรนเดอร์เดี่ยวกำลังทำงานอยู่' : 'A single render is already in progress.',
        'warning'
      );
      return;
    }

    singleRenderInFlightRef.current = true;
    setIsSingleRendering(true);
    try {
      const activeFamily = engineRegistry.find((f) => f.id === selectedFamilyId);
      const activePreset = activeFamily?.presets.find((p) => p.id === selectedPresetId);
      setActiveTab('render');
      showToast(
        language === 'th'
          ? 'ส่งงานจริงไปที่ ComfyUI แล้ว · ' + (activePreset?.name || selectedPresetId)
          : 'Submitted LIVE ComfyUI render · ' + (activePreset?.name || selectedPresetId),
        'info'
      );
      const completed = await runLiveRender(
        selectedFamilyId,
        selectedPresetId,
        activePreset?.name || 'Selected Preset',
        engineParamOverrides
      );
      showToast(
        completed.status === 'completed'
          ? (language === 'th' ? 'เรนเดอร์จริงเสร็จแล้ว พร้อมฟังไฟล์จาก ComfyUI' : 'LIVE render completed. Audio is ready.')
          : completed.status === 'failed'
          ? (language === 'th' ? 'ตรวจพบหลักฐานว่างานล้มเหลว: ' + (completed.error || '') : 'Evidence confirms render failure: ' + (completed.error || ''))
          : (language === 'th' ? 'งานยังไม่ถูกตัดสิน ระบบหยุดรอแบบถี่และจะตรวจหลักฐานย้อนหลัง' : 'Render is not terminal yet. Fast polling stopped; evidence will be rechecked later.'),
        completed.status === 'completed' ? 'success' : completed.status === 'failed' ? 'warning' : 'info'
      );
    } finally {
      singleRenderInFlightRef.current = false;
      setIsSingleRendering(false);
    }
  }, [selectedFamilyId, selectedPresetId, engineParamOverrides, language, showToast, runLiveRender]);

  const startAbRender = useCallback(async () => {
    setActiveTab('render');
    showToast(
      language === 'th'
        ? 'ส่ง A/B จริงเข้า ComfyUI: YuE2 + MiniMax Music 3'
        : 'Submitted LIVE A/B to ComfyUI: YuE2 + MiniMax Music 3',
      'info'
    );

    const [jobA, jobB] = await Promise.all([
      runLiveRender(
        'yue2',
        'yue2-song-full',
        'YuE2 · Song · Full Planning (A)',
        {
          planning_mode: 'full',
          max_score_tokens: 4096,
          acoustic_steps: 32,
          temperature: 1,
          top_p: 0.95,
          top_k: 100,
          repetition_penalty: 1.2,
          guidance: 1,
          tile_frames: 1024,
        },
        'A/B A'
      ),
      runLiveRender(
        'minimax_music3',
        'minimax3-allinone-thai',
        'MiniMax Music 3 · Live Adapter (B)',
        {
          cfg_scale: 1.7,
          top_k: 50,
          sampler_steps: 30,
          sampler_cfg: 1.7,
          sampler_name: 'euler',
          scheduler: 'simple',
          decode_mode: 'Low VRAM / Tiled',
          tile_size: 1536,
          tile_overlap: 64,
        },
        'A/B B'
      ),
    ]);

    setCompareEvaluation((prev) => {
      const nextEvaluation: CompareEvaluation = {
        ...prev,
        id: 'eval-live-' + Math.random().toString(36).substring(2, 8),
        date: new Date().toISOString().split('T')[0],
        trackName: songData.trackName,
        renderA: jobA,
        renderB: jobB,
        preferred: 'Tie',
        notes: '',
      };
      localStorage.setItem(STORAGE_KEYS.EVALS, JSON.stringify(nextEvaluation));
      return nextEvaluation;
    });

    const bothCompleted = jobA.status === 'completed' && jobB.status === 'completed';
    const anyFailed = jobA.status === 'failed' || jobB.status === 'failed';
    showToast(
      bothCompleted
        ? (language === 'th' ? 'A/B จริงเสร็จทั้งสองเอนจิน พร้อม Compare' : 'LIVE A/B completed. Ready to compare.')
        : anyFailed
        ? (language === 'th' ? 'A/B มีงานที่ยืนยันแล้วว่าล้มเหลว ตรวจ Render Queue' : 'A/B contains an evidence-confirmed failure. Check Render Queue.')
        : (language === 'th' ? 'A/B ยังรอหลักฐานปลายทาง ระบบจะตรวจสถานะย้อนหลังโดยไม่ตีว่า Failed' : 'A/B is still awaiting terminal evidence and will be rechecked later.'),
      bothCompleted ? 'success' : anyFailed ? 'warning' : 'info'
    );
    if (bothCompleted) setActiveTab('compare');
  }, [songData.trackName, language, showToast, runLiveRender]);

  // 13. Compare Studio
  const [compareEvaluation, setCompareEvaluation] = useState<CompareEvaluation>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialCompareEvaluation;
  });

  const [savedEvaluations, setSavedEvaluations] = useState<CompareEvaluation[]>([initialCompareEvaluation]);

  const updateCompareEvaluation = useCallback((updates: Partial<CompareEvaluation>) => {
    setCompareEvaluation((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.EVALS, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveCurrentEvaluation = useCallback(() => {
    const record: CompareEvaluation = {
      ...compareEvaluation,
      id: 'eval-' + Math.random().toString(36).substring(2, 8),
      date: new Date().toISOString().split('T')[0],
    };
    setSavedEvaluations((prev) => [record, ...prev]);
    showToast(
      language === 'th' ? 'บันทึกผลการประเมิน A/B เข้าสู่คลังเรียบร้อยแล้ว' : 'Saved A/B Evaluation record successfully',
      'success'
    );
  }, [compareEvaluation, language, showToast]);

  // 14. Library
  const [libraryVersions, setLibraryVersions] = useState<LibraryVersion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIBRARY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialLibraryVersions;
  });

  const forkVersion = useCallback((verId: string) => {
    const sourceVer = libraryVersions.find((v) => v.id === verId);
    if (!sourceVer) return;

    const newVersionTag = `${sourceVer.version}-fork.${Math.floor(Math.random() * 90 + 10)}`;
    const newVersion: LibraryVersion = {
      ...sourceVer,
      id: 'lib-ver-' + Math.random().toString(36).substring(2, 8),
      version: newVersionTag,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · เพิ่งสร้าง',
      status: 'Draft',
      songSnapshot: {
        ...sourceVer.songSnapshot,
        version: newVersionTag,
        status: 'Draft',
      },
    };

    setLibraryVersions((prev) => [newVersion, ...prev]);
    showToast(
      language === 'th' ? `แตกแขนงเวอร์ชันใหม่ "${newVersionTag}" สำเร็จ` : `Forked new version "${newVersionTag}"`,
      'success'
    );
  }, [libraryVersions, language, showToast]);

  const loadVersionToWorkspace = useCallback((verId: string) => {
    const targetVer = libraryVersions.find((v) => v.id === verId);
    if (!targetVer) return;
    pushToUndo(songData);
    setSongDataState(targetVer.songSnapshot);
    localStorage.setItem(STORAGE_KEYS.SONG, JSON.stringify(targetVer.songSnapshot));
    setActiveTab('blueprint');
    showToast(
      language === 'th' ? `โหลดเวอร์ชัน "${targetVer.version}" เข้าสู่ห้องทำเพลงแล้ว` : `Loaded version "${targetVer.version}" into workspace`,
      'success'
    );
  }, [libraryVersions, songData, pushToUndo, language, showToast]);

  // 15. Source / References
  const applyReferenceToWorkspace = useCallback((refId: string) => {
    const refCard = referenceCards.find((r) => r.id === refId);
    if (!refCard) return;

    pushToUndo(songData);
    updateSongData((prev) => {
      return {
        ...prev,
        trackName: language === 'th' ? refCard.titleTh : refCard.titleEn,
        brief: language === 'th' ? refCard.descriptionTh : refCard.descriptionEn,
        profile: language === 'th' ? refCard.artistProfileTh : refCard.artistProfileEn,
        theme: language === 'th' ? refCard.themeTh : refCard.themeEn,
        selectedTags: refCard.tags,
        musicDirection: language === 'th' ? refCard.musicDirectionTh : refCard.musicDirectionEn,
        durationIntent: refCard.defaultDuration,
      };
    });

    handleSelectFamily(refCard.familyTarget);
    setActiveTab('blueprint');
    showToast(
      language === 'th' ? `นำเข้าแม่แบบ "${refCard.titleTh}" เรียบร้อยแล้ว` : `Applied reference "${refCard.titleEn}" to workspace`,
      'success'
    );
  }, [songData, language, pushToUndo, updateSongData, handleSelectFamily, showToast]);

  // 16. AI Section Assistant (scoped)
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiTarget, setAiTarget] = useState<AiAssistTarget>('style');
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [aiDraftPayload, setAiDraftPayload] = useState<any>(null);
  const [aiDraftLoading, setAiDraftLoading] = useState<boolean>(false);

  const generateScopedDraft = useCallback(async (promptText: string) => {
    setAiDraftLoading(true);
    setAiDraft(null);
    setAiDraftPayload(null);
    try {
      if (!backendOnline) await refreshBackendStatus();
      const lyricsLanguageCodeMap: Record<string,string> = { auto:'auto', thai:'th', english:'en', japanese:'ja', chinese:'zh', korean:'ko' };
      const lyricsLanguageLabelMap: Record<string,string> = { auto:'Auto', thai:'Thai', english:'English', japanese:'Japanese', chinese:'Chinese', korean:'Korean' };
      const canonicalLyrics = songData.canonicalLyrics.map((sec) => '[' + sec.title + ']\n' + sec.text).join('\n\n');
      const tags = {
        genre: songData.selectedTags.Genre || [],
        mood: songData.selectedTags.Mood || [],
        instruments: songData.selectedTags.Instruments || [],
        vocals: songData.selectedTags.Vocals || [],
        rhythm: songData.selectedTags.Rhythm || [],
        production: songData.selectedTags.Production || [],
        era: songData.selectedTags.Era || [],
      };
      const arrangement = {
        schema_version: 'arrangement-template.v1',
        name: songData.trackName + ' Arrangement',
        target_seconds: songData.durationIntent,
        max_duration_cap: Math.min(360, songData.durationIntent + 30),
        tolerance_seconds: 20,
        strategy: 'target_structure',
        sections: songData.arrangement.map((node) => ({ id: node.id, label: node.name, target_seconds: node.targetSeconds, role: node.role })),
      };
      const currentByTarget: Record<string, any> = {
        profile: { profile: songData.profile },
        theme: { theme: songData.theme },
        tags,
        style: { style: songData.musicDirection },
        lyrics: { lyrics: canonicalLyrics, language: songData.lyricsLanguage },
        arrangement,
      };
      const body = {
        action: aiTarget,
        provider: aiProvider,
        model: aiModel,
        engine: selectedFamilyId === 'minimax_music3' ? 'minimax_music3' : 'yue2',
        mode: songData.instrumental ? 'instrumental' : 'song',
        lyrics_language: lyricsLanguageCodeMap[songData.lyricsLanguage] || 'auto',
        lyrics_language_label: lyricsLanguageLabelMap[songData.lyricsLanguage] || 'Auto',
        current_lyrics: canonicalLyrics,
        brief: promptText.trim() || songData.brief || ('Refine ' + aiTarget + ' while preserving approved context.'),
        profile: songData.profile,
        theme: songData.theme,
        current: currentByTarget[aiTarget],
        workspace_context: {
          style: songData.musicDirection,
          music_tags: tags,
          lyrics_language: lyricsLanguageCodeMap[songData.lyricsLanguage] || 'auto',
          lyrics: canonicalLyrics,
          arrangement,
          mode: songData.instrumental ? 'instrumental' : 'song',
        },
        project: { name: songData.projectTitle, track: songData.trackName, version: songData.version },
      };
      const response = await fetch(API_BASE_URL + '/api/ai/director', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('AI Director HTTP ' + response.status);
      const data = await response.json();
      const result = data?.result || {};
      setAiDraftPayload(result);
      let display = '';
      if (aiTarget === 'style') display = String(result.style || '');
      else if (aiTarget === 'lyrics') display = String(result.lyrics || '');
      else if (aiTarget === 'tags') display = JSON.stringify(result.tags || {}, null, 2);
      else if (aiTarget === 'arrangement') display = JSON.stringify(result, null, 2);
      else if (aiTarget === 'profile') display = [result.name, result.identity, result.summary].filter(Boolean).join('\n') || JSON.stringify(result, null, 2);
      else if (aiTarget === 'theme') display = [result.name, result.summary, result.concept].filter(Boolean).join('\n') || JSON.stringify(result, null, 2);
      else display = JSON.stringify(result, null, 2);
      setAiDraft(display);
      showToast(
        (language === 'th' ? 'AI จริงตอบกลับแล้ว · ' : 'Live AI response · ') + (data?.resolved_model || aiModel),
        'success'
      );
    } catch (error) {
      console.error(error);
      setAiDraft(null);
      setAiDraftPayload(null);
      showToast(language === 'th' ? 'เชื่อม AI ไม่สำเร็จ กรุณาตรวจ Backend 3012' : 'AI request failed. Check backend 3012.', 'warning');
    } finally {
      setAiDraftLoading(false);
    }
  }, [aiTarget, aiProvider, aiModel, backendOnline, refreshBackendStatus, selectedFamilyId, songData, language, showToast]);
  const applyScopedDraft = useCallback(() => {
    if (!aiDraft || !aiDraftPayload) return;

    if (aiTarget === 'profile') {
      const value = [aiDraftPayload.name, aiDraftPayload.identity, aiDraftPayload.summary].filter(Boolean).join(' — ') || aiDraft;
      updateSongData({ profile: value });
    } else if (aiTarget === 'theme') {
      const value = [aiDraftPayload.name, aiDraftPayload.summary, aiDraftPayload.concept].filter(Boolean).join(' — ') || aiDraft;
      updateSongData({ theme: value });
    } else if (aiTarget === 'style') {
      updateSongData({ musicDirection: String(aiDraftPayload.style || aiDraft).trim() });
    } else if (aiTarget === 'tags') {
      const tags = aiDraftPayload.tags || {};
      updateSongData((prev) => ({
        ...prev,
        selectedTags: {
          Genre: Array.isArray(tags.genre) ? tags.genre : prev.selectedTags.Genre,
          Mood: Array.isArray(tags.mood) ? tags.mood : prev.selectedTags.Mood,
          Instruments: Array.isArray(tags.instruments) ? tags.instruments : prev.selectedTags.Instruments,
          Vocals: Array.isArray(tags.vocals) ? tags.vocals : prev.selectedTags.Vocals,
          Rhythm: Array.isArray(tags.rhythm) ? tags.rhythm : prev.selectedTags.Rhythm,
          Production: Array.isArray(tags.production) ? tags.production : prev.selectedTags.Production,
          Era: Array.isArray(tags.era) ? tags.era : prev.selectedTags.Era,
        },
      }));
    } else if (aiTarget === 'lyrics') {
      const lyricsText = String(aiDraftPayload.lyrics || aiDraft);
      const blocks = lyricsText.split(/(?=^\[[^\]]+\]\s*$)/m).map((part) => part.trim()).filter(Boolean);
      const parsed: { type: string; text: string }[] = [];
      let verseSeen = 0;
      let chorusSeen = 0;
      for (const blockText of blocks) {
        const match = blockText.match(/^\[([^\]]+)\]\s*\n?([\s\S]*)$/);
        if (!match) continue;
        const tag = match[1].trim().toLowerCase();
        const text = match[2].trim();
        let type = 'custom';
        if (tag.includes('intro')) type = 'intro';
        else if (tag.includes('pre') && tag.includes('chorus')) type = 'prechorus';
        else if (tag.includes('final') && tag.includes('chorus')) type = 'finalchorus';
        else if (tag.includes('verse 2') || tag.includes('verse2')) type = 'verse2';
        else if (tag.includes('verse')) { verseSeen += 1; type = verseSeen === 1 ? 'verse1' : 'verse2'; }
        else if (tag.includes('chorus')) { chorusSeen += 1; type = chorusSeen === 1 ? 'chorus' : 'finalchorus'; }
        else if (tag.includes('bridge')) type = 'bridge';
        else if (tag.includes('outro')) type = 'outro';
        parsed.push({ type, text });
      }
      updateSongData((prev) => ({
        ...prev,
        canonicalLyrics: prev.canonicalLyrics.map((sec) => {
          if (sec.locked) return sec;
          const found = parsed.find((item) => item.type === sec.type);
          return found ? { ...sec, text: found.text } : sec;
        }),
      }));
    } else if (aiTarget === 'arrangement') {
      const sections = Array.isArray(aiDraftPayload.sections) ? aiDraftPayload.sections : [];
      if (sections.length) {
        updateSongData((prev) => {
          const mapLyricRef = (label: string) => {
            const l = String(label || '').toLowerCase();
            const preferredType = l.includes('intro') ? 'intro'
              : l.includes('pre') && l.includes('chorus') ? 'prechorus'
              : l.includes('final') && l.includes('chorus') ? 'finalchorus'
              : l.includes('verse 2') ? 'verse2'
              : l.includes('verse') ? 'verse1'
              : l.includes('bridge') ? 'bridge'
              : l.includes('outro') ? 'outro'
              : l.includes('chorus') ? 'chorus' : '';
            return prev.canonicalLyrics.find((sec) => sec.type === preferredType)?.id || '';
          };
          const proposed = sections.map((sec: any, index: number) => ({
            id: String(sec.id || ('arr-ai-' + index)),
            lyricSectionId: mapLyricRef(sec.label),
            name: String(sec.label || sec.role || ('Section ' + (index + 1))),
            role: String(sec.role || 'section'),
            targetSeconds: Math.max(1, Number(sec.target_seconds || 30)),
            locked: false,
          }));
          const merged = proposed.map((node, index) => prev.arrangement[index]?.locked ? prev.arrangement[index] : node);
          const total = merged.reduce((sum, node) => sum + node.targetSeconds, 0);
          return { ...prev, arrangement: merged, durationIntent: total };
        });
      }
    }

    setAiDraft(null);
    setAiDraftPayload(null);
    setAiDrawerOpen(false);
    showToast(
      language === 'th' ? 'นำผล AI จริงไปใช้เฉพาะส่วน [' + aiTarget + '] แล้ว' : 'Applied LIVE AI result only to [' + aiTarget + ']',
      'success'
    );
  }, [aiDraft, aiDraftPayload, aiTarget, updateSongData, language, showToast]);
  // 17. AI Director (deliberate full song redesign)
  const [directorModalOpen, setDirectorModalOpen] = useState<boolean>(false);
  const [directorDraft, setDirectorDraft] = useState<SongData | null>(null);
  const [directorLoading, setDirectorLoading] = useState<boolean>(false);

  const generateDirectorDraft = useCallback(async (briefText: string, keepProfile: boolean, preserveLocked: boolean) => {
    setDirectorLoading(true);
    setDirectorDraft(null);
    try {
      const lyricsLanguageCodeMap: Record<string,string> = { auto:'auto', thai:'th', english:'en', japanese:'ja', chinese:'zh', korean:'ko' };
      const currentLyrics = songData.canonicalLyrics.map((sec) => ({
        id: sec.id,
        type: sec.type,
        title: sec.title,
        text: sec.text,
        locked: sec.locked,
      }));
      const currentArrangement = songData.arrangement.map((node) => ({
        id: node.id,
        lyricSectionId: node.lyricSectionId,
        label: node.name,
        role: node.role,
        target_seconds: node.targetSeconds,
        locked: node.locked,
      }));
      const body = {
        provider: aiProvider,
        model: aiModel,
        action: 'song_blueprint',
        engine: selectedFamilyId === 'minimax_music3' ? 'minimax_music3' : 'yue2',
        mode: songData.instrumental ? 'instrumental' : 'song',
        lyrics_language: lyricsLanguageCodeMap[songData.lyricsLanguage] || 'auto',
        lyrics_language_label: songData.lyricsLanguage,
        current_lyrics: currentLyrics.map((sec) => '[' + sec.title + ']\n' + sec.text).join('\n\n'),
        brief: briefText.trim() || songData.brief || 'Redesign this song into a coherent new production while preserving explicit constraints.',
        profile: songData.profile,
        theme: songData.theme,
        current: {
          track_name: songData.trackName,
          brief: songData.brief,
          profile: songData.profile,
          theme: songData.theme,
          tags: songData.selectedTags,
          custom_tags: songData.customTags,
          style: songData.musicDirection,
          lyrics_language: songData.lyricsLanguage,
          lyrics: currentLyrics,
          arrangement: currentArrangement,
          duration_seconds: songData.durationIntent,
          instrumental: songData.instrumental,
        },
        workspace_context: {
          style: songData.musicDirection,
          music_tags: songData.selectedTags,
          lyrics_language: lyricsLanguageCodeMap[songData.lyricsLanguage] || 'auto',
          lyrics: currentLyrics,
          arrangement: currentArrangement,
          mode: songData.instrumental ? 'instrumental' : 'song',
        },
        director_options: {
          keep_profile: keepProfile,
          preserve_locked: preserveLocked,
        },
        project: { name: songData.projectTitle, track: songData.trackName, version: songData.version },
      };

      const response = await fetch(API_BASE_URL + '/api/ai/director', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('AI Director HTTP ' + response.status);
      const data = await response.json();
      const result = data?.result || {};

      const tagSource = result.tags || {};
      const selectedTags: SongData['selectedTags'] = {
        Genre: Array.isArray(tagSource.genre) ? tagSource.genre.map(String) : [],
        Mood: Array.isArray(tagSource.mood) ? tagSource.mood.map(String) : [],
        Instruments: Array.isArray(tagSource.instruments) ? tagSource.instruments.map(String) : [],
        Vocals: Array.isArray(tagSource.vocals) ? tagSource.vocals.map(String) : [],
        Rhythm: Array.isArray(tagSource.rhythm) ? tagSource.rhythm.map(String) : [],
        Production: Array.isArray(tagSource.production) ? tagSource.production.map(String) : [],
        Era: Array.isArray(tagSource.era) ? tagSource.era.map(String) : [],
      };

      const proposedLyricsRaw = Array.isArray(result.lyrics) ? result.lyrics : [];
      let proposedLyrics: LyricSection[] = proposedLyricsRaw.map((sec: any, index: number) => ({
        id: 'sec-ai-' + (index + 1) + '-' + Math.random().toString(36).slice(2, 6),
        type: String(sec.type || 'custom') as LyricSection['type'],
        title: String(sec.title || sec.type || ('Section ' + (index + 1))),
        text: String(sec.text || ''),
        locked: false,
      }));
      if (!proposedLyrics.length) proposedLyrics = songData.canonicalLyrics.map((sec) => ({ ...sec }));

      if (preserveLocked) {
        for (const locked of songData.canonicalLyrics.filter((sec) => sec.locked)) {
          const idx = proposedLyrics.findIndex((sec) => sec.type === locked.type);
          if (idx >= 0) proposedLyrics[idx] = { ...locked };
          else proposedLyrics.push({ ...locked });
        }
      }

      const lyricIdByType = new Map(proposedLyrics.map((sec) => [sec.type, sec.id]));
      const proposedArrangementRaw = Array.isArray(result.arrangement) ? result.arrangement : [];
      let proposedArrangement: ArrangementNode[] = proposedArrangementRaw.map((node: any, index: number) => {
        const lyricType = String(node.lyric_type || '');
        return {
          id: 'arr-ai-' + (index + 1) + '-' + Math.random().toString(36).slice(2, 6),
          lyricSectionId: lyricIdByType.get(lyricType as any) || proposedLyrics[index]?.id || '',
          name: String(node.label || node.name || ('Section ' + (index + 1))),
          role: String(node.role || 'section'),
          targetSeconds: Math.max(1, Math.round(Number(node.target_seconds || 30))),
          locked: false,
        };
      });
      if (!proposedArrangement.length) proposedArrangement = songData.arrangement.map((node) => ({ ...node }));

      if (preserveLocked) {
        proposedArrangement = proposedArrangement.map((node, index) =>
          songData.arrangement[index]?.locked ? { ...songData.arrangement[index] } : node
        );
      }

      const totalSeconds = proposedArrangement.reduce((sum, node) => sum + node.targetSeconds, 0);
      const languageMap: Record<string, SongData['lyricsLanguage']> = {
        th: 'thai',
        thai: 'thai',
        en: 'english',
        english: 'english',
        auto: 'auto',
      };
      const newDraft: SongData = {
        ...songData,
        trackName: String(result.track_name || songData.trackName),
        version: songData.version + '-director',
        status: 'draft',
        brief: String(result.brief || briefText || songData.brief),
        profile: keepProfile ? songData.profile : String(result.profile || songData.profile),
        theme: String(result.theme || songData.theme),
        selectedTags,
        customTags: Array.isArray(result.custom_tags) ? result.custom_tags.map(String) : [],
        musicDirection: String(result.style || songData.musicDirection),
        lyricsLanguage: languageMap[String(result.lyrics_language || '').toLowerCase()] || songData.lyricsLanguage,
        canonicalLyrics: proposedLyrics,
        arrangement: proposedArrangement,
        durationIntent: totalSeconds || Math.max(1, Number(result.duration_seconds || songData.durationIntent)),
        instrumental: typeof result.instrumental === 'boolean' ? result.instrumental : songData.instrumental,
      };

      setDirectorDraft(newDraft);
      showToast(
        (language === 'th' ? 'Live AI Director พร้อมพรีวิว · ' : 'Live AI Director preview ready · ') + (data?.resolved_model || aiModel),
        'success'
      );
    } catch (error) {
      console.error(error);
      setDirectorDraft(null);
      showToast(language === 'th' ? 'AI Director ทำงานไม่สำเร็จ กรุณาตรวจ ComfyUI / Provider' : 'AI Director failed. Check ComfyUI / provider.', 'warning');
    } finally {
      setDirectorLoading(false);
    }
  }, [songData, language, aiProvider, aiModel, selectedFamilyId, showToast]);

  const confirmDirectorReplace = useCallback(() => {
    if (!directorDraft) return;
    pushToUndo(songData);
    setSongDataState(directorDraft);
    localStorage.setItem(STORAGE_KEYS.SONG, JSON.stringify(directorDraft));
    setDirectorDraft(null);
    setDirectorModalOpen(false);
    showToast(
      language === 'th' ? 'แทนที่ห้องทำเพลงด้วยโครงสร้างเพลงใหม่จาก AI Director สำเร็จ' : 'Replaced workspace with new song structure from AI Director',
      'success'
    );
  }, [directorDraft, songData, pushToUndo, language, showToast]);

  const t = translations[language];

  return (
    <StudioContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        t,

        // Live backend / AI
        apiBaseUrl,
        aiProviders,
        aiProvider,
        setAiProvider,
        aiModels,
        aiModelsLoading,
        aiModel,
        setAiModel,
        backendHealth,
        backendOnline,
        refreshBackendStatus,

        // Workspace
        songData,
        updateSongData,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        resetDemo,

        // Tag Palette
        toggleTag,
        addCustomTag,
        removeCustomTag,
        aiSuggestTags,

        // Music Direction
        aiEditStyleOnly,

        // Lyrics
        updateLyricText,
        toggleLyricLock,
        duplicateLyricSection,
        deleteLyricSection,
        addLyricSection,
        aiRewriteSection,
        aiGenerateLyricsAll,

        // Arrangement
        updateArrangementNode,
        adjustNodeDuration,
        reorderArrangementNodes,
        duplicateArrangementNode,
        deleteArrangementNode,
        addArrangementNode,
        aiArrange,
        saveArrangementTemplate,

        // Engine & Presets
        selectedFamilyId,
        setSelectedFamilyId: handleSelectFamily,
        selectedPresetId,
        setSelectedPresetId: handleSelectPreset,
        parameterVisibility,
        setParameterVisibility,
        workflowInfoDrawerOpen,
        setWorkflowInfoDrawerOpen,
        engineParamOverrides,
        setEngineParamOverride,

        // Render
        renderJobs,
        isSingleRendering,
        startSingleRender,
        startAbRender,
        refreshRenderJob,
        refreshPendingRenderJobs,
        dismissRenderJob,
        clearFailedRenderJobs,

        // Compare
        compareEvaluation,
        updateCompareEvaluation,
        savedEvaluations,
        saveCurrentEvaluation,

        // Library
        libraryVersions,
        forkVersion,
        loadVersionToWorkspace,

        // References
        applyReferenceToWorkspace,

        // AI Assistant
        aiDrawerOpen,
        setAiDrawerOpen,
        aiTarget,
        setAiTarget,
        aiDraft,
        aiDraftLoading,
        generateScopedDraft,
        applyScopedDraft,

        // AI Director
        directorModalOpen,
        setDirectorModalOpen,
        directorDraft,
        directorLoading,
        generateDirectorDraft,
        confirmDirectorReplace,

        // Toasts
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
