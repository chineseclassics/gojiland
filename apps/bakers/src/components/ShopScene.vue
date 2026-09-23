<script setup lang="ts">
import { ingredientList, ingredients, toolList, toolOwners } from '../game/catalog'
import { images } from '../game/images'
import { useBakers } from '../composables/useGame'

const { state, buy, setShopTab, switchScene } = useBakers()

function owned(id: string) {
  return state.inventory[id] ?? 0
}
</script>

<template>
  <section class="shop" :style="{ backgroundImage: `url(${images.shop})` }">
    <div class="sheet">
      <header class="head">
        <div>
          <p class="kicker">雜貨鋪</p>
          <h2>麵粉、奶油，還有修船的東西。</h2>
        </div>
        <button type="button" class="back" @click="switchScene('kitchen')">回廚房</button>
      </header>

      <p class="note">肉桂、可可、蜂蜜和香草，這裡不賣。去海邊幫船長修船才拿得到。</p>

      <div v-if="state.wanted.length" class="wanted">
        <p>這道點心還要買</p>
        <div>
          <span v-for="id in state.wanted" :key="id">
            <img :src="images[ingredients[id].image]" alt="" />
            {{ ingredients[id].name }}
          </span>
        </div>
      </div>

      <div class="tabs">
        <button type="button" :class="{ on: state.shopTab === 'ingredients' }" @click="setShopTab('ingredients')">烘焙食材</button>
        <button type="button" :class="{ on: state.shopTab === 'tools' }" @click="setShopTab('tools')">修船工具</button>
      </div>

      <div v-if="state.shopTab === 'ingredients'" class="grid">
        <article v-for="item in ingredientList" :key="item.id" class="card">
          <img :src="images[item.image]" :alt="item.name" />
          <h3>{{ item.name }}</h3>
          <p class="en">{{ item.enName }}</p>
          <p class="tip">{{ item.tip }}</p>
          <p class="own">已有 {{ owned(item.id) }}</p>
          <button type="button" @click="buy(item.id)">
            <img :src="images.coin" alt="" />
            {{ item.price }}
          </button>
        </article>
      </div>

      <div v-else class="grid">
        <article v-for="item in toolList" :key="item.id" class="card tool">
          <img :src="images[item.image]" :alt="item.name" />
          <h3>{{ item.name }}</h3>
          <p class="en">{{ item.enName }}</p>
          <p class="tip">{{ item.tip }}</p>
          <p class="own">{{ toolOwners(item.id).join('、') }}會用到 · 已有 {{ owned(item.id) }}</p>
          <button type="button" @click="buy(item.id)">
            <img :src="images.coin" alt="" />
            {{ item.price }}
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.shop {
  height: 100%;
  background-position: center;
  background-size: cover;
  display: flex;
}

.sheet {
  width: min(880px, calc(100% - 24px));
  margin: 12px;
  overflow: auto;
  background: color-mix(in oklch, var(--paper) 93%, white);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 16px 16px 24px;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
}

.kicker {
  font-family: "Noto Serif TC", serif;
  color: var(--cocoa);
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}

h2 {
  font-family: "Noto Serif TC", serif;
  font-size: clamp(1.3rem, 2vw, 1.8rem);
  margin: 2px 0 0;
}

.back, .tabs button, .card button {
  border: 0;
  border-radius: 12px;
  font-weight: 700;
}

.back {
  background: var(--cocoa);
  color: var(--paper);
  padding: 8px 12px;
  white-space: nowrap;
}

.note, .tip, .own, .en {
  color: var(--ink-soft);
  font-size: 0.82rem;
}

.note { margin: 10px 0; }

.wanted {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.85rem;
}

.wanted div { display: flex; flex-wrap: wrap; gap: 6px; }

.wanted span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: oklch(0.94 0.04 82);
  border-radius: 999px;
  padding: 2px 8px 2px 2px;
}

.wanted img { width: 28px; height: 28px; object-fit: contain; }

.tabs { display: flex; gap: 8px; margin: 8px 0 12px; }

.tabs button {
  background: var(--paper-2);
  padding: 8px 14px;
}

.tabs button.on {
  background: var(--cocoa);
  color: var(--paper);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.card {
  display: flex;
  flex-direction: column;
  background: oklch(0.98 0.012 90);
  border-radius: 16px;
  padding: 10px;
  min-height: 100%;
}

.card.tool { background: oklch(0.95 0.02 170); }

.card img {
  width: 100%;
  height: 104px;
  object-fit: contain;
}

h3 { margin: 4px 0 0; font-size: 1rem; }

.tip { flex: 1; margin: 4px 0; line-height: 1.4; }

.own { margin-bottom: 8px; }

.card button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--cocoa);
  color: var(--paper);
  padding: 8px;
}

.card button img { width: 18px; height: 18px; }
</style>
