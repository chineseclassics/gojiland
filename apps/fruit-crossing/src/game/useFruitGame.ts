import { computed, reactive, readonly } from 'vue'
import { FRUITS_DATA, SAVE_KEY, SELL_MAP, SHOP_DECOR, SHOP_FOOD, VEGGIES_DATA, isSunday, todayLabel } from '../constants'
import type { Basket, CatchType, GameState, HairStyle, Keys, PlaceKind, ShopTab, TownPlayer } from '../types'
import { playSound } from './audio'
import { placeRects } from './draw'
import { clockLabel, dayPeriodFromHour, fetchWeatherCode, hourNow, isRainCode, isThunderCode, weatherLabel } from './weather'

function defaultState(): GameState {
  return {
    mode: 'CATCH',
    catchType: 'FRUIT',
    paused: false,
    finished: false,
    inShelter: false,
    raining: false,
    thunder: false,
    rainLeft: 0,
    nextThunder: 240 + Math.random() * 300,
    realRaining: false,
    dayPeriod: dayPeriodFromHour(hourNow()),
    playerWet: false,
    fruitsWet: false,
    flash: 0,
    bolts: [],
    score: 0,
    combo: 0,
    bestCombo: 0,
    eaten: 0,
    money: 100,
    backpack: ['🍎 蘋果', '🍌 香蕉'],
    furniture: ['🪵 木製小椅', '🪴 綠色盆栽'],
    mrGifted: false,
    shopTab: 'fruits',
    interactLock: 0,
    nearPlace: '',
    width: 800,
    height: 500,
    spawnAcc: 0,
    pops: [],
    items: [],
    walkTarget: null,
    toast: '',
    sundayOpen: isSunday(),
    shelterOpen: false,
    shopOpen: false,
    homeOpen: false,
    customOpen: false,
    pauseOpen: false,
    summaryOpen: false,
    summaryTitle: '遊戲完成！',
    shelterEatMsg: '點下面按鈕就會吃一顆。',
    shelterEatOk: true,
    mrDialog: '「你好啊！今天是星期日，我來商店看看新鮮的水果！」',
  }
}

