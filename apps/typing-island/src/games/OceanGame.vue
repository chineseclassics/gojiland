<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import KidSprite from '../components/KidSprite.vue'
import KeyboardHint from '../components/KeyboardHint.vue'
import TypingPrompt from '../components/TypingPrompt.vue'
import { sfx } from '../composables/useSfx'
import { useKeys } from '../composables/useKeys'
import { useTyping } from '../composables/useTyping'
import { bankFor, pickOne } from '../data/prompts'
import { injectIsland } from '../island/useIsland'
import type { Prompt } from '../types'

const GOAL = 8
const island = injectIsland()
const { state, oceanMode, showPinyinHint } = island
const { typed, wrong, reset, feed } = useTyping()

const pos = shallowRef(0)
const jumping = shallowRef(false)
const spit = shallowRef(false)
const shark = shallowRef(0.12)
const near = shallowRef<Prompt>(pickOne(bankFor(state.lang, 'short')))
const far = shallowRef<Prompt>(pickOne(bankFor(state.lang, 'mid'), near.value.input))
const choice = shallowRef<'near' | 'far'>('near')
const frozen = shallowRef(false)

const active = computed(() => (choice.value === 'near' ? near.value : far.value))
const remaining = computed(() => active.value.input.slice(typed.value.length))
const canFar = computed(() => pos.value <= GOAL - 2)
const playerLeft = computed(() => 18 + (pos.value / GOAL) * 58)
const sharkLeft = computed(() => Math.max(2, playerLeft.value - 22 - shark.value * 14))
const sharkRate = computed(() => {
  if (oceanMode.value === 'beach') return 0
  return island.consumeSharkBuff() || island.petFull.value ? 0.028 : 0.05
})

function rollStones() {
  near.value = pickOne(bankFor(state.lang, 'short'))
  far.value = pickOne(bankFor(state.lang, oceanMode.value === 'beach' ? 'mid' : 'far'), near.value.input)
  choice.value = 'near'
  reset()
}

function win() {
  const sharkRun = oceanMode.value === 'shark'
  island.completeLevel(
    sharkRun ? 'ocean' : 'beach',
    { fish: sharkRun ? 2 : 1, stars: sharkRun ? 2 : 1 },
    state.lang === 'zh' ? (sharkRun ? '衝出水面了！' : '跳到沙灘盡頭了！') : (sharkRun ? 'You made it out!' : 'Beach complete!'),
    state.lang === 'zh' ? '帶回了魚，可以回家煮飯。' : 'You brought fish home for dinner.',
  )
}

function getSpit() {
  frozen.value = true
  spit.value = true
  sfx.wrong()
  pos.value = Math.max(0, pos.value - 1)
  shark.value = 0.28
  window.setTimeout(() => {
    spit.value = false
    frozen.value = false
    rollStones()
  }, 900)
}

function jumpTo(size: 'near' | 'far') {
  jumping.value = true
  sfx.done()
  pos.value += size === 'far' ? 2 : 1
  shark.value = Math.max(0.04, shark.value - 0.24)
  window.setTimeout(() => {
    jumping.value = false
  }, 320)
  if (pos.value >= GOAL) {
    win()
    return
  }
  rollStones()
}

useKeys((key) => {
  if (island.result.value || frozen.value) return
  if (key === ' ' && typed.value.length === 0) {
    if (canFar.value) choice.value = choice.value === 'near' ? 'far' : 'near'
    return
  }
  const outcome = feed(key, active.value.input)
  if (outcome === 'wrong') {
    sfx.wrong()
    shark.value = Math.min(1, shark.value + 0.1)
    if (shark.value >= 1 && oceanMode.value === 'shark') getSpit()
    return
  }
  sfx.tap()
  if (outcome === 'done') jumpTo(choice.value)
})

