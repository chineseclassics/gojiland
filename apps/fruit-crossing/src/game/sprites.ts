import basketUrl from '../assets/basket.png'
import houseUrl from '../assets/house.png'
import playerUrl from '../assets/player.png'
import shedUrl from '../assets/shed.png'
import shopUrl from '../assets/shop.png'

export type SpriteKey = 'basket' | 'house' | 'shed' | 'shop' | 'player'

const urls: Record<SpriteKey, string> = {
  basket: basketUrl,
  house: houseUrl,
  shed: shedUrl,
  shop: shopUrl,
  player: playerUrl,
}

const sprites: Partial<Record<SpriteKey, HTMLImageElement>> = {}
let loading: Promise<void> | null = null

export function getSprite(key: SpriteKey): HTMLImageElement | null {
  const img = sprites[key]
  return img && img.complete && img.naturalWidth > 0 ? img : null
}

export function loadSprites(): Promise<void> {
  if (loading) return loading
  loading = Promise.all(
    (Object.keys(urls) as SpriteKey[]).map(
      (key) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.decoding = 'async'
          img.onload = () => {
            sprites[key] = img
            resolve()
          }
          img.onerror = () => resolve()
          img.src = urls[key]
        }),
    ),
  ).then(() => undefined)
  return loading
}
