<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import KidSprite from '../components/KidSprite.vue'
import PetSprite from '../components/PetSprite.vue'
import { sfx } from '../composables/useSfx'
import { useKeys } from '../composables/useKeys'
import { useLetterFall } from '../composables/useLetterFall'
import { injectIsland } from '../island/useIsland'

interface Pop {
  id: number
  x: number
  y: number
  hue: number
  char: string
}

const island = injectIsland()
const { state } = island
const hopping = shallowRef(false)
const ouch = shallowRef(false)
const pops = ref<Pop[]>([])
let popSeq = 1

const {
  letters,
  hits,
  lives,
  combo,
  beam,
  need,
  waveLabel,
  shoot,
} = useLetterFall({
  paused: () => Boolean(island.result.value),
  onWin(shotCount, comboCount) {
    sfx.win()
    island.completeLevel(
      'fall',
      { stars: comboCount >= 8 ? 2 : 1 },
      state.lang === 'zh' ? '氣球都打爆了！' : 'Balloon pop party!',
      state.lang === 'zh'
        ? `啪啪打掉 ${shotCount} 個，連擊 ${comboCount}。眼睛看天空，手自己會找到鍵。`
        : `Popped ${shotCount} balloons. Best combo ${comboCount}.`,
    )
  },
  onSpill() {
    sfx.wrong()
    ouch.value = true
    window.setTimeout(() => {
      ouch.value = false
    }, 280)
  },
  onLose(shotCount) {
    island.completeLevel(
      'fall',
      { stars: shotCount >= 12 ? 1 : 0 },
      state.lang === 'zh' ? '氣球碰到草地了' : 'A balloon kissed the grass',
      state.lang === 'zh'
        ? `這輪啪掉 ${shotCount} 個。再來！手停在 ASDF，不要偷看鍵盤。`
        : `You popped ${shotCount}. Fingers on ASDF, eyes on the sky.`,
    )
  },
})

const waveText = computed(() => {
  if (state.lang === 'en') {
    if (waveLabel.value === 'home') return 'Home row balloons: A S D F J K L'
    if (waveLabel.value === 'home+') return 'G and H join the sky'
    if (waveLabel.value === 'stretch') return 'Stretch those fingers!'
    return 'The whole alphabet is raining'
  }
  if (waveLabel.value === 'home') return '基本鍵氣球：A S D F J K L'
  if (waveLabel.value === 'home+') return 'G 和 H 也飛來了'
  if (waveLabel.value === 'stretch') return '手指要伸遠一點囉'
  return '二十六個字母一起下雨'
})

const sparkStyle = computed(() => {
  const shot = beam.value
  if (!shot) return null
  const x0 = 50
  const y0 = 88
  const dx = shot.x - x0
  const dy = shot.y - y0
  const length = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  return {
    width: `${length}%`,
    transform: `rotate(${angle}deg)`,
  }
})

useKeys((key) => {
  const outcome = shoot(key)
  if (outcome.kind === 'hit') {
    sfx.ok()
    hopping.value = true
    pops.value.push({
      id: popSeq,
      x: outcome.letter.x,
      y: outcome.letter.y,
      hue: outcome.letter.hue,
      char: outcome.letter.char,
    })
    const id = popSeq
    popSeq += 1
    window.setTimeout(() => {
      hopping.value = false
      pops.value = pops.value.filter((pop) => pop.id !== id)
    }, 420)
    return
  }
  if (outcome.kind === 'miss') {
    sfx.wrong()
    ouch.value = true
    window.setTimeout(() => {
      ouch.value = false
    }, 280)
  }
})
</script>

