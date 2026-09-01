<script setup lang="ts">
defineProps<{ open: boolean }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="mask">
      <div class="sheet">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(61, 52, 40, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fade-in 0.2s ease;
}
.sheet {
  width: min(92vw, 460px);
  max-height: min(86dvh, 640px);
  overflow: auto;
  background: rgb(247, 243, 223);
  color: #725d42;
  border-radius: 40px 35px 45px 38px / 38px 45px 35px 40px;
  padding: 22px 20px;
  box-shadow: var(--ac-shadow-lg);
  font-weight: 600;
  animation: zoom-in 0.28s ease;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
</style>
