<script setup lang="ts">
import type { AlbumSlot } from '../../game/flashCards'
import FruitHoloCard from '../cards/FruitHoloCard.vue'
import GameModal from './GameModal.vue'

defineProps<{
  open: boolean
  furniture: string[]
  album: AlbumSlot[]
}>()
const emit = defineEmits<{
  close: []
  inspect: [name: string]
}>()
</script>

<template>
  <GameModal :open="open">
    <div class="bar">
      <h3>🏠 我的溫馨小屋</h3>
      <button type="button" class="ac-btn ac-btn-orange" @click="emit('close')">離開</button>
    </div>
    <p>閃卡冊 · 點卡片把玩</p>
    <div class="album">
      <button
        v-for="slot in album"
        :key="slot.spec.name"
        type="button"
        class="slot"
        :disabled="!slot.count"
        @click="emit('inspect', slot.spec.name)"
      >
        <FruitHoloCard v-if="slot.count" :spec="slot.spec" mode="thumb" />
        <span v-else class="empty-card">{{ slot.spec.emoji }}</span>
        <span class="label">
          {{ slot.spec.name }}
          <b v-if="slot.count > 1">×{{ slot.count }}</b>
        </span>
      </button>
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
.album {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.slot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 8px 6px;
  background: #fdfdf5;
  border-radius: 18px;
  box-shadow: var(--ac-shadow);
  color: var(--ac-text);
}
.slot:disabled {
  opacity: 0.55;
  cursor: default;
}
.empty-card {
  display: grid;
  place-items: center;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  border: 1px dashed rgba(122, 88, 52, 0.35);
  background: rgba(247, 243, 223, 0.6);
  font-size: 1.6rem;
}
.label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}
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
