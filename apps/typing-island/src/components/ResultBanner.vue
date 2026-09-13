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
      <button class="big-btn" type="button" @click="island.goHome()">
        {{ state.lang === 'zh' ? '回家看看寵物' : 'Back home' }}
      </button>
    </div>
  </div>
</template>
