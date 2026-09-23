import { computed, inject, reactive, readonly, shallowRef, watch, type InjectionKey } from 'vue'
import { playOven, playSound, speakEnglish, stopOven } from '../game/audio'
import { captains, ingredients, tools } from '../game/catalog'
import { sellPrice } from '../game/economy'
import type { ImageKey } from '../game/images'
import { dishes, guestImage, guestLine, guestName, matchDish, nextOrder, orderBonus, type GuestId } from '../game/recipes'
import type { BagFilter, BakedItem, BeachCoin, GameState, Recipe, SceneId, ShopTab, SupplyWhere } from '../game/types'

const SAVE_KEY = 'bakers-save-v1'

export interface PrepNeed {
  id: string
  where: SupplyWhere
}

export interface TrayItem {
  id: string
  name: string
  enName: string
  image: ImageKey
  count: number
  needed: boolean
  done: boolean
}

export interface BagStock {
  kind: 'stock'
  id: string
  name: string
  enName: string
  image: ImageKey
  count: number
  exclusive: boolean
}

export interface BagBaked {
  kind: 'baked'
  id: string
  name: string
  image: ImageKey
  count: number
  price: number
}

export type BagEntry = BagStock | BagBaked

interface SaveFile {
  v: 1
  gold: number
  inventory: Record<string, number>
  baked: BakedItem[]
  recipe: Recipe | null
  table: string[]
  captainIndex: number
  repaired: boolean
  thanks: string | null
  coins: BeachCoin[]
  tidePending: boolean
  wanted: string[]
  discovered?: string[]
  orderId?: string
  orderGuest?: string
  pendingBake?: BakedItem | null
}

function countOf(list: string[], id: string) {
  return list.filter((item) => item === id).length
}

function addCount(inventory: Record<string, number>, id: string, count: number) {
  inventory[id] = (inventory[id] ?? 0) + count
}

function takeCount(inventory: Record<string, number>, id: string) {
  const next = (inventory[id] ?? 0) - 1
  if (next <= 0) delete inventory[id]
  else inventory[id] = next
}

const coinSpots = [
  { x: 10, y: 64 },
  { x: 24, y: 76 },
  { x: 40, y: 68 },
  { x: 16, y: 84 },
  { x: 34, y: 86 },
  { x: 50, y: 78 },
]

function spawnCoins(amount: number): BeachCoin[] {
  const spots = [...coinSpots].sort(() => Math.random() - 0.5).slice(0, amount)
  return spots.map((spot, index) => ({
    id: `coin-${Date.now()}-${index}-${Math.floor(Math.random() * 999)}`,
    x: spot.x + Math.random() * 3,
    y: spot.y + Math.random() * 2,
    amount: 10 + Math.floor(Math.random() * 9),
  }))
}

function recipeFromDish(id: string): Recipe | null {
  const dish = dishes.find((item) => item.id === id)
  if (!dish) return null
  return {
    id: dish.id,
    name: dish.name,
    enName: dish.enName,
    image: dish.image,
    required: [...dish.required],
    note: dish.note,
  }
}

function freshState(): GameState {
  return {
    gold: 100,
    inventory: { flour: 2, sugar: 1, butter: 1, eggs: 1, baking_soda: 1 },
    baked: [],
    scene: 'kitchen',
    recipe: recipeFromDish('cookies'),
    table: [],
    captainIndex: 0,
    repaired: false,
    thanks: null,
    coins: spawnCoins(4),
    tidePending: false,
    shopTab: 'ingredients',
    bagOpen: false,
    bagFilter: 'all',
    customOpen: false,
    baking: false,
    result: null,
    toast: null,
    wanted: [],
    confirmReset: false,
    discovered: [],
    orderId: 'cookies',
    orderGuest: 'brother',
    pendingBake: null,
    debut: null,
  }
}

function isImageKey(value: unknown): value is ImageKey {
  return typeof value === 'string' && value in imagesSafe()
}

function imagesSafe() {
  const keys = new Set<string>()
  for (const item of Object.values(ingredients)) keys.add(item.image)
  for (const item of Object.values(tools)) keys.add(item.image)
  for (const dish of dishes) keys.add(dish.image)
  return Object.fromEntries([...keys].map((key) => [key, 1]))
}

function asRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readSave(): SaveFile | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = asRecord(JSON.parse(raw))
    if (!data || data.v !== 1) return null
    return data as unknown as SaveFile
  } catch {
    return null
  }
}

