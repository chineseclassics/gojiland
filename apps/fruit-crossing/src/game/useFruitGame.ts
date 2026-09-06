import { computed, reactive, readonly, shallowRef } from 'vue'
import { FRUITS_DATA, SAVE_KEY, SHOP_DECOR, SHOP_SEEDS, fruitSellPrice, isOrdinarySeed, isSunday, todayLabel } from '../constants'
import type { Basket, GameState, HairStyle, Keys, PlaceKind, ShopTab, TownPlayer } from '../types'
import { isMuted, playSound, setRainAmbience, toggleMute, unlockAudio } from './audio'
import { placeRects } from './draw'
import {
  FLASH_CARD_COST,
  albumSlots,
  countFruitStacks,
  fruitCardSpec,
  fruitNameFromBagItem,
  isFlashCard,
  makeFlashCard,
} from './flashCards'
import { guestById, remainingGuests } from './hotelGuests'
import { clockLabel, dayPeriodFromHour, fetchWeatherCode, hourNow, isRainCode, isThunderCode, weatherLabel } from './weather'

function defaultState(): GameState {
  return {
    mode: 'CATCH',
    paused: false,
    animTime: 0,
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
    flashCards: [],
    inspectOpen: false,
    inspectName: '',
    inspectFlipped: true,
    inspectReveal: false,
    mrGifted: false,
    shopTab: 'seeds',
    interactLock: 0,
    nearPlace: '',
    hotelOpen: false,
    visitedGuests: [],
    todayGuestId: '',
    guestDate: '',
    guestTalkIdx: 0,
    guestDialog: '',
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
    mrDialog: '「星期天我才來換閃卡。平常買賣去找老闆。」',
  }
}

