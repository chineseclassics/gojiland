<script setup lang="ts">
import { computed } from 'vue'
import PetSprite from '../components/PetSprite.vue'
import { injectIsland } from '../island/useIsland'

const island = injectIsland()
const { state, petFull, petHungry, canCook, adventureLabel } = island

const speech = computed(() => {
  if (state.lang === 'en') {
    if (petHungry.value) return 'I am hungry... type-cook for me!'
    if (petFull.value) return 'So full! I will scare the shark away.'
    return 'Go adventure, then cook dinner.'
  }
  if (petHungry.value) return '肚子好餓……打字煮飯給我吃嘛'
  if (petFull.value) return '吃得好飽！下次出海我幫你趕鯊魚'
  return '出門帶東西回來，我們一起煮飯'
})
</script>

<template>
  <section class="home">
    <div class="sky" />
    <div class="island-body">
      <div class="cabin">
        <div class="roof" />
        <div class="door" />
        <div class="window" />
      </div>
      <div class="yard">
        <PetSprite :hungry="petHungry" :happy="petFull" />
        <div class="bubble">{{ speech }}</div>
      </div>
    </div>
    <div class="shore" />
    <div class="home-actions">
      <button class="big-btn" type="button" @click="island.startAdventure()">
        {{ adventureLabel }}
      </button>
      <button class="big-btn candy" type="button" @click="island.openFall()">
        {{ state.lang === 'zh' ? '打掉字母氣球' : 'Pop letters' }}
      </button>
      <button class="big-btn leaf" type="button" :disabled="!canCook" @click="island.openKitchen()">
        {{ state.lang === 'zh' ? '回家煮飯' : 'Cook' }}
      </button>
    </div>
    <p class="home-tip">
      {{ state.lang === 'zh'
        ? '寵物等級 ' + state.pet.level + ' · 飽食 ' + (100 - state.pet.hunger)
        : 'Pet Lv.' + state.pet.level + ' · full ' + (100 - state.pet.hunger) }}
    </p>
  </section>
</template>

<style scoped>
.home {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.sky {
  position: absolute;
  inset: 0 0 42% 0;
  background:
    radial-gradient(circle at 78% 22%, oklch(0.95 0.08 85), transparent 22%),
    linear-gradient(180deg, oklch(0.78 0.07 220), oklch(0.86 0.06 85));
}

.island-body {
  position: absolute;
  left: 50%;
  top: 28%;
  width: min(560px, 90vw);
  height: 38%;
  transform: translateX(-50%);
  background: oklch(0.72 0.12 145);
  border-radius: 46% 48% 20% 22%;
  box-shadow: inset 0 18px 0 oklch(0.62 0.12 145 / 0.4);
}

.cabin {
  position: absolute;
  left: 12%;
  top: -18%;
  width: 132px;
  height: 110px;
  background: oklch(0.82 0.06 70);
  border-radius: 8px 8px 6px 6px;
}

.roof {
  position: absolute;
  left: -16px;
  top: -28px;
  width: 164px;
  height: 52px;
  background: var(--berry);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.door {
  position: absolute;
  left: 52px;
  bottom: 0;
  width: 28px;
  height: 42px;
  background: oklch(0.45 0.08 50);
  border-radius: 8px 8px 0 0;
}

.window {
  position: absolute;
  right: 16px;
  top: 28px;
  width: 28px;
  height: 22px;
  background: oklch(0.82 0.06 220);
  border-radius: 4px;
}

.yard {
  position: absolute;
  right: 10%;
  bottom: 12%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bubble {
  margin-top: 8px;
  max-width: 180px;
  background: oklch(0.98 0.02 85);
  padding: 8px 12px;
  border-radius: 16px 16px 16px 4px;
  font-weight: 800;
  font-size: 14px;
}

.shore {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 22%;
  background:
    linear-gradient(180deg, oklch(0.9 0.05 85) 0 18%, oklch(0.52 0.08 210) 18% 100%);
}

.home-actions {
  position: absolute;
  left: 50%;
  bottom: 9%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 2;
  flex-wrap: wrap;
  justify-content: center;
  width: min(520px, 94vw);
}

.home-tip {
  position: absolute;
  left: 50%;
  bottom: 3%;
  transform: translateX(-50%);
  margin: 0;
  font-weight: 800;
  color: oklch(0.98 0.02 85);
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
