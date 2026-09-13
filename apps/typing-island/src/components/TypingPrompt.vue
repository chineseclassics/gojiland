<script setup lang="ts">
import { computed } from 'vue'
import type { Prompt } from '../types'

const props = defineProps<{
  prompt: Prompt
  typed: string
  wrong?: boolean
  showHint?: boolean
}>()

const rest = computed(() => props.prompt.input.slice(props.typed.length))
</script>

<template>
  <div class="prompt-card" :class="{ wrong }">
    <div class="prompt-display">{{ prompt.display }}</div>
    <div class="prompt-typed">
      <span>{{ typed }}</span><span class="ghost">{{ rest }}</span>
    </div>
    <div v-if="showHint && prompt.hint !== prompt.display" class="prompt-hint">
      {{ prompt.hint }}
    </div>
  </div>
</template>
