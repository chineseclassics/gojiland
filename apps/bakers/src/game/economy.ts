import { ingredients } from './catalog'

const EXCLUSIVE_WORTH = 40

export function sellPrice(required: string[]) {
  const cost = required.reduce((sum, id) => {
    const item = ingredients[id]
    if (!item) return sum
    return sum + (item.exclusive ? EXCLUSIVE_WORTH : item.price)
  }, 0)
  return Math.max(24, Math.round(cost * 1.4))
}
