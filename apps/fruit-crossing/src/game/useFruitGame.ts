import { computed, reactive, readonly, shallowRef } from 'vue'
import { FRUITS_DATA, SAVE_KEY, SHOP_DECOR, SHOP_SEEDS, fruitSellPrice, isOrdinarySeed, isSunday, todayLabel } from '../constants'
import type { Basket, GameState, HairStyle, HotelStay, Keys, PlaceKind, ShopTab, TownPlayer, TownStay } from '../types'
import { isMuted, playSound, setRainAmbience, toggleMute, unlockAudio } from './audio'
import { hotelGuestPos, placeRects } from './draw'
import {
  FLASH_CARD_COST,
  albumSlots,
  countFruitStacks,
  fruitCardSpec,
  fruitNameFromBagItem,
  isFlashCard,
  makeFlashCard,
} from './flashCards'
import {
  HOTEL_ROOM_COUNT,
  TOWN_RESIDENT_MAX,
  guestById,
  houseReady,
  houseRemainLabel,
  inviteCandidates,
} from './hotelGuests'
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
    hotelFocusRoom: -1,
    hotelStays: [],
    townStays: [],
    villagerOpen: false,
    villagerSlot: 0,
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
    state.sundayOpen || state.shelterOpen || state.shopOpen || state.homeOpen || state.hotelOpen || state.villagerOpen || state.customOpen || state.pauseOpen || state.summaryOpen || state.inspectOpen,
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
      hotelStays: state.hotelStays,
      townStays: state.townStays.map(({ following, x, y, ...rest }) => rest),
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
        hotelStays: HotelStay[]
        townStays: Omit<TownStay, 'following' | 'x' | 'y'>[]
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
      if (Array.isArray(data.hotelStays)) {
        state.hotelStays = data.hotelStays
          .filter((it) => it && guestById(it.id))
          .map((it) => ({
            id: it.id,
            room: (Number(it.room) === 1 ? 1 : 0) as 0 | 1,
            furniture: Array.isArray(it.furniture) ? it.furniture : [],
            talkIdx: Number(it.talkIdx) || 0,
          }))
          .slice(0, HOTEL_ROOM_COUNT)
      }
      const legacyId = (data as { todayGuestId?: string }).todayGuestId
      if (!state.hotelStays.length && typeof legacyId === 'string' && guestById(legacyId)) {
        state.hotelStays = [{ id: legacyId, room: 0, furniture: [], talkIdx: 0 }]
      }
      if (Array.isArray(data.townStays)) {
        state.townStays = data.townStays
          .filter((it) => it && guestById(it.id) && (it.slot === 0 || it.slot === 1))
          .slice(0, TOWN_RESIDENT_MAX)
          .map((it) => ({
            id: it.id,
            slot: it.slot,
            buildStart: Number(it.buildStart) || Date.now(),
            furniture: Array.isArray(it.furniture) ? it.furniture : [],
            talkIdx: Number(it.talkIdx) || 0,
            following: false,
            x: 0,
            y: 0,
            announcedReady: !!it.announcedReady || houseReady(Number(it.buildStart) || 0),
          }))
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

  function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }) {
    return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h
  }

  function detectPlace(x: number, y: number): PlaceKind {
    const rects = placeRects(state.width, state.height)
    for (const stay of state.hotelStays) {
      const pos = hotelGuestPos(stay.room, state.width, state.height)
      if (Math.hypot(x - pos.x, y - pos.y) < 36) return stay.room === 0 ? 'hroom0' : 'hroom1'
    }
    for (const stay of state.townStays) {
      const kind = stay.slot === 0 ? 'house0' : 'house1'
      if (Math.hypot(x - stay.x, y - stay.y) < 32) return kind
      if (inRect(x, y, rects[kind])) return kind
    }
    if (inRect(x, y, rects.home)) return 'home'
    if (inRect(x, y, rects.hotel)) return 'hotel'
    if (inRect(x, y, rects.shed)) return 'shed'
    if (inRect(x, y, rects.shop)) return 'shop'
    return ''
  }

  function tryEnterPlace(kind: PlaceKind) {
    if (!kind || state.interactLock > 0 || anyModal.value) return
    state.interactLock = 0.8
    if (kind === 'shop') openShop()
    else if (kind === 'home') openHome()
    else if (kind === 'hotel') openHotel()
    else if (kind === 'hroom0') openHotel(0)
    else if (kind === 'hroom1') openHotel(1)
    else if (kind === 'house0' || kind === 'house1') openVillager(kind === 'house0' ? 0 : 1)
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
    refreshHouses()
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
    updateVillagers(dt)
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
    const b = kind === 'hroom0' || kind === 'hroom1' ? rects.hotel : rects[kind]
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
    if (state.sundayOpen || state.summaryOpen || state.inShelter || state.shopOpen || state.homeOpen || state.hotelOpen || state.villagerOpen || state.customOpen || state.inspectOpen) return
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

  function openHotel(room = -1) {
    state.hotelOpen = true
    state.hotelFocusRoom = room
    if (room >= 0) {
      const stay = state.hotelStays.find((it) => it.room === room)
      const guest = stay ? guestById(stay.id) : null
      state.guestDialog = guest ? guest.lines[stay?.talkIdx ?? 0] : ''
    }
    playSound('door')
  }
  function closeHotel() {
    state.hotelOpen = false
    state.hotelFocusRoom = -1
    state.interactLock = 1.2
    playSound('close')
    stepAwayFromPlace('hotel')
  }
  function focusHotelRoom(room: number) {
    state.hotelFocusRoom = room
    const stay = state.hotelStays.find((it) => it.room === room)
    const guest = stay ? guestById(stay.id) : null
    state.guestDialog = guest ? guest.lines[stay?.talkIdx ?? 0] : ''
    playSound('tab')
  }
  function inviteGuest(id: string) {
    if (state.hotelStays.some((it) => it.id === id) || state.townStays.some((it) => it.id === id)) {
      playSound('deny')
      showNotice('這個人已經在鎮上了。')
      return
    }
    const guest = guestById(id)
    if (!guest) return
    const used = new Set(state.hotelStays.map((it) => it.room))
    let room = ([0, 1] as const).find((n) => !used.has(n))
    let replaced = ''
    if (room == null) {
      const focus = state.hotelFocusRoom === 0 || state.hotelFocusRoom === 1 ? state.hotelFocusRoom : 0
      const old = state.hotelStays.find((it) => it.room === focus)
      replaced = old ? guestById(old.id)?.name ?? '' : ''
      state.hotelStays = state.hotelStays.filter((it) => it.room !== focus)
      room = focus as 0 | 1
    }
    state.hotelStays.push({ id, room, furniture: [], talkIdx: 0 })
    state.hotelFocusRoom = room
    state.guestDialog = guest.lines[0]
    playSound('talk')
    showNotice(replaced ? `${replaced} 退房了，${guest.name} 住進 ${room + 1} 號房。` : `${guest.name} 住進 ${room + 1} 號房了。到門口就能看見他。`)
    persistHud()
  }
  function checkoutHotelGuest() {
    const stay = state.hotelStays.find((it) => it.room === state.hotelFocusRoom)
    const guest = stay ? guestById(stay.id) : null
    if (!stay || !guest) return
    state.hotelStays = state.hotelStays.filter((it) => it.room !== stay.room)
    state.hotelFocusRoom = -1
    playSound('close')
    showNotice(`${guest.name} 離開客房了。之後還可以再邀請。`)
    persistHud()
  }
  function talkHotelGuest() {
    const stay = state.hotelStays.find((it) => it.room === state.hotelFocusRoom)
    const guest = stay ? guestById(stay.id) : null
    if (!stay || !guest) return
    stay.talkIdx = (stay.talkIdx + 1) % guest.lines.length
    state.guestDialog = guest.lines[stay.talkIdx]
    playSound('talk')
  }
  function decorateHotelRoom(name: string, price: number) {
    const stay = state.hotelStays.find((it) => it.room === state.hotelFocusRoom)
    if (!stay) return
    if (stay.furniture.includes(name)) {
      playSound('deny')
      return
    }
    if (state.money < price) {
      playSound('deny')
      showNotice('這件家具還買不起。')
      return
    }
    state.money -= price
    stay.furniture.push(name)
    playSound('buy')
    showNotice(`擺進 ${stay.room + 1} 號房了。`)
    persistHud()
  }
  function settleGuestInTown() {
    const stay = state.hotelStays.find((it) => it.room === state.hotelFocusRoom)
    const guest = stay ? guestById(stay.id) : null
    if (!stay || !guest) return
    if (state.townStays.length >= TOWN_RESIDENT_MAX) {
      playSound('deny')
      const names = state.townStays.map((it) => guestById(it.id)?.name).filter(Boolean).join('、')
      showNotice(`小鎮已有 ${names}。請其中一位離開後，才能再請人來。`)
      return
    }
    const used = new Set(state.townStays.map((it) => it.slot))
    const slot = ([0, 1] as const).find((n) => !used.has(n))
    if (slot == null) return
    const plot = placeRects(state.width, state.height)[slot === 0 ? 'house0' : 'house1']
    state.townStays.push({
      id: stay.id,
      slot,
      buildStart: Date.now(),
      furniture: [...stay.furniture],
      talkIdx: 0,
      following: false,
      x: plot.x + plot.w / 2,
      y: plot.y + plot.h + 12,
      announcedReady: false,
    })
    state.hotelStays = state.hotelStays.filter((it) => it.room !== stay.room)
    state.hotelFocusRoom = -1
    state.hotelOpen = false
    state.interactLock = 1.2
    playSound('door')
    showNotice(`${guest.name} 來到小鎮了。他會出現在路上，房子大約五分鐘後蓋好。`)
    persistHud()
    stepAwayFromPlace('hotel')
  }

  function refreshHouses() {
    let changed = false
    for (const stay of state.townStays) {
      if (!stay.announcedReady && houseReady(stay.buildStart)) {
        stay.announcedReady = true
        changed = true
        const name = guestById(stay.id)?.name ?? '朋友'
        playSound('fanfare')
        showNotice(`${name} 的房子蓋好了！可以去找他聊天、玩耍。`)
      }
    }
    if (changed) persistHud()
  }

  function updateVillagers(dt: number) {
    const rects = placeRects(state.width, state.height)
    for (const stay of state.townStays) {
      const plot = rects[stay.slot === 0 ? 'house0' : 'house1']
      const homeX = plot.x + plot.w / 2
      const homeY = plot.y + plot.h + 14
      let tx = homeX
      let ty = homeY
      if (stay.following) {
        tx = townPlayer.x - 28
        ty = townPlayer.y + 8
      } else if (houseReady(stay.buildStart)) {
        tx = homeX + Math.sin(state.animTime * 0.6 + stay.slot) * 36
        ty = homeY + Math.cos(state.animTime * 0.45 + stay.slot) * 10
      }
      stay.x += (tx - stay.x) * Math.min(1, dt * 4)
      stay.y += (ty - stay.y) * Math.min(1, dt * 4)
    }
  }

  function openVillager(slot: 0 | 1) {
    const stay = state.townStays.find((it) => it.slot === slot)
    const guest = stay ? guestById(stay.id) : null
    if (!stay || !guest) return
    state.villagerSlot = slot
    state.villagerOpen = true
    const lines = houseReady(stay.buildStart) ? guest.townLines : guest.buildLines
    state.guestDialog = lines[stay.talkIdx % lines.length]
    playSound('talk')
  }
  function closeVillager() {
    state.villagerOpen = false
    state.interactLock = 1.2
    playSound('close')
    const kind = state.villagerSlot === 0 ? 'house0' : 'house1'
    stepAwayFromPlace(kind)
  }
  function talkVillager() {
    const stay = state.townStays.find((it) => it.slot === state.villagerSlot)
    const guest = stay ? guestById(stay.id) : null
    if (!stay || !guest) return
    const lines = houseReady(stay.buildStart) ? guest.townLines : guest.buildLines
    stay.talkIdx = (stay.talkIdx + 1) % lines.length
    state.guestDialog = lines[stay.talkIdx]
    playSound('talk')
  }
  function playWithVillager() {
    const stay = state.townStays.find((it) => it.slot === state.villagerSlot)
    const guest = stay ? guestById(stay.id) : null
    if (!stay || !guest || !houseReady(stay.buildStart)) {
      playSound('deny')
      showNotice('房子蓋好才能一起玩。')
      return
    }
    stay.following = !stay.following
    for (const other of state.townStays) {
      if (other !== stay) other.following = false
    }
    state.guestDialog = guest.playLines[stay.following ? 0 : 1]
    playSound(stay.following ? 'gift' : 'close')
    showNotice(stay.following ? `${guest.name} 跟著你散步了。再點一次就會停。` : `${guest.name} 先回家門口了。`)
    if (stay.following) {
      state.villagerOpen = false
      state.interactLock = 0.6
    }
    persistHud()
  }
  function decorateVillagerHome(name: string, price: number) {
    const stay = state.townStays.find((it) => it.slot === state.villagerSlot)
    if (!stay || !houseReady(stay.buildStart)) return
    if (stay.furniture.includes(name)) {
      playSound('deny')
      return
    }
    if (state.money < price) {
      playSound('deny')
      showNotice('這件家具還買不起。')
      return
    }
    state.money -= price
    stay.furniture.push(name)
    playSound('buy')
    showNotice('擺進新家了。')
    persistHud()
  }
  function askVillagerToLeave() {
    const stay = state.townStays.find((it) => it.slot === state.villagerSlot)
    const guest = stay ? guestById(stay.id) : null
    if (!stay || !guest) return
    state.townStays = state.townStays.filter((it) => it.slot !== stay.slot)
    state.villagerOpen = false
    state.interactLock = 1.2
    playSound('close')
    showNotice(`${guest.name} 離開小鎮了。以後還可以再邀請回來。`)
    persistHud()
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
    const rects = placeRects(state.width, state.height)
    for (const stay of state.townStays) {
      if (stay.following) continue
      if (stay.x === 0 && stay.y === 0) {
        const plot = rects[stay.slot === 0 ? 'house0' : 'house1']
        stay.x = plot.x + plot.w / 2
        stay.y = plot.y + plot.h + 12
      }
    }
  }

  function goLandHome() {
    const host = window.location.hostname
    if (host.endsWith('workers.dev') || host.endsWith('goji.land')) {
      window.location.href = 'https://goji.land/'
      return
    }
    const path = window.location.pathname
    if (path.includes('/apps/fruit-crossing')) {
      window.location.href = path.replace(/\/apps\/fruit-crossing.*/, '/index.html')
      return
    }
    window.location.href = '../../index.html'
  }

  const hotelRooms = computed(() =>
    state.hotelStays
      .slice()
      .sort((a, b) => a.room - b.room)
      .map((stay) => {
        const guest = guestById(stay.id)!
        return {
          room: stay.room,
          guest,
          furniture: stay.furniture,
          dialog: state.hotelFocusRoom === stay.room ? state.guestDialog : guest.lines[stay.talkIdx % guest.lines.length],
        }
      }),
  )
  const hotelCandidates = computed(() =>
    inviteCandidates(
      state.hotelStays.map((it) => it.id),
      state.townStays.map((it) => it.id),
    ),
  )
  const townNames = computed(() =>
    state.townStays.map((it) => guestById(it.id)?.name).filter((n): n is string => !!n),
  )
  const villagerStay = computed(() => state.townStays.find((it) => it.slot === state.villagerSlot) ?? null)
  const villagerGuest = computed(() => (villagerStay.value ? guestById(villagerStay.value.id) : null))
  const villagerReady = computed(() => (villagerStay.value ? houseReady(villagerStay.value.buildStart) : false))
  const villagerRemain = computed(() => {
    void state.animTime
    return villagerStay.value ? houseRemainLabel(villagerStay.value.buildStart) : ''
  })

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
    hotelRooms,
    hotelCandidates,
    townNames,
    villagerGuest,
    villagerReady,
    villagerRemain,
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
    focusHotelRoom,
    inviteGuest,
    talkHotelGuest,
    checkoutHotelGuest,
    decorateHotelRoom,
    settleGuestInTown,
    closeVillager,
    talkVillager,
    playWithVillager,
    decorateVillagerHome,
    askVillagerToLeave,
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