function sanitize(saved: SaveFile): GameState {
  const base = freshState()
  base.gold = Number.isFinite(saved.gold) ? Math.max(0, Math.floor(saved.gold)) : base.gold
  base.inventory = {}
  const inventory = asRecord(saved.inventory) ?? {}
  for (const [id, count] of Object.entries(inventory)) {
    if ((ingredients[id] || tools[id]) && typeof count === 'number' && count > 0) {
      base.inventory[id] = Math.floor(count)
    }
  }
  base.baked = Array.isArray(saved.baked)
    ? saved.baked.filter((item) => item && typeof item.name === 'string' && typeof item.count === 'number' && item.count > 0 && isImageKey(item.image)).map((item) => ({
        id: String(item.id),
        name: item.name.slice(0, 16),
        image: item.image,
        price: Math.max(0, Math.floor(item.price || 0)),
        count: Math.floor(item.count),
      }))
    : []
  if (saved.recipe && Array.isArray(saved.recipe.required) && isImageKey(saved.recipe.image)) {
    const dish = dishes.find((item) => item.id === saved.recipe?.id)
    const source = !saved.recipe.custom && dish ? dish.required : saved.recipe.required
    const required = source.filter((id) => ingredients[id])
    if (required.length > 0) {
      const savedRequired = saved.recipe.required.join('.')
      const nextRequired = required.join('.')
      const table = Array.isArray(saved.table) ? saved.table.filter((id) => ingredients[id]) : []
      if (savedRequired !== nextRequired) {
        for (const id of table) addCount(base.inventory, id, 1)
        base.table = []
      } else {
        base.table = table
      }
      base.recipe = {
        id: dish && !saved.recipe.custom ? dish.id : String(saved.recipe.id),
        name: dish && !saved.recipe.custom ? dish.name : String(saved.recipe.name).slice(0, 16),
        enName: dish && !saved.recipe.custom ? dish.enName : String(saved.recipe.enName || 'Pastry'),
        image: dish && !saved.recipe.custom ? dish.image : saved.recipe.image,
        required,
        custom: Boolean(saved.recipe.custom),
        note: dish?.note,
      }
    }
  }
  if (!base.recipe) {
    base.table = Array.isArray(saved.table) ? saved.table.filter((id) => ingredients[id]) : []
  }
  base.captainIndex = Math.min(captains.length - 1, Math.max(0, Math.floor(saved.captainIndex || 0)))
  base.repaired = Boolean(saved.repaired)
  base.thanks = typeof saved.thanks === 'string' ? saved.thanks : null
  base.coins = Array.isArray(saved.coins)
    ? saved.coins.filter((coin) => coin && typeof coin.amount === 'number').map((coin, index) => ({
        id: String(coin.id || `coin-saved-${index}`),
        x: Number(coin.x) || 20,
        y: Number(coin.y) || 70,
        amount: Math.max(1, Math.floor(coin.amount)),
      }))
    : base.coins
  base.tidePending = Boolean(saved.tidePending)
  base.wanted = Array.isArray(saved.wanted) ? saved.wanted.filter((id) => ingredients[id] && !ingredients[id].exclusive) : []
  base.discovered = Array.isArray(saved.discovered)
    ? [...new Set(saved.discovered.filter((id) => dishes.some((dish) => dish.id === id)))]
    : []
  base.orderId = dishes.some((dish) => dish.id === saved.orderId) ? String(saved.orderId) : 'cookies'
  const guestIds: GuestId[] = ['brother', 'jack', 'morgan', 'coral', 'luna', 'neighbor']
  base.orderGuest = guestIds.includes(saved.orderGuest as GuestId) ? String(saved.orderGuest) : 'brother'
  if (saved.pendingBake && isImageKey(saved.pendingBake.image) && typeof saved.pendingBake.name === 'string') {
    base.result = {
      id: String(saved.pendingBake.id),
      name: saved.pendingBake.name.slice(0, 16),
      image: saved.pendingBake.image,
      price: Math.max(0, Math.floor(saved.pendingBake.price || 0)),
      count: 1,
    }
    base.pendingBake = null
    base.baking = false
  }
  base.scene = 'kitchen'
  return base
}

