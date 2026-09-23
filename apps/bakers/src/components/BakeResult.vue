<script setup lang="ts">
import { images } from '../game/images'
import { useBakers } from '../composables/useGame'

const { state, finishBake } = useBakers()
</script>

<template>
  <div v-if="state.result" class="mask">
      <section class="card">
        <img :src="images[state.result.image]" :alt="state.result.name" />
        <p class="kicker">烤好了</p>
        <h2>{{ state.result.name }}</h2>
        <div class="actions">
          <button type="button" @click="finishBake('eat')">吃掉</button>
          <button type="button" @click="finishBake('save')">放進包包</button>
          <button type="button" class="sell" @click="finishBake('sell')">
            <img :src="images.coin" alt="" />
            賣出，得到 {{ state.result.price }} 金幣
          </button>
        </div>
      </section>
    </div>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 20px;
  background: oklch(0.28 0.04 50 / 0.4);
  animation: rise 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes rise {
  from { opacity: 0; }
}

.card {
  width: min(380px, 100%);
  background: var(--paper);
  border-radius: 24px;
  padding: 22px 18px 16px;
  text-align: center;
  box-shadow: var(--shadow);
}

.card img {
  width: 160px;
  height: 160px;
  margin: 0 auto 8px;
  object-fit: contain;
}

.kicker {
  font-family: "Noto Serif TC", serif;
  color: var(--cocoa);
  letter-spacing: 0.12em;
}

h2 {
  font-family: "Noto Serif TC", serif;
  font-size: 1.8rem;
  margin: 4px 0 14px;
}

.actions { display: grid; gap: 8px; }

button {
  border: 0;
  border-radius: 14px;
  background: var(--paper-2);
  padding: 12px;
  font-weight: 700;
}

.sell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--cocoa);
  color: var(--paper);
}

.sell img { width: 22px; height: 22px; margin: 0; }
</style>
