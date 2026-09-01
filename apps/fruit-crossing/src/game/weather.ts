import type { DayPeriod, GameState } from '../types'

export function hourNow(): number {
  const n = new Date()
  return n.getHours() + n.getMinutes() / 60
}

export function dayPeriodFromHour(h: number): DayPeriod {
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 11) return 'morning'
  if (h >= 11 && h < 16) return 'noon'
  if (h >= 16 && h < 18) return 'afternoon'
  if (h >= 18 && h < 19.5) return 'evening'
  return 'night'
}

export function periodName(p: DayPeriod): string {
  return {
    dawn: '清晨',
    morning: '早上',
    noon: '中午',
    afternoon: '午後',
    evening: '傍晚',
    night: '晚上',
  }[p]
}

export function clockLabel(period: DayPeriod): string {
  const n = new Date()
  const hh = String(n.getHours()).padStart(2, '0')
  const mm = String(n.getMinutes()).padStart(2, '0')
  return `${periodName(period)} ${hh}:${mm}`
}

export function weatherLabel(state: Pick<GameState, 'thunder' | 'raining' | 'dayPeriod'>): string {
  if (state.thunder) return '⛈️ 雷雨'
  if (state.raining) return '🌧️ 下雨'
  if (state.dayPeriod === 'night') return '🌙 晴夜'
  return '☀️ 晴朗'
}

export function isRainCode(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)
}

export function isThunderCode(code: number): boolean {
  return code >= 95 && code <= 99
}

export async function fetchWeatherCode(): Promise<number> {
  let lat = 25.033
  let lon = 121.565
  try {
    const ip = (await fetch('https://ipwho.is/').then((r) => r.json())) as {
      success?: boolean
      latitude?: number
      longitude?: number
    }
    if (ip.success && ip.latitude && ip.longitude) {
      lat = ip.latitude
      lon = ip.longitude
    }
  } catch {
    /* keep Taipei fallback */
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,precipitation,is_day&timezone=auto`
  const data = (await fetch(url).then((r) => r.json())) as { current?: { weather_code?: number } }
  return Number(data.current?.weather_code ?? 0)
}
