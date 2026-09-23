<script setup lang="ts">
import { ingredients, tools } from '../game/catalog'
import { images } from '../game/images'
import { useBakers } from '../composables/useGame'

const { state, captain, repair, collectCoin, seekTools, switchScene } = useBakers()

function hasTool(id: string) {
  return (state.inventory[id] ?? 0) > 0
}

function ready() {
  return captain.value.tools.every((id) => hasTool(id))
}
</script>

<template>
  <section class="beach" :style="{ backgroundImage: `url(${images.beach})` }">
    <article class="card">
      <img class="face" :src="images[captain.image]" :alt="captain.name" />
      <div>
        <p class="kicker">沙灣鎮海邊</p>
        <h2>{{ captain.name }}</h2>
        <p class="line">{{ state.thanks || captain.plea }}</p>
      </div>

      <ul class="tools">
        <li v-for="id in captain.tools" :key="id" :class="{ have: hasTool(id) }">
          <img :src="images[tools[id].image]" :alt="tools[id].name" />
          <span>{{ tools[id].name }}</span>
        </li>
      </ul>

      <p v-if="state.repaired" class="reward">
        <img :src="images[ingredients[captain.rewardItem].image]" alt="" />
        謝禮已經放進包包。
      </p>

      <div class="actions">
        <button v-if="!state.repaired && !ready()" type="button" class="sea" @click="seekTools">去買修船工具</button>
        <button v-else-if="!state.repaired" type="button" class="sea" @click="repair">修好這艘船</button>
        <button type="button" class="quiet" @click="switchScene('kitchen')">回廚房</button>
      </div>
    </article>

    <button
      v-for="(coin, index) in state.coins"
      :key="coin.id"
      type="button"
      class="coin"
      :style="{ left: `${coin.x}%`, top: `${coin.y}%`, animationDelay: `${index * 0.2}s` }"
      @click="collectCoin(coin.id)"
    >
      <img :src="images.coin" alt="金幣" />
      <span>{{ coin.amount }}</span>
    </button>

    <p v-if="state.coins.length === 0" class="tide">
      沙灘上這會兒沒有潮錢。烤好一份點心，或送走一艘船，下一潮會再留下。
    </p>
  </section>
</template>

<style scoped>
.beach {
  height: 100%;
  position: relative;
  background-position: center;
  background-size: cover;
  overflow: hidden;
}

.card {
  position: absolute;
  left: clamp(14px, 3vw, 40px);
  top: clamp(14px, 4vh, 40px);
  width: min(420px, calc(100% - 28px));
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 8px 12px;
  padding: 14px;
  border-radius: 20px;
  background: color-mix(in oklch, var(--paper) 92%, white);
  box-shadow: var(--shadow);
}

.face {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  grid-row: span 2;
}

.kicker {
  font-family: "Noto Serif TC", serif;
  color: var(--sea);
  letter-spacing: 0.08em;
  font-size: 0.78rem;
}

h2 {
  font-family: "Noto Serif TC", serif;
  margin: 0;
  font-size: 1.4rem;
}

.line {
  color: var(--ink-soft);
  line-height: 1.5;
  font-size: 0.92rem;
}

.tools {
  grid-column: 1 / -1;
  list-style: none;
  display: flex;
  gap: 8px;
  margin: 4px 0 0;
  padding: 0;
}

.tools li {
  flex: 1;
  text-align: center;
  border-radius: 12px;
  padding: 6px 4px;
  background: oklch(0.94 0.02 85);
  opacity: 0.55;
  font-size: 0.75rem;
}

.tools li.have { opacity: 1; background: oklch(0.93 0.04 160); }

.tools img {
  width: 48px;
  height: 48px;
  margin: 0 auto 2px;
  object-fit: contain;
}

.reward {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.reward img { width: 32px; height: 32px; object-fit: contain; }

.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
}

.sea, .quiet {
  border: 0;
  border-radius: 12px;
  min-height: 48px;
  padding: 12px 14px;
  font-weight: 700;
  flex: 1;
}

.sea { background: var(--sea); color: var(--paper); }
.quiet { background: var(--paper-2); }

.coin {
  position: absolute;
  width: 76px;
  height: 76px;
  border: 0;
  background: transparent;
  padding: 0;
  animation: float 2.6s ease-in-out infinite;
}

.coin img { width: 68px; height: 68px; object-fit: contain; }

.coin span {
  position: absolute;
  right: -2px;
  bottom: 0;
  background: var(--cocoa);
  color: var(--paper);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 5px;
}

.tide {
  position: absolute;
  left: 16px;
  bottom: 16px;
  max-width: min(420px, calc(100% - 32px));
  margin: 0;
  padding: 10px 12px;
  border-radius: 14px;
  background: color-mix(in oklch, var(--paper) 90%, white);
  color: var(--ink-soft);
  font-size: 0.85rem;
}

@keyframes float {
  50% { transform: translateY(-7px); }
}

@media (max-width: 700px), (max-height: 700px) {
  .card {
    top: 10px;
    width: min(520px, calc(100% - 20px));
    max-height: calc(100% - 150px);
    overflow: auto;
    grid-template-columns: 64px 1fr;
  }
  .face { width: 64px; height: 64px; }
  .coin { width: 84px; height: 84px; }
  .coin img { width: 72px; height: 72px; }
  .tide { bottom: calc(12px + env(safe-area-inset-bottom)); }
}

@media (min-width: 768px) and (max-width: 1180px) {
  .card { width: min(520px, calc(100% - 32px)); }
  .coin { width: 88px; height: 88px; }
  .coin img { width: 78px; height: 78px; }
  .sea, .quiet { min-height: 52px; font-size: 1.05rem; }
}
</style>
