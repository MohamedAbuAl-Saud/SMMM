// Cute Cartoon Web Audio Synthesizer for Bestie Check SM

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bestie_sound_muted');
      this.isMuted = saved === 'true';

      // Unlock AudioContext on Chrome for user interaction
      const unlockAudio = () => {
        const ctx = this.getContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => {
          window.removeEventListener(ev, unlockAudio);
        });
      };
      ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => {
        window.addEventListener(ev, unlockAudio, { once: true, passive: true });
      });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {
          console.error('Web Audio API error:', e);
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bestie_sound_muted', muted ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('bestie_sound_toggle', { detail: muted }));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Cute bubble pop
  public playPop(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(860, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Sparkling Ding for choosing correct answer
  public playDing(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.2); // A6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  // Cartoon Boing spring effect (for warning / 4th wrong option)
  public playBoing(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      // Vibrato wobble
      osc.frequency.linearRampToValueAtTime(540, ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.16);
      osc.frequency.linearRampToValueAtTime(460, ctx.currentTime + 0.24);
      osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.32);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch {}
  }

  public playWarning(): void {
    this.playBoing();
  }

  // Cute cartoon children's giggle/laugh + magical opening chime
  public playCartoonLaugh(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const giggleNotes = [
        { f: 550, t: 0.0, d: 0.08 },
        { f: 700, t: 0.09, d: 0.08 },
        { f: 620, t: 0.18, d: 0.08 },
        { f: 780, t: 0.27, d: 0.1 },
        { f: 920, t: 0.38, d: 0.16 },
      ];
      giggleNotes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + t;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);
        osc.frequency.exponentialRampToValueAtTime(f * 1.2, start + d);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + d);
      });
    } catch {}
  }

  // Cute cartoon opening chime combined with giggle
  public playCuteOpen(): void {
    if (this.isMuted) return;
    try {
      this.playCartoonLaugh();

      const ctx = this.getContext();
      if (!ctx) return;

      const chimeNotes = [
        { f: 523.25, time: 0.25, dur: 0.35 },
        { f: 659.25, time: 0.39, dur: 0.38 },
        { f: 783.99, time: 0.53, dur: 0.42 },
        { f: 880.00, time: 0.69, dur: 0.46 },
        { f: 1046.50, time: 0.85, dur: 0.55 },
        { f: 1318.51, time: 1.03, dur: 0.75 },
      ];

      chimeNotes.forEach(({ f, time, dur }) => {
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + time;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(f * 2, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        oscHarmonic.start(start);
        osc.stop(start + dur);
        oscHarmonic.stop(start + dur);
      });
    } catch {}
  }

  // Welcoming musical melody
  public playWelcome(): void {
    this.playCuteOpen();
  }

  // Cheerful Next question chord
  public playNext(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {}
  }

  // Fanfare celebration with joyful victory tones
  public playFanfare(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const melody = [
        { f: 523.25, t: 0, d: 0.14 },
        { f: 523.25, t: 0.12, d: 0.14 },
        { f: 659.25, t: 0.24, d: 0.16 },
        { f: 783.99, t: 0.38, d: 0.2 },
        { f: 1046.5, t: 0.55, d: 0.65 },
      ];

      melody.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + d);
      });
    } catch {}
  }

  // Cartoon Whoosh transition sound
  public playWhoosh(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.09);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }
}

export const sound = new SoundEffects();
