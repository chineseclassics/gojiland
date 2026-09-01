<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div v-show="message" class="toast">📢 {{ message }}</div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: calc(88px + env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  max-width: min(92vw, 420px);
  background: #fdfdf5;
  color: var(--ac-text);
  border-radius: 40px 35px 45px 38px / 38px 45px 35px 40px;
  padding: 12px 18px;
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
  text-align: center;
  box-shadow: var(--ac-shadow-lg);
}
</style>
