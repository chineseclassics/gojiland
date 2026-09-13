import type { Lang, Prompt } from '../types'

function zh(display: string, input: string): Prompt {
  return { display, input, hint: input }
}

function en(word: string): Prompt {
  return { display: word, input: word, hint: word }
}

export const banks = {
  keys: {
    en: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'f', 'j', 'a'].map(en),
    zh: [zh('啊', 'a'), zh('哦', 'o'), zh('鵝', 'e'), zh('一', 'i'), zh('烏', 'u'), zh('阿', 'a'), zh('衣', 'i'), zh('屋', 'u')],
  },
  short: {
    en: ['as', 'ad', 'sad', 'dad', 'all', 'add', 'ask', 'lad', 'fall', 'jak'].map(en),
    zh: [zh('我', 'wo'), zh('你', 'ni'), zh('的', 'de'), zh('是', 'shi'), zh('了', 'le'), zh('不', 'bu'), zh('在', 'zai'), zh('有', 'you'), zh('人', 'ren'), zh('大', 'da')],
  },
  mid: {
    en: ['cat', 'dog', 'sun', 'go', 'up', 'run', 'jump', 'fish', 'swim', 'wave', 'boat', 'sand'].map(en),
    zh: [zh('跳', 'tiao'), zh('海', 'hai'), zh('魚', 'yu'), zh('水', 'shui'), zh('走', 'zou'), zh('看', 'kan'), zh('船', 'chuan'), zh('山', 'shan'), zh('天', 'tian'), zh('家', 'jia')],
  },
  far: {
    en: ['shark', 'coral', 'shell', 'ocean', 'pearl', 'whale'].map(en),
    zh: [zh('海洋', 'haiyang'), zh('朋友', 'pengyou'), zh('學校', 'xuexiao'), zh('同學', 'tongxue'), zh('老師', 'laoshi')],
  },
  fruit: {
    en: ['apple', 'pear', 'grape', 'peach', 'mango', 'berry', 'lemon', 'plum', 'kiwi', 'goji'].map(en),
    zh: [zh('蘋果', 'pingguo'), zh('香蕉', 'xiangjiao'), zh('西瓜', 'xigua'), zh('桃子', 'taozi'), zh('草莓', 'caomei'), zh('葡萄', 'putao'), zh('橘子', 'juzi'), zh('枸杞', 'gouqi')],
  },
  cook: {
    fish: {
      en: en('soup'),
      zh: zh('魚湯', 'yutang'),
    },
    fruit: {
      en: en('salad'),
      zh: zh('果盤', 'guopan'),
    },
    feast: {
      en: en('feast'),
      zh: zh('大餐', 'dacan'),
    },
  },
} as const

export function pickOne(list: Prompt[], avoid = ''): Prompt {
  const pool = list.filter((item) => item.input !== avoid)
  const source = pool.length ? pool : list
  return source[Math.floor(Math.random() * source.length)]
}

export function pickMany(list: Prompt[], count: number): Prompt[] {
  const out: Prompt[] = []
  const used = new Set<string>()
  let guard = 0
  while (out.length < count && guard < 80) {
    const item = list[Math.floor(Math.random() * list.length)]
    if (!used.has(item.input)) {
      used.add(item.input)
      out.push(item)
    }
    guard += 1
  }
  while (out.length < count) out.push(list[out.length % list.length])
  return out
}

export function bankFor(lang: Lang, name: keyof Omit<typeof banks, 'cook'>): Prompt[] {
  return [...banks[name][lang]]
}
