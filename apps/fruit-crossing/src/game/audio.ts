export type SoundName =
  | 'catch'
  | 'rare'
  | 'miss'
  | 'poop'
  | 'flush'
  | 'deny'
  | 'eat'
  | 'buy'
  | 'sell'
  | 'talk'
  | 'gift'
  | 'open'
  | 'close'
  | 'tab'
  | 'door'
  | 'pause'
  | 'resume'
  | 'town'
  | 'orchard'
  | 'custom'
  | 'step'
  | 'near'
  | 'thunder'
  | 'zap'
  | 'strike'
  | 'card'
  | 'foil'
  | 'flip'
  | 'fanfare'
  | 'start'

export interface SoundOpts {
  combo?: number
}

const MUTE_KEY = 'fruitcrossing-muted'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false
try {
  muted = localStorage.getItem(MUTE_KEY) === 'true'
} catch {
  muted = false
}

let rainSource: AudioBufferSourceNode | null = null
let rainGain: GainNode | null = null
let rainWanted = false
let rainQuiet = false

function ac(): AudioContext | null {
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 1
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function unlockAudio(): void {
  ac()
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(next: boolean): boolean {
  muted = next
  try {
    localStorage.setItem(MUTE_KEY, String(muted))
  } catch {
    /* ignore */
  }
  if (master) master.gain.value = muted ? 0 : 1
  if (muted) stopRain(true)
  else if (rainWanted) startRain(rainQuiet)
  return muted
}

export function toggleMute(): boolean {
  return setMuted(!muted)
}

function dest(audioCtx: AudioContext): AudioNode {
  return master ?? audioCtx.destination
}

function envGain(audioCtx: AudioContext, start: number, peak: number, dur: number, delay = 0): GainNode {
  const g = audioCtx.createGain()
  const t = start + delay
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  return g
}

function beep(
  audioCtx: AudioContext,
  freq: number,
  dur: number,
  peak: number,
  type: OscillatorType = 'sine',
  delay = 0,
  freqEnd = freq,
): void {
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const g = envGain(audioCtx, now, peak, dur, delay)
  osc.type = type
  osc.frequency.setValueAtTime(freq, now + delay)
  if (freqEnd !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + delay + dur)
  osc.connect(g)
  g.connect(dest(audioCtx))
  osc.start(now + delay)
  osc.stop(now + delay + dur + 0.02)
}

function noise(audioCtx: AudioContext, seconds: number): AudioBufferSourceNode {
  const length = Math.max(1, Math.floor(audioCtx.sampleRate * seconds))
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    brown = (brown + white * 0.08) / 1.08
    data[i] = brown * 3.2
  }
  const src = audioCtx.createBufferSource()
  src.buffer = buffer
  return src
}

function burst(
  audioCtx: AudioContext,
  dur: number,
  peak: number,
  freq: number,
  q = 4,
  delay = 0,
): void {
  const now = audioCtx.currentTime
  const src = noise(audioCtx, dur + 0.05)
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(freq, now + delay)
  filter.Q.value = q
  const g = envGain(audioCtx, now, peak, dur, delay)
  src.connect(filter)
  filter.connect(g)
  g.connect(dest(audioCtx))
  src.start(now + delay)
  src.stop(now + delay + dur + 0.04)
}

function chord(audioCtx: AudioContext, freqs: number[], dur: number, peak: number, delay = 0, type: OscillatorType = 'triangle'): void {
  for (const f of freqs) beep(audioCtx, f, dur, peak, type, delay)
}

function playCatch(audioCtx: AudioContext, combo: number): void {
  const n = Math.min(Math.max(combo, 1), 16)
  const base = 392 * (2 ** ((n - 1) / 12))
  beep(audioCtx, base, 0.11, 0.11, 'triangle')
  beep(audioCtx, base * 1.5, 0.14, 0.07, 'sine', 0.03)
  if (n >= 5) beep(audioCtx, base * 2, 0.16, 0.05, 'sine', 0.07)
  if (n > 0 && n % 5 === 0) chord(audioCtx, [523.25, 659.25, 783.99], 0.22, 0.06, 0.05)
}

function playRare(audioCtx: AudioContext): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((f, i) => beep(audioCtx, f, 0.18, 0.09, 'triangle', i * 0.06))
  burst(audioCtx, 0.22, 0.05, 2800, 2, 0.08)
}

