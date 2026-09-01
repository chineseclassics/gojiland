<script setup lang="ts">
import { useInjectedGame } from '../game/key'

const game = useInjectedGame()
const s = game.raw
const dateText = game.dateText
const weatherText = game.weatherText
const storming = game.storming
</script>

<template>
  <header class="header">
    <div class="row">
      <button class="ac-btn ac-btn-cream" type="button" @click="game.goLandHome">← 樂園</button>
      <h1 class="title">🍃 水果森友會</h1>
      <div class="chips">
        <span class="ac-chip">{{ dateText }}</span>
        <span class="ac-chip weather">{{ weatherText }}</span>
      </div>
    </div>
    <div class="row actions">
      <button class="ac-btn ac-btn-yellow" type="button" @click="game.useToilet">🚽 馬桶 {{ s.eaten }}/20</button>
      <button v-if="storming && !s.inShelter" class="ac-btn ac-btn-blue" type="button" @click="game.enterShelter">☂️ 躲雨</button>
      <button class="ac-btn ac-btn-green" type="button" @click="game.toggleTown">{{ s.mode === 'CATCH' ? '🏡 小鎮' : '🍎 果園' }}</button>
      <button class="ac-btn ac-btn-orange" type="button" @click="game.togglePause">{{ s.paused ? '▶️ 繼續' : '⏸️ 暫停' }}</button>
      <button class="ac-btn ac-btn-red" type="button" @click="game.finishGame">❌ 結束</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: calc(10px + env(safe-area-inset-top)) 12px 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent),
    linear-gradient(90deg, #f8a6b2 0%, #f7cd67 35%, #82d5bb 70%, #889df0 100%);
  border-bottom: 3px solid rgba(121, 79, 39, 0.12);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.actions { margin-top: 8px; }
.title {
  margin: 0;
  font-size: clamp(18px, 4.5vw, 22px);
  color: var(--ac-text);
  font-weight: 800;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
}
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.weather { background: #e6f9f6; }
</style>
