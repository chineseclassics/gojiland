<script setup lang="ts">
import type { HotelGuest } from '../../game/hotelGuests'
import GameModal from './GameModal.vue'

defineProps<{
  open: boolean
  guest: HotelGuest | null
  candidates: HotelGuest[]
  dialog: string
}>()

const emit = defineEmits<{
  close: []
  invite: [id: string]
  talk: []
}>()
</script>

<template>
  <GameModal :open="open">
    <div class="bar">
      <h3>🏨 小屋旁的旅館</h3>
      <button type="button" class="ac-btn ac-btn-orange" @click="emit('close')">離開</button>
    </div>
    <p class="lead">每位旅客只會來這一夜。請來過的人，以後都不會再來。</p>
    <div v-if="guest" class="guest">
      <span class="face">{{ guest.emoji }}</span>
      <div class="copy">
        <b>{{ guest.name }}</b>
        <small>{{ guest.title }}</small>
        <p>{{ dialog }}</p>
      </div>
      <button type="button" class="ac-btn ac-btn-yellow" @click="emit('talk')">對話</button>
    </div>
    <template v-else-if="candidates.length">
      <p class="hint">今天還沒有人住進來。邀請一位吧，邀請過就不會再來。</p>
      <div class="list">
        <button
          v-for="it in candidates"
          :key="it.id"
          type="button"
          class="item"
          @click="emit('invite', it.id)"
        >
          <span>{{ it.emoji }} {{ it.name }}</span>
          <b>邀請</b>
        </button>
      </div>
    </template>
    <p v-else class="empty">認識過的旅客都來過了。旅館今晚空空的。</p>
  </GameModal>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
h3 { margin: 0; color: #725d42; }
.lead, .hint, .empty { color: #8a7b66; font-weight: 700; font-size: 13px; line-height: 1.5; }
.guest {
  display: flex;
  gap: 8px;
  align-items: center;
  background: #fdfdf5;
  border-radius: 24px;
  padding: 12px;
  margin: 10px 0;
  box-shadow: var(--ac-shadow);
}
.face { font-size: 36px; }
.copy { flex: 1; min-width: 0; }
.copy b { display: block; }
.copy small { color: #b08958; font-size: 11px; }
.copy p { margin: 6px 0 0; font-size: 13px; color: #725d42; }
.list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 40vh; overflow: auto; }
.item {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  background: #fdfdf5;
  color: var(--ac-text);
  padding: 10px;
  border-radius: 18px;
  font-weight: 700;
  font-size: 12px;
  box-shadow: var(--ac-shadow);
}
</style>
