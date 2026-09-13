import { PLACES } from '../constants'
import type { Basket, DayPeriod, GameState, Rect, TownPlayer } from '../types'
import { HOUSE_BUILD_MS, guestById } from './hotelGuests'
import { getSprite } from './sprites'

function pxPlace(place: { x: number; y: number; w: number; h: number }, w: number, h: number): Rect {
  return { x: place.x * w, y: place.y * h, w: place.w * w, h: place.h * h }
}

function skyPalette(period: DayPeriod, raining: boolean, thunder: boolean) {
  const palettes = {
    dawn: { top: '#f9a8d4', mid: '#fdba74', ground: '#4d7c0f', orb: '#fda4af', orbR: 28 },
    morning: { top: '#7dd3fc', mid: '#bbf7d0', ground: '#4d7c0f', orb: '#fde68a', orbR: 32 },
    noon: { top: '#38bdf8', mid: '#86efac', ground: '#3f6212', orb: '#facc15', orbR: 36 },
    afternoon: { top: '#7dd3fc', mid: '#fde68a', ground: '#3f6212', orb: '#fbbf24', orbR: 34 },
    evening: { top: '#fb7185', mid: '#fdba74', ground: '#365314', orb: '#fb923c', orbR: 30 },
    night: { top: '#0f172a', mid: '#1e3a5f', ground: '#14532d', orb: '#f1f5f9', orbR: 22 },
  }
  const p = palettes[period]
  if (raining || thunder) {
    return {
      top: thunder ? '#1e293b' : '#334155',
      mid: thunder ? '#334155' : '#475569',
      ground: '#14532d',
      orb: '#cbd5e1',
      orbR: p.orbR - 6,
    }
  }
  return p
}

function drawSpriteFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

function drawBuildingSprite(ctx: CanvasRenderingContext2D, key: 'house' | 'hotel' | 'shed' | 'shop', b: Rect) {
  const img = getSprite(key)
  if (!img) return false
  const padX = b.w * 0.08
  const topExtra = b.h * 0.42
  drawSpriteFit(ctx, img, b.x - padX, b.y - topExtra, b.w + padX * 2, b.h + topExtra)
  return true
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lit: boolean) {
  ctx.fillStyle = lit ? '#fde68a' : '#7dd3fc'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = '#78350f'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)
  ctx.beginPath()
  ctx.moveTo(x + w / 2, y)
  ctx.lineTo(x + w / 2, y + h)
  ctx.moveTo(x, y + h / 2)
  ctx.lineTo(x + w, y + h / 2)
  ctx.stroke()
}

function drawHomeHouse(ctx: CanvasRenderingContext2D, b: Rect, night: boolean) {
  if (drawBuildingSprite(ctx, 'house', b)) return
  ctx.fillStyle = '#92400e'
  ctx.fillRect(b.x + b.w * 0.72, b.y - 28, 12, 32)
  ctx.fillStyle = '#7f1d1d'
  ctx.beginPath()
  ctx.moveTo(b.x + b.w * 0.72 - 4, b.y - 28)
  ctx.lineTo(b.x + b.w * 0.72 + 16, b.y - 28)
  ctx.lineTo(b.x + b.w * 0.72 + 6, b.y - 40)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#c2410c'
  ctx.beginPath()
  ctx.moveTo(b.x - 10, b.y + 6)
  ctx.lineTo(b.x + b.w / 2, b.y - 32)
  ctx.lineTo(b.x + b.w + 10, b.y + 6)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fed7aa'
  ctx.fillRect(b.x, b.y, b.w, b.h)
  ctx.strokeStyle = '#9a3412'
  ctx.lineWidth = 2
  ctx.strokeRect(b.x, b.y, b.w, b.h)
  const doorW = b.w * 0.28
  const doorH = b.h * 0.48
  const doorX = b.x + b.w / 2 - doorW / 2
  const doorY = b.y + b.h - doorH
  ctx.fillStyle = '#9a3412'
  ctx.fillRect(doorX, doorY, doorW, doorH)
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.arc(doorX + doorW * 0.78, doorY + doorH * 0.52, 3, 0, Math.PI * 2)
  ctx.fill()
  drawWindow(ctx, b.x + b.w * 0.1, b.y + b.h * 0.22, b.w * 0.22, b.h * 0.28, night)
  drawWindow(ctx, b.x + b.w * 0.68, b.y + b.h * 0.22, b.w * 0.22, b.h * 0.28, night)
}