export function useGame() {
  const saved = readSave()
  const state = reactive<GameState>(saved ? sanitize(saved) : freshState())
  const customDraft = shallowRef('')
  let toastTimer = 0
  let toastSerial = 0
  let bakeToken = 0

  function toast(text: string) {
    toastSerial += 1
    const id = toastSerial
    state.toast = { id, text }
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      if (state.toast?.id === id) state.toast = null
    }, 2600)
  }

  function returnTable() {
    for (const id of state.table) addCount(state.inventory, id, 1)
    state.table = []
  }

  function whereToFind(id: string): SupplyWhere {
    if ((state.inventory[id] ?? 0) > 0) return 'bag'
    if (ingredients[id]?.exclusive) return 'beach'
    return 'shop'
  }

  const prep = computed(() => {
    const recipe = state.recipe
    if (!recipe) return { missing: [] as PrepNeed[], ready: false }
    const missing = recipe.required.filter((id) => countOf(state.table, id) < countOf(recipe.required, id))
    const unique = [...new Set(missing)]
    return {
      missing: unique.map((id) => ({ id, where: whereToFind(id) })),
      ready: unique.length === 0 && state.table.length === recipe.required.length,
    }
  })

  const tray = computed<TrayItem[]>(() => {
    const needed = new Set(state.recipe?.required ?? [])
    return Object.entries(state.inventory)
      .filter(([id, count]) => count > 0 && ingredients[id])
      .map(([id, count]) => {
        const item = ingredients[id]
        const requiredCount = state.recipe ? countOf(state.recipe.required, id) : 0
        const placed = countOf(state.table, id)
        return {
          id,
          name: item.name,
          enName: item.enName,
          image: item.image,
          count,
          needed: needed.has(id),
          done: requiredCount > 0 && placed >= requiredCount,
        }
      })
      .sort((a, b) => Number(b.needed) - Number(a.needed) || a.name.localeCompare(b.name, 'zh-Hant'))
  })

  const captain = computed(() => captains[state.captainIndex] ?? captains[0])

  const recipePrice = computed(() => (state.recipe ? sellPrice(state.recipe.required) : 0))

  const order = computed(() => {
    const dish = dishes.find((item) => item.id === state.orderId) ?? dishes[0]
    const guestId = (['brother', 'jack', 'morgan', 'coral', 'luna', 'neighbor'] as GuestId[]).includes(state.orderGuest as GuestId)
      ? (state.orderGuest as GuestId)
      : 'brother'
    const price = sellPrice(dish.required)
    return {
      recipeId: dish.id,
      dishName: dish.name,
      guestName: guestName(guestId),
      image: guestImage(guestId),
      line: guestLine(guestId, dish.name),
      payout: price + orderBonus(price),
      dishImage: dish.image,
    }
  })

  const menuProgress = computed(() => ({
    done: state.discovered.length,
    total: dishes.length,
  }))

  const bagEntries = computed<BagEntry[]>(() => {
    const stock: BagStock[] = Object.entries(state.inventory)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => {
        const ingredient = ingredients[id]
        const tool = tools[id]
        const item = ingredient ?? tool
        return {
          kind: 'stock' as const,
          id,
          name: item?.name ?? id,
          enName: item?.enName ?? '',
          image: item?.image ?? 'pastry',
          count,
          exclusive: Boolean(ingredient?.exclusive),
        }
      })
    const baked: BagBaked[] = state.baked.map((item) => ({
      kind: 'baked' as const,
      id: item.id,
      name: item.name,
      image: item.image,
      count: item.count,
      price: item.price,
    }))
    if (state.bagFilter === 'baked') return baked
    if (state.bagFilter === 'stock') return stock
    return [...baked, ...stock]
  })

  const bagCount = computed(() => {
    const stock = Object.values(state.inventory).reduce((sum, count) => sum + count, 0)
    const baked = state.baked.reduce((sum, item) => sum + item.count, 0)
    return stock + baked
  })

  function arriveTide() {
    if (state.scene === 'beach' && state.coins.length === 0 && state.tidePending) {
      state.coins = spawnCoins(3)
      state.tidePending = false
      playSound('tide')
    }
  }

  function switchScene(scene: SceneId) {
    if (state.scene === scene) return
    if (scene === 'beach' && state.repaired) {
      state.captainIndex = (state.captainIndex + 1) % captains.length
      state.repaired = false
      state.thanks = null
    }
    state.scene = scene
    state.bagOpen = false
    playSound('door')
    if (scene === 'beach') arriveTide()
  }

  function goLandHome() {
    const host = window.location.hostname
    if (host.endsWith('workers.dev') || host.endsWith('goji.land')) {
      window.location.href = 'https://goji.land/'
      return
    }
    const path = window.location.pathname
    if (path.includes('/apps/bakers')) {
      window.location.href = path.replace(/\/apps\/bakers.*/, '/index.html')
      return
    }
    window.location.href = 'https://goji.land/'
  }

  function selectPreset(id: string) {
    if (state.baking) return
    if (state.recipe?.id === id) return
    const preset = dishes.find((item) => item.id === id)
    if (!preset) return
    returnTable()
    state.recipe = { ...preset, required: [...preset.required], note: preset.note }
    state.customOpen = false
    state.wanted = []
    playSound('recipe')
  }

  function toggleCustom() {
    state.customOpen = !state.customOpen
  }

  function submitCustom() {
    if (state.baking) return
    const name = customDraft.value.trim()
    if (!name) {
      playSound('deny')
      toast('先寫下想做的點心名字。')
      return
    }
    returnTable()
    const recipeName = name.slice(0, 16)
    const matched = matchDish(recipeName)
    const canonical = dishes.find((dish) => dish.id === matched.id)
    state.recipe = {
      id: matched.hit ? matched.id : `custom:${recipeName}:${matched.required.join('.')}`,
      name: matched.hit ? canonical?.name ?? recipeName : recipeName,
      enName: matched.enName,
      image: matched.image,
      required: matched.required,
      custom: !matched.hit,
      note: matched.note,
    }
    state.customOpen = false
    state.wanted = []
    customDraft.value = ''
    playSound('recipe')
    toast(matched.hit ? `${state.recipe.name}的空位擺好了。` : `「${recipeName}」先照奶油酥的材料來擺。`)
  }

  function place(id: string) {
    const item = ingredients[id]
    if (!item || state.baking) return
    if (!state.recipe) {
      playSound('deny')
      toast('先選一道點心，桌上才知道要放什麼。')
      return
    }
    const need = countOf(state.recipe.required, id)
    if (need === 0) {
      playSound('deny')
      toast(`${item.name}不是這道點心要用的。`)
      return
    }
    if (countOf(state.table, id) >= need) {
      playSound('deny')
      toast(`${item.name}已經放夠了。`)
      return
    }
    if ((state.inventory[id] ?? 0) < 1) return
    takeCount(state.inventory, id)
    state.table.push(id)
    speakEnglish(item.enName)
    playSound('pop')
  }

  function placeFromBag() {
    const recipe = state.recipe
    if (!recipe || state.baking) return
    let placed = 0
    for (const id of recipe.required) {
      const need = countOf(recipe.required, id)
      while (countOf(state.table, id) < need && (state.inventory[id] ?? 0) > 0) {
        takeCount(state.inventory, id)
        state.table.push(id)
        placed += 1
      }
    }
    if (!placed) {
      playSound('deny')
      toast('包包裡沒有能放上的材料。')
      return
    }
    speakEnglish(recipe.enName)
    playSound('pop')
    if (!prep.value.ready) toast('能放的都放上了，還缺一些。')
  }

  function unplace(id: string) {
    if (state.baking) return
    const index = state.table.indexOf(id)
    if (index < 0) return
    state.table.splice(index, 1)
    addCount(state.inventory, id, 1)
    const item = ingredients[id]
    if (item) speakEnglish(item.enName)
    playSound('lift')
  }

  function startBake() {
    if (state.baking) return
    if (!state.recipe) {
      playSound('deny')
      toast('先選一道點心。')
      return
    }
    if (!prep.value.ready) {
      playSound('deny')
      const shopIds = prep.value.missing.filter((item) => item.where === 'shop').map((item) => item.id)
      const beach = prep.value.missing.filter((item) => item.where === 'beach').map((item) => ingredients[item.id].name)
      state.wanted = shopIds
      const inBag = prep.value.missing.filter((item) => item.where === 'bag').map((item) => ingredients[item.id].name)
      if (inBag.length) toast(`${inBag.join('、')}還在包包裡，點一下放到桌上。`)
      else if (beach.length) toast(`${beach.join('、')}要去海邊，幫船長修船才拿得到。`)
      else if (shopIds.length) toast('還缺商店裡的材料。')
      else toast('還有空位沒放上食材。')
      return
    }
    const recipe = state.recipe
    const price = sellPrice(recipe.required)
    const baked: BakedItem = {
      id: recipe.id,
      name: recipe.name,
      image: recipe.image,
      price,
      count: 1,
    }
    state.table = []
    state.baking = true
    state.wanted = []
    state.pendingBake = baked
    const first = rememberDish(recipe.id)
    state.debut = first ? recipe.name : null
    if (first) state.gold += 8
    playOven()
    const token = ++bakeToken
    window.setTimeout(() => {
      if (token !== bakeToken) return
      stopOven()
      state.baking = false
      state.result = baked
      state.tidePending = true
      playSound('fanfare')
    }, 1400)
  }

  function rememberDish(id: string) {
    if (!dishes.some((dish) => dish.id === id) || state.discovered.includes(id)) return false
    state.discovered.push(id)
    return true
  }

  function payOrder(price: number) {
    const bonus = orderBonus(price)
    state.gold += price + bonus
    const current = state.orderId
    const next = nextOrder(state.discovered, current, exclusiveIds())
    state.orderId = next.recipeId
    state.orderGuest = next.guestId
    const dish = dishes.find((item) => item.id === next.recipeId)
    const guest = guestName(next.guestId)
    return { paid: price + bonus, nextLine: dish ? `${guest}接著想要${dish.name}。` : '' }
  }

  function exclusiveIds() {
    return new Set(Object.values(ingredients).filter((item) => item.exclusive).map((item) => item.id))
  }

  function finishBake(action: 'eat' | 'save' | 'sell' | 'deliver') {
    const result = state.result
    if (!result) return
    if (action === 'deliver' && result.id !== state.orderId) {
      playSound('deny')
      return
    }
    if (action === 'eat') {
      toast(`吃掉了${result.name}。廚房聞起來更香了。`)
      playSound('eat')
    } else if (action === 'save') {
      const found = state.baked.find((item) => item.id === result.id)
      if (found) found.count += 1
      else state.baked.push({ ...result })
      playSound('bag')
      toast(`${result.name}放進包包了。`)
    } else if (action === 'deliver') {
      const paid = payOrder(result.price)
      playSound('fanfare')
      toast(`送給客人了。連謝禮一共 ${paid.paid} 金幣。${paid.nextLine}`)
    } else {
      state.gold += result.price
      playSound('sell')
      toast(`賣出${result.name}，得到 ${result.price} 金幣。`)
    }
    state.result = null
    state.debut = null
    state.pendingBake = null
  }

  function eatSaved(id: string) {
    const item = state.baked.find((baked) => baked.id === id)
    if (!item) return
    item.count -= 1
    if (item.count <= 0) state.baked = state.baked.filter((baked) => baked.id !== id)
    playSound('eat')
    toast(`吃掉了一份${item.name}。`)
  }

  function sellSaved(id: string) {
    const item = state.baked.find((baked) => baked.id === id)
    if (!item) return
    state.gold += item.price
    item.count -= 1
    if (item.count <= 0) state.baked = state.baked.filter((baked) => baked.id !== id)
    playSound('sell')
    toast(`賣出${item.name}，得到 ${item.price} 金幣。`)
  }

  function deliverSaved(id: string) {
    const item = state.baked.find((baked) => baked.id === id)
    if (!item || item.id !== state.orderId) return
    const paid = payOrder(item.price)
    item.count -= 1
    if (item.count <= 0) state.baked = state.baked.filter((baked) => baked.id !== id)
    playSound('fanfare')
    toast(`送給客人了。連謝禮一共 ${paid.paid} 金幣。${paid.nextLine}`)
  }

  function buy(id: string) {
    const item = ingredients[id] ?? tools[id]
    if (!item || ('exclusive' in item && item.exclusive)) return
    if (state.gold < item.price) {
      playSound('deny')
      toast('金幣不夠。沙灘上有時有金幣，烤好的點心也可以賣。')
      return
    }
    state.gold -= item.price
    addCount(state.inventory, id, 1)
    state.wanted = state.wanted.filter((wanted) => wanted !== id)
    playSound('buy')
    toast(`買到${item.name}了。`)
  }

  function repair() {
    const current = captains[state.captainIndex]
    if (state.repaired) {
      playSound('deny')
      toast('這艘船已經修好了。離開海邊再回來，會遇見下一位船長。')
      return
    }
    const missing = current.tools.filter((id) => (state.inventory[id] ?? 0) < 1)
    if (missing.length) {
      playSound('deny')
      toast(`還缺${missing.map((id) => tools[id].name).join('、')}。商店的修船工具頁有賣。`)
      return
    }
    for (const id of current.tools) takeCount(state.inventory, id)
    const reward = ingredients[current.rewardItem]
    state.gold += current.rewardGold
    addCount(state.inventory, current.rewardItem, current.rewardCount)
    state.repaired = true
    state.tidePending = true
    state.thanks = `船修好了。謝禮是 ${current.rewardGold} 金幣，還有${reward.name} ×${current.rewardCount}。離開海邊再回來，會遇見下一位船長。`
    playSound('hammer')
    window.setTimeout(() => playSound('fanfare'), 220)
    arriveTide()
  }

  function collectCoin(id: string) {
    const coin = state.coins.find((item) => item.id === id)
    if (!coin) return
    state.coins = state.coins.filter((item) => item.id !== id)
    state.gold += coin.amount
    playSound('coin')
    toast(`撿到 ${coin.amount} 金幣。`)
    arriveTide()
  }

  function openShop(tab: ShopTab = 'ingredients') {
    state.shopTab = tab
    switchScene('shop')
  }

  function seekShop() {
    state.wanted = prep.value.missing.filter((item) => item.where === 'shop').map((item) => item.id)
    openShop('ingredients')
  }

  function seekTools() {
    openShop('tools')
  }

  function setShopTab(tab: ShopTab) {
    if (state.shopTab === tab) return
    state.shopTab = tab
    playSound('pop')
  }

  function setBagFilter(filter: BagFilter) {
    if (state.bagFilter === filter) return
    state.bagFilter = filter
    playSound('pop')
  }

  function toggleBag() {
    state.bagOpen = !state.bagOpen
    if (state.bagOpen) state.confirmReset = false
    playSound('bag')
  }

  function closeBag() {
    state.bagOpen = false
    state.confirmReset = false
  }

  function askReset() {
    state.confirmReset = true
  }

  function cancelReset() {
    state.confirmReset = false
  }

  let skipSave = false

  function resetGame() {
    skipSave = true
    bakeToken += 1
    stopOven()
    const next = freshState()
    state.gold = next.gold
    state.inventory = next.inventory
    state.baked = []
    state.scene = 'kitchen'
    state.recipe = next.recipe ? { ...next.recipe, required: [...next.recipe.required] } : null
    state.table = []
    state.captainIndex = 0
    state.repaired = false
    state.thanks = null
    state.coins = next.coins
    state.tidePending = false
    state.shopTab = 'ingredients'
    state.bagOpen = false
    state.bagFilter = 'all'
    state.customOpen = false
    state.baking = false
    state.result = null
    state.wanted = []
    state.confirmReset = false
    state.discovered = []
    state.orderId = next.orderId
    state.orderGuest = next.orderGuest
    state.pendingBake = null
    state.debut = null
    customDraft.value = ''
    localStorage.removeItem(SAVE_KEY)
    toast('新的一天開始了。')
  }

  function persist() {
    if (skipSave) {
      skipSave = false
      return
    }
    const file: SaveFile = {
      v: 1,
      gold: state.gold,
      inventory: state.inventory,
      baked: state.baked,
      recipe: state.recipe,
      table: state.table,
      captainIndex: state.captainIndex,
      repaired: state.repaired,
      thanks: state.thanks,
      coins: state.coins,
      tidePending: state.tidePending,
      wanted: state.wanted,
      discovered: state.discovered,
      orderId: state.orderId,
      orderGuest: state.orderGuest,
      pendingBake: state.pendingBake,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(file))
  }

  watch(
    () => [state.gold, state.inventory, state.baked, state.recipe, state.table, state.captainIndex, state.repaired, state.thanks, state.coins, state.tidePending, state.wanted, state.discovered, state.orderId, state.orderGuest, state.pendingBake],
    () => persist(),
    { deep: true },
  )

  return {
    state: readonly(state),
    customDraft,
    prep,
    tray,
    captain,
    recipePrice,
    order,
    menuProgress,
    bagEntries,
    bagCount,
    switchScene,
    goLandHome,
    selectPreset,
    toggleCustom,
    submitCustom,
    place,
    placeFromBag,
    unplace,
    startBake,
    finishBake,
    deliverSaved,
    eatSaved,
    sellSaved,
    buy,
    repair,
    collectCoin,
    openShop,
    seekShop,
    seekTools,
    setShopTab,
    setBagFilter,
    toggleBag,
    closeBag,
    askReset,
    cancelReset,
    resetGame,
  }
}

export type GameApi = ReturnType<typeof useGame>
export const gameKey: InjectionKey<GameApi> = Symbol('bakers')

export function useBakers() {
  const game = inject(gameKey)
  if (!game) throw new Error('找不到烘焙遊戲')
  return game
}
