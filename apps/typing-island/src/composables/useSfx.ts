let ctx: AudioContext | null = null

function audio() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function beep(freq: number, duration = 0.09, type: OscillatorType = 'triangle', gain = 0.05) {
  const ac = audio()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

export const sfx = {
  tap: () => beep(520, 0.06, 'triangle', 0.04),
  ok: () => beep(660, 0.1, 'sine', 0.05),
  done: () => {
    beep(520, 0.08)
    window.setTimeout(() => beep(780, 0.14), 70)
  },
  wrong: () => beep(180, 0.12, 'square', 0.04),
  win: () => {
    beep(523, 0.1)
    window.setTimeout(() => beep(659, 0.1), 90)
    window.setTimeout(() => beep(784, 0.18), 180)
  },
}
