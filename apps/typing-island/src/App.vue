<script setup lang="ts">
import { computed, provide } from 'vue'
import GameHud from './components/GameHud.vue'
import ResultBanner from './components/ResultBanner.vue'
import FruitRainGame from './games/FruitRainGame.vue'
import KeyHomeGame from './games/KeyHomeGame.vue'
import KitchenGame from './games/KitchenGame.vue'
import OceanGame from './games/OceanGame.vue'
import { islandKey, useIsland } from './island/useIsland'
import HomeView from './views/HomeView.vue'
import MiniGamesView from './views/MiniGamesView.vue'

const island = useIsland()
provide(islandKey, island)

const sceneClass = computed(() => `scene-${island.scene.value}`)
</script>

<template>
  <div class="world" :class="sceneClass">
    <GameHud />
    <main class="scene-stage">
      <HomeView v-if="island.scene.value === 'home'" />
      <MiniGamesView v-else-if="island.scene.value === 'minigames'" />
      <KeyHomeGame v-else-if="island.scene.value === 'keys'" />
      <OceanGame v-else-if="island.scene.value === 'ocean'" />
      <FruitRainGame v-else-if="island.scene.value === 'orchard'" />
      <KitchenGame v-else-if="island.scene.value === 'kitchen'" />
      <ResultBanner />
    </main>
  </div>
</template>
