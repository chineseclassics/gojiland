<script setup lang="ts">
import { computed } from 'vue'
import { fruitCardSpec } from '../../game/flashCards'
import FruitHoloCard from './FruitHoloCard.vue'

const props = defineProps<{
  open: boolean
  fruitName: string
  flipped: boolean
  hint: string
}>()

const emit = defineEmits<{
  close: []
}>()

const spec = computed(() => fruitCardSpec(props.fruitName))

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && spec"
      class="inspect"
      @click="onBackdrop"
    >
      <div class="spot" @click.stop>
        <button type="button" class="close" @click="emit('close')">×</button>
        <FruitHoloCard
          :key="fruitName"
          :spec="spec"
          mode="play"
          :flipped="flipped"
        />
        <div class="meta">
          <div class="name">{{ spec.name }}</div>
          <div class="src">{{ spec.epithet }} · 水果先生</div>
          <div class="hint">{{ hint }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.inspect {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  background: radial-gradient(ellipse at 50% 42%, rgba(70, 42, 24, 0.35), rgba(8, 6, 5, 0.82) 70%);
  cursor: pointer;
}
.spot {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
}
.close {
  position: absolute;
  top: -0.4rem;
  right: -0.2rem;
  z-index: 3;
  appearance: none;
  border: 0;
  background: transparent;
  color: #e8d4b8;
  font-size: 1.3rem;
  cursor: pointer;
}
.meta {
  margin-top: 1.15rem;
  text-align: center;
  color: #f0e2c8;
  font-family: "Noto Serif TC", "Songti TC", serif;
}
.name {
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.32em;
}
.src {
  margin-top: 0.25rem;
  color: #d4b48a;
  font-size: 0.82rem;
  letter-spacing: 0.12em;
}
.hint {
  margin-top: 0.55rem;
  color: #9a8068;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}
</style>
