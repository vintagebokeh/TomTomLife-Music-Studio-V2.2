import { SongData } from '../types';

export function formatLyricsForYuE2(songData: SongData): string {
  if (songData.instrumental) {
    return '[Instrumental]';
  }

  // YuE2 SAFE section vocabulary verified by the workflow guide.
  // Canonical structure remains richer; only the engine-facing text is normalized.
  const safeTagByType: Record<string, string> = {
    intro: 'Intro',
    verse1: 'Verse',
    prechorus: 'Verse', // approximate engine mapping; canonical Pre-Chorus is preserved upstream
    chorus: 'Chorus',
    verse2: 'Verse',
    bridge: 'Bridge',
    finalchorus: 'Chorus',
    outro: 'Outro',
  };

  return songData.canonicalLyrics
    .map((sec) => {
      const tag = safeTagByType[sec.type] || 'Verse';
      return `[${tag}]\n${sec.text.trim()}`;
    })
    .join('\n\n');
}

export function formatLyricsForMiniMax(songData: SongData): string {
  if (songData.instrumental) {
    return '# Instrumental Mode Active\n(Vocals disabled in sampler conditioning)';
  }

  return songData.canonicalLyrics
    .map((sec) => {
      return `[${sec.title}]\n${sec.text.trim()}`;
    })
    .join('\n\n');
}

export function formatStyleForYuE2(songData: SongData): string {
  const genres = songData.selectedTags.Genre.join(', ');
  const moods = songData.selectedTags.Mood.join(', ');
  const instruments = songData.selectedTags.Instruments.join(', ');
  const vocals = songData.instrumental ? 'Instrumental' : songData.selectedTags.Vocals.join(', ');
  const production = songData.selectedTags.Production.join(', ');

  const tagsSummary = [genres, moods, instruments, vocals, production]
    .filter(Boolean)
    .join(', ');

  return `${tagsSummary}. ${songData.musicDirection}`.trim();
}

export function formatStyleForMiniMax(songData: SongData): string {
  const genres = songData.selectedTags.Genre.join(', ') || 'Thai Indie Pop';
  const moods = songData.selectedTags.Mood.join(', ') || 'Melancholic, Cozy';
  const instruments = songData.selectedTags.Instruments.join(', ') || 'Acoustic Guitar, Rhodes';
  const vocals = songData.instrumental ? 'None (Pure Instrumental)' : (songData.selectedTags.Vocals.join(', ') || 'Soft Female Lead');
  const rhythm = songData.selectedTags.Rhythm.join(', ') || '4/4 78 BPM Laidback';
  const production = songData.selectedTags.Production.join(', ') || 'Studio Master';
  const era = songData.selectedTags.Era.join(', ') || 'Contemporary';

  const arrangementList = songData.arrangement
    .map((node) => `- ${node.name} (${node.targetSeconds}s): ${node.role}`)
    .join('\n');

  return `[Global Metadata]
Style & Genre: ${genres}
Mood & Atmosphere: ${moods}
Era & Aesthetics: ${era}
Instrumentation: ${instruments}
Groove & Meter: ${rhythm}
Production & Mixing: ${production}

[Vocal Details]
Vocal Type: ${vocals}
Language: ${songData.lyricsLanguage.toUpperCase()}
Execution: Authentic expressive enunciation, pristine dynamic range

[Arrangement Architecture]
Total Duration: ${songData.durationIntent}s
${arrangementList}

[Producer Directive]
${songData.musicDirection}`;
}