export function useFruitGame() {
  const state = reactive<GameState>(defaultState())
  const basket = reactive<Basket>({ x: 400, y: 430, w: 72, h: 26, targetX: 400, squash: 1 })
  const townPlayer = reactive<TownPlayer>({ x: 220, y: 280, speed: 220, hairStyle: 'short', shirtColor: '#ef4444' })
  const keys = reactive<Keys>({ left: false, right: false, up: false, down: false })

  let toastTimer = 0
  const dateText = computed(() => `${todayLabel()}　${clockLabel(state.dayPeriod)}`)
  const weatherText = computed(() => weatherLabel(state))
  const anyModal = computed(() =>
    state.sundayOpen || state.shelterOpen || state.shopOpen || state.homeOpen || state.customOpen || state.pauseOpen || state.summaryOpen,
  )
  const blocked = computed(() => state.paused || state.finished || state.inShelter || anyModal.value)
  const storming = computed(() => state.raining || state.thunder)

  function showNotice(msg: string) {
    state.toast = msg
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      state.toast = ''
    }, 2600)
  }

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      money: state.money,
      eaten: state.eaten,
      backpack: state.backpack,
      furniture: state.furniture,
      hairStyle: townPlayer.hairStyle,
      shirtColor: townPlayer.shirtColor,
      mrGifted: state.mrGifted,
      giftDate: todayLabel(),
    }))
  }

  function loadSave() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') as Partial<{
        money: number
        eaten: number
        backpack: string[]
        furniture: string[]
        hairStyle: HairStyle
        shirtColor: string
        mrGifted: boolean
        giftDate: string
      }> | null
      if (!data) return
      if (Number.isFinite(data.money)) state.money = data.money as number
      if (Number.isFinite(data.eaten)) state.eaten = Math.max(0, Math.min(20, data.eaten as number))
      if (Array.isArray(data.backpack)) state.backpack = data.backpack
      if (Array.isArray(data.furniture)) state.furniture = data.furniture
      if (data.hairStyle) townPlayer.hairStyle = data.hairStyle
      if (data.shirtColor) townPlayer.shirtColor = data.shirtColor
      if (data.giftDate === todayLabel()) state.mrGifted = !!data.mrGifted
    } catch {
      /* ignore bad save */
    }
  }

  function persistHud() {
    save()
  }

  function startRain() {
    state.raining = true
    showNotice('外面正在下雨。想躲就進棚子，淋濕也不會壞。')
  }

  function stopRain(quiet: boolean) {
    state.raining = false
    if (!quiet && !state.thunder) showNotice('雨停了。')
  }

  function startThunder() {
    state.thunder = true
    state.raining = true
    state.rainLeft = 20
    state.flash = 0.8
    showNotice('打雷了！大約 20 秒。被閃電打到就會停。')
  }

  function stopThunder(reason: 'strike' | 'time') {
    state.thunder = false
    state.bolts = []
    state.flash = 0.4
    if (!state.realRaining) state.raining = false
    showNotice(reason === 'strike' ? '被閃電打到，雷雨停了！水果濕了但沒壞。' : '雷雨過去了。')
  }

  async function refreshWeather() {
    try {
      const code = await fetchWeatherCode()
      state.realRaining = isRainCode(code)
      if (isThunderCode(code) && !state.thunder) startThunder()
      else if (state.realRaining && !state.raining) startRain()
      else if (!state.realRaining && !state.thunder && state.raining) stopRain(false)
    } catch {
      state.realRaining = false
    }
  }

  function spawnItem() {
    const pool = state.catchType === 'FRUIT' ? FRUITS_DATA : VEGGIES_DATA
    const roll = Math.random()
    const template = roll < 0.08
      ? pool.find((it) => it.type === 'RARE')!
      : roll < 0.16
        ? pool.find((it) => it.type === 'POOP')!
        : pool.filter((it) => it.type !== 'RARE' && it.type !== 'POOP')[Math.floor(Math.random() * 5)]
    state.items.push({
      ...template,
      x: 36 + Math.random() * (state.width - 72),
      y: -28,
      r: template.type === 'RARE' ? 22 : 18,
    })
  }

  function catchItem(item: GameState['items'][number]) {
    if (item.type === 'POOP') {
      playSound('poop')
      state.combo = 0
      if (state.eaten > 0) {
        state.eaten -= 1
        showNotice('接到大便！肚子不舒服，少了一顆。')
      } else {
        state.backpack.push('🍎 蘋果')
        showNotice('神奇大便變出一顆蘋果！')
      }
      state.pops.push({ x: item.x, y: item.y, text: '糟糕', color: '#7f1d1d', life: 1 })
    } else {
      playSound('catch')
      state.combo += 1
      state.bestCombo = Math.max(state.bestCombo, state.combo)
      const gained = item.pts + Math.min(20, (state.combo - 1) * 2)
      state.score += gained
      state.backpack.push(`${item.emoji} ${item.name}`)
      state.pops.push({ x: item.x, y: item.y, text: `+${gained}`, color: item.type === 'RARE' ? '#b45309' : '#14532d', life: 1 })
    }
    basket.squash = 0.8
    persistHud()
  }

  function detectPlace(x: number, y: number): PlaceKind {
    const rects = placeRects(state.width, state.height)
    if (x > rects.home.x && x < rects.home.x + rects.home.w && y > rects.home.y && y < rects.home.y + rects.home.h) return 'home'
    if (x > rects.shed.x && x < rects.shed.x + rects.shed.w && y > rects.shed.y && y < rects.shed.y + rects.shed.h) return 'shed'
    if (x > rects.shop.x && x < rects.shop.x + rects.shop.w && y > rects.shop.y && y < rects.shop.y + rects.shop.h) return 'shop'
    return ''
  }

  function tryEnterPlace(kind: PlaceKind) {
    if (!kind || state.interactLock > 0 || anyModal.value) return
    state.interactLock = 0.8
    if (kind === 'shop') openShop()
    else if (kind === 'home') openHome()
    else if (kind === 'shed') {
      if (storming.value) enterShelter()
      else showNotice('現在沒下雨，棚子空空的。')
    }
  }

  function updateWeather(dt: number) {
    state.dayPeriod = dayPeriodFromHour(hourNow())
    state.flash = Math.max(0, state.flash - dt * 2.4)
    if (state.paused || state.finished) return
    if (storming.value && !state.inShelter) {
      state.playerWet = true
      state.fruitsWet = true
    }
    if (state.thunder) {
      state.rainLeft -= dt
      if (!state.inShelter && Math.random() < dt * 0.22) {
        state.bolts.push({ x: 40 + Math.random() * (state.width - 80), life: 0.28 })
        state.flash = 1
      }
      for (let i = state.bolts.length - 1; i >= 0; i--) {
        const b = state.bolts[i]
        b.life -= dt
        if (b.life <= 0) state.bolts.splice(i, 1)
        else if (!state.inShelter) {
          const hit = state.mode === 'CATCH'
            ? Math.abs(b.x - (basket.x + basket.w / 2)) < basket.w * 0.55
            : Math.abs(b.x - townPlayer.x) < 36
          if (hit) {
            stopThunder('strike')
            return
          }
        }
      }
      if (state.rainLeft <= 0) stopThunder('time')
      return
    }
    if (state.inShelter) return
    state.nextThunder -= dt
    if (state.nextThunder <= 0) {
      state.nextThunder = 420 + Math.random() * 480
      if (Math.random() < 0.35) startThunder()
    }
  }

  function updateCatch(dt: number) {
    if (blocked.value) return
    if (keys.left) basket.targetX -= 460 * dt
    if (keys.right) basket.targetX += 460 * dt
    basket.targetX = Math.min(Math.max(basket.targetX, 8), state.width - basket.w - 8)
    basket.x += (basket.targetX - basket.x) * Math.min(1, dt * 14)
    basket.squash += (1 - basket.squash) * Math.min(1, dt * 10)
    state.spawnAcc += dt
    if (state.spawnAcc >= Math.max(0.48, 1.05 - state.score / 500)) {
      state.spawnAcc = 0
      spawnItem()
    }
    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i]
      item.y += item.speed * dt
      const hit = item.y > basket.y - 8 && item.y < basket.y + basket.h + 8 && item.x > basket.x - 8 && item.x < basket.x + basket.w + 8
      if (hit) {
        catchItem(item)
        state.items.splice(i, 1)
      } else if (item.y > state.height + 30) {
        state.combo = 0
        state.items.splice(i, 1)
      }
    }
    for (let i = state.pops.length - 1; i >= 0; i--) {
      state.pops[i].y -= 40 * dt
      state.pops[i].life -= dt * 1.3
      if (state.pops[i].life <= 0) state.pops.splice(i, 1)
    }
  }

  function updateTown(dt: number) {
    state.interactLock = Math.max(0, state.interactLock - dt)
    state.nearPlace = detectPlace(townPlayer.x, townPlayer.y)
    if (blocked.value) {
      state.walkTarget = null
      return
    }
    let vx = 0
    let vy = 0
    if (keys.left) vx -= 1
    if (keys.right) vx += 1
    if (keys.up) vy -= 1
    if (keys.down) vy += 1
    if (state.walkTarget) {
      const dx = state.walkTarget.x - townPlayer.x
      const dy = state.walkTarget.y - townPlayer.y
      const dist = Math.hypot(dx, dy)
      if (dist < 8) state.walkTarget = null
      else {
        vx += dx / dist
        vy += dy / dist
      }
    }
    const len = Math.hypot(vx, vy) || 1
    townPlayer.x += (vx / len) * townPlayer.speed * dt
    townPlayer.y += (vy / len) * townPlayer.speed * dt
    townPlayer.x = Math.min(Math.max(townPlayer.x, 24), state.width - 24)
    townPlayer.y = Math.min(Math.max(townPlayer.y, 24), state.height - 24)
    state.nearPlace = detectPlace(townPlayer.x, townPlayer.y)
  }

  function stepAwayFromPlace(kind: PlaceKind) {
    if (!kind) return
    const rects = placeRects(state.width, state.height)
    const b = rects[kind === 'home' ? 'home' : kind === 'shed' ? 'shed' : 'shop']
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const dx = townPlayer.x - cx
    const dy = townPlayer.y - cy
    const dist = Math.hypot(dx, dy) || 1
    townPlayer.x = Math.min(Math.max(cx + (dx / dist) * (Math.max(b.w, b.h) * 0.55 + 20), 24), state.width - 24)
    townPlayer.y = Math.min(Math.max(cy + (dy / dist) * (Math.max(b.w, b.h) * 0.55 + 20), 24), state.height - 24)
    state.walkTarget = null
    state.nearPlace = detectPlace(townPlayer.x, townPlayer.y)
  }

  function useToilet() {
    if (state.eaten <= 0) {
      playSound('deny')
      showNotice('肚子還是空的。先吃水果，再來消化。')
      return
    }
    state.eaten = 0
    state.money += 10
    playSound('flush')
    showNotice('消化完了！還多了 10 塊錢。')
    persistHud()
  }

  function togglePause() {
    if (state.sundayOpen || state.summaryOpen || state.inShelter || state.shopOpen || state.homeOpen || state.customOpen) return
    state.paused = !state.paused
    state.pauseOpen = state.paused
  }

  function toggleTown() {
    if (state.mode === 'CATCH') {
      state.mode = 'TOWN'
      showNotice('走進小鎮了。點螢幕或拖手指走路，點建築進去。')
    } else {
      state.mode = 'CATCH'
      state.finished = false
      showNotice('回到果園，接住掉下來的水果！')
    }
  }

  function toggleCatchType() {
    state.catchType = (state.catchType === 'FRUIT' ? 'VEGGIE' : 'FRUIT') as CatchType
    state.items = []
    showNotice(state.catchType === 'FRUIT' ? '換成水果模式了！' : '換成蔬菜模式了！')
  }

  function enterShelter() {
    if (!storming.value) return
    state.inShelter = true
    state.paused = false
    state.pauseOpen = false
    state.shelterOpen = true
    state.shelterEatMsg = state.backpack.length ? '點下面按鈕就會吃一顆。' : '背包是空的，先去接一些再來吃。'
    state.shelterEatOk = state.backpack.length > 0
  }

  function eatInShelter() {
    if (!state.backpack.length) {
      playSound('deny')
      state.shelterEatMsg = '背包裡沒有水果。'
      state.shelterEatOk = false
      return
    }
    if (state.eaten >= 20) {
      playSound('deny')
      state.shelterEatMsg = '太飽了，先按消化馬桶。'
      state.shelterEatOk = false
      return
    }
    const eaten = state.backpack.pop() as string
    state.eaten += 1
    playSound('catch')
    state.shelterEatMsg = `吃掉了 ${eaten}！飽足感 ${state.eaten} / 20`
    state.shelterEatOk = true
    persistHud()
  }

  function leaveShelter() {
    state.inShelter = false
    state.shelterOpen = false
    state.interactLock = 1.2
    stepAwayFromPlace('shed')
    if (storming.value) {
      state.playerWet = true
      state.fruitsWet = true
      showNotice('你選擇淋雨。水果濕了但沒壞。')
    } else {
      showNotice('出來繼續冒險吧！')
    }
  }

  function openShop() {
    state.shopOpen = true
    state.shopTab = 'fruits'
  }
  function closeShop() {
    state.shopOpen = false
    state.interactLock = 1.2
    stepAwayFromPlace('shop')
  }
  function switchShopTab(tab: ShopTab) {
    state.shopTab = tab
  }
  function buyFood(name: string, price: number) {
    if (state.money < price) {
      playSound('deny')
      showNotice('錢不夠，去賣水果吧！')
      return
    }
    state.money -= price
    state.backpack.push(name)
    playSound('catch')
    showNotice(`買下了 ${name}`)
    persistHud()
  }
  function buyDecor(name: string, price: number) {
    if (state.furniture.includes(name)) return
    if (state.money < price) {
      playSound('deny')
      showNotice('這件家具還買不起。')
      return
    }
    state.money -= price
    state.furniture.push(name)
    playSound('catch')
    showNotice(`${name} 搬進小屋了！`)
    persistHud()
  }
  function sellItem(idx: number) {
    const sold = state.backpack.splice(idx, 1)[0]
    state.money += SELL_MAP[sold] || 15
    playSound('catch')
    showNotice(`賣出了 ${sold}`)
    persistHud()
  }
  function talkMrFruit() {
    playSound('catch')
    const lines = ['「下雨前記得進棚子。」', '「連擊越高越好吃。」', '「飽了就去消化馬桶。」']
    state.mrDialog = lines[Math.floor(Math.random() * lines.length)]
    if (!state.mrGifted) {
      state.mrGifted = true
      state.backpack.push('🍊 橘子')
      state.money += 20
      showNotice('水果先生送你橘子和 20 塊錢！')
      persistHud()
    }
  }

  function openHome() { state.homeOpen = true }
  function closeHome() {
    state.homeOpen = false
    state.interactLock = 1.2
    stepAwayFromPlace('home')
  }
  function openCustom() { state.customOpen = true }
  function closeCustom() { state.customOpen = false }
  function changeHair(style: HairStyle) {
    townPlayer.hairStyle = style
    showNotice('髮型換好了！')
    persistHud()
  }
  function changeShirt(color: string) {
    townPlayer.shirtColor = color
    showNotice('上衣換好了！')
    persistHud()
  }

  function finishGame() {
    state.finished = true
    state.paused = false
    state.pauseOpen = false
    state.summaryTitle = '遊戲完成！'
    state.summaryOpen = true
  }
  function closeSummaryToTown() {
    state.summaryOpen = false
    state.finished = false
    if (state.mode !== 'TOWN') toggleTown()
  }
  function restartGame() {
    state.score = 0
    state.combo = 0
    state.bestCombo = 0
    state.items = []
    state.pops = []
    state.finished = false
    state.paused = false
    state.inShelter = false
    state.summaryOpen = false
    state.pauseOpen = false
    state.shelterOpen = false
    state.thunder = false
    state.bolts = []
    state.playerWet = false
    state.fruitsWet = false
    if (!state.realRaining) state.raining = false
    state.mode = 'CATCH'
    showNotice('新的一輪開始！')
  }

  function closeSunday() {
    state.sundayOpen = false
    showNotice('手指左右滑動，接住掉下來的水果。')
  }

  function setBasketX(x: number) {
    if (state.mode !== 'CATCH' || blocked.value) return
    basket.targetX = Math.min(Math.max(x - basket.w / 2, 8), state.width - basket.w - 8)
  }

  function pointerDown(x: number, y: number) {
    if (state.mode === 'CATCH') {
      setBasketX(x)
      return
    }
    if (blocked.value) return
    const kind = detectPlace(x, y)
    if (kind) {
      townPlayer.x = x
      townPlayer.y = y
      tryEnterPlace(kind)
      return
    }
    state.walkTarget = { x, y }
  }

  function pointerMove(x: number, y: number) {
    if (state.mode === 'CATCH') {
      setBasketX(x)
      return
    }
    if (blocked.value) return
    state.walkTarget = { x, y }
  }

  function resize(w: number, h: number) {
    state.width = Math.max(320, w)
    state.height = Math.max(220, h)
    basket.y = state.height - 72
    basket.x = Math.min(Math.max(basket.x, 8), state.width - basket.w - 8)
    basket.targetX = basket.x
  }

  function goLandHome() {
    const host = window.location.hostname
    if (host.endsWith('workers.dev') || host.endsWith('goji.land')) {
      window.location.href = 'https://gojiland-platform.gnoluy.workers.dev/'
      return
    }
    const path = window.location.pathname
    if (path.includes('/apps/fruit-crossing')) {
      window.location.href = path.replace(/\/apps\/fruit-crossing.*/, '/index.html')
      return
    }
    window.location.href = '../../index.html'
  }

  loadSave()

  return {
    state: readonly(state),
    raw: state,
    basket,
    townPlayer,
    keys,
    dateText,
    weatherText,
    storming,
    sunday: computed(() => isSunday()),
    shopFood: SHOP_FOOD,
    shopDecor: SHOP_DECOR,
    showNotice,
    persistHud,
    refreshWeather,
    updateWeather,
    updateCatch,
    updateTown,
    useToilet,
    togglePause,
    toggleTown,
    toggleCatchType,
    enterShelter,
    eatInShelter,
    leaveShelter,
    openShop,
    closeShop,
    switchShopTab,
    buyFood,
    buyDecor,
    sellItem,
    talkMrFruit,
    openHome,
    closeHome,
    openCustom,
    closeCustom,
    changeHair,
    changeShirt,
    finishGame,
    closeSummaryToTown,
    restartGame,
    closeSunday,
    setBasketX,
    pointerDown,
    pointerMove,
    tryEnterPlace,
    resize,
    goLandHome,
  }
}

export type FruitGame = ReturnType<typeof useFruitGame>
