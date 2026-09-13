<script setup lang="ts">
import type { ShopDecor } from '../../types'
import type { HotelGuest } from '../../game/hotelGuests'
import GameModal from './GameModal.vue'

defineProps<{
  open: boolean
  guest: HotelGuest | null
  dialog: string
  ready: boolean
  remain: string
  furniture: string[]
  money: number
  decors: ShopDecor[]
  following: boolean
}>()

const emit = defineEmits<{
  close: []
  talk: []
  play: []
  decorate: [name: string, price: number]
  leave: []
}>()
</script>

<template>
  <GameModal :open="open">
    <div class="bar">
      <h3>{{ ready ? '🏡 新家' : '🪵 蓋房工地' }}</h3>
      <button type="button" class="ac-btn ac-btn-orange" @click="emit('close')">離開</button>
    </div>
    <div v-if="guest" class="guest">
      <span class="face">{{ guest.emoji }}</span>
      <div class="copy">
        <b>{{ guest.name }}</b>
        <small>{{ guest.title }}</small>
        <p>{{ dialog }}</p>
        <p v-if="!ready" class="wait">房子還在蓋，{{ remain }}。</p>
      </div>
    </div>
    <div class="actions">
      <button type="button" class="ac-btn ac-btn-yellow" @click="emit('talk')">對話</button>
      <button v-if="ready" type="button" class="ac-btn ac-btn-teal" @click="emit('play')">
        {{ following ? '一起散步中' : '一起玩耍' }}
      </button>
    </div>
    <template v-if="ready">
      <p class="hint">這是{{ guest?.name }}的家，可以幫忙買家具佈置。</p>
      <div class="grid">
        <button
          v-for="it in decors"
          :key="it.name"
          type="button"
          class="item"
          :disabled="furniture.includes(it.name)"
          @click="emit('decorate', it.name, it.price)"
        >
          <span>{{ it.name }}</span>
          <b>{{ furniture.includes(it.name) ? '已擺好' : '$' + it.price }}</b>
        </button>
      </div>
      <p v-if="furniture.length" class="placed">屋裡有：{{ furniture.join('、') }}</p>
      <button type="button" class="ac-btn ac-btn-brown ac-btn-block leave" @click="emit('leave')">
        請{{ guest?.name }}離開小鎮
      </button>
      <p class="hint">離開以後，這個人還可以再被邀請回來。</p>
    </template>
  </GameModal>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
h3 { margin: 0; color: #725d42; }
.hint, .placed, .wait { color: #8a7b66; font-weight: 700; font-size: 13px; line-height: 1.5; }
.wait { color: #b45309; }
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
.actions { display: flex; gap: 8px; margin-bottom: 10px; }
.actions .ac-btn { flex: 1; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 24vh; overflow: auto; }
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
.item:disabled { opacity: 0.45; }
.leave { margin-top: 12px; min-height: 46px; background: var(--ac-brown); color: #fff; box-shadow: 0 4px 0 0 #7a6745; }
.leave:active { box-shadow: 0 1px 0 0 #7a6745; }
</style>
