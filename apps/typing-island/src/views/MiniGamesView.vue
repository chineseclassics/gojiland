<script setup lang="ts">
import { injectIsland } from '../island/useIsland'

const island = injectIsland()
const { state } = island
</script>

<template>
  <section class="minis">
    <h1>{{ state.lang === 'zh' ? '島上各地' : 'Island spots' }}</h1>
    <p class="lead">
      {{ state.lang === 'zh' ? '走過的地方隨時能再玩。沒開的路，先去主線探險。' : 'Replay unlocked places. Finish the trail to open more.' }}
    </p>
    <div class="spots">
      <button class="spot blast" type="button" @click="island.openFall()">
        <span class="emoji">🎈</span>
        <strong>{{ state.lang === 'zh' ? '打掉字母氣球' : 'Pop letters' }}</strong>
        <em>{{ state.lang === 'zh' ? '看天空，啪啪打字' : 'Type to pop balloons' }}</em>
      </button>
      <button class="spot keys" type="button" @click="island.openKeys()">
        <span class="emoji">⌨️</span>
        <strong>{{ state.lang === 'zh' ? '字母回家' : 'Letter home' }}</strong>
        <em>{{ state.lang === 'zh' ? '認鍵' : 'Find keys' }}</em>
      </button>
      <button class="spot beach" type="button" @click="island.openOcean('beach')">
        <span class="emoji">🏖️</span>
        <strong>{{ state.lang === 'zh' ? '沙灘跳石' : 'Beach stones' }}</strong>
        <em>{{ state.lang === 'zh' ? '沒有鯊魚' : 'No shark' }}</em>
      </button>
      <button
        class="spot ocean"
        type="button"
        :disabled="!state.unlocked.ocean"
        @click="island.openOcean('shark')"
      >
        <span class="emoji">🦈</span>
        <strong>{{ state.lang === 'zh' ? '海底逃鯊' : 'Ocean chase' }}</strong>
        <em>{{ state.unlocked.ocean ? (state.lang === 'zh' ? '已開路' : 'Open') : (state.lang === 'zh' ? '還沒開路' : 'Locked') }}</em>
      </button>
      <button
        class="spot orchard"
        type="button"
        :disabled="!state.unlocked.orchard && state.campaignStep < 3"
        @click="island.openOrchard()"
      >
        <span class="emoji">🍎</span>
        <strong>{{ state.lang === 'zh' ? '水果雨' : 'Fruit rain' }}</strong>
        <em>{{ state.unlocked.orchard || state.campaignStep >= 3 ? (state.lang === 'zh' ? '已開路' : 'Open') : (state.lang === 'zh' ? '還沒開路' : 'Locked') }}</em>
      </button>
      <div class="spot locked">
        <span class="emoji">🌳</span>
        <strong>{{ state.lang === 'zh' ? '爬樹' : 'Tree climb' }}</strong>
        <em>{{ state.lang === 'zh' ? '即將開張' : 'Soon' }}</em>
      </div>
    </div>
  </section>
</template>

<style scoped>
.minis {
  height: 100%;
  padding: 8px 20px 28px;
  overflow: auto;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  margin: 0;
}

.lead {
  font-weight: 700;
  margin: 6px 0 18px;
}

.spots {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.spot {
  border: 4px solid oklch(0.32 0.04 50 / 0.14);
  border-radius: 24px;
  padding: 18px 12px;
  background: oklch(0.98 0.02 85 / 0.88);
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  box-shadow: 0 8px 0 oklch(0.22 0.04 50 / 0.1);
}

.spot .emoji { font-size: 2rem; }
.spot strong { font-family: var(--font-zh); font-size: 1.2rem; }
.spot em { font-style: normal; font-weight: 700; opacity: 0.65; }

.spot.keys { background: oklch(0.93 0.05 80); }
.spot.blast { background: oklch(0.92 0.12 55); }
.spot.beach { background: oklch(0.92 0.05 85); }
.spot.ocean { background: oklch(0.86 0.06 210); }
.spot.orchard { background: oklch(0.88 0.08 145); }
.spot.locked,
.spot:disabled {
  opacity: 0.55;
  filter: grayscale(0.4);
}

@media (max-width: 720px) {
  .spots { grid-template-columns: 1fr 1fr; }
}
</style>
