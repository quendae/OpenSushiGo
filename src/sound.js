const STORAGE_KEY = 'puchate-cafe-sound';

class CafeSound {
  constructor() {
    this.context = null;
    this.muted = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'off';
  }

  async ensure() {
    if (this.muted) return null;
    const AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!AudioContext) return null;
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') await this.context.resume();
    return this.context;
  }

  setMuted(value) {
    this.muted = Boolean(value);
    localStorage.setItem(STORAGE_KEY, this.muted ? 'off' : 'on');
    if (!this.muted) void this.play('select');
    return this.muted;
  }

  toggle() { return this.setMuted(!this.muted); }

  tone(frequency, start, duration, options = {}) {
    const ctx = this.context;
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = options.wave ?? 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    if (options.to) oscillator.frequency.exponentialRampToValueAtTime(options.to, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.volume ?? 0.055, start + Math.min(.018, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
  }

  noise(start, duration = .08, volume = .018) {
    const ctx = this.context;
    if (!ctx) return;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = 'highpass';
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(start);
  }

  async play(name) {
    const ctx = await this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime + .008;
    if (name === 'select') {
      this.tone(520, now, .09, { to: 710, volume: .045 });
      this.tone(1040, now + .025, .07, { volume: .018 });
    } else if (name === 'confirm') {
      this.noise(now, .12, .014);
      this.tone(330, now, .16, { to: 660, wave: 'triangle', volume: .04 });
    } else if (name === 'reveal') {
      [659, 784, 988].forEach((frequency, index) => this.tone(frequency, now + index * .055, .2, { volume: .033 }));
    } else if (name === 'pass') {
      this.noise(now, .18, .012);
      this.tone(420, now, .2, { to: 260, wave: 'triangle', volume: .025 });
    } else if (name === 'menu') {
      [523, 659, 784].forEach((frequency, index) => this.tone(frequency, now + index * .08, .18, { volume: .038 }));
    } else if (name === 'round') {
      [392, 523, 659, 784].forEach((frequency, index) => this.tone(frequency, now + index * .09, .3, { volume: .04 }));
    } else if (name === 'victory') {
      [523, 659, 784, 1047].forEach((frequency, index) => this.tone(frequency, now + index * .11, .42, { volume: .052 }));
      this.noise(now + .25, .35, .013);
    } else if (name === 'error') {
      this.tone(180, now, .18, { to: 120, wave: 'square', volume: .026 });
    }
  }
}

export const sound = new CafeSound();
