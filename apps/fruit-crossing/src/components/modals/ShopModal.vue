<script setup lang="ts">
import GameModal from './GameModal.vue'
import type { ShopDecor, ShopFood, ShopTab } from '../../types'

const props = defineProps<{
  open: boolean
  money: number
  tab: ShopTab
  foods: ShopFood[]
  decors: ShopDecor[]
  backpack: string[]
  owned: string[]
  sunday: boolean
  dialog: string
}>()
const emit = defineEmits<{
  close: []
  tab: [ShopTab]
  buyFood: [name: string, price: number]
  buyDecor: [name: string, price: number]
  sell: [idx: number]
  talk: []
}>()

function sellPrice(name: string) {
  return props.foods.find((f) => f.name === name)?.sell ?? 15
}
</script>

<template>
  <GameModal :open="open">
    <div class="top">
      <div>
        <h3>🏪 小鎮水果商店</h3>
        <p>老闆：「歡迎選購新鮮蔬果與家具！」</p>
      </div>
      <span class="money">💰 {{ money }}</span>
    </div>
    <div v-if="sunday" class="mr">
      <span class="face">👴</span>
      <div>
        <b>水果先生</b>
        <p>{{ dialog }}</p>
      </div>
      <button type="button" class="ac-btn ac-btn-yellow" @click="emit('talk')">對話</button>
    </div>
    <div class="tabs">
      <button type="button" class="ac-btn" :class="tab === 'fruits' ? 'ac-btn-teal' : 'ac-btn-cream'" @click="emit('tab', 'fruits')">買蔬果</button>
      <button type="button" class="ac-btn" :class="tab === 'decor' ? 'ac-btn-teal' : 'ac-btn-cream'" @click="emit('tab', 'decor')">買家俱</button>
      <button type="button" class="ac-btn" :class="tab === 'sell' ? 'ac-btn-teal' : 'ac-btn-cream'" @click="emit('tab', 'sell')">出售</button>
    </div>
    <div class="grid">
      <template v-if="tab === 'fruits'">
        <button v-for="it in foods" :key="it.name" type="button" class="item" @click="emit('buyFood', it.name, it.price)">
          <span>{{ it.name }}</span><b>${{ it.price }}</b>
        </button>
      </template>
      <template v-else-if="tab === 'decor'">
        <button v-for="it in decors" :key="it.name" type="button" class="item" :disabled="owned.includes(it.name)" @click="emit('buyDecor', it.name, it.price)">
          <span>{{ it.name }}</span><b>{{ owned.includes(it.name) ? '已擁有' : '$' + it.price }}</b>
        </button>
      </template>
      <p v-else-if="!backpack.length" class="empty">背包是空的。</p>
      <template v-else>
        <button v-for="(it, idx) in backpack" :key="it + idx" type="button" class="item" @click="emit('sell', idx)">
          <span>{{ it }}</span><b>賣 +${{ sellPrice(it) }}</b>
        </button>
      </template>
    </div>
    <button type="button" class="ac-btn ac-btn-brown ac-btn-block leave" @click="emit('close')">離開商店</button>
  </GameModal>
</template>

<style scoped>
.top { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
h3 { margin: 0 0 4px; color: #725d42; font-size: 20px; }
p { margin: 0; font-size: 12px; color: #8a7b66; }
.money {
  background: var(--ac-yellow);
  border-radius: var(--ac-radius-pill);
  padding: 6px 12px;
  font-weight: 800;
  color: var(--ac-text);
  box-shadow: 0 3px 0 0 #d4ad45;
}
.mr {
  display: flex;
  gap: 8px;
  align-items: center;
  background: #fdfdf5;
  border-radius: 24px;
  padding: 10px;
  margin: 10px 0;
  box-shadow: var(--ac-shadow);
}
.face { font-size: 28px; }
.tabs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin: 10px 0; }
.tabs .ac-btn { min-height: 38px; font-size: 12px; padding: 0 6px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 36vh; overflow: auto; }
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
.empty { grid-column: 1 / -1; text-align: center; color: #8a7b66; }
.leave { margin-top: 12px; min-height: 46px; background: var(--ac-brown); color: #fff; box-shadow: 0 4px 0 0 #7a6745; }
.leave:active { box-shadow: 0 1px 0 0 #7a6745; }
</style>
