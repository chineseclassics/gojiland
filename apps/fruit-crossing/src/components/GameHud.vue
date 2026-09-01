<script setup lang="ts">
import { useInjectedGame } from '../game/key'

const game = useInjectedGame()
const s = game.raw
</script>

<template>
  <footer class="hud">
    <div class="stats">
      <div class="ac-stat"><small>得分</small><b>{{ s.score }}</b></div>
      <div class="ac-stat"><small>連擊</small><b>{{ s.combo }}</b></div>
      <div class="ac-stat"><small>飽足</small><b>{{ s.eaten }}/20</b></div>
      <div class="ac-stat money"><small>金錢</small><b>{{ s.money }}</b></div>
      <div class="ac-stat"><small>背包</small><b>{{ s.backpack.length }}</b></div>
    </div>
    <div class="hud-actions">
      <button v-if="s.mode === 'TOWN'" class="ac-btn ac-btn-purple" type="button" @click="game.openCustom">👕 換裝</button>
      <button class="ac-btn ac-btn-yellow" type="button" @click="game.toggleCatchType">
        {{ s.catchType === 'FRUIT' ? '🍎 水果' : '🥦 蔬菜' }}
      </button>
    </div>
  </footer>
</template>

<style scoped>
.hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background:
    linear-gradient(0deg, rgba(255, 255, 255, 0.4), transparent),
    #f0e8d8;
  border-top: 3px solid rgba(121, 79, 39, 0.12);
}
.stats { display: flex; flex-wrap: wrap; gap: 6px; }
.money { background: #f7cd67; }
.hud-actions { display: flex; gap: 8px; }
</style>
