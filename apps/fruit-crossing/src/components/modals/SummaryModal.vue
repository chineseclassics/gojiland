<script setup lang="ts">
import GameModal from './GameModal.vue'

defineProps<{
  open: boolean
  title: string
  score: number
  combo: number
  eaten: number
  bag: number
}>()
const emit = defineEmits<{ restart: []; town: [] }>()
</script>

<template>
  <GameModal :open="open">
    <div class="center">
      <div class="emoji">🎉</div>
      <h2>{{ title }}</h2>
      <div class="box">
        <p><span>最終得分</span><b>{{ score }}</b></p>
        <p><span>最高連擊</span><b>{{ combo }}</b></p>
        <p><span>肚子</span><b>{{ eaten }} / 20</b></p>
        <p><span>背包</span><b>{{ bag }} 個</b></p>
      </div>
      <div class="row">
        <button type="button" class="ac-btn ac-btn-green" @click="emit('restart')">再玩一次</button>
        <button type="button" class="ac-btn ac-btn-yellow" @click="emit('town')">小鎮逛逛</button>
      </div>
    </div>
  </GameModal>
</template>

<style scoped>
.center { text-align: center; }
.emoji { font-size: 48px; }
h2 { margin: 8px 0 12px; color: #725d42; }
.box {
  background: #fdfdf5;
  border-radius: 24px;
  padding: 12px 16px;
  text-align: left;
  box-shadow: var(--ac-shadow);
}
.box p {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-weight: 700;
  color: #8a7b66;
}
.box b { color: var(--ac-text); }
.row { display: flex; gap: 10px; margin-top: 16px; }
.row .ac-btn { flex: 1; min-height: 48px; }
</style>
