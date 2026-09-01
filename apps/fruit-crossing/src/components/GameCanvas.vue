<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useInjectedGame } from '../game/key'
import { useCanvasLoop } from '../game/useCanvasLoop'

const game = useInjectedGame()

const canvasRef = useTemplateRef<HTMLCanvasElement>('gameCanvas')
useCanvasLoop(canvasRef, game)

function pos(e: MouseEvent | TouchEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  const src = 'touches' in e ? (e.touches[0] || e.changedTouches[0]) : e
  if (!src) return { x: 0, y: 0 }
  const scaleX = game.raw.width / (rect.width || 1)
  const scaleY = game.raw.height / (rect.height || 1)
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  }
}

function onDown(e: MouseEvent | TouchEvent) {
  if ('touches' in e) e.preventDefault()
  const p = pos(e)
  game.pointerDown(p.x, p.y)
}

function onMove(e: MouseEvent | TouchEvent) {
  if ('touches' in e) {
    if (!e.touches.length) return
    e.preventDefault()
  } else if ((e as MouseEvent).buttons === 0) {
    // 滑鼠未按住時，接水果仍跟滑鼠；小鎮不空走
    if (game.raw.mode === 'TOWN') return
  }
  const p = pos(e)
  game.pointerMove(p.x, p.y)
}
</script>

<template>
  <canvas
    ref="gameCanvas"
    class="game-canvas"
    @mousedown="onDown"
    @mousemove="onMove"
    @touchstart.prevent="onDown"
    @touchmove.prevent="onMove"
  />
</template>

<style scoped>
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: pointer;
}
</style>
