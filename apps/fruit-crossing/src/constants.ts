import type { FallItem, ShopDecor, ShopFood } from './types'

export const SAVE_KEY = 'fruitcrossing-v2'
export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

export const FRUITS_DATA: Omit<FallItem, 'x' | 'y' | 'r'>[] = [
  { name: '蘋果', emoji: '🍎', pts: 10, speed: 140, type: 'FRUIT' },
  { name: '香蕉', emoji: '🍌', pts: 14, speed: 160, type: 'FRUIT' },
  { name: '橘子', emoji: '🍊', pts: 18, speed: 175, type: 'FRUIT' },
  { name: '葡萄', emoji: '🍇', pts: 22, speed: 190, type: 'FRUIT' },
  { name: '榴蓮', emoji: '🥭', pts: 30, speed: 220, type: 'FRUIT' },
  { name: '金色果實', emoji: '⭐', pts: 50, speed: 240, type: 'RARE' },
  { name: '大便', emoji: '💩', pts: 0, speed: 165, type: 'POOP' },
]

export const VEGGIES_DATA: Omit<FallItem, 'x' | 'y' | 'r'>[] = [
  { name: '西蘭花', emoji: '🥦', pts: 10, speed: 140, type: 'VEGGIE' },
  { name: '胡蘿蔔', emoji: '🥕', pts: 14, speed: 160, type: 'VEGGIE' },
  { name: '青菜', emoji: '🥬', pts: 18, speed: 175, type: 'VEGGIE' },
  { name: '茄子', emoji: '🍆', pts: 22, speed: 190, type: 'VEGGIE' },
  { name: '黃瓜', emoji: '🥒', pts: 26, speed: 210, type: 'VEGGIE' },
  { name: '金色蔬菜', emoji: '🌟', pts: 50, speed: 240, type: 'RARE' },
  { name: '大便', emoji: '💩', pts: 0, speed: 165, type: 'POOP' },
]

export const SHOP_FOOD: ShopFood[] = [
  { name: '🍎 蘋果', price: 10, sell: 8 },
  { name: '🍌 香蕉', price: 15, sell: 10 },
  { name: '🍊 橘子', price: 20, sell: 12 },
  { name: '🥭 榴蓮', price: 28, sell: 16 },
  { name: '🥦 西蘭花', price: 12, sell: 8 },
  { name: '🥕 胡蘿蔔', price: 15, sell: 10 },
]

export const SHOP_DECOR: ShopDecor[] = [
  { name: '🪵 木製小椅', price: 40 },
  { name: '🪴 綠色盆栽', price: 35 },
  { name: '🛋️ 舒適沙發', price: 50 },
  { name: '📺 復古電視', price: 80 },
  { name: '🧸 熊熊玩偶', price: 35 },
]

export const SELL_MAP = Object.fromEntries(SHOP_FOOD.map((it) => [it.name, it.sell]))

export const PLACES = {
  home: { kind: 'home' as const, x: 0.12, y: 0.28, w: 0.18, h: 0.24 },
  shed: { kind: 'shed' as const, x: 0.4, y: 0.3, w: 0.18, h: 0.22 },
  shop: { kind: 'shop' as const, x: 0.66, y: 0.26, w: 0.22, h: 0.28 },
}

export function todayLabel(): string {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日 (星期${WEEKDAYS[now.getDay()]})`
}

export function isSunday(): boolean {
  return new Date().getDay() === 0
}
