import { FRUITS_DATA } from '../constants'
import type { FruitFlashCard } from '../types'

export const FLASH_CARD_COST = 100

export interface FruitCardSpec {
  name: string
  emoji: string
  glow: string
  deep: string
  epithet: string
  lines: [string, string]
}

export interface FruitStack {
  name: string
  emoji: string
  count: number
  ready: boolean
}

export interface AlbumSlot {
  spec: FruitCardSpec
  count: number
}

const CARD_STYLE: Record<string, Omit<FruitCardSpec, 'name' | 'emoji'>> = {
  蘋果: { glow: '#f6c8b4', deep: '#8b2a22', epithet: '園中紅玉', lines: ['園中紅玉墜', '一咬滿齒香'] },
  香蕉: { glow: '#f6e3a8', deep: '#8a6a18', epithet: '金月一彎', lines: ['金彎如新月', '軟甜解渴時'] },
  橘子: { glow: '#f4c18a', deep: '#b45309', epithet: '暖皮藏日', lines: ['皮暖藏冬日', '瓣瓣皆是光'] },
  葡萄: { glow: '#d7c4f0', deep: '#5b3a86', epithet: '紫琉璃串', lines: ['一串紫琉璃', '涼意入齒間'] },
  榴蓮: { glow: '#dce8a8', deep: '#4d6a1e', epithet: '異香識寶', lines: ['殼重香更烈', '識貨方知寶'] },
  金色果實: { glow: '#f8e7a0', deep: '#9a6b12', epithet: '星落成果', lines: ['星落成一果', '萬園難再尋'] },
}

export const FRUIT_CARD_CATALOG: FruitCardSpec[] = FRUITS_DATA
  .filter((it) => it.type !== 'POOP')
  .map((it) => {
    const style = CARD_STYLE[it.name] ?? CARD_STYLE.蘋果
    return {
      name: it.name,
      emoji: it.emoji,
      ...style,
    }
  })

const SPEC_BY_NAME = new Map(FRUIT_CARD_CATALOG.map((spec) => [spec.name, spec]))

export function fruitCardSpec(name: string): FruitCardSpec | null {
  return SPEC_BY_NAME.get(name) ?? null
}

export function fruitNameFromBagItem(item: string): string | null {
  const name = item.replace(/^[^\s]+\s/, '')
  return SPEC_BY_NAME.has(name) ? name : null
}

export function countFruitStacks(backpack: readonly string[]): FruitStack[] {
  const counts = new Map<string, number>()
  for (const item of backpack) {
    const name = fruitNameFromBagItem(item)
    if (!name) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return FRUIT_CARD_CATALOG.map((spec) => {
    const count = counts.get(spec.name) ?? 0
    return {
      name: spec.name,
      emoji: spec.emoji,
      count,
      ready: count >= FLASH_CARD_COST,
    }
  })
}

export function albumSlots(cards: readonly FruitFlashCard[]): AlbumSlot[] {
  const counts = new Map<string, number>()
  for (const card of cards) {
    counts.set(card.name, (counts.get(card.name) ?? 0) + 1)
  }
  return FRUIT_CARD_CATALOG.map((spec) => ({
    spec,
    count: counts.get(spec.name) ?? 0,
  }))
}

export function makeFlashCard(name: string): FruitFlashCard {
  return {
    id: `${name}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
  }
}

export function isFlashCard(value: unknown): value is FruitFlashCard {
  if (!value || typeof value !== 'object') return false
  const card = value as FruitFlashCard
  return typeof card.id === 'string' && typeof card.name === 'string' && SPEC_BY_NAME.has(card.name)
}
