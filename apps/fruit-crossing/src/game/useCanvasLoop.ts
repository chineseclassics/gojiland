import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { drawCatchScene, drawTownScene } from './draw'
import { loadSprites } from './sprites'
import type { FruitGame } from './useFruitGame'

export function useCanvasLoop(canvasRef: Ref<HTMLCanvasElement | null>, game: FruitGame) {
  let raf = 0
  let last = 0
  let ctx: CanvasRenderingContext2D | null = null

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    game.resize(rect.width, rect.height)
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    ctx = canvas.getContext('2d')
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function frame(ts: number) {
    if (!last) last = ts
    const dt = Math.min(0.033, (ts - last) / 1000)
    last = ts
    const s = game.raw
    game.updateWeather(dt)
    if (s.mode === 'CATCH') game.updateCatch(dt)
    else game.updateTown(dt)
    if (ctx) {
      if (s.mode === 'CATCH') drawCatchScene(ctx, s, game.basket)
      else drawTownScene(ctx, s, game.townPlayer, game.sunday.value)
    }
    raf = requestAnimationFrame(frame)
  }

  onMounted(() => {
    void loadSprites()
    resize()
    window.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('resize', resize)
    raf = requestAnimationFrame(frame)
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    window.visualViewport?.removeEventListener('resize', resize)
  })

  watch(canvasRef, () => resize())

  return { resize }
}
