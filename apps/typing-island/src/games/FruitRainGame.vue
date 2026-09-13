<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import KeyboardHint from '../components/KeyboardHint.vue'
import TypingPrompt from '../components/TypingPrompt.vue'
import { sfx } from '../composables/useSfx'
import { useKeys } from '../composables/useKeys'
import { useTyping } from '../composables/useTyping'
import { bankFor, pickOne } from '../data/prompts'
import { injectIsland } from '../island/useIsland'

interface Fruit {
  id: number
  prompt: ReturnType<typeof pickOne>
  x: number
  y: number
  emoji: string
}

const NEED = 8
const island = injectIsland()
const { state, showPinyinHint } = island
const { typed, wrong, reset, feed } = useTyping()
const fruits = ref<Fruit[]>([])
const caught = shallowRef(0)
const missed = shallowRef(0)
const juice = shallowRef(false)
let idSeq = 1
const faces = ['🍎', '🍐', '🍇', '🍑', '🍋', '🍓']

const current = computed(() => fruits.value[0])
const remaining = computed(() => current.value?.prompt.input.slice(typed.value.length) ?? '')

function spawn() {
  fruits.value.push({
    id: idSeq,
    prompt: pickOne(bankFor(state.lang, 'fruit')),
    x: 12 + Math.random() * 70,
    y: -12,
    emoji: faces[idSeq % faces.length],
  })
  idSeq += 1
}

function bonk() {
  juice.value = true
  sfx.wrong()
  missed.value += 1
  fruits.value.shift()
  reset()
  window.setTimeout(() => {
    juice.value = false
  }, 280)
  if (missed.value >= 3) finish(false)
}

function finish(nice: boolean) {
  island.completeLevel(
    'orchard',
    { fruit: caught.value, stars: nice ? 2 : 1 },
    state.lang === 'zh' ? (nice ? '籃子滿了！' : '水果接到了') : (nice ? 'Basket full!' : 'Nice picking'),
    state.lang === 'zh' ? `帶回 ${caught.value} 顆水果。` : `You brought ${caught.value} fruit home.`,
  )
}

useKeys((key) => {
  if (island.result.value || !current.value) return
  const outcome = feed(key, current.value.prompt.input)
  if (outcome === 'wrong') {
    sfx.wrong()
    return
  }
  sfx.tap()
  if (outcome === 'done') {
    sfx.done()
    fruits.value.shift()
    caught.value += 1
    reset()
    if (caught.value >= NEED) finish(true)
  }
})

let raf = 0
let last = 0
let spawnAcc = 0
function tick(now: number) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
  last = now
  if (!island.result.value) {
    spawnAcc += dt
    if (spawnAcc > 1.5 && fruits.value.length < 4) {
      spawn()
      spawnAcc = 0
    }
    fruits.value = fruits.value.map((f) => ({ ...f, y: f.y + dt * 22 }))
    if (fruits.value[0] && fruits.value[0].y > 86) bonk()
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  spawn()
  raf = requestAnimationFrame(tick)
})
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <section class="rain" :class="{ juice }">
    <div class="trees" />
    <div
      v-for="fruit in fruits"
      :key="fruit.id"
      class="fruit"
      :class="{ active: current?.id === fruit.id }"
      :style="{ left: fruit.x + '%', top: fruit.y + '%' }"
    >
      {{ fruit.emoji }}
    </div>
    <div class="basket">🧺</div>
    <div v-if="current" class="center">
      <TypingPrompt :prompt="current.prompt" :typed="typed" :wrong="wrong" :show-hint="showPinyinHint" />
      <KeyboardHint :next="remaining" />
    </div>
    <p class="score">{{ caught }} / {{ NEED }} · miss {{ missed }}/3</p>
  </section>
</template>

<style scoped>
.rain {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.trees {
  position: absolute;
  inset: auto 0 0 0;
  height: 28%;
  background:
    radial-gradient(circle at 12% 0, oklch(0.42 0.12 145) 0 70px, transparent 71px),
    radial-gradient(circle at 50% 10%, oklch(0.4 0.12 145) 0 90px, transparent 91px),
    radial-gradient(circle at 86% 0, oklch(0.45 0.12 145) 0 80px, transparent 72px),
    oklch(0.62 0.12 85);
}

.fruit {
  position: absolute;
  font-size: 2.2rem;
  transform: translate(-50%, 0);
  filter: grayscale(0.3);
}

.fruit.active {
  filter: none;
  font-size: 2.8rem;
}

.basket {
  position: absolute;
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
  font-size: 3rem;
}

.center {
  position: absolute;
  left: 50%;
  top: 18%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.score {
  position: absolute;
  right: 18px;
  top: 8px;
  font-weight: 800;
  color: oklch(0.22 0.04 50);
}

.juice {
  animation: splat 0.28s var(--ease);
}

@keyframes splat {
  0% { background-color: oklch(0.7 0.15 25 / 0.25); }
  100% { background-color: transparent; }
}
</style>
