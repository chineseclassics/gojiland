<script setup lang="ts">
import { computed } from 'vue'
import { FLASH_CARD_COST, type FruitStack } from '../../game/flashCards'
import { fruitSellPrice } from '../../constants'
import type { ShopDecor, ShopSeed, ShopTab } from '../../types'
import GameModal from './GameModal.vue'

const props = defineProps<{
  open: boolean
  money: number
  tab: ShopTab
  seeds: ShopSeed[]
  decors: ShopDecor[]
  backpack: string[]
  owned: string[]
  sunday: boolean
  dialog: string
  fruitStacks: FruitStack[]
}>()
const emit = defineEmits<{
  close: []
  tab: [ShopTab]
  buySeed: [name: string, price: number]
  buyDecor: [name: string, price: number]
  sell: [idx: number]
  talk: []
  exchange: [name: string]
}>()

const collecting = computed(() =>
  props.fruitStacks
    .filter((it) => it.count > 0)
    .sort((a, b) => Number(b.ready) - Number(a.ready) || b.count - a.count),
)

const sellable = computed(() => {
  const groups = new Map<string, { name: string; price: number; count: number; idx: number }>()
  props.backpack.forEach((name, idx) => {
    const price = fruitSellPrice(name)
    if (price == null) return
    const g = groups.get(name)
    if (g) g.count += 1
    else groups.set(name, { name, price, count: 1, idx })
  })
  return [...groups.values()]
})
</script>

<template>
  <GameModal :open="open">
    <div class="top">
      <div>
        <h3>🏪 小鎮水果商店</h3>
        <p>賣水果、買稀有種子。普通水果種子不收。</p>
      </div>
      <span class="money">💰 {{ money }}</span>
    </div>
    <div class="boss">
      <span class="face">🧔</span>
      <div class="copy">
        <b>商店老闆</b>
        <p>想賣水果，或買葡萄、榴蓮、金色果實的種子，找我就對了。</p>
      </div>
    </div>
    <div v-if="sunday" class="mr">
      <span class="face">👴</span>
      <div class="copy">
        <b>水果先生</b>
        <p>{{ dialog }}</p>
        <p class="gift">星期天只負責換閃卡，別的買賣找老闆。</p>
      </div>
      <button type="button" class="ac-btn ac-btn-yellow" @click="emit('talk')">對話</button>
    </div>
    <div v-if="sunday" class="trades">
      <p v-if="!collecting.length" class="hint">接到一百顆同樣的水果，就能跟水果先生換成閃卡。</p>
      <div v-for="it in collecting" :key="it.name" class="trade">
        <div class="trade-copy">
          <span>{{ it.emoji }} {{ it.name }}</span>
          <b :class="{ ready: it.ready }">{{ it.count }}/{{ FLASH_CARD_COST }}</b>
        </div>
        <button
          type="button"
          class="ac-btn"
          :class="it.ready ? 'ac-btn-green' : 'ac-btn-cream'"
          :disabled="!it.ready"
          @click="emit('exchange', it.name)"
        >
          {{ it.ready ? '換閃卡' : '還不夠' }}
        </button>
      </div>
    </div>
    <div class="tabs">
      <button type="button" class="ac-btn" :class="tab === 'seeds' ? 'ac-btn-teal' : 'ac-btn-cream'" @click="emit('tab', 'seeds')">稀有種子</button>
      <button type="button" class="ac-btn" :class="tab === 'decor' ? 'ac-btn-teal' : 'ac-btn-cream'" @click="emit('tab', 'decor')">買家俱</button>
      <button type="button" class="ac-btn" :class="tab === 'sell' ? 'ac-btn-teal' : 'ac-btn-cream'" @click="emit('tab', 'sell')">賣水果</button>
    </div>
    <div class="grid">
      <template v-if="tab === 'seeds'">
        <button v-for="it in seeds" :key="it.name" type="button" class="item" @click="emit('buySeed', it.name, it.price)">
          <span>{{ it.name }}</span><b>${{ it.price }}</b>
        </button>
      </template>
      <template v-else-if="tab === 'decor'">
        <button v-for="it in decors" :key="it.name" type="button" class="item" :disabled="owned.includes(it.name)" @click="emit('buyDecor', it.name, it.price)">
          <span>{{ it.name }}</span><b>{{ owned.includes(it.name) ? '已擁有' : '$' + it.price }}</b>
        </button>
      </template>
      <p v-else-if="!sellable.length" class="empty">沒有可賣的水果。種子不能賣給老闆。</p>
      <template v-else>
        <button v-for="it in sellable" :key="it.name" type="button" class="item" @click="emit('sell', it.idx)">
          <span>{{ it.name }} ×{{ it.count }}</span><b>賣 +${{ it.price }}</b>
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
.boss, .mr {
  display: flex;
  gap: 8px;
  align-items: center;
  background: #fdfdf5;
  border-radius: 24px;
  padding: 10px;
  margin: 10px 0 8px;
  box-shadow: var(--ac-shadow);
}
.face { font-size: 28px; }
.copy { flex: 1; min-width: 0; }
.gift { margin-top: 4px; color: #b45309; }
.trades {
  display: grid;
  gap: 6px;
  margin-bottom: 8px;
}
.hint {
  margin: 0;
  font-size: 12px;
  color: #8a7b66;
  text-align: center;
}
.trade {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdfdf5;
  border-radius: 18px;
  padding: 8px 10px;
  box-shadow: var(--ac-shadow);
}
.trade-copy {
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
}
.trade-copy .ready { color: #3f7a1d; }
.trade .ac-btn { min-height: 34px; font-size: 12px; padding: 0 10px; }
.trade .ac-btn:disabled { opacity: 0.45; }
.tabs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin: 10px 0; }
.tabs .ac-btn { min-height: 38px; font-size: 12px; padding: 0 6px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 28vh; overflow: auto; }
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
