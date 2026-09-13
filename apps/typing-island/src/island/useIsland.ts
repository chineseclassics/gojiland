import { computed, inject, reactive, shallowRef, watch, type InjectionKey } from 'vue'
import type { IslandSave, Lang, LevelKind, LevelLoot, LevelResult, OceanMode, Scene } from '../types'

const SAVE_KEY = 'goji-typing-island-v1'

export function defaultSave(): IslandSave {
  return {
    lang: 'zh',
    campaignStep: 0,
    unlocked: { ocean: false, orchard: false },
    inventory: { fish: 0, fruit: 0 },
    pet: { hunger: 55, level: 1, fedCount: 0 },
    stars: 0,
    sharkBuff: 0,
  }
}

function loadSave(): IslandSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return defaultSave()
    return { ...defaultSave(), ...JSON.parse(raw) as IslandSave }
  } catch {
    return defaultSave()
  }
}

export function useIsland() {
  const state = reactive(loadSave())
  const scene = shallowRef<Scene>('home')
  const oceanMode = shallowRef<OceanMode>('beach')
  const result = shallowRef<LevelResult | null>(null)

  watch(state, () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  }, { deep: true })

  const showPinyinHint = computed(() => state.lang === 'zh' && state.campaignStep < 3)
  const petFull = computed(() => state.pet.hunger <= 20)
  const petHungry = computed(() => state.pet.hunger >= 70)
  const canCook = computed(() => state.inventory.fish > 0 || state.inventory.fruit > 0)

  const adventureLabel = computed(() => {
    if (state.lang === 'en') {
      if (state.campaignStep === 0) return 'Help letters go home'
      if (state.campaignStep === 1) return 'Beach jumps'
      if (state.campaignStep === 2) return 'Go to sea'
      if (state.campaignStep === 3) return 'Orchard rain'
      return 'Adventure again'
    }
    if (state.campaignStep === 0) return '幫字母回家'
    if (state.campaignStep === 1) return '去沙灘練習跳'
    if (state.campaignStep === 2) return '出海（小心鯊魚）'
    if (state.campaignStep === 3) return '去果園接水果'
    return '再出門冒險'
  })

  function setLang(lang: Lang) {
    state.lang = lang
  }

  function goHome() {
    result.value = null
    scene.value = 'home'
  }

  function goMiniGames() {
    result.value = null
    scene.value = 'minigames'
  }

  function startAdventure() {
    result.value = null
    if (state.campaignStep === 0) {
      scene.value = 'keys'
      return
    }
    if (state.campaignStep === 1) {
      oceanMode.value = 'beach'
      scene.value = 'ocean'
      return
    }
    if (state.campaignStep === 2) {
      oceanMode.value = 'shark'
      scene.value = 'ocean'
      return
    }
    scene.value = 'orchard'
  }

  function openKeys() {
    result.value = null
    scene.value = 'keys'
  }

  function openOcean(mode: OceanMode) {
    if (mode === 'shark' && !state.unlocked.ocean) return
    result.value = null
    oceanMode.value = mode
    scene.value = 'ocean'
  }

  function openOrchard() {
    if (!state.unlocked.orchard && state.campaignStep < 3) return
    result.value = null
    scene.value = 'orchard'
  }

  function openKitchen() {
    if (!canCook.value) return
    result.value = null
    scene.value = 'kitchen'
  }

  function completeLevel(kind: LevelKind, loot: LevelLoot, title: string, detail: string) {
    state.inventory.fish += loot.fish ?? 0
    state.inventory.fruit += loot.fruit ?? 0
    state.stars += loot.stars ?? 1
    if (kind !== 'kitchen') {
      state.pet.hunger = Math.min(100, state.pet.hunger + 12)
    }

    if (kind === 'keys' && state.campaignStep === 0) state.campaignStep = 1
    if (kind === 'beach') {
      state.unlocked.ocean = true
      if (state.campaignStep === 1) state.campaignStep = 2
    }
    if (kind === 'ocean') {
      state.unlocked.ocean = true
      if (state.campaignStep === 2) state.campaignStep = 3
      if (state.sharkBuff > 0) state.sharkBuff -= 1
    }
    if (kind === 'orchard') {
      state.unlocked.orchard = true
      if (state.campaignStep === 3) state.campaignStep = 4
    }

    result.value = { kind, title, detail, loot }
  }

  function cook(recipe: 'fish' | 'fruit' | 'feast') {
    if (recipe === 'fish' && state.inventory.fish < 1) return false
    if (recipe === 'fruit' && state.inventory.fruit < 1) return false
    if (recipe === 'feast' && (state.inventory.fish < 1 || state.inventory.fruit < 1)) return false

    if (recipe === 'fish') {
      state.inventory.fish -= 1
      state.pet.hunger = Math.max(0, state.pet.hunger - 40)
    } else if (recipe === 'fruit') {
      state.inventory.fruit -= 1
      state.pet.hunger = Math.max(0, state.pet.hunger - 28)
    } else {
      state.inventory.fish -= 1
      state.inventory.fruit -= 1
      state.pet.hunger = 0
      state.sharkBuff = 2
    }

    state.pet.fedCount += 1
    if (state.pet.fedCount % 3 === 0) state.pet.level += 1
    state.stars += recipe === 'feast' ? 2 : 1
    return true
  }

  function consumeSharkBuff() {
    return state.sharkBuff > 0
  }

  return {
    state,
    scene,
    oceanMode,
    result,
    showPinyinHint,
    petFull,
    petHungry,
    canCook,
    adventureLabel,
    setLang,
    goHome,
    goMiniGames,
    startAdventure,
    openKeys,
    openOcean,
    openOrchard,
    openKitchen,
    completeLevel,
    cook,
    consumeSharkBuff,
  }
}

export type Island = ReturnType<typeof useIsland>
export const islandKey: InjectionKey<Island> = Symbol('typing-island')

export function injectIsland(): Island {
  const island = inject(islandKey)
  if (!island) throw new Error('Island store missing')
  return island
}
