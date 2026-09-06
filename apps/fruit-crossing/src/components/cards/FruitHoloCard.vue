<script setup lang="ts">
import { computed, useTemplateRef, type CSSProperties } from 'vue'
import sparkleUrl from '../../assets/cards/mica-sparkle.svg'
import { useHoloPointer } from '../../composables/useHoloPointer'
import type { FruitCardSpec } from '../../game/flashCards'
import './holo-card.css'

const props = withDefaults(defineProps<{
  spec: FruitCardSpec
  mode: 'play' | 'still' | 'thumb'
  flipped?: boolean
}>(), {
  flipped: true,
})

const stageRef = useTemplateRef<HTMLElement>('stage')
const playable = computed(() => props.mode === 'play')
const faceUp = computed(() => props.flipped)
const stageClass = computed(() => [
  'holo-stage',
  `holo-${props.mode}`,
  props.flipped ? 'is-front' : 'is-back',
])
const stageStyle = computed(() => ({
  '--sparkle': `url("${sparkleUrl}")`,
  '--card-ratio': '3 / 4',
  '--fruit-glow': props.spec.glow,
  '--fruit-deep': props.spec.deep,
} as CSSProperties))

useHoloPointer(stageRef, playable, faceUp)
</script>

<template>
  <div
    ref="stage"
    :class="stageClass"
    :style="stageStyle"
  >
    <div class="holo-shadow" />
    <div class="holo-flipper">
      <div class="holo-card">
        <div class="holo-edge holo-edge-left" />
        <div class="holo-edge holo-edge-right" />
        <div class="holo-edge holo-edge-top" />
        <div class="holo-edge holo-edge-bottom" />
        <div class="holo-face holo-front">
          <div class="holo-fruit-face">
            <p class="holo-fruit-mark">森友閃卡</p>
            <span class="holo-fruit-emoji">{{ spec.emoji }}</span>
            <h3 class="holo-fruit-name">{{ spec.name }}</h3>
            <p class="holo-fruit-epithet">{{ spec.epithet }}</p>
          </div>
          <template v-if="mode !== 'thumb'">
            <div class="holo-foil" />
            <div class="holo-glitter" />
            <div class="holo-bar" />
            <div class="holo-glare" />
            <div class="holo-bevel" />
          </template>
        </div>
        <div class="holo-face holo-back">
          <div class="holo-verse">
            <div class="holo-verse-sheet">
              <div class="holo-verse-board">
                <p class="holo-verse-col">{{ spec.lines[0] }}</p>
                <p class="holo-verse-col">{{ spec.lines[1] }}</p>
              </div>
              <p class="holo-verse-colophon">水果先生<span>〈{{ spec.name }}〉</span></p>
            </div>
            <p class="holo-verse-seal">水果</p>
          </div>
          <template v-if="mode !== 'thumb'">
            <div class="holo-foil holo-foil-back" />
            <div class="holo-glare" />
            <div class="holo-bevel" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
