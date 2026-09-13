<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import KeyboardHint from '../components/KeyboardHint.vue'
import PetSprite from '../components/PetSprite.vue'
import TypingPrompt from '../components/TypingPrompt.vue'
import { sfx } from '../composables/useSfx'
import { useKeys } from '../composables/useKeys'
import { useTyping } from '../composables/useTyping'
import { banks } from '../data/prompts'
import { injectIsland } from '../island/useIsland'
import type { Prompt } from '../types'

const island = injectIsland()
const { state } = island
const { typed, wrong, reset, feed } = useTyping()
const recipe = shallowRef<'fish' | 'fruit' | 'feast' | null>(null)

const prompt = computed<Prompt | null>(() => {
  if (!recipe.value) return null
  return banks.cook[recipe.value][state.lang]
})
const remaining = computed(() => prompt.value?.input.slice(typed.value.length) ?? '')

function pick(next: 'fish' | 'fruit' | 'feast') {
  recipe.value = next
  reset()
}

useKeys((key) => {
  if (!prompt.value || island.result.value) return
  const outcome = feed(key, prompt.value.input)
  if (outcome === 'wrong') {
    sfx.wrong()
    return
  }
  sfx.tap()
  if (outcome === 'done' && recipe.value) {
    const ok = island.cook(recipe.value)
    if (!ok) return
    sfx.win()
    const name = prompt.value.display
    island.completeLevel(
      'kitchen',
      { cooked: name, stars: 0 },
      state.lang === 'zh' ? `${name}好了！` : `${name} is ready!`,
      state.lang === 'zh' ? '寵物吃得好香。出海會比較輕鬆。' : 'The pet is full. The shark will be slower.',
    )
  }
})
</script>

<template>
  <section class="kitchen">
    <div class="stove">
      <PetSprite :happy="true" />
      <div class="pot">🍲</div>
    </div>
    <div v-if="!recipe" class="menu">
      <p>{{ state.lang === 'zh' ? '今晚煮什麼？打出菜名。' : 'Type the dish name.' }}</p>
      <button v-if="state.inventory.fish > 0" class="big-btn sea" type="button" @click="pick('fish')">
        🐟 {{ state.lang === 'zh' ? '魚湯' : 'soup' }}
      </button>
      <button v-if="state.inventory.fruit > 0" class="big-btn leaf" type="button" @click="pick('fruit')">
        🍎 {{ state.lang === 'zh' ? '果盤' : 'salad' }}
      </button>
      <button v-if="state.inventory.fish > 0 && state.inventory.fruit > 0" class="big-btn" type="button" @click="pick('feast')">
        ✨ {{ state.lang === 'zh' ? '枸杞大餐' : 'feast' }}
      </button>
    </div>
    <div v-else class="cook-prompt">
      <TypingPrompt :prompt="prompt!" :typed="typed" :wrong="wrong" :show-hint="true" />
      <KeyboardHint :next="remaining" />
    </div>
  </section>
</template>

<style scoped>
.kitchen {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  background:
    linear-gradient(180deg, oklch(0.86 0.05 70), oklch(0.78 0.06 55));
}

.stove {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.pot {
  font-size: 4rem;
  animation: bob 1.6s var(--ease) infinite;
}

.menu, .cook-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.menu p {
  font-family: var(--font-zh);
  font-size: 1.4rem;
  margin: 0;
}
</style>