function playPoop(audioCtx: AudioContext): void {
  burst(audioCtx, 0.18, 0.16, 180, 1.2)
  beep(audioCtx, 140, 0.22, 0.1, 'sawtooth', 0, 55)
}

function playFlush(audioCtx: AudioContext): void {
  burst(audioCtx, 0.5, 0.12, 420, 1.6)
  beep(audioCtx, 280, 0.45, 0.08, 'sine', 0, 70)
  beep(audioCtx, 190, 0.38, 0.05, 'triangle', 0.08, 60)
}

function playEat(audioCtx: AudioContext): void {
  burst(audioCtx, 0.07, 0.1, 900, 6)
  beep(audioCtx, 220, 0.08, 0.07, 'triangle', 0.04, 160)
  burst(audioCtx, 0.06, 0.08, 700, 5, 0.09)
}

function playTalk(audioCtx: AudioContext): void {
  beep(audioCtx, 494, 0.08, 0.08, 'triangle')
  beep(audioCtx, 587, 0.1, 0.07, 'triangle', 0.07)
  beep(audioCtx, 659, 0.14, 0.06, 'sine', 0.14)
}

function playCard(audioCtx: AudioContext): void {
  chord(audioCtx, [392, 493.88, 587.33], 0.28, 0.07)
  beep(audioCtx, 784, 0.32, 0.08, 'triangle', 0.12)
  beep(audioCtx, 987.77, 0.4, 0.06, 'sine', 0.22)
  burst(audioCtx, 0.35, 0.04, 2400, 1.4, 0.1)
}

function playFoil(audioCtx: AudioContext): void {
  burst(audioCtx, 0.28, 0.05, 3200, 1.8)
  beep(audioCtx, 1174, 0.22, 0.05, 'sine', 0.04, 1568)
}

function playThunder(audioCtx: AudioContext): void {
  burst(audioCtx, 0.7, 0.22, 90, 0.7)
  beep(audioCtx, 48, 0.8, 0.12, 'sine', 0.02, 28)
}

function startRain(quiet: boolean): void {
  const audioCtx = ac()
  if (!audioCtx || muted) return
  rainWanted = true
  rainQuiet = quiet
  if (rainSource) {
    rainGain?.gain.setTargetAtTime(quiet ? 0.012 : 0.045, audioCtx.currentTime, 0.12)
    return
  }
  const src = noise(audioCtx, 2)
  src.loop = true
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1400
  filter.Q.value = 0.7
  const g = audioCtx.createGain()
  g.gain.value = quiet ? 0.012 : 0.045
  src.connect(filter)
  filter.connect(g)
  g.connect(dest(audioCtx))
  src.start()
  rainSource = src
  rainGain = g
}

function stopRain(force = false): void {
  if (!force) rainWanted = false
  const audioCtx = ctx
  if (rainGain && audioCtx) {
    rainGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.18)
  }
  const src = rainSource
  rainSource = null
  rainGain = null
  window.setTimeout(() => {
    try { src?.stop() } catch { /* already stopped */ }
  }, 400)
}

export function setRainAmbience(on: boolean, quiet = false): void {
  if (on && !muted) startRain(quiet)
  else stopRain()
}