<template>
  <section class="fall" :class="{ ouch }">
    <div class="sky">
      <div class="sun" />
      <div class="cloud one" />
      <div class="cloud two" />
      <div class="cloud three" />
      <div class="ribbon">
        <strong>{{ state.lang === 'zh' ? '打掉字母' : 'Letter blast' }}</strong>
        <em>{{ waveText }}</em>
      </div>
      <div class="hearts">
        <span v-for="n in 3" :key="n" class="heart" :class="{ gone: n > lives }">♥</span>
      </div>
      <div v-if="combo >= 3" class="combo">
        {{ state.lang === 'zh' ? '連擊' : 'COMBO' }}
        <b>x{{ combo }}</b>
      </div>
      <div
        v-for="letter in letters"
        :key="letter.id"
        class="balloon"
        :style="{
          left: letter.x + '%',
          top: letter.y + '%',
          '--hue': String(letter.hue),
          animationDelay: (letter.id % 5) * -0.4 + 's',
        }"
      >
        <span class="face">
          <i class="eye" />
          <i class="eye" />
        </span>
        {{ letter.char.toUpperCase() }}
        <span class="string" />
      </div>
      <div
        v-for="pop in pops"
        :key="pop.id"
        class="pop"
        :style="{ left: pop.x + '%', top: pop.y + '%', '--hue': String(pop.hue) }"
      >
        啪{{ pop.char.toUpperCase() }}
      </div>
      <div v-if="sparkStyle" class="spark" :style="sparkStyle" />
      <div class="hill">
        <span class="bloom a">✿</span>
        <span class="bloom b">❀</span>
        <span class="bloom c">✿</span>
      </div>
      <div class="crew">
        <PetSprite :happy="combo >= 3" />
        <div class="shooter">
          <KidSprite :jumping="hopping" />
          <span class="wand" />
        </div>
      </div>
    </div>
    <p class="board">
      <span>{{ hits }} / {{ need }}</span>
      <small>{{ state.lang === 'zh' ? '看天空，手停在 ASDF' : 'Eyes up. Fingers on ASDF.' }}</small>
    </p>
  </section>
</template>

<style scoped>
.fall {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 12px 10px;
}

.fall.ouch .sky {
  animation: ouch 0.28s var(--ease);
}

.sky {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px 32px 48% 50%;
  background: linear-gradient(
    180deg,
    oklch(0.84 0.07 230) 0 38%,
    oklch(0.92 0.06 95) 68%,
    oklch(0.8 0.1 145) 100%
  );
  box-shadow: 0 10px 0 oklch(0.45 0.08 145 / 0.18);
}

.sun {
  position: absolute;
  right: 11%;
  top: 11%;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: oklch(0.93 0.16 85);
  box-shadow:
    0 0 0 12px oklch(0.93 0.16 85 / 0.28),
    18px -16px 0 -22px oklch(0.93 0.16 85),
    -20px -12px 0 -24px oklch(0.93 0.16 85),
    22px 8px 0 -24px oklch(0.93 0.16 85);
}

.cloud {
  position: absolute;
  background: oklch(0.99 0.01 210 / 0.92);
  border-radius: 40px;
  animation: drift 22s linear infinite;
  box-shadow:
    28px 8px 0 4px oklch(0.99 0.01 210 / 0.92),
    -22px 10px 0 0 oklch(0.99 0.01 210 / 0.92);
}

.cloud.one {
  width: 86px;
  height: 26px;
  top: 18%;
  left: -18%;
}

.cloud.two {
  width: 64px;
  height: 20px;
  top: 32%;
  left: 8%;
  animation-duration: 28s;
}

.cloud.three {
  width: 100px;
  height: 28px;
  top: 14%;
  left: 36%;
  animation-duration: 24s;
  animation-delay: -8s;
}

.ribbon {
  position: absolute;
  left: 14px;
  top: 12px;
  z-index: 2;
  background: var(--berry);
  color: oklch(0.98 0.03 85);
  padding: 8px 16px 10px;
  border-radius: 18px 22px 18px 8px;
  box-shadow: 0 6px 0 var(--berry-deep);
}

.ribbon strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.ribbon em {
  display: block;
  font-style: normal;
  font-weight: 800;
  font-size: 0.82rem;
  opacity: 0.9;
}

.hearts {
  position: absolute;
  right: 16px;
  top: 14px;
  z-index: 2;
  display: flex;
  gap: 6px;
  font-size: 1.6rem;
  color: var(--berry);
  filter: drop-shadow(0 3px 0 oklch(0.42 0.16 28 / 0.35));
}

.heart.gone {
  opacity: 0.22;
  filter: grayscale(1);
}