export function useFruitGame() {
  const state = reactive<GameState>(defaultState())
  const basket = reactive<Basket>({ x: 400, y: 430, w: 72, h: 26, targetX: 400, squash: 1 })
  const townPlayer = reactive<TownPlayer>({ x: 420, y: 360, speed: 220, hairStyle: 'short', shirtColor: '#ef4444' })
  const keys = reactive<Keys>({ left: false, right: false, up: false, down: false })

  let toastTimer = 0
  let inspectTimer = 0
  let stepAcc = 0
  let lastNear: PlaceKind = ''
  const muted = shallowRef(isMuted())

  function syncRain() {
    const storm = state.raining || state.thunder
    const hush = state.inShelter || state.paused || state.finished
    setRainAmbience(storm && !state.finished, hush)
  }
  const dateText = computed(() => `${todayLabel()}　${clockLabel(state.dayPeriod)}`)
  const weatherText = computed(() => weatherLabel(state))
  const fruitStacks = computed(() => countFruitStacks(state.backpack))
  const cardAlbum = computed(() => albumSlots(state.flashCards))
  const inspectHint = computed(() =>
    state.inspectReveal
      ? '按住拖曳把玩 · 輕點空白收進小屋'
      : '按住拖曳，可翻到背面 · 輕點空白放下',
  )
  const anyModal = computed(() =>
    state.sundayOpen || state.shelterOpen || state.shopOpen || state.homeOpen || state.hotelOpen || state.customOpen || state.pauseOpen || state.summaryOpen || state.inspectOpen,
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
      flashCards: state.flashCards,
      hairStyle: townPlayer.hairStyle,
      shirtColor: townPlayer.shirtColor,
      mrGifted: state.mrGifted,
      giftDate: todayLabel(),
      visitedGuests: state.visitedGuests,
      todayGuestId: state.todayGuestId,
      guestDate: state.guestDate,
    }))
  }

  function loadSave() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') as Partial<{
        money: number
        eaten: number
        backpack: string[]
        furniture: string[]
        flashCards: unknown[]
        hairStyle: HairStyle
        shirtColor: string
        mrGifted: boolean
        giftDate: string
        visitedGuests: string[]
        todayGuestId: string
        guestDate: string
      }> | null
      if (!data) return
      if (Number.isFinite(data.money)) state.money = data.money as number
      if (Number.isFinite(data.eaten)) state.eaten = Math.max(0, Math.min(20, data.eaten as number))
      if (Array.isArray(data.backpack)) state.backpack = data.backpack
      if (Array.isArray(data.furniture)) state.furniture = data.furniture
      if (Array.isArray(data.flashCards)) state.flashCards = data.flashCards.filter(isFlashCard)
      if (data.hairStyle) townPlayer.hairStyle = data.hairStyle
      if (data.shirtColor) townPlayer.shirtColor = data.shirtColor
      if (data.giftDate === todayLabel()) state.mrGifted = !!data.mrGifted
      if (Array.isArray(data.visitedGuests)) {
        state.visitedGuests = data.visitedGuests.filter((id): id is string => typeof id === 'string')
      }
      if (data.guestDate === todayLabel() && typeof data.todayGuestId === 'string' && data.todayGuestId) {
        state.todayGuestId = data.todayGuestId
        state.guestDate = data.guestDate
        const guest = guestById(state.todayGuestId)
        if (guest) state.guestDialog = guest.lines[0]
      }
    } catch {
      /* ignore bad save */
    }
  }

  function persistHud() {
    save()
  }

  function startRain() {
    state.raining = true
    syncRain()
    showNotice('外面正在下雨。想躲就進棚子，淋濕也不會壞。')
  }

  function stopRain(quiet: boolean) {
    state.raining = false
    syncRain()
    if (!quiet && !state.thunder) showNotice('雨停了。')
  }

  function startThunder() {
    state.thunder = true
    state.raining = true
    state.rainLeft = 20
    state.flash = 0.8
    syncRain()
    playSound('thunder')
    showNotice('打雷了！大約 20 秒。被閃電打到就會停。')
  }

  function stopThunder(reason: 'strike' | 'time') {
    state.thunder = false
    state.bolts = []
    state.flash = 0.4
    if (!state.realRaining) state.raining = false
    syncRain()
    playSound(reason === 'strike' ? 'strike' : 'close')
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
    const pool = FRUITS_DATA
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
      state.combo += 1
      state.bestCombo = Math.max(state.bestCombo, state.combo)
      playSound(item.type === 'RARE' ? 'rare' : 'catch', { combo: state.combo })
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
    if (x > rects.hotel.x && x < rects.hotel.x + rects.hotel.w && y > rects.hotel.y && y < rects.hotel.y + rects.hotel.h) return 'hotel'
    if (x > rects.shed.x && x < rects.shed.x + rects.shed.w && y > rects.shed.y && y < rects.shed.y + rects.shed.h) return 'shed'
    if (x > rects.shop.x && x < rects.shop.x + rects.shop.w && y > rects.shop.y && y < rects.shop.y + rects.shop.h) return 'shop'
    return ''
  }

  function tryEnterPlace(kind: PlaceKind) {
    if (!kind || state.interactLock > 0 || anyModal.value) return
    state.interactLock = 0.8
    if (kind === 'shop') openShop()
    else if (kind === 'home') openHome()
    else if (kind === 'hotel') openHotel()
    else if (kind === 'shed') {
      if (storming.value) enterShelter()
      else {
        playSound('deny')
        showNotice('現在沒下雨，棚子空空的。')
      }
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
        playSound('zap')
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
        if (state.combo > 0) playSound('miss')
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
    const moving = Math.hypot(vx, vy) > 0.01
    const len = Math.hypot(vx, vy) || 1
    townPlayer.x += (vx / len) * townPlayer.speed * dt
    townPlayer.y += (vy / len) * townPlayer.speed * dt
    townPlayer.x = Math.min(Math.max(townPlayer.x, 24), state.width - 24)
    townPlayer.y = Math.min(Math.max(townPlayer.y, 24), state.height - 24)
    state.nearPlace = detectPlace(townPlayer.x, townPlayer.y)
    if (state.nearPlace && state.nearPlace !== lastNear) playSound('near')
    lastNear = state.nearPlace
    if (moving) {
      stepAcc += dt
      if (stepAcc >= 0.36) {
        stepAcc = 0
        playSound('step')
      }
    } else {
      stepAcc = 0
    }
  }

  function stepAwayFromPlace(kind: PlaceKind) {
    if (!kind) return
    const rects = placeRects(state.width, state.height)
    const b = rects[kind]
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
    if (state.sundayOpen || state.summaryOpen || state.inShelter || state.shopOpen || state.homeOpen || state.hotelOpen || state.customOpen || state.inspectOpen) return
    state.paused = !state.paused
    state.pauseOpen = state.paused
    syncRain()
    playSound(state.paused ? 'pause' : 'resume')
  }

  function toggleTown() {
    if (state.mode === 'CATCH') {
      state.mode = 'TOWN'
      playSound('town')
      showNotice('走進小鎮了。點螢幕或拖手指走路，點建築進去。')
    } else {
      state.mode = 'CATCH'
      state.finished = false
      playSound('orchard')
      showNotice('回到果園，接住掉下來的水果！')
    }
  }

  function enterShelter() {
    if (!storming.value) return
    state.inShelter = true
    state.paused = false
    state.pauseOpen = false
    state.shelterOpen = true
    syncRain()
    playSound('door')
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
    playSound('eat')
    state.shelterEatMsg = `吃掉了 ${eaten}！飽足感 ${state.eaten} / 20`
    state.shelterEatOk = true
    persistHud()
  }

  function leaveShelter() {
    state.inShelter = false
    state.shelterOpen = false
    state.interactLock = 1.2
    syncRain()
    playSound('close')
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
    state.shopTab = 'seeds'
    playSound('open')
  }
  function closeShop() {
    state.shopOpen = false
    state.interactLock = 1.2
    playSound('close')
    stepAwayFromPlace('shop')
  }
  function switchShopTab(tab: ShopTab) {
    if (state.shopTab === tab) return
    state.shopTab = tab
    playSound('tab')
  }
  function buySeed(name: string, price: number) {
    if (state.money < price) {
      playSound('deny')
      showNotice('錢不夠，先把水果賣給老闆吧！')
      return
    }
    state.money -= price
    state.backpack.push(name)
    playSound('buy')
    showNotice(`買下了 ${name}`)
    persistHud()
  }
  function buyDecor(name: string, price: number) {
    if (state.furniture.includes(name)) {
      playSound('deny')
      return
    }
    if (state.money < price) {
      playSound('deny')
      showNotice('這件家具還買不起。')
      return
    }
    state.money -= price
    state.furniture.push(name)
    playSound('buy')
    showNotice(`${name} 搬進小屋了！`)
    persistHud()
  }
  function sellItem(idx: number) {
    const item = state.backpack[idx]
    if (!item) return
    if (isOrdinarySeed(item) || item.includes('種子')) {
      playSound('deny')
      showNotice('老闆不收種子，普通水果種子更不行。')
      return
    }
    const price = fruitSellPrice(item)
    if (price == null) {
      playSound('deny')
      showNotice('老闆只收水果。')
      return
    }
    state.backpack.splice(idx, 1)
    state.money += price
    playSound('sell')
    showNotice(`賣出了 ${item}`)
    persistHud()
  }
  function talkMrFruit() {
    if (!isSunday()) {
      playSound('deny')
      showNotice('水果先生只在星期天出現。')
      return
    }
    playSound('talk')
    const ready = fruitStacks.value.filter((it) => it.ready)
    const lines = ready.length
      ? [`「${ready[0].name}已經一百顆了，換一張閃卡吧。」`, '「閃卡收在小屋裡，我只負責換卡。」']
      : ['「一百顆同樣的水果，換一張閃卡。」', '「買賣去找老闆，我星期天只換閃卡。」']
    state.mrDialog = lines[Math.floor(Math.random() * lines.length)]
  }

  function openInspect(name: string, reveal: boolean) {
    if (!fruitCardSpec(name)) return
    window.clearTimeout(inspectTimer)
    state.inspectName = name
    state.inspectOpen = true
    state.inspectReveal = reveal
    state.inspectFlipped = !reveal
    playSound(reveal ? 'card' : 'open')
    if (reveal) {
      inspectTimer = window.setTimeout(() => {
        state.inspectFlipped = true
        playSound('foil')
      }, 620)
    }
  }

  function closeInspect() {
    window.clearTimeout(inspectTimer)
    state.inspectOpen = false
    state.inspectReveal = false
    state.inspectFlipped = true
    playSound('close')
  }

  function inspectOwnedCard(name: string) {
    const owned = state.flashCards.some((card) => card.name === name)
    if (!owned) return
    openInspect(name, false)
  }

  function exchangeFlashCard(name: string) {
    if (!isSunday()) {
      playSound('deny')
      showNotice('水果先生只在星期天換閃卡。')
      return
    }
    if (!fruitCardSpec(name)) {
      playSound('deny')
      return
    }
    let have = 0
    for (const item of state.backpack) {
      if (fruitNameFromBagItem(item) === name) have += 1
    }
    if (have < FLASH_CARD_COST) {
      playSound('deny')
      state.mrDialog = `「${name}還差 ${FLASH_CARD_COST - have} 顆。」`
      showNotice(`${name}還不夠一百顆。`)
      return
    }
    let removed = 0
    for (let i = state.backpack.length - 1; i >= 0 && removed < FLASH_CARD_COST; i--) {
      if (fruitNameFromBagItem(state.backpack[i]) === name) {
        state.backpack.splice(i, 1)
        removed += 1
      }
    }
    const card = makeFlashCard(name)
    state.flashCards.push(card)
    state.mrDialog = `「一百顆${name}，換成這張閃卡。好好收著。」`
    showNotice(`換到 ${name} 閃卡！收進小屋了。`)
    persistHud()
    openInspect(name, true)
  }

  function openHotel() {
    state.hotelOpen = true
    playSound('door')
  }
  function closeHotel() {
    state.hotelOpen = false
    state.interactLock = 1.2
    playSound('close')
    stepAwayFromPlace('hotel')
  }
  function inviteGuest(id: string) {
    if (state.guestDate === todayLabel() && state.todayGuestId) {
      playSound('deny')
      showNotice('今晚已經有旅客了。')
      return
    }
    if (state.visitedGuests.includes(id)) {
      playSound('deny')
      showNotice('這個人已經來過，不會再來了。')
      return
    }
    const guest = guestById(id)
    if (!guest) return
    state.todayGuestId = id
    state.guestDate = todayLabel()
    state.visitedGuests.push(id)
    state.guestTalkIdx = 0
    state.guestDialog = guest.lines[0]
    playSound('talk')
    showNotice(`${guest.name} 今晚住進來了。`)
    persistHud()
  }
  function talkHotelGuest() {
    const guest = hotelGuest.value
    if (!guest) return
    state.guestTalkIdx = (state.guestTalkIdx + 1) % guest.lines.length
    state.guestDialog = guest.lines[state.guestTalkIdx]
    playSound('talk')
  }

  function openHome() {
    state.homeOpen = true
    playSound('door')
  }
  function closeHome() {
    state.homeOpen = false
    state.interactLock = 1.2
    playSound('close')
    stepAwayFromPlace('home')
  }
  function openCustom() {
    state.customOpen = true
    playSound('open')
  }
  function closeCustom() {
    state.customOpen = false
    playSound('close')
  }
  function changeHair(style: HairStyle) {
    townPlayer.hairStyle = style
    playSound('custom')
    showNotice('髮型換好了！')
    persistHud()
  }
  function changeShirt(color: string) {
    townPlayer.shirtColor = color
    playSound('custom')
    showNotice('上衣換好了！')
    persistHud()
  }

  function finishGame() {
    state.finished = true
    state.paused = false
    state.pauseOpen = false
    state.summaryTitle = '遊戲完成！'
    state.summaryOpen = true
    syncRain()
    playSound('fanfare')
  }
  function closeSummaryToTown() {
    state.summaryOpen = false
    state.finished = false
    syncRain()
    if (state.mode !== 'TOWN') toggleTown()
    else playSound('town')
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
    syncRain()
    playSound('start')
    showNotice('新的一輪開始！')
  }

  function closeSunday() {
    state.sundayOpen = false
    playSound('start')
    showNotice('手指左右滑動，接住掉下來的水果。')
  }

  function toggleSound() {
    muted.value = toggleMute()
    syncRain()
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

  const hotelGuest = computed(() => {
    if (state.guestDate !== todayLabel() || !state.todayGuestId) return null
    return guestById(state.todayGuestId)
  })
  const hotelCandidates = computed(() => remainingGuests(state.visitedGuests))

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
    fruitStacks,
    cardAlbum,
    inspectHint,
    hotelGuest,
    hotelCandidates,
    muted,
    sunday: computed(() => isSunday()),
    unlockAudio,
    toggleSound,
    shopSeeds: SHOP_SEEDS,
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
    enterShelter,
    eatInShelter,
    leaveShelter,
    openShop,
    closeShop,
    switchShopTab,
    buySeed,
    buyDecor,
    sellItem,
    talkMrFruit,
    exchangeFlashCard,
    inspectOwnedCard,
    closeInspect,
    openHome,
    closeHome,
    openHotel,
    closeHotel,
    inviteGuest,
    talkHotelGuest,
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
