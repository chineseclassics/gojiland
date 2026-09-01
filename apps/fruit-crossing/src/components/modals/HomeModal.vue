<script setup lang="ts">
import GameModal from './GameModal.vue'

defineProps<{ open: boolean; furniture: string[] }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <GameModal :open="open">
    <div class="bar">
      <h3>🏠 我的溫馨小屋</h3>
      <button type="button" class="ac-btn ac-btn-orange" @click="emit('close')">離開</button>
    </div>
    <p>你擺放的家具：</p>
    <div class="list">
      <span v-for="item in furniture" :key="item" class="tag">{{ item }}</span>
      <span v-if="!furniture.length" class="empty">小屋還空空的。</span>
    </div>
  </GameModal>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
h3 { margin: 0; color: #725d42; }
p { color: #8a7b66; font-weight: 700; }
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 80px;
  background: #fdfdf5;
  border-radius: 24px;
  padding: 12px;
  box-shadow: var(--ac-shadow);
}
.tag {
  background: var(--ac-yellow);
  border-radius: var(--ac-radius-pill);
  padding: 6px 12px;
  font-weight: 800;
  font-size: 12px;
  color: var(--ac-text);
}
.empty { color: #8a7b66; font-weight: 700; }
</style>
