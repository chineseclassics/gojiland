import { shallowRef } from 'vue'

export type SoundName =
  | 'pop'
  | 'lift'
  | 'recipe'
  | 'deny'
  | 'coin'
  | 'buy'
  | 'sell'
  | 'eat'
  | 'bag'
  | 'door'
  | 'tide'
  | 'hammer'
  | 'fanfare'

const MUTE_KEY = 'bakers-muted'

export const soundMuted = shallowRef(false)
try {
  soundMuted.value = localStorage.getItem(MUTE_KEY) === 'true'
} catch {
  soundMuted.value = false
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ovenNodes: AudioScheduledSourceNode[] = []

function ac(): AudioContext | null {
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = soundMuted.value ? 0 : 0.85
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function dest(audioCtx: AudioContext): AudioNode {
  return master ?? audioCtx.destination
}

export function toggleMute(): boolean {
  soundMuted.value = !soundMuted.value
  try {
    localStorage.setItem(MUTE_KEY, String(soundMuted.value))
  } catch {
    /* 靜音偏好寫不進去時，這一局仍然生效 */
  }
  ac()
  if (master) master.gain.value = soundMuted.value ? 0 : 0.85
  return soundMuted.value
}

function envGain(audioCtx: AudioContext, start: number, peak: number, dur: number, delay = 0): GainNode {
  const g = audioCtx.createGain()
  const t = start + delay
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + Math.min(0.02, dur * 0.25))
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
): OscillatorNode {
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const g = envGain(audioCtx, now, peak, dur, delay)
  osc.type = type
  osc.frequency.setValueAtTime(freq, now + delay)
  if (freqEnd !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + delay + dur)
  osc.connect(g)
  g.connect(dest(audioCtx))
  osc.start(now + delay)
  osc.stop(now + delay + dur + 0.03)
  return osc
}

function noise(audioCtx: AudioContext, seconds: number): AudioBufferSourceNode {
  const length = Math.max(1, Math.floor(audioCtx.sampleRate * seconds))
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    brown = (brown + white * 0.12) / 1.12
    data[i] = brown * 2.4
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
  sweepTo = freq,
): AudioBufferSourceNode {
  const now = audioCtx.currentTime
  const src = noise(audioCtx, dur + 0.08)
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(freq, now + delay)
  if (sweepTo !== freq) filter.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), now + delay + dur)
  filter.Q.value = q
  const g = envGain(audioCtx, now, peak, dur, delay)
  src.connect(filter)
  filter.connect(g)
  g.connect(dest(audioCtx))
  src.start(now + delay)
  src.stop(now + delay + dur + 0.05)
  return src
}

function playPop(audioCtx: AudioContext) {
  beep(audioCtx, 640, 0.07, 0.06, 'sine', 0, 420)
  burst(audioCtx, 0.05, 0.035, 1400, 3)
}

function playLift(audioCtx: AudioContext) {
  beep(audioCtx, 380, 0.09, 0.045, 'sine', 0, 620)
  burst(audioCtx, 0.06, 0.02, 900, 2, 0.02)
}

function playRecipe(audioCtx: AudioContext) {
  beep(audioCtx, 523.25, 0.1, 0.045, 'triangle')
  beep(audioCtx, 659.25, 0.14, 0.04, 'sine', 0.07)
  burst(audioCtx, 0.08, 0.02, 1800, 1.5, 0.04)
}

function playDeny(audioCtx: AudioContext) {
  beep(audioCtx, 196, 0.12, 0.05, 'triangle', 0, 140)
  burst(audioCtx, 0.08, 0.04, 220, 1.2)
}

function playCoin(audioCtx: AudioContext) {
  beep(audioCtx, 988, 0.12, 0.05, 'sine')
  beep(audioCtx, 1318, 0.16, 0.045, 'triangle', 0.06)
  burst(audioCtx, 0.1, 0.02, 2400, 2, 0.04)
}

function playBuy(audioCtx: AudioContext) {
  beep(audioCtx, 740, 0.08, 0.05, 'square')
  beep(audioCtx, 988, 0.14, 0.04, 'sine', 0.05)
  beep(audioCtx, 1480, 0.18, 0.03, 'triangle', 0.1)
}

