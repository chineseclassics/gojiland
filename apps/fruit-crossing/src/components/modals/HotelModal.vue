<script setup lang="ts">
import { computed } from 'vue'
import { HOTEL_ROOM_COUNT, type HotelGuest } from '../../game/hotelGuests'
import type { ShopDecor } from '../../types'
import GameModal from './GameModal.vue'

const props = defineProps<{
  open: boolean
  rooms: { room: 0 | 1; guest: HotelGuest; furniture: string[]; dialog: string }[]
  candidates: HotelGuest[]
  focusRoom: number
  money: number
  decors: ShopDecor[]
  townCount: number
  townMax: number
  townNames: string[]
}>()

const emit = defineEmits<{
  close: []
  focus: [room: number]
  invite: [id: string]
  talk: []
  decorate: [name: string, price: number]
  settle: []
  checkout: []
}>()

const focused = computed(() => props.rooms.find((r) => r.room === props.focusRoom) ?? null)
const emptyRooms = computed(() => HOTEL_ROOM_COUNT - props.rooms.length)
const townFull = computed(() => props.townCount >= props.townMax)

function owned(name: string) {
  return focused.value?.furniture.includes(name) ?? false
}
</script>

<template>
  <GameModal :open="open">
    <div class="bar">
      <h3>🏨 小屋旁的旅館</h3>
      <button type="button" class="ac-btn ac-btn-orange" @click="emit('close')">離開</button>
    </div>
    <p class="lead">兩間客房。邀請旅客住下，再請他們搬進小鎮。小鎮最多兩位新住民。</p>
    <p class="meta">客房 {{ rooms.length }}/2　小鎮 {{ townCount }}/{{ townMax }}</p>

    <template v-if="focusRoom < 0">
      <div class="rooms">
        <button
          v-for="n in 2"
          :key="n"
          type="button"
          class="room"
          @click="rooms.some((r) => r.room === n - 1) ? emit('focus', n - 1) : undefined"
        >
          <template v-if="rooms.find((r) => r.room === n - 1)">
            <span class="face">{{ rooms.find((r) => r.room === n - 1)!.guest.emoji }}</span>
            <b>{{ n }}號房 · {{ rooms.find((r) => r.room === n - 1)!.guest.name }}</b>
            <small>他站在旅館門口，點他也可以</small>
          </template>
          <template v-else>
            <span class="face">🛏️</span>
            <b>{{ n }}號房 · 空房</b>
            <small>還沒有人住</small>
          </template>
        </button>
      </div>
      <p class="hint">
        {{ emptyRooms ? '請一位旅客來住。他會出現在旅館門口。' : '客房滿了。再邀請新人，會請現在這位退房，換成新的人。' }}
      </p>
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
      <p v-if="!candidates.length" class="empty">暫時沒有可以邀請的人。</p>
    </template>

    <template v-else-if="focused">
      <button type="button" class="ac-btn ac-btn-cream back" @click="emit('focus', -1)">← 大廳</button>
      <div class="guest">
        <span class="face">{{ focused.guest.emoji }}</span>
        <div class="copy">
          <b>{{ focused.guest.name }}</b>
          <small>{{ focused.guest.title }} · {{ focused.room + 1 }}號房</small>
          <p>{{ focused.dialog }}</p>
        </div>
        <button type="button" class="ac-btn ac-btn-yellow" @click="emit('talk')">對話</button>
      </div>
      <p v-if="townFull" class="warn">
        小鎮已有 {{ townNames.join('、') }}。想請 {{ focused.guest.name }} 搬來，得先請其中一位離開。
      </p>
      <button
        type="button"
        class="ac-btn ac-btn-green ac-btn-block settle"
        :disabled="townFull"
        @click="emit('settle')"
      >
        請{{ focused.guest.name }}來小鎮住（開始蓋房）
      </button>
      <button type="button" class="ac-btn ac-btn-cream ac-btn-block checkout" @click="emit('checkout')">
        請{{ focused.guest.name }}退房，換成別人
      </button>
      <p class="hint">幫這間房買家具，客人會自己擺。每樣只能擺一次。</p>
      <div class="grid">
        <button
          v-for="it in decors"
          :key="it.name"
          type="button"
          class="item"
          :disabled="owned(it.name)"
          @click="emit('decorate', it.name, it.price)"
        >
          <span>{{ it.name }}</span>
          <b>{{ owned(it.name) ? '已擺好' : '$' + it.price }}</b>
        </button>
      </div>
      <p v-if="focused.furniture.length" class="placed">房裡有：{{ focused.furniture.join('、') }}</p>
    </template>
  </GameModal>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
h3 { margin: 0; color: #725d42; }
.lead, .hint, .empty, .meta, .placed, .warn { color: #8a7b66; font-weight: 700; font-size: 13px; line-height: 1.5; }
.meta { margin-top: -6px; }
.warn { color: #b45309; }
.back { margin: 8px 0; min-height: 34px; font-size: 12px; }
.rooms { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
.room {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fdfdf5;
  color: var(--ac-text);
  padding: 12px;
  border-radius: 18px;
  font-weight: 700;
  box-shadow: var(--ac-shadow);
  text-align: left;
}
.room small { color: #b08958; font-size: 11px; }
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
.list, .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 28vh; overflow: auto; }
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
.settle { margin-top: 8px; min-height: 46px; }
.settle:disabled { opacity: 0.45; }
.checkout { margin-top: 8px; min-height: 40px; }
</style>
