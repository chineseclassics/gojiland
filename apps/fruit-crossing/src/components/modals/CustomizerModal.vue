<script setup lang="ts">
import GameModal from './GameModal.vue'
import type { HairStyle } from '../../types'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; hair: [HairStyle]; shirt: [string] }>()
const hairs: { id: HairStyle; name: string }[] = [
  { id: 'short', name: '短髮' },
  { id: 'long', name: '長髮' },
  { id: 'pony', name: '馬尾' },
  { id: 'curl', name: '捲髮' },
  { id: 'cap', name: '鴨舌帽' },
]
const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
</script>

<template>
  <GameModal :open="open">
    <div class="bar">
      <h3>👕 角色裝扮</h3>
      <button type="button" class="ac-btn ac-btn-green" @click="emit('close')">關閉</button>
    </div>
    <p>髮型</p>
    <div class="row">
      <button v-for="h in hairs" :key="h.id" type="button" class="ac-btn ac-btn-cream" @click="emit('hair', h.id)">{{ h.name }}</button>
    </div>
    <p>衣服顏色</p>
    <div class="row">
      <button v-for="c in colors" :key="c" type="button" class="dot" :style="{ backgroundColor: c }" @click="emit('shirt', c)" />
    </div>
  </GameModal>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: center; }
h3 { margin: 0; color: #725d42; }
p { color: #8a7b66; font-weight: 700; margin: 12px 0 8px; }
.row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.dot {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  box-shadow: 0 4px 0 0 rgba(61, 52, 40, 0.18);
}
.dot:active { transform: translateY(2px); box-shadow: 0 1px 0 0 rgba(61, 52, 40, 0.18); }
</style>
