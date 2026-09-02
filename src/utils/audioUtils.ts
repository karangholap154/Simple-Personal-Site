const STORAGE_KEY_SOUND = "portfolio_cli_sound_enabled";

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

export const loadSoundSetting = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SOUND);
    return saved === "true";
  } catch {
    return false;
  }
};

export const saveSoundSetting = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND, String(enabled));
  } catch {
    // ignore
  }
};

export const playKeySound = (
  type: "key" | "enter" | "space" | "backspace" | "bell" = "key",
  soundEnabled = true
) => {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "enter" || type === "space") {
      // Deeper tactile thock sound for space/enter keys
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "bell") {
      // Vintage CRT Terminal Error Bell Beep (\a)
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "backspace") {
      // Crisp subtle release click for backspace
      osc.type = "triangle";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.02);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } else {
      // Crisp mechanical key click with slight randomized pitch
      osc.type = "triangle";
      osc.frequency.setValueAtTime(750 + Math.random() * 180, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.018);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      osc.start(now);
      osc.stop(now + 0.018);
    }
  } catch {
    // browser audio context restriction fallback
  }
};
