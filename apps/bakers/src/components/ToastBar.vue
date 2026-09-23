<script setup lang="ts">
import { useBakers } from '../composables/useGame'

const { state } = useBakers()
</script>

<template>
  <Transition name="fade">
    <p v-if="state.toast" :key="state.toast.id" class="toast">{{ state.toast.text }}</p>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 40;
  margin: 0;
  max-width: min(520px, calc(100% - 28px));
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--cocoa-deep);
  color: var(--paper);
  font-weight: 700;
  text-align: center;
  box-shadow: var(--shadow);
}
</style>
