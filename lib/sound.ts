/**
 * High-performance Sound & Speech Engine for Hitzak
 * Utilizes Web Audio API synthesis for chimes and Web Speech API for crystal-clear Basque pronunciation.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    this.voicesLoaded = this.voices.length > 0;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private isSoundEnabled(): boolean {
    if (typeof window === "undefined") return true;
    try {
      const savedSound = localStorage.getItem("hitzak_sound_enabled") !== null
        ? localStorage.getItem("hitzak_sound_enabled")
        : localStorage.getItem("euskarolingo_sound_enabled");
      return savedSound !== "false";
    } catch (_) {
      return true;
    }
  }

  /**
   * Duolingo-style crisp high chime for correct answers
   */
  playCorrect() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "triangle";
    osc2.type = "sine";

    // Pleasant Major Chord Arpeggio (C5 -> E5 -> G5 -> C6)
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.setValueAtTime(659.25, now + 0.08);
    osc1.frequency.setValueAtTime(783.99, now + 0.16);

    osc2.frequency.setValueAtTime(1046.5, now + 0.16);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.16);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  }

  /**
   * Duolingo-style dull double thud for incorrect answers
   */
  playIncorrect() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Tile click pop sound
   */
  playClick() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Matching pair sparkle sound
   */
  playMatch() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.15, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  }

  /**
   * Fanfare victory chime for lesson completion
   */
  playVictory() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.5 },
    ];

    let t = now;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d * 0.9;
    });
  }

  /**
   * Sanitizes speech text to strip parenthetical English glosses or formatting
   */
  private cleanSpeechText(text: string): string {
    return text
      .replace(/\s*\([^)]*\)/g, "") // Remove (translations in parentheses)
      .replace(/\s*\[[^\]]*\]/g, "") // Remove [brackets]
      .replace(/[•*#_~`💡🦉🇬🇧🟢💎🎁]/g, "") // Remove emojis and symbols
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Speaks Basque text via Web Speech API with pitch and custom rate controls
   */
  speak(text: string, slow = false) {
    if (typeof window === "undefined") return;

    const cleanText = this.cleanSpeechText(text);
    if (!cleanText) return;

    if (!("speechSynthesis" in window)) {
      this.playClick();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Get user-configured speech speed multiplier
      let baseRate = 0.95;
      try {
        const savedRate = localStorage.getItem("hitzak_speech_rate") || localStorage.getItem("euskarolingo_speech_rate");
        if (savedRate) {
          const parsed = parseFloat(savedRate);
          if (!isNaN(parsed) && parsed > 0.4 && parsed < 2.0) {
            baseRate = parsed;
          }
        }
      } catch (_) {}

      utterance.rate = slow ? baseRate * 0.65 : baseRate;
      utterance.pitch = 1.05;
      utterance.lang = "eu-ES";

      if (!this.voicesLoaded) {
        this.loadVoices();
      }

      // Find the best voice: Basque > Spanish (phonetically identical standard vowels/consonants) > Catalan/Galician > default
      const euVoice =
        this.voices.find((v) => v.lang === "eu-ES" || v.lang.startsWith("eu")) ||
        this.voices.find((v) => v.lang === "es-ES" || v.lang.startsWith("es")) ||
        this.voices.find((v) => v.lang === "ca-ES" || v.lang.startsWith("ca")) ||
        this.voices.find((v) => v.default);

      if (euVoice) {
        utterance.voice = euVoice;
      }

      // Resume synthesis if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error, falling back to audio tone:", e);
      this.playClick();
    }
  }
}

export const sound = new SoundEngine();
