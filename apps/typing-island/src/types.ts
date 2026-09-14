export type Lang = 'zh' | 'en'
export type Scene = 'home' | 'minigames' | 'keys' | 'ocean' | 'orchard' | 'kitchen' | 'fall'
export type OceanMode = 'beach' | 'shark'
export type LevelKind = 'keys' | 'beach' | 'ocean' | 'orchard' | 'kitchen' | 'fall'

export interface Prompt {
  display: string
  input: string
  hint: string
}

export interface IslandSave {
  lang: Lang
  campaignStep: number
  unlocked: {
    ocean: boolean
    orchard: boolean
  }
  inventory: {
    fish: number
    fruit: number
  }
  pet: {
    hunger: number
    level: number
    fedCount: number
  }
  stars: number
  sharkBuff: number
}

export interface LevelLoot {
  fish?: number
  fruit?: number
  stars?: number
  cooked?: string
}

export interface LevelResult {
  kind: LevelKind
  title: string
  detail: string
  loot: LevelLoot
}
