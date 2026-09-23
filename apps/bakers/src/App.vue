<script setup lang="ts">
import { computed, provide } from 'vue'
import AppHeader from './components/AppHeader.vue'
import BagPanel from './components/BagPanel.vue'
import BakeResult from './components/BakeResult.vue'
import BeachScene from './components/BeachScene.vue'
import KitchenScene from './components/KitchenScene.vue'
import ShopScene from './components/ShopScene.vue'
import ToastBar from './components/ToastBar.vue'
import { gameKey, useGame } from './composables/useGame'

const game = useGame()
provide(gameKey, game)
const scene = computed(() => game.state.scene)
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="stage" :data-scene="scene">
      <Transition :key="scene" name="scene" mode="out-in">
        <KitchenScene v-if="scene === 'kitchen'" />
        <ShopScene v-else-if="scene === 'shop'" />
        <BeachScene v-else />
      </Transition>
    </main>
    <BagPanel />
    <BakeResult />
    <ToastBar />
  </div>
</template>

<style scoped>
.app {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--cocoa-deep);
}

.stage {
  flex: 1;
  min-height: 0;
  position: relative;
}
</style>
