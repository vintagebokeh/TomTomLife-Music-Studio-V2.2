// Web Audio API lightweight synthesizer for high-fidelity interactive prototype playback
class StudioAudioPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrack: 'A' | 'B' | null = null;
  private currentTime: number = 0;
  private duration: number = 300;
  private timer: number | null = null;
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private onTimeUpdateCallback: ((time: number, isPlaying: boolean, track: 'A' | 'B' | null) => void) | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setOnTimeUpdate(cb: (time: number, isPlaying: boolean, track: 'A' | 'B' | null) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public play(track: 'A' | 'B', startSeconds?: number) {
    this.initCtx();
    this.stopAudioNodes();

    if (startSeconds !== undefined) {
      this.currentTime = startSeconds;
    }
    this.currentTrack = track;
    this.isPlaying = true;

    // Start tone generation loop representing musical progression
    this.startMusicalPattern(track);

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = window.setInterval(() => {
      this.currentTime += 0.5;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0;
        this.pause();
      }
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime, this.isPlaying, this.currentTrack);
      }
    }, 500);

    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.isPlaying, this.currentTrack);
    }
  }

  public pause() {
    this.isPlaying = false;
    this.stopAudioNodes();
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.isPlaying, this.currentTrack);
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.isPlaying && this.currentTrack) {
      this.stopAudioNodes();
      this.startMusicalPattern(this.currentTrack);
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.isPlaying, this.currentTrack);
    }
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getPlayingTrack(): 'A' | 'B' | null {
    return this.currentTrack;
  }

  private startMusicalPattern(track: 'A' | 'B') {
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Track A (YuE2): Warm nylon acoustic timbre (E Major: E3, G#3, B3, E4)
      // Track B (MiniMax 3): Crisp modern vocal synth pad (A3, C#4, E4, A4)
      const chordA = [164.81, 207.65, 246.94, 329.63]; // E chord
      const chordB = [220.0, 277.18, 329.63, 440.0];  // A chord
      const freqs = track === 'A' ? chordA : chordB;

      // Master output limiter
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, now);
      masterGain.connect(this.ctx.destination);

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Track A uses triangle/sine for warm acoustic body, Track B uses warm sine with subtle vibrato
        osc.type = track === 'A' ? (idx % 2 === 0 ? 'triangle' : 'sine') : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle breathing pulsing
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.5 + idx * 0.2, now);
        lfoGain.gain.setValueAtTime(0.02, now);
        lfo.connect(noteGain.gain);
        lfo.start(now);

        noteGain.gain.setValueAtTime(0.04 / freqs.length, now);
        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        this.activeNodes.push({ osc, gain: noteGain });
      });
    } catch {
      // AudioContext could be blocked by browser policy until gesture
    }
  }

  private stopAudioNodes() {
    this.activeNodes.forEach(({ osc }) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.activeNodes = [];
  }
}

export const studioAudioPlayer = new StudioAudioPlayer();
