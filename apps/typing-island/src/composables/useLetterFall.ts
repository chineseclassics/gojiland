import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'

export interface FallingLetter {
  id: number
  char: string
  x: number
  y: number
  speed: number
  hue: number
}

export type ShootResult =
  | { kind: 'idle' }
  | { kind: 'miss' }
  | { kind: 'hit'; letter: FallingLetter }

export interface ShotBeam {
  x: number
  y: number
}

const NEED = 36
const LIVES = 3
const GROUND = 86
const POOLS = [
  'asdfjkl',
  'asdfghjkl',
  'qwerasdfzxcvjkluiop',
  'abcdefghijklmnopqrstuvwxyz',
]

function poolFor(hits: number) {
  if (hits < 8) return POOLS[0]
  if (hits < 16) return POOLS[1]
  if (hits < 24) return POOLS[2]
  return POOLS[3]
}

export function useLetterFall(options: {
  paused: () => boolean
  onWin: (hits: number, combo: number) => void
  onLose: (hits: number) => void
  onSpill?: () => void
}) {
  const letters = ref<FallingLetter[]>([])
  const hits = shallowRef(0)
  const lives = shallowRef(LIVES)
  const combo = shallowRef(0)
  const bestCombo = shallowRef(0)
  const beam = shallowRef<ShotBeam | null>(null)
  const boomId = shallowRef<number | null>(null)

  let seq = 1
  let raf = 0
  let last = 0
  let spawnAcc = 0
  let beamTimer = 0

  const need = NEED
  const remaining = computed(() => Math.max(0, NEED - hits.value))
  const waveLabel = computed(() => {
    if (hits.value < 8) return 'home'
    if (hits.value < 16) return 'home+'
    if (hits.value < 24) return 'stretch'
    return 'all'
  })

  function pickChar() {
    const pool = poolFor(hits.value)
    const counts = new Map<string, number>()
    for (const letter of letters.value) {
      counts.set(letter.char, (counts.get(letter.char) ?? 0) + 1)
    }
    const fresh = pool.split('').filter((ch) => (counts.get(ch) ?? 0) < 2)
    const source = fresh.length ? fresh : pool.split('')
    return source[Math.floor(Math.random() * source.length)]
  }

  function spawn(startY = 2) {
    if (letters.value.length >= 8) return
    let x = 12 + Math.random() * 76
    for (let i = 0; i < 6; i += 1) {
      const clash = letters.value.some((letter) => Math.abs(letter.x - x) < 10 && Math.abs(letter.y - startY) < 16)
      if (!clash) break
      x = 12 + Math.random() * 76
    }
    letters.value.push({
      id: seq,
      char: pickChar(),
      x,
      y: startY,
      speed: 10 + hits.value * 0.32 + Math.random() * 4,
      hue: [28, 55, 85, 145, 200, 310][seq % 6],
    })
    seq += 1
  }

  function lowestMatch(char: string) {
    let best: FallingLetter | null = null
    for (const letter of letters.value) {
      if (letter.char !== char) continue
      if (!best || letter.y > best.y) best = letter
    }
    return best
  }

  function shoot(raw: string): ShootResult {
    if (options.paused()) return { kind: 'idle' }
    const char = raw.toLowerCase()
    if (!/^[a-z]$/.test(char)) return { kind: 'idle' }
    const target = lowestMatch(char)
    if (!target) {
      combo.value = 0
      return { kind: 'miss' }
    }
    letters.value = letters.value.filter((letter) => letter.id !== target.id)
    hits.value += 1
    combo.value += 1
    if (combo.value > bestCombo.value) bestCombo.value = combo.value
    beam.value = { x: target.x, y: target.y }
    boomId.value = target.id
    beamTimer = 0.18
    if (hits.value >= NEED) options.onWin(hits.value, bestCombo.value)
    return { kind: 'hit', letter: target }
  }

  function tick(now: number) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    if (!options.paused()) {
      spawnAcc += dt
      const gap = Math.max(0.7, 1.7 - hits.value * 0.02)
      if (spawnAcc > gap) {
        spawn()
        spawnAcc = 0
      }
      letters.value = letters.value.map((letter) => ({
        ...letter,
        y: letter.y + letter.speed * dt,
      }))
      const spilled = letters.value.filter((letter) => letter.y >= GROUND)
      if (spilled.length) {
        letters.value = letters.value.filter((letter) => letter.y < GROUND)
        combo.value = 0
        lives.value -= 1
        options.onSpill?.()
        if (lives.value <= 0) options.onLose(hits.value)
      }
      if (beamTimer > 0) {
        beamTimer -= dt
        if (beamTimer <= 0) {
          beam.value = null
          boomId.value = null
        }
      }
    }
    raf = requestAnimationFrame(tick)
  }

  onMounted(() => {
    spawn(8)
    spawn(22)
    spawn(14)
    raf = requestAnimationFrame(tick)
  })
  onUnmounted(() => cancelAnimationFrame(raf))

  return {
    letters,
    hits,
    lives,
    combo,
    bestCombo,
    beam,
    boomId,
    need,
    remaining,
    waveLabel,
    shoot,
  }
}
