import { inject, type InjectionKey } from 'vue'
import type { FruitGame } from './useFruitGame'

export const fruitGameKey: InjectionKey<FruitGame> = Symbol('fruit-game')

export function useInjectedGame(): FruitGame {
  const game = inject(fruitGameKey)
  if (!game) throw new Error('fruit game missing')
  return game
}