function playSell(audioCtx: AudioContext) {
  beep(audioCtx, 523.25, 0.1, 0.045, 'triangle')
  beep(audioCtx, 659.25, 0.12, 0.04, 'triangle', 0.08)
  beep(audioCtx, 784, 0.18, 0.045, 'sine', 0.16)
  burst(audioCtx, 0.16, 0.025, 2000, 1.6, 0.1)
}

function playEat(audioCtx: AudioContext) {
  burst(audioCtx, 0.06, 0.07, 1100, 5)
  beep(audioCtx, 240, 0.07, 0.04, 'triangle', 0.03, 160)
  burst(audioCtx, 0.05, 0.055, 780, 4, 0.08)
  burst(audioCtx, 0.04, 0.04, 1400, 6, 0.14)
}

function playBag(audioCtx: AudioContext) {
  burst(audioCtx, 0.16, 0.045, 500, 0.8, 0, 900)
  beep(audioCtx, 320, 0.1, 0.03, 'sine', 0.04)
}

function playDoor(audioCtx: AudioContext) {
  burst(audioCtx, 0.22, 0.04, 280, 0.7, 0, 900)
  beep(audioCtx, 440, 0.16, 0.03, 'sine', 0.04, 660)
}

function playTide(audioCtx: AudioContext) {
  burst(audioCtx, 0.45, 0.04, 240, 0.6, 0, 140)
  beep(audioCtx, 330, 0.4, 0.025, 'sine', 0.05, 220)
}

function playHammer(audioCtx: AudioContext) {
  burst(audioCtx, 0.06, 0.08, 180, 1.4)
  beep(audioCtx, 140, 0.08, 0.05, 'triangle')
  burst(audioCtx, 0.05, 0.07, 220, 1.6, 0.12)
  beep(audioCtx, 180, 0.07, 0.04, 'triangle', 0.12)
}

function playFanfare(audioCtx: AudioContext) {
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, index) => beep(audioCtx, freq, 0.22, 0.05, 'triangle', index * 0.08))
  beep(audioCtx, 1318, 0.35, 0.035, 'sine', 0.32)
  burst(audioCtx, 0.28, 0.03, 2600, 1.5, 0.2)
}

export function stopOven() {
  const when = ctx?.currentTime ?? 0
  for (const node of ovenNodes) {
    try {
      node.stop(when)
    } catch {
      /* 已經播完 */
    }
  }
  ovenNodes = []
}

export function playOven() {
  const audioCtx = ac()
  if (!audioCtx) return
  stopOven()
  const ticks = [0, 0.28, 0.55, 0.82, 1.08]
  for (const delay of ticks) {
    ovenNodes.push(burst(audioCtx, 0.09, 0.03, 420 + delay * 180, 1.1, delay, 700))
    ovenNodes.push(beep(audioCtx, 196, 0.08, 0.02, 'sine', delay, 240))
  }
  ovenNodes.push(beep(audioCtx, 92, 1.25, 0.018, 'triangle', 0, 110))
}

export function playSound(kind: SoundName) {
  try {
    const audioCtx = ac()
    if (!audioCtx) return
    if (kind === 'pop') playPop(audioCtx)
    else if (kind === 'lift') playLift(audioCtx)
    else if (kind === 'recipe') playRecipe(audioCtx)
    else if (kind === 'deny') playDeny(audioCtx)
    else if (kind === 'coin') playCoin(audioCtx)
    else if (kind === 'buy') playBuy(audioCtx)
    else if (kind === 'sell') playSell(audioCtx)
    else if (kind === 'eat') playEat(audioCtx)
    else if (kind === 'bag') playBag(audioCtx)
    else if (kind === 'door') playDoor(audioCtx)
    else if (kind === 'tide') playTide(audioCtx)
    else if (kind === 'hammer') playHammer(audioCtx)
    else playFanfare(audioCtx)
  } catch {
    /* 沒有音效時遊戲仍可玩 */
  }
}

export function speakEnglish(text: string) {
  if (!('speechSynthesis' in window) || soundMuted.value) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}