function drawHotelInn(ctx: CanvasRenderingContext2D, b: Rect, night: boolean) {
  if (drawBuildingSprite(ctx, 'hotel', b)) return
  ctx.fillStyle = '#9a3412'
  ctx.beginPath()
  ctx.moveTo(b.x - 8, b.y + 10)
  ctx.lineTo(b.x + b.w / 2, b.y - 36)
  ctx.lineTo(b.x + b.w + 8, b.y + 10)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fde8d0'
  ctx.fillRect(b.x, b.y, b.w, b.h)
  ctx.fillStyle = '#fed7aa'
  ctx.fillRect(b.x + 6, b.y + 8, b.w - 12, b.h * 0.42)
  ctx.fillStyle = '#9a3412'
  ctx.fillRect(b.x + b.w * 0.38, b.y + b.h * 0.52, b.w * 0.24, b.h * 0.48)
  drawWindow(ctx, b.x + b.w * 0.12, b.y + b.h * 0.16, b.w * 0.18, b.h * 0.2, night)
  drawWindow(ctx, b.x + b.w * 0.7, b.y + b.h * 0.16, b.w * 0.18, b.h * 0.2, night)
  drawWindow(ctx, b.x + b.w * 0.12, b.y + b.h * 0.58, b.w * 0.18, b.h * 0.2, night)
  drawWindow(ctx, b.x + b.w * 0.7, b.y + b.h * 0.58, b.w * 0.18, b.h * 0.2, night)
}

function drawRainShed(ctx: CanvasRenderingContext2D, b: Rect) {
  if (drawBuildingSprite(ctx, 'shed', b)) return
  ctx.fillStyle = '#a16207'
  ctx.fillRect(b.x + 8, b.y + 8, 10, b.h - 8)
  ctx.fillRect(b.x + b.w - 18, b.y + 8, 10, b.h - 8)
  ctx.fillRect(b.x + b.w * 0.42, b.y + 18, 8, b.h - 18)
  ctx.fillStyle = '#78350f'
  ctx.beginPath()
  ctx.moveTo(b.x - 12, b.y + 18)
  ctx.lineTo(b.x + b.w / 2, b.y - 22)
  ctx.lineTo(b.x + b.w + 12, b.y + 18)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#b45309'
  ctx.fillRect(b.x - 8, b.y + 14, b.w + 16, 10)
}

function drawFruitShop(ctx: CanvasRenderingContext2D, b: Rect, night: boolean) {
  if (drawBuildingSprite(ctx, 'shop', b)) return
  ctx.fillStyle = '#b45309'
  ctx.beginPath()
  ctx.moveTo(b.x - 8, b.y + 8)
  ctx.lineTo(b.x + b.w / 2, b.y - 28)
  ctx.lineTo(b.x + b.w + 8, b.y + 8)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff7ed'
  ctx.fillRect(b.x, b.y, b.w, b.h)
  ctx.strokeStyle = '#92400e'
  ctx.lineWidth = 2
  ctx.strokeRect(b.x, b.y, b.w, b.h)
  void night
}

function drawBasketSprite(ctx: CanvasRenderingContext2D, basket: Basket) {
  const img = getSprite('basket')
  if (!img) return false
  // 視覺略大於碰撞盒，但對齊水果 emoji（約 36px）比例
  const drawW = basket.w * 1.08
  const drawH = drawW * (img.naturalHeight / img.naturalWidth)
  ctx.save()
  ctx.translate(basket.x + basket.w / 2, basket.y + basket.h * 0.55)
  ctx.scale(1, basket.squash)
  ctx.drawImage(img, -drawW / 2, -drawH * 0.82, drawW, drawH)
  ctx.restore()
  return true
}

function drawBolt(ctx: CanvasRenderingContext2D, x: number, height: number) {
  ctx.save()
  ctx.strokeStyle = '#f8fafc'
  ctx.lineWidth = 3
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x - 12, height * 0.22)
  ctx.lineTo(x + 8, height * 0.28)
  ctx.lineTo(x - 6, height * 0.48)
  ctx.lineTo(x + 14, height * 0.62)
  ctx.stroke()
  ctx.restore()
}

