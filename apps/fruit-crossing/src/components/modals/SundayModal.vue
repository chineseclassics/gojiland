<script setup lang="ts">
import GameModal from './GameModal.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <GameModal :open="open">
    <div class="center">
      <div class="emoji">👴✨</div>
      <h2>星期日特別提示</h2>
      <p>今天水果先生會來商店。走進店裡找他說話，可能有禮物。</p>
      <button type="button" class="ac-btn ac-btn-green ac-btn-block" @click="emit('close')">知道了，開始玩！🍎</button>
    </div>
  </GameModal>
</template>

<style scoped>
.center { text-align: center; }
.emoji { font-size: 48px; }
h2 { margin: 8px 0; color: #725d42; font-size: 22px; }
p { font-size: 14px; font-weight: 700; color: #8a7b66; line-height: 1.5; }
.ac-btn { margin-top: 14px; min-height: 48px; }
</style>
