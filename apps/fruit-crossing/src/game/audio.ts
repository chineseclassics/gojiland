type SoundType = 'catch' | 'poop' | 'flush' | 'deny'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function playSound(type: SoundType): void {
  try {
    const ac = audio()
    if (!ac) return
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    const now = ac.currentTime
    if (type === 'catch') {
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.1)
      gain.gain.setValueAtTime(0.16, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.stop(now + 0.1)
    } else if (type === 'poop') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(160, now)
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.2)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      osc.stop(now + 0.2)
    } else if (type === 'flush') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.linearRampToValueAtTime(90, now + 0.4)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      osc.stop(now + 0.4)
    } else {
      osc.type = 'square'
      osc.frequency.setValueAtTime(200, now)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      osc.stop(now + 0.2)
    }
    osc.start()
  } catch {
    /* ignore locked audio */
  }
}