function drawRain(ctx: CanvasRenderingContext2D, state: GameState) {
  const heavy = state.thunder
  const n = heavy ? 90 : 56
  const now = state.animTime * 1000
  for (let r = 0; r < n; r++) {
    const rx = ((r * 97.3 + now * (heavy ? 0.85 : 0.55)) % (state.width + 40)) - 20
    const ry = ((r * 53.1 + now * (heavy ? 1.15 : 0.75)) % (state.height + 30)) - 10
    const len = heavy ? 18 : 12
    const g = ctx.createLinearGradient(rx, ry, rx + 3, ry + len)
    g.addColorStop(0, 'rgba(224, 242, 254, 0)')
    g.addColorStop(1, heavy ? 'rgba(186, 230, 253, 0.9)' : 'rgba(147, 197, 253, 0.7)')
    ctx.fillStyle = g
    ctx.fillRect(rx, ry, heavy ? 2.2 : 1.6, len)
  }
}

export function drawSky(ctx: CanvasRenderingContext2D, state: GameState) {
  const p = skyPalette(state.dayPeriod, state.raining, state.thunder)
  const g = ctx.createLinearGradient(0, 0, 0, state.height)
  g.addColorStop(0, p.top)
  g.addColorStop(0.55, p.mid)
  g.addColorStop(1, p.ground)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, state.width, state.height)
  if (state.dayPeriod === 'night' && !state.thunder) {
    ctx.fillStyle = '#f8fafc'
    for (let i = 0; i < 38; i++) {
      const sx = (Math.sin(i * 12.7) * 0.5 + 0.5) * state.width
      const sy = (Math.sin(i * 7.3) * 0.5 + 0.5) * state.height * 0.42
      ctx.globalAlpha = 0.35 + (i % 5) * 0.12
      ctx.fillRect(sx, sy, 2, 2)
    }
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = p.orb
  ctx.beginPath()
  ctx.arc(state.width * 0.84, state.height * 0.14, p.orbR, 0, Math.PI * 2)
  ctx.fill()
  if (state.dayPeriod === 'night') {
    ctx.fillStyle = p.top
    ctx.beginPath()
    ctx.arc(state.width * 0.84 + 10, state.height * 0.12, p.orbR * 0.78, 0, Math.PI * 2)
    ctx.fill()
  }
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(248, 250, 252, ${state.flash * 0.55})`
    ctx.fillRect(0, 0, state.width, state.height)
  }
  for (const b of state.bolts) drawBolt(ctx, b.x, state.height)
}

export function drawCatchScene(ctx: CanvasRenderingContext2D, state: GameState, basket: Basket) {
  drawSky(ctx, state)
  ctx.fillStyle = skyPalette(state.dayPeriod, state.raining, state.thunder).ground
  ctx.fillRect(0, state.height - 42, state.width, 42)
  if (!drawBasketSprite(ctx, basket)) {
    ctx.save()
    ctx.translate(basket.x + basket.w / 2, basket.y)
    ctx.scale(1, basket.squash)
    ctx.fillStyle = '#b45309'
    ctx.beginPath()
    ctx.moveTo(-basket.w / 2, 0)
    ctx.lineTo(-basket.w / 2 + 10, basket.h)
    ctx.lineTo(basket.w / 2 - 10, basket.h)
    ctx.lineTo(basket.w / 2, 0)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#78350f'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const item of state.items) {
    ctx.font = `${item.r * 2}px serif`
    ctx.fillText(item.emoji, item.x, item.y)
    if (state.fruitsWet) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)'
      ctx.beginPath()
      ctx.arc(item.x + 8, item.y - 6, 3, 0, Math.PI * 2)
      ctx.arc(item.x - 6, item.y + 4, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  for (const pop of state.pops) {
    ctx.globalAlpha = Math.max(0, pop.life)
    ctx.fillStyle = pop.color
    ctx.font = '800 16px "M PLUS Rounded 1c", Nunito, sans-serif'
    ctx.fillText(pop.text, pop.x, pop.y)
    ctx.globalAlpha = 1
  }
  if ((state.raining || state.thunder) && !state.inShelter) {
    ctx.fillStyle = state.thunder ? '#e2e8f0' : '#0c4a6e'
    ctx.font = '700 14px "M PLUS Rounded 1c", Nunito, sans-serif'
    ctx.fillText(state.thunder ? '雷雨中，可躲進棚子' : '正在淋雨，水果不會壞', state.width / 2, 28)
  }
  if (state.raining || state.thunder) drawRain(ctx, state)
}

export function drawAvatar(ctx: CanvasRenderingContext2D, p: TownPlayer) {
  const img = getSprite('player')
  if (img) {
    const h = 78
    const w = (img.naturalWidth / img.naturalHeight) * h
    ctx.drawImage(img, p.x - w / 2, p.y - h + 10, w, h)
    // shirt color badge so換裝仍有回饋
    ctx.fillStyle = p.shirtColor
    ctx.beginPath()
    ctx.arc(p.x + w * 0.28, p.y - 8, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    return
  }
  ctx.fillStyle = p.shirtColor
  ctx.beginPath()
  ctx.arc(p.x, p.y + 8, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fde68a'
  ctx.beginPath()
  ctx.arc(p.x, p.y - 6, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#78350f'
  if (p.hairStyle === 'short') {
    ctx.beginPath()
    ctx.arc(p.x, p.y - 10, 10, Math.PI, Math.PI * 2)
    ctx.fill()
  } else if (p.hairStyle === 'long') {
    ctx.fillRect(p.x - 12, p.y - 14, 24, 18)
  } else if (p.hairStyle === 'pony') {
    ctx.beginPath()
    ctx.arc(p.x, p.y - 10, 9, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(p.x + 6, p.y - 8, 8, 16)
  } else if (p.hairStyle === 'curl') {
    ctx.beginPath()
    ctx.arc(p.x - 7, p.y - 10, 7, 0, Math.PI * 2)
    ctx.arc(p.x + 7, p.y - 10, 7, 0, Math.PI * 2)
    ctx.arc(p.x, p.y - 14, 7, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(p.x - 12, p.y - 16, 24, 7)
  }
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, night: boolean, accent: string) {
  ctx.fillStyle = night ? '#14532d' : '#2f5a12'
  ctx.beginPath()
  ctx.ellipse(x + 2, y + 4, 20, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = night ? '#166534' : '#3f7a18'
  ctx.beginPath()
  ctx.ellipse(x, y, 18, 13, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = night ? '#22c55e' : '#65a30d'
  ctx.beginPath()
  ctx.ellipse(x - 8, y - 5, 11, 8, -0.35, 0, Math.PI * 2)
  ctx.ellipse(x + 8, y - 4, 10, 7, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(x - 7, y - 7, 2.6, 0, Math.PI * 2)
  ctx.arc(x + 5, y - 6, 2.3, 0, Math.PI * 2)
  ctx.arc(x + 1, y - 1, 2, 0, Math.PI * 2)
  ctx.fill()
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawTownGround(ctx: CanvasRenderingContext2D, w: number, h: number, night: boolean) {
  ctx.fillStyle = night ? '#1f3d12' : '#3d6b14'
  ctx.fillRect(0, h * 0.4, w, h * 0.6)

  ctx.fillStyle = night ? '#16300c' : '#2f5a10'
  for (let i = 0; i < 12; i++) {
    ctx.beginPath()
    ctx.ellipse(w * (0.05 + (i % 6) * 0.18), h * (0.62 + (i % 4) * 0.08), 48, 18, 0.1 * (i % 3), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = night ? '#2d5a1c' : '#4f8a1c'
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.ellipse(w * (0.1 + i * 0.1), h * (0.78 + (i % 2) * 0.05), 40, 14, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const dirt = night ? '#6b4e2e' : '#c4a06a'
  const packed = night ? '#7c5c38' : '#d4b184'
  const dust = night ? '#8b7355' : '#e4d0aa'
  const yards = [
    { x: w * 0.125, y: h * 0.5, rx: w * 0.09, ry: 26 },
    { x: w * 0.33, y: h * 0.5, rx: w * 0.1, ry: 28 },
    { x: w * 0.54, y: h * 0.52, rx: w * 0.08, ry: 22 },
    { x: w * 0.78, y: h * 0.5, rx: w * 0.11, ry: 28 },
  ]
  for (const yrd of yards) {
    blob(ctx, yrd.x, yrd.y, yrd.rx, yrd.ry, dirt)
    blob(ctx, yrd.x, yrd.y + 4, yrd.rx * 0.72, yrd.ry * 0.55, packed)
  }

  for (let i = 0; i < 36; i++) {
    const t = i / 35
    const x = w * (0.02 + t * 0.96)
    const y = h * 0.58 + Math.sin(t * Math.PI * 2.2) * h * 0.028
    blob(ctx, x, y, 38 + (i % 4) * 6, 20 + (i % 3) * 3, dirt)
  }
  for (let i = 0; i < 32; i++) {
    const t = i / 31
    const x = w * (0.03 + t * 0.94)
    const y = h * 0.585 + Math.sin(t * Math.PI * 2.2) * h * 0.024
    blob(ctx, x, y, 26 + (i % 3) * 4, 12, packed)
  }
  ctx.fillStyle = dust
  for (let i = 0; i < 28; i++) {
    const t = i / 27
    const x = w * (0.04 + t * 0.92)
    const y = h * 0.59 + Math.sin(t * 7.1) * 8
    ctx.beginPath()
    ctx.ellipse(x, y, 6, 3.4, t * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }

  drawBush(ctx, w * 0.4, h * 0.5, night, night ? '#f9a8d4' : '#fb7185')
  drawBush(ctx, w * 0.55, h * 0.52, night, night ? '#fde68a' : '#facc15')
}

function drawBuildSite(ctx: CanvasRenderingContext2D, b: Rect, progress: number, animTime: number, night: boolean) {
  ctx.fillStyle = night ? '#5b3a1a' : '#8b5a2b'
  ctx.fillRect(b.x + b.w * 0.1, b.y + b.h * 0.55, 10, b.h * 0.45)
  ctx.fillRect(b.x + b.w * 0.8, b.y + b.h * 0.55, 10, b.h * 0.45)
  ctx.fillRect(b.x + b.w * 0.1, b.y + b.h * 0.52, b.w * 0.8, 8)
  const roofH = 20 + progress * 28
  ctx.fillStyle = night ? '#7f1d1d' : '#c2410c'
  ctx.globalAlpha = 0.85
  ctx.beginPath()
  ctx.moveTo(b.x - 6, b.y + b.h * 0.55)
  ctx.lineTo(b.x + b.w / 2, b.y + b.h * 0.55 - roofH)
  ctx.lineTo(b.x + b.w + 6, b.y + b.h * 0.55)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  if (progress > 0.35) {
    ctx.fillStyle = night ? '#fed7aa' : '#ffedd5'
    ctx.globalAlpha = (progress - 0.35) / 0.65
    ctx.fillRect(b.x + 8, b.y + b.h * 0.58, b.w - 16, b.h * 0.38)
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = '#f7f3df'
  ctx.beginPath()
  ctx.roundRect(b.x + 8, b.y + b.h + 6, b.w - 16, 8, 4)
  ctx.fill()
  ctx.fillStyle = '#65a30d'
  ctx.beginPath()
  ctx.roundRect(b.x + 8, b.y + b.h + 6, (b.w - 16) * progress, 8, 4)
  ctx.fill()
  if (progress < 1) {
    const spark = (Math.sin(animTime * 10) + 1) / 2
    ctx.fillStyle = `rgba(250, 204, 21, ${0.35 + spark * 0.55})`
    ctx.beginPath()
    ctx.arc(b.x + b.w * 0.7, b.y + b.h * 0.4, 5 + spark * 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCottage(ctx: CanvasRenderingContext2D, b: Rect, night: boolean, slot: number) {
  ctx.save()
  ctx.filter = slot === 0 ? 'hue-rotate(-18deg)' : 'hue-rotate(42deg)'
  drawHomeHouse(ctx, b, night)
  ctx.restore()
}

export function hotelGuestPos(room: 0 | 1, width: number, height: number) {
  const hotel = pxPlace(PLACES.hotel, width, height)
  return {
    x: hotel.x + hotel.w * (0.22 + room * 0.56),
    y: hotel.y + hotel.h + 20,
  }
}

function drawVillager(ctx: CanvasRenderingContext2D, x: number, y: number, emoji: string) {
  ctx.font = '28px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, x, y - 8)
}

export function drawTownScene(ctx: CanvasRenderingContext2D, state: GameState, player: TownPlayer) {
  drawSky(ctx, state)
  const night = state.dayPeriod === 'night'
  drawTownGround(ctx, state.width, state.height, night)
  const home = pxPlace(PLACES.home, state.width, state.height)
  const hotel = pxPlace(PLACES.hotel, state.width, state.height)
  const shed = pxPlace(PLACES.shed, state.width, state.height)
  const shop = pxPlace(PLACES.shop, state.width, state.height)
  drawHomeHouse(ctx, home, night)
  drawHotelInn(ctx, hotel, night)
  drawRainShed(ctx, shed)
  drawFruitShop(ctx, shop, night)
  for (const stay of state.hotelStays) {
    const pos = hotelGuestPos(stay.room, state.width, state.height)
    drawVillager(ctx, pos.x, pos.y, guestById(stay.id)?.emoji ?? '🙂')
  }
  for (const stay of state.townStays) {
    const key = stay.slot === 0 ? 'house0' : 'house1'
    const plot = pxPlace(PLACES[key], state.width, state.height)
    const progress = Math.min(1, Math.max(0, (Date.now() - stay.buildStart) / HOUSE_BUILD_MS))
    if (progress >= 1) drawCottage(ctx, plot, night, stay.slot)
    else drawBuildSite(ctx, plot, progress, state.animTime, night)
  }
  for (const stay of state.townStays) {
    drawVillager(ctx, stay.x, stay.y, guestById(stay.id)?.emoji ?? '🙂')
  }
  drawAvatar(ctx, player)
  ctx.textAlign = 'center'
  if (state.nearPlace) {
    ctx.fillStyle = 'rgba(247, 243, 223, 0.92)'
    const labels: Record<Exclude<typeof state.nearPlace, ''>, string> = {
      home: '點一下進小屋',
      hotel: '點一下進旅館',
      shed: '點一下進棚子',
      shop: '點一下進商店',
      house0: '點一下找新住民',
      house1: '點一下找新住民',
      hroom0: '點一下找旅館客人',
      hroom1: '點一下找旅館客人',
    }
    const hotelStay = state.nearPlace === 'hroom0' || state.nearPlace === 'hroom1'
      ? state.hotelStays.find((it) => (it.room === 0 ? 'hroom0' : 'hroom1') === state.nearPlace)
      : null
    const stay = state.nearPlace === 'house0' || state.nearPlace === 'house1'
      ? state.townStays.find((it) => (it.slot === 0 ? 'house0' : 'house1') === state.nearPlace)
      : null
    const label = hotelStay
      ? `點一下找${guestById(hotelStay.id)?.name ?? '客人'}`
      : stay
      ? (Date.now() - stay.buildStart >= HOUSE_BUILD_MS ? '點一下找朋友' : '點一下看工地')
      : labels[state.nearPlace]
    ctx.beginPath()
    const bw = 180
    const bh = 34
    const bx = state.width / 2 - bw / 2
    const by = state.height - 52
    ctx.roundRect(bx, by, bw, bh, 16)
    ctx.fill()
    ctx.fillStyle = '#794f27'
    ctx.font = '700 13px "M PLUS Rounded 1c", Nunito, sans-serif'
    ctx.fillText(label, state.width / 2, state.height - 34)
  }
  if (state.raining || state.thunder) drawRain(ctx, state)
}

export function placeRects(width: number, height: number) {
  return {
    home: pxPlace(PLACES.home, width, height),
    hotel: pxPlace(PLACES.hotel, width, height),
    shed: pxPlace(PLACES.shed, width, height),
    shop: pxPlace(PLACES.shop, width, height),
    house0: pxPlace(PLACES.house0, width, height),
    house1: pxPlace(PLACES.house1, width, height),
  }
}
