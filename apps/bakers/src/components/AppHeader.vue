<script setup lang="ts">
import { images } from '../game/images'
import { soundMuted, toggleMute } from '../game/audio'
import { useBakers } from '../composables/useGame'

const { state, bagCount, switchScene, toggleBag, goLandHome } = useBakers()
</script>

<template>
  <header class="bar">
    <button type="button" class="home" @click="goLandHome">樂園</button>
    <div class="brand">
      <img class="portrait" :src="images.baker" alt="烘焙師" />
      <div>
        <p class="mark">The Bakers</p>
        <p class="sub">小小烘焙師</p>
      </div>
    </div>

    <div class="purse">
      <img :src="images.coin" alt="" />
      <span>{{ state.gold }}</span>
    </div>

    <nav class="nav">
      <button type="button" :class="{ on: state.scene === 'kitchen' }" @click="switchScene('kitchen')">廚房</button>
      <button type="button" :class="{ on: state.scene === 'shop' }" @click="switchScene('shop')">商店</button>
      <button type="button" :class="{ on: state.scene === 'beach' }" @click="switchScene('beach')">海邊</button>
      <button type="button" @click="toggleMute">{{ soundMuted ? '開聲音' : '靜音' }}</button>
      <button type="button" class="bag" @click="toggleBag">
        <img :src="images.satchel" alt="" />
        <span>包包</span>
        <em v-if="bagCount > 0">{{ bagCount }}</em>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  z-index: 5;
}

.home {
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  padding: 8px 10px;
  border-radius: 999px;
  font-weight: 700;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.portrait {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px var(--paper), 0 0 0 3px var(--line);
}

.mark {
  font-family: Fraunces, "Noto Serif TC", serif;
  font-weight: 680;
  font-size: 1.25rem;
  letter-spacing: -0.03em;
  line-height: 1;
}

.sub {
  margin-top: 3px;
  color: var(--ink-soft);
  font-size: 0.78rem;
}

.purse {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  background: oklch(0.94 0.04 88);
}

.purse img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.purse span {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 1.05rem;
}

.nav {
  display: flex;
  gap: 6px;
}

.nav button {
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
}

.nav button.on {
  background: var(--cocoa);
  color: var(--paper);
}

.bag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bag img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.bag em {
  font-style: normal;
  font-size: 0.72rem;
  min-width: 1.2rem;
  padding: 1px 5px;
  border-radius: 999px;
  background: var(--apricot);
  color: var(--cocoa-deep);
}

@media (max-width: 720px) {
  .bar { flex-wrap: wrap; padding: 8px 10px; }
  .sub { display: none; }
  .nav { width: 100%; }
  .nav button { flex: 1; padding: 8px 4px; }
  .purse { margin-left: 0; }
}
</style>
