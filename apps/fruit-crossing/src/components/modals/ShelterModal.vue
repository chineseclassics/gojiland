<script setup lang="ts">
import GameModal from './GameModal.vue'

defineProps<{
  open: boolean
  count: number
  message: string
  ok: boolean
  status: string
  leaveLabel: string
}>()
const emit = defineEmits<{ eat: []; leave: [] }>()
</script>

<template>
  <GameModal :open="open">
    <div class="center">
      <div class="emoji">🛖🌧️</div>
      <h2>小木棚躲雨中</h2>
      <p>想躲就待著。也可以出去淋雨；水果淋濕了不會壞。</p>
      <p :class="ok ? 'good' : 'bad'">{{ message }}</p>
      <button type="button" class="ac-btn ac-btn-orange ac-btn-block" @click="emit('eat')">😋 躲雨吃水果（還有 {{ count }} 顆）</button>
      <p class="status">{{ status }}</p>
      <button type="button" class="ac-btn ac-btn-blue ac-btn-block" @click="emit('leave')">{{ leaveLabel }}</button>
    </div>
  </GameModal>
</template>

<style scoped>
.center { text-align: center; }
.emoji { font-size: 48px; }
h2 { margin: 6px 0; color: #725d42; }
p { font-size: 13px; font-weight: 700; color: #8a7b66; }
.good { color: #5a9e1e; }
.bad { color: #c94444; }
.ac-btn { min-height: 48px; margin-top: 8px; }
.status { color: #6a7fd4; margin-top: 10px; }
</style>
