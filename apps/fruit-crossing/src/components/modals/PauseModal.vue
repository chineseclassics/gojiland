<script setup lang="ts">
import GameModal from './GameModal.vue'
defineProps<{ open: boolean }>()
const emit = defineEmits<{ resume: [] }>()
</script>

<template>
  <GameModal :open="open">
    <div class="center">
      <div class="emoji">⏸️</div>
      <h2>遊戲暫停中</h2>
      <button type="button" class="ac-btn ac-btn-green ac-btn-block" @click="emit('resume')">▶️ 繼續遊戲</button>
    </div>
  </GameModal>
</template>

<style scoped>
.center { text-align: center; }
.emoji { font-size: 48px; }
h2 { margin: 8px 0 16px; color: #725d42; }
.ac-btn { min-height: 48px; }
</style>
