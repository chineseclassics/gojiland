<script setup lang="ts">
import { injectIsland } from '../island/useIsland'

const island = injectIsland()
const { state, scene } = island

function toggleLang() {
  island.setLang(state.lang === 'zh' ? 'en' : 'zh')
}
</script>

<template>
  <header class="hud">
    <div class="hud-cluster">
      <a class="hud-btn" href="https://goji.land">GojiLand</a>
      <button v-if="scene !== 'home'" class="hud-btn" type="button" @click="island.goHome()">
        {{ state.lang === 'zh' ? '回家' : 'Home' }}
      </button>
      <span class="chip">★ {{ state.stars }}</span>
      <span class="chip">🐟 {{ state.inventory.fish }}</span>
      <span class="chip">🍎 {{ state.inventory.fruit }}</span>
    </div>
    <div class="hud-actions">
      <button class="hud-btn" type="button" @click="toggleLang">
        {{ state.lang === 'zh' ? '中文' : 'English' }}
        <span style="opacity: 0.55"> / {{ state.lang === 'zh' ? 'EN' : '中' }}</span>
      </button>
      <button class="hud-btn primary" type="button" @click="island.goMiniGames()">
        {{ state.lang === 'zh' ? '小遊戲' : 'Minigames' }}
      </button>
    </div>
  </header>
</template>
