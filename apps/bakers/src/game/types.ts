import type { ImageKey } from './images'

export type SceneId = 'kitchen' | 'shop' | 'beach'
export type ShopTab = 'ingredients' | 'tools'
export type BagFilter = 'all' | 'baked' | 'stock'
export type SupplyWhere = 'bag' | 'shop' | 'beach'

export interface Ingredient {
  id: string
  name: string
  enName: string
  price: number
  image: ImageKey
  tip: string
  exclusive: boolean
}

export interface Tool {
  id: string
  name: string
  enName: string
  price: number
  image: ImageKey
  tip: string
}

export interface Recipe {
  id: string
  name: string
  enName: string
  image: ImageKey
  required: string[]
  custom?: boolean
  note?: string
}

export interface Captain {
  id: string
  name: string
  image: ImageKey
  plea: string
  tools: string[]
  rewardGold: number
  rewardItem: string
  rewardCount: number
}

export interface BeachCoin {
  id: string
  x: number
  y: number
  amount: number
}

export interface BakedItem {
  id: string
  name: string
  image: ImageKey
  price: number
  count: number
}

export interface ToastNote {
  id: number
  text: string
}

export interface GameState {
  gold: number
  inventory: Record<string, number>
  baked: BakedItem[]
  scene: SceneId
  recipe: Recipe | null
  table: string[]
  captainIndex: number
  repaired: boolean
  thanks: string | null
  coins: BeachCoin[]
  tidePending: boolean
  shopTab: ShopTab
  bagOpen: boolean
  bagFilter: BagFilter
  customOpen: boolean
  baking: boolean
  result: BakedItem | null
  toast: ToastNote | null
  wanted: string[]
  confirmReset: boolean
  discovered: string[]
  orderId: string
  orderGuest: string
  pendingBake: BakedItem | null
  debut: string | null
}
