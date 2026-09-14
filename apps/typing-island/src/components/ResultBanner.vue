<script setup lang="ts">
import { injectIsland } from '../island/useIsland'

const island = injectIsland()
const { result, state } = island
</script>

<template>
  <div v-if="result" class="overlay">
    <div class="banner">
      <h2>{{ result.title }}</h2>
      <p>{{ result.detail }}</p>
      <div class="actions">
        <button v-if="result.kind === 'fall'" class="big-btn candy" type="button" @click="island.openFall()">
          {{ state.lang === 'zh' ? '再打一場氣球' : 'Pop again' }}
        </button>
        <button class="big-btn" type="button" @click="island.goHome()">
          {{ state.lang === 'zh' ? '回家看看寵物' : 'Back home' }}
        </button>
      </div>
    </div>
  </div>
</template>