let raf = 0
let last = 0
function tick(now: number) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
  last = now
  if (!island.result.value && !frozen.value && oceanMode.value === 'shark') {
    shark.value = Math.min(1, shark.value + dt * sharkRate.value)
    if (shark.value >= 1) getSpit()
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  rollStones()
  raf = requestAnimationFrame(tick)
})
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <section class="ocean">
    <div class="surface" />
    <div class="caustic" />
    <div v-if="oceanMode === 'shark'" class="shark" :class="{ chomp: spit }" :style="{ left: sharkLeft + '%' }">
      <div class="fin" />
      <div class="shark-body">
        <div class="eye" />
        <div class="gums" />
      </div>
    </div>
    <div class="actor" :style="{ left: playerLeft + '%' }">
      <KidSprite :jumping="jumping" />
    </div>
    <div class="stone start" :style="{ left: '14%' }" />
    <div
      v-for="n in GOAL"
      :key="n"
      class="stone"
      :class="{ here: n === pos }"
      :style="{ left: 18 + (n / GOAL) * 58 + '%' }"
    />
    <div class="shore-flag" />
    <div class="prompts">
      <button class="pick" :class="{ on: choice === 'near' }" type="button" @click="choice = 'near'">
        <span>{{ state.lang === 'zh' ? '近' : 'Near' }}</span>
        <TypingPrompt :prompt="near" :typed="choice === 'near' ? typed : ''" :wrong="choice === 'near' && wrong" :show-hint="showPinyinHint" />
      </button>
      <button v-if="canFar" class="pick" :class="{ on: choice === 'far' }" type="button" @click="choice = 'far'">
        <span>{{ state.lang === 'zh' ? '遠' : 'Far' }}</span>
        <TypingPrompt :prompt="far" :typed="choice === 'far' ? typed : ''" :wrong="choice === 'far' && wrong" :show-hint="showPinyinHint" />
      </button>
    </div>
    <div class="dock">
      <KeyboardHint :next="remaining" />
    </div>
    <p class="lang-note">
      {{ oceanMode === 'shark'
        ? (state.lang === 'zh' ? '空白鍵換石頭 · 打錯鯊魚會靠近 · 被追上會吐回上一塊' : 'Space switches stone · mistakes bring the shark')
        : (state.lang === 'zh' ? '空白鍵換近／遠石頭' : 'Space switches near / far') }}
    </p>
  </section>
</template>

<style scoped>
.ocean {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px 96px;
  gap: 12px;
}

.surface {
  position: absolute;
  inset: 0 0 58% 0;
  background: linear-gradient(180deg, oklch(0.78 0.06 210), oklch(0.48 0.08 220));
}

.caustic {
  position: absolute;
  inset: 38% 0 0 0;
  background:
    radial-gradient(ellipse at 20% 20%, oklch(0.7 0.08 200 / 0.25) 0 18%, transparent 40%),
    radial-gradient(ellipse at 70% 40%, oklch(0.75 0.07 195 / 0.18) 0 20%, transparent 48%),
    oklch(0.3 0.06 228);
}

.stone {
  position: absolute;
  bottom: 28%;
  width: 70px;
  height: 28px;
  margin-left: -35px;
  background: oklch(0.55 0.04 70);
  border-radius: 50%;
  box-shadow: 0 8px 0 oklch(0.22 0.04 50 / 0.25);
}

.stone.here {
  background: oklch(0.78 0.08 85);
}

.shore-flag {
  position: absolute;
  right: 6%;
  bottom: 30%;
  width: 10px;
  height: 70px;
  background: oklch(0.86 0.05 85);
}

.shore-flag::after {
  content: '';
  position: absolute;
  top: 0;
  left: 10px;
  border: 12px solid transparent;
  border-left-color: var(--berry);
}

.actor {
  position: absolute;
  bottom: 31%;
  margin-left: -27px;
  z-index: 3;
}

.shark {
  position: absolute;
  bottom: 26%;
  z-index: 2;
  transition: left 0.2s linear;
}

.shark-body {
  width: 92px;
  height: 42px;
  background: oklch(0.48 0.04 250);
  border-radius: 50% 40% 50% 50%;
  position: relative;
}

.eye {
  position: absolute;
  right: 18px;
  top: 10px;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  box-shadow: inset -3px 0 0 #222;
}

.gums {
  position: absolute;
  right: 4px;
  top: 16px;
  width: 18px;
  height: 10px;
  background: oklch(0.7 0.12 20);
  border-radius: 0 8px 8px 0;
}

.fin {
  position: absolute;
  left: 28px;
  top: -16px;
  border: 14px solid transparent;
  border-bottom-color: oklch(0.42 0.04 250);
}

.shark.chomp {
  animation: chomp 0.4s var(--ease);
}

.prompts {
  display: flex;
  gap: 16px;
  z-index: 4;
}

.pick {
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: oklch(0.96 0.02 85);
  font-weight: 800;
}

.pick.on :deep(.prompt-card) {
  box-shadow: 0 10px 0 oklch(0.55 0.17 28 / 0.35);
  transform: translateY(-4px);
}

.dock {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  z-index: 6;
}

@keyframes chomp {
  0%, 100% { transform: scale(1); }
  40% { transform: scale(1.18) rotate(-8deg); }
}
</style>
