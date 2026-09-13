<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  next: string
}>()

const rows = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
]

const nextChar = computed(() => props.next.slice(0, 1).toLowerCase())
</script>

<template>
  <div class="kbd" aria-hidden="true">
    <div v-for="row in rows" :key="row" class="kbd-row">
      <div
        v-for="ch in row"
        :key="ch"
        class="kbd-key"
        :class="{ next: ch === nextChar }"
      >
        {{ ch }}
      </div>
    </div>
  </div>
</template>
