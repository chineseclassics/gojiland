<script setup lang="ts">
defineProps<{
  jumping?: boolean
}>()
</script>

<template>
  <div class="kid" :class="{ jumping }">
    <div class="kid-head" />
    <div class="kid-hood" />
    <div class="kid-leg l" />
    <div class="kid-leg r" />
  </div>
</template>

<style scoped>
.kid.jumping {
  animation: hop 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes hop {
  0% { transform: translateY(0); }
  50% { transform: translateY(-28px); }
  100% { transform: translateY(0); }
}
</style>
