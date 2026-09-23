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
        <p class="kicker">海邊</p>
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
      沙灘上這會兒沒有金幣。烤好一份點心，或幫船長修好船，潮水會再送來。
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
  padding: 10px 12px;
  font-weight: 700;
}

.sea { background: var(--sea); color: var(--paper); }
.quiet { background: var(--paper-2); }

.coin {
  position: absolute;
  border: 0;
  background: transparent;
  padding: 0;
  animation: float 2.6s ease-in-out infinite;
}

.coin img { width: 62px; height: 62px; object-fit: contain; }

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
</style>