export function playSound(type: SoundName, opts: SoundOpts = {}): void {
  try {
    const audioCtx = ac()
    if (!audioCtx || muted) return
    switch (type) {
      case 'catch':
        playCatch(audioCtx, opts.combo ?? 1)
        break
      case 'rare':
        playRare(audioCtx)
        break
      case 'miss':
        beep(audioCtx, 240, 0.12, 0.05, 'sine', 0, 140)
        break
      case 'poop':
        playPoop(audioCtx)
        break
      case 'flush':
        playFlush(audioCtx)
        break
      case 'deny':
        beep(audioCtx, 196, 0.12, 0.08, 'square')
        beep(audioCtx, 147, 0.16, 0.07, 'square', 0.09)
        break
      case 'eat':
        playEat(audioCtx)
        break
      case 'buy':
        beep(audioCtx, 880, 0.08, 0.09, 'triangle')
        beep(audioCtx, 1320, 0.14, 0.08, 'sine', 0.06)
        break
      case 'sell':
        beep(audioCtx, 659, 0.08, 0.08, 'triangle')
        beep(audioCtx, 523, 0.12, 0.07, 'triangle', 0.07)
        break
      case 'talk':
        playTalk(audioCtx)
        break
      case 'gift':
        chord(audioCtx, [523.25, 659.25, 783.99, 1046.5], 0.24, 0.07, 0, 'triangle')
        break
      case 'open':
        beep(audioCtx, 392, 0.1, 0.07, 'triangle')
        beep(audioCtx, 523, 0.14, 0.06, 'sine', 0.06)
        break
      case 'close':
        beep(audioCtx, 392, 0.1, 0.06, 'triangle')
        beep(audioCtx, 294, 0.12, 0.05, 'sine', 0.05)
        break
      case 'tab':
        beep(audioCtx, 698, 0.06, 0.05, 'triangle')
        break
      case 'door':
        burst(audioCtx, 0.12, 0.07, 240, 2)
        beep(audioCtx, 180, 0.16, 0.05, 'triangle', 0.02, 140)
        break
      case 'pause':
        beep(audioCtx, 330, 0.1, 0.06, 'sine')
        beep(audioCtx, 247, 0.14, 0.05, 'sine', 0.08)
        break
      case 'resume':
        beep(audioCtx, 330, 0.08, 0.06, 'sine')
        beep(audioCtx, 440, 0.12, 0.06, 'sine', 0.07)
        break
      case 'town':
        chord(audioCtx, [392, 494, 588], 0.2, 0.06)
        break
      case 'orchard':
        chord(audioCtx, [440, 554, 659], 0.2, 0.06)
        break
      case 'custom':
        beep(audioCtx, 587, 0.08, 0.06, 'triangle')
        beep(audioCtx, 740, 0.12, 0.05, 'sine', 0.06)
        break
      case 'step':
        burst(audioCtx, 0.06, 0.035, 320, 3)
        break
      case 'near':
        beep(audioCtx, 784, 0.08, 0.04, 'sine')
        break
      case 'thunder':
        playThunder(audioCtx)
        break
      case 'zap':
        burst(audioCtx, 0.12, 0.14, 1800, 3)
        beep(audioCtx, 720, 0.1, 0.06, 'square', 0, 180)
        break
      case 'strike':
        burst(audioCtx, 0.28, 0.2, 500, 1.4)
        beep(audioCtx, 90, 0.3, 0.1, 'sawtooth', 0, 40)
        break
      case 'card':
        playCard(audioCtx)
        break
      case 'foil':
        playFoil(audioCtx)
        break
      case 'flip':
        burst(audioCtx, 0.1, 0.04, 1600, 2.4)
        beep(audioCtx, 640, 0.1, 0.04, 'triangle', 0, 820)
        break
      case 'fanfare':
        chord(audioCtx, [392, 523.25, 659.25], 0.28, 0.07)
        chord(audioCtx, [523.25, 659.25, 783.99], 0.32, 0.07, 0.16)
        break
      case 'start':
        beep(audioCtx, 523, 0.1, 0.07, 'triangle')
        beep(audioCtx, 659, 0.12, 0.06, 'triangle', 0.08)
        beep(audioCtx, 784, 0.16, 0.06, 'sine', 0.16)
        break
    }
  } catch {
    /* ignore locked audio */
  }
}
