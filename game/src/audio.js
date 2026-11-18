// EMBERCLASH — procedural audio: WebAudio only, no files.
// One job: SFX synth + per-arena music loops, all generated at runtime.
const TRACKS = {
  ember: { bpm: 112, root: 110, scale: [0, 3, 5, 7, 10], wave: 'sawtooth', bright: 0.5 },
  blaze: { bpm: 132, root: 98, scale: [0, 2, 3, 7, 8], wave: 'square', bright: 0.7 },
  inferno: { bpm: 150, root: 87, scale: [0, 1, 3, 6, 8], wave: 'sawtooth', bright: 0.9 },
  boss: { bpm: 160, root: 82, scale: [0, 1, 3, 6, 10], wave: 'sawtooth', bright: 1.0 },
  title: { bpm: 96, root: 130, scale: [0, 4, 5, 7, 11], wave: 'triangle', bright: 0.4 },
};

export class AudioEngine {
  constructor() {
    this.ctx = null; this.master = null; this.musicGain = null; this.sfxGain = null;
    this.muted = false; this.track = 'title'; this.step = 0; this.nextTime = 0; this.timer = null;
    this.unlocked = false;
  }
  unlock() {
    if (this.unlocked) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.30; this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.55; this.sfxGain.connect(this.master);
      this.unlocked = true;
      this.startMusic();
    } catch { /* audio unavailable: game still plays */ }
  }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.5; }
  setTrack(name) { if (TRACKS[name]) this.track = name; }
  noteFreq(root, semitone) { return root * Math.pow(2, semitone / 12); }
  /** Schedule one synth note. */
  blip(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo > 0) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + dur + 0.02);
  }
  noise(dur, vol, when = 0, low = 400) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = low;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxGain); src.start(t);
  }
  sfx(name) {
    if (!this.ctx) return;
    switch (name) {
      case 'swing': this.noise(0.09, 0.25, 0, 2400); break;
      case 'hit': this.blip(180, 0.12, 'square', 0.35, 0, 60); this.noise(0.08, 0.3, 0, 1200); break;
      case 'crit': this.blip(520, 0.16, 'square', 0.4, 0, 130); this.blip(780, 0.14, 'square', 0.3, 0.05, 200); break;
      case 'jump': this.blip(300, 0.14, 'sine', 0.3, 0, 620); break;
      case 'dash': this.noise(0.16, 0.3, 0, 3000); break;
      case 'hurt': this.blip(140, 0.2, 'sawtooth', 0.35, 0, 70); break;
      case 'ko': this.blip(90, 0.5, 'sawtooth', 0.5, 0, 30); this.noise(0.4, 0.4, 0, 800); break;
      case 'skill': this.blip(440, 0.2, 'triangle', 0.4, 0, 880); this.blip(660, 0.18, 'triangle', 0.3, 0.06, 990); break;
      case 'ult': this.blip(220, 0.4, 'sawtooth', 0.45, 0, 880); this.noise(0.5, 0.4, 0, 2000); break;
      case 'coin': this.blip(990, 0.1, 'sine', 0.35); this.blip(1320, 0.14, 'sine', 0.3, 0.08); break;
      case 'click': this.blip(700, 0.06, 'sine', 0.3); break;
      case 'win': [523, 659, 784, 1046].forEach((f, i) => this.blip(f, 0.22, 'triangle', 0.4, i * 0.12)); break;
      case 'lose': [400, 350, 300, 200].forEach((f, i) => this.blip(f, 0.25, 'sawtooth', 0.3, i * 0.14)); break;
      case 'round': this.blip(392, 0.12, 'square', 0.35); this.blip(523, 0.12, 'square', 0.35, 0.1); this.blip(659, 0.2, 'square', 0.4, 0.2); break;
      case 'freeze': this.blip(1200, 0.3, 'sine', 0.3, 0, 300); break;
      default: break;
    }
  }
  /** Tiny step sequencer: bass + lead + hat, scheduled ahead in 8th notes. */
  startMusic() {
    if (this.timer || !this.ctx) return;
    this.nextTime = this.ctx.currentTime + 0.1; this.step = 0;
    this.timer = setInterval(() => {
      if (!this.ctx || this.muted) { this.nextTime = this.ctx ? this.ctx.currentTime + 0.1 : 0; return; }
      const tr = TRACKS[this.track];
      const spb = 60 / tr.bpm / 2; // 8th note
      while (this.nextTime < this.ctx.currentTime + 0.25) {
        this.scheduleStep(tr, this.step, this.nextTime);
        this.step = (this.step + 1) % 64;
        this.nextTime += spb;
      }
    }, 60);
  }
  scheduleStep(tr, step, t) {
    const when = t - this.ctx.currentTime;
    if (when < 0) return;
    const bassNotes = [0, 0, 7, 0, 5, 0, 7, 10];
    if (step % 8 === 0) this.blip(this.noteFreq(tr.root / 2, bassNotes[(step / 8) % 8 | 0]), 0.3, 'sine', 0.5, when);
    if (step % 4 === 2) this.noise(0.05, 0.12, when, 6000); // hat
    if (step % 2 === 0) {
      const idx = [0, 2, 1, 3, 2, 4, 3, 1][(step / 2) % 8 | 0];
      const f = this.noteFreq(tr.root * 2, tr.scale[idx % tr.scale.length] + 12 * (idx > 2 ? 1 : 0));
      if (Math.random() < 0.55 + tr.bright * 0.3) this.blip(f, 0.18, tr.wave, 0.10 + tr.bright * 0.05, when);
    }
    if (step % 16 === 0) this.blip(this.noteFreq(tr.root, 0), 0.5, 'triangle', 0.18, when); // root pad
  }
}
