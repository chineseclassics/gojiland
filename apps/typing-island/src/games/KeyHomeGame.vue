<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import KeyboardHint from '../components/KeyboardHint.vue'
import TypingPrompt from '../components/TypingPrompt.vue'
import { sfx } from '../composables/useSfx'
import { useKeys } from '../composables/useKeys'
import { useTyping } from '../composables/useTyping'
import { bankFor } from '../data/prompts'
import { injectIsland } from '../island/useIsland'

const island = injectIsland()
const { state, showPinyinHint } = island
const { typed, wrong, reset, feed } = useTyping()

const queue = bankFor(state.lang, 'keys')
const index = shallowRef(0)
const prompt = computed(() => queue[index.value])
const remaining = computed(() => prompt.value.input.slice(typed.value.length))

useKeys((key) => {
  if (island.result.value) return
  const outcome = feed(key, prompt.value.input)
  if (outcome === 'wrong') {
    sfx.wrong()
    return
  }
  sfx.tap()
  if (outcome === 'done') {
    sfx.done()
    reset()
    if (index.value + 1 >= queue.length) {
      island.completeLevel(
        'keys',
        { stars: 1 },
        state.lang === 'zh' ? '字母都回家了！' : 'Letters are home!',
        state.lang === 'zh' ? '鍵盤亮起來了。可以去沙灘了。' : 'The keyboard woke up. Beach is next.',
      )
      return
    }
    index.value += 1
  }
})
</script>

<template>
  <section class="keys-game">
    <p class="title">{{ state.lang === 'zh' ? '迷路的字母要回家' : 'Lost letters want to go home' }}</p>
    <TypingPrompt :prompt="prompt" :typed="typed" :wrong="wrong" :show-hint="showPinyinHint" />
    <div class="house">
      <KeyboardHint :next="remaining" />
    </div>
    <p class="lang-note">
      {{ state.lang === 'zh' ? '請用英文鍵盤打拼音，不要開中文輸入法' : 'Type the letters you see' }}
    </p>
  </section>
</template>

<style scoped>
.keys-game {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding-bottom: 36px;
}

.title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  margin: 0;
}

.house {
  background: oklch(0.8 0.05 70);
  padding: 18px 18px 14px;
  border-radius: 24px 24px 12px 12px;
  box-shadow: 0 14px 0 oklch(0.45 0.08 50 / 0.2);
  position: relative;
}

.house::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -28px;
  width: 86%;
  height: 40px;
  transform: translateX(-50%);
  background: var(--berry);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.house {
  position: relative;
}
</style>
