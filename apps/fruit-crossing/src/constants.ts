import type { FallItem, ShopDecor, ShopSeed } from './types'

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

export const SHOP_SEEDS: ShopSeed[] = [
  { name: '🍇 葡萄種子', price: 60 },
  { name: '🥭 榴蓮種子', price: 90 },
  { name: '⭐ 金色果實種子', price: 160 },
]

export const FRUIT_SELL: Record<string, number> = {
  '🍎 蘋果': 8,
  '🍌 香蕉': 10,
  '🍊 橘子': 12,
  '🍇 葡萄': 18,
  '🥭 榴蓮': 22,
  '⭐ 金色果實': 40,
}

export const SHOP_DECOR: ShopDecor[] = [
  { name: '🪵 木製小椅', price: 40 },
  { name: '🪴 綠色盆栽', price: 35 },
  { name: '🛋️ 舒適沙發', price: 50 },
  { name: '📺 復古電視', price: 80 },
  { name: '🧸 熊熊玩偶', price: 35 },
]

export function isOrdinarySeed(item: string): boolean {
  return item.includes('蘋果種子') || item.includes('香蕉種子') || item.includes('橘子種子')
}

export function fruitSellPrice(item: string): number | null {
  if (item.includes('種子')) return null
  return FRUIT_SELL[item] ?? null
}

export const PLACES = {
  home: { kind: 'home' as const, x: 0.03, y: 0.12, w: 0.16, h: 0.22 },
  hotel: { kind: 'hotel' as const, x: 0.21, y: 0.08, w: 0.18, h: 0.26 },
  shed: { kind: 'shed' as const, x: 0.42, y: 0.16, w: 0.14, h: 0.18 },
  shop: { kind: 'shop' as const, x: 0.6, y: 0.1, w: 0.22, h: 0.24 },
  house0: { kind: 'house0' as const, x: 0.18, y: 0.48, w: 0.18, h: 0.24 },
  house1: { kind: 'house1' as const, x: 0.58, y: 0.48, w: 0.18, h: 0.24 },
}

export function todayLabel(): string {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日 (星期${WEEKDAYS[now.getDay()]})`
}

export function isSunday(): boolean {
  return new Date().getDay() === 0
}
