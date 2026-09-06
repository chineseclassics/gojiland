export type GameMode = 'CATCH' | 'TOWN'
export type ItemType = 'FRUIT' | 'RARE' | 'POOP'
export type DayPeriod = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'
export type HairStyle = 'short' | 'long' | 'cap' | 'pony' | 'curl'
export type ShopTab = 'seeds' | 'decor' | 'sell'
export type PlaceKind = 'home' | 'hotel' | 'shed' | 'shop' | ''

export interface FallItem {
  name: string
  emoji: string
  pts: number
  speed: number
  type: ItemType
  x: number
  y: number
  r: number
}

export interface ShopSeed {
  name: string
  price: number
}

export interface ShopDecor {
  name: string
  price: number
}

export interface FruitFlashCard {
  id: string
  name: string
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface GameState {
  mode: GameMode
  paused: boolean
  animTime: number
  finished: boolean
  inShelter: boolean
  raining: boolean
  thunder: boolean
  rainLeft: number
  nextThunder: number
  realRaining: boolean
  dayPeriod: DayPeriod
  playerWet: boolean
  fruitsWet: boolean
  flash: number
  bolts: { x: number; life: number }[]
  score: number
  combo: number
  bestCombo: number
  eaten: number
  money: number
  backpack: string[]
  furniture: string[]
  flashCards: FruitFlashCard[]
  inspectOpen: boolean
  inspectName: string
  inspectFlipped: boolean
  inspectReveal: boolean
  mrGifted: boolean
  shopTab: ShopTab
  interactLock: number
  nearPlace: PlaceKind
  hotelOpen: boolean
  visitedGuests: string[]
  todayGuestId: string
  guestDate: string
  guestTalkIdx: number
  guestDialog: string
  width: number
  height: number
  spawnAcc: number
  pops: { x: number; y: number; text: string; color: string; life: number }[]
  items: FallItem[]
  walkTarget: { x: number; y: number } | null
  toast: string
  sundayOpen: boolean
  shelterOpen: boolean
  shopOpen: boolean
  homeOpen: boolean
  customOpen: boolean
  pauseOpen: boolean
  summaryOpen: boolean
  summaryTitle: string
  shelterEatMsg: string
  shelterEatOk: boolean
  mrDialog: string
}

export interface Basket {
  x: number
  y: number
  w: number
  h: number
  targetX: number
  squash: number
}

export interface TownPlayer {
  x: number
  y: number
  speed: number
  hairStyle: HairStyle
  shirtColor: string
}

export interface Keys {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}