.combo {
  position: absolute;
  left: 50%;
  top: 18%;
  z-index: 3;
  transform: translateX(-50%) rotate(-6deg);
  background: oklch(0.95 0.14 85);
  color: var(--ink);
  padding: 6px 14px 8px;
  border-radius: 18px;
  font-weight: 900;
  box-shadow: 0 6px 0 oklch(0.78 0.12 70);
  animation: popin 0.35s var(--ease);
}

.combo b {
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin-left: 6px;
}

.balloon {
  position: absolute;
  width: 78px;
  height: 78px;
  margin-left: -39px;
  display: grid;
  place-items: center;
  padding-top: 14px;
  border-radius: 50% 50% 46% 50%;
  background:
    radial-gradient(circle at 32% 22%, oklch(0.97 0.06 var(--hue) / 0.9) 0 12px, transparent 13px),
    oklch(0.86 0.16 var(--hue));
  color: oklch(0.28 0.08 var(--hue));
  font-family: var(--font-display);
  font-size: 2.15rem;
  letter-spacing: 0;
  box-shadow:
    inset 0 -10px 0 oklch(0.72 0.14 var(--hue)),
    0 10px 0 oklch(0.55 0.1 var(--hue) / 0.32);
  animation: wobble 1.6s ease-in-out infinite;
}

.face {
  position: absolute;
  top: 8px;
  display: flex;
  gap: 18px;
}

.eye {
  width: 6px;
  height: 6px;
  background: oklch(0.28 0.04 50);
  border-radius: 50%;
}

.string {
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: 18px;
  background: oklch(0.55 0.06 var(--hue));
}

.pop {
  position: absolute;
  margin-left: -24px;
  font-family: var(--font-zh);
  font-size: 1.6rem;
  font-weight: 900;
  color: oklch(0.45 0.16 var(--hue));
  animation: burst 0.42s var(--ease) forwards;
  pointer-events: none;
}

.spark {
  position: absolute;
  left: 50%;
  top: 88%;
  height: 8px;
  transform-origin: left center;
  background: repeating-linear-gradient(
    90deg,
    oklch(0.92 0.16 85),
    oklch(0.92 0.16 85) 8px,
    transparent 8px,
    transparent 14px
  );
  border-radius: 99px;
  pointer-events: none;
}

.hill {
  position: absolute;
  left: -6%;
  right: -6%;
  bottom: -8%;
  height: 22%;
  background: oklch(0.68 0.14 145);
  border-radius: 50% 50% 0 0;
  box-shadow: inset 0 12px 0 oklch(0.58 0.13 145 / 0.4);
}

.bloom {
  position: absolute;
  top: 18%;
  font-size: 1.2rem;
}

.bloom.a { left: 12%; color: oklch(0.78 0.16 350); }
.bloom.b { left: 78%; top: 28%; color: oklch(0.86 0.16 85); }
.bloom.c { left: 28%; top: 38%; color: oklch(0.82 0.14 28); }

.crew {
  position: absolute;
  left: 50%;
  bottom: 3%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 10px;
  z-index: 2;
}

.shooter {
  position: relative;
}

.wand {
  position: absolute;
  left: 50%;
  top: -6px;
  width: 8px;
  height: 22px;
  transform: translateX(-50%);
  background: oklch(0.78 0.12 85);
  border-radius: 6px 6px 2px 2px;
  box-shadow: 0 -8px 0 4px oklch(0.9 0.16 85);
}

.board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 8px 0 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--ink);
}

.board small {
  font-family: var(--font-zh);
  font-size: 0.92rem;
  font-weight: 800;
}

@keyframes drift {
  from { transform: translateX(0); }
  to { transform: translateX(130%); }
}

@keyframes wobble {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(6deg); }
}

@keyframes burst {
  0% { transform: scale(0.4); opacity: 1; }
  100% { transform: scale(1.6) translateY(-18px); opacity: 0; }
}

@keyframes popin {
  from { transform: translateX(-50%) scale(0.6) rotate(-12deg); }
  to { transform: translateX(-50%) scale(1) rotate(-6deg); }
}

@keyframes ouch {
  0%, 100% { transform: translateX(0); }
  30% { transform: translateX(-8px); }
  60% { transform: translateX(8px); }
}
</style>
