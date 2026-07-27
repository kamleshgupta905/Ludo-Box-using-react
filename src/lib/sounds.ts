// Lightweight Web Audio SFX + ambient background music (no assets required).
// All sounds are synthesized on demand. Respects a `muted` flag.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicNodes: { stop: () => void } | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.7;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (masterGain) masterGain.gain.value = m ? 0 : 0.7;
}

function beep(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.2, delay = 0) {
  const c = ac();
  if (!c || !masterGain) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function sfxDice() {
  // quick rattle
  for (let i = 0; i < 4; i++) beep(180 + Math.random() * 120, 0.05, "square", 0.08, i * 0.04);
}

export function sfxMove() {
  beep(520, 0.08, "triangle", 0.12);
}

export function sfxCapture() {
  const c = ac();
  if (!c || !masterGain) return;
  // clap-like noise burst
  const t0 = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * 0.25, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = 0.4;
  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = 1400;
  src.connect(filt);
  filt.connect(g);
  g.connect(masterGain);
  src.start(t0);
  // descending sweep for drama
  beep(660, 0.15, "sawtooth", 0.18, 0);
  beep(330, 0.2, "sawtooth", 0.14, 0.08);
}

export function sfxFinish() {
  beep(660, 0.12, "triangle", 0.18, 0);
  beep(880, 0.14, "triangle", 0.18, 0.1);
  beep(1320, 0.2, "triangle", 0.2, 0.22);
}

export function sfxWin() {
  [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.22, "triangle", 0.22, i * 0.12));
}

export function sfxLose() {
  beep(300, 0.2, "sine", 0.18, 0);
  beep(200, 0.3, "sine", 0.18, 0.15);
}

// Ambient background: slow arpeggio over a soft pad.
export function startMusic() {
  const c = ac();
  if (!c || !masterGain || musicNodes) return;
  const bus = c.createGain();
  bus.gain.value = 0.06; // very light
  bus.connect(masterGain);

  // Pad drone
  const pad = c.createOscillator();
  const padG = c.createGain();
  pad.type = "sine";
  pad.frequency.value = 130.81; // C3
  padG.gain.value = 0.35;
  pad.connect(padG);
  padG.connect(bus);
  pad.start();

  const pad2 = c.createOscillator();
  const pad2G = c.createGain();
  pad2.type = "sine";
  pad2.frequency.value = 196.0; // G3
  pad2G.gain.value = 0.25;
  pad2.connect(pad2G);
  pad2G.connect(bus);
  pad2.start();

  // Slow arpeggio (C major-ish)
  const notes = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25];
  let idx = 0;
  const step = () => {
    if (!musicNodes) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = notes[idx % notes.length];
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    osc.connect(g);
    g.connect(bus);
    osc.start(t0);
    osc.stop(t0 + 0.75);
    idx++;
  };
  const interval = window.setInterval(step, 620);

  musicNodes = {
    stop: () => {
      window.clearInterval(interval);
      try { pad.stop(); } catch { /* noop */ }
      try { pad2.stop(); } catch { /* noop */ }
      musicNodes = null;
    },
  };
}

export function stopMusic() {
  musicNodes?.stop();
  musicNodes = null;
}
