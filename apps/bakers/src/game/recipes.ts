import type { ImageKey } from './images'

export type DishCategory = 'cookie' | 'cake' | 'bread' | 'tart' | 'snack'

export interface Dish {
  id: string
  name: string
  enName: string
  image: ImageKey
  required: string[]
  category: DishCategory
  keywords: string[]
  note?: string
}

export const categoryLabel: Record<DishCategory | 'all', string> = {
  all: '全部',
  cookie: '餅乾',
  cake: '蛋糕',
  bread: '麵包',
  tart: '派與塔',
  snack: '小點',
}

export const dishes: Dish[] = [
  {
    id: 'oatmeal_cookie',
    name: '燕麥餅乾',
    enName: 'Oatmeal Cookies',
    image: 'oatmeal_cookie',
    required: ['flour', 'oats', 'butter', 'sugar', 'raisin'],
    category: 'cookie',
    keywords: ['燕麥餅乾', 'oatmeal'],
  },
  {
    id: 'almond_cookie',
    name: '杏仁餅',
    enName: 'Almond Cookies',
    image: 'almond_cookie',
    required: ['flour', 'almond', 'sugar', 'butter'],
    category: 'cookie',
    keywords: ['杏仁餅', 'almond cookie'],
  },
  {
    id: 'cookies',
    name: '香酥餅乾',
    enName: 'Cookies',
    image: 'cookies',
    required: ['flour', 'sugar', 'butter', 'baking_soda'],
    category: 'cookie',
    keywords: ['餅乾', 'cookie'],
  },
  {
    id: 'chocolate_cookies',
    name: '巧克力餅乾',
    enName: 'Chocolate Cookies',
    image: 'cookies',
    required: ['flour', 'sugar', 'butter', 'baking_soda', 'chocolate'],
    category: 'cookie',
    keywords: ['巧克力餅乾', 'chocolate cookie'],
  },
  {
    id: 'brownie',
    name: '布朗尼',
    enName: 'Brownie',
    image: 'brownie',
    required: ['flour', 'butter', 'sugar', 'eggs', 'cocoa'],
    category: 'cookie',
    keywords: ['布朗尼', 'brownie'],
  },
  {
    id: 'cupcake',
    name: '杯子蛋糕',
    enName: 'Cupcake',
    image: 'cupcake',
    required: ['flour', 'sugar', 'eggs', 'butter', 'baking_powder'],
    category: 'cake',
    keywords: ['杯子蛋糕', 'cupcake'],
  },
  {
    id: 'lemon_cake',
    name: '檸檬蛋糕',
    enName: 'Lemon Cake',
    image: 'lemon_cake',
    required: ['flour', 'sugar', 'eggs', 'butter', 'lemon'],
    category: 'cake',
    keywords: ['檸檬蛋糕', 'lemon cake'],
  },
  {
    id: 'coconut_cake',
    name: '椰子蛋糕',
    enName: 'Coconut Cake',
    image: 'coconut_cake',
    required: ['flour', 'coconut', 'sugar', 'eggs', 'butter'],
    category: 'cake',
    keywords: ['椰子蛋糕', 'coconut cake'],
  },
  {
    id: 'apple_cake',
    name: '蘋果蛋糕',
    enName: 'Apple Cake',
    image: 'apple_cake',
    required: ['flour', 'sugar', 'eggs', 'apple', 'baking_powder'],
    category: 'cake',
    keywords: ['蘋果蛋糕', 'apple cake'],
  },
  {
    id: 'chocolate_cake',
    name: '巧克力蛋糕',
    enName: 'Chocolate Cake',
    image: 'cake',
    required: ['flour', 'sugar', 'eggs', 'milk', 'cocoa'],
    category: 'cake',
    keywords: ['巧克力蛋糕', 'chocolate cake'],
    note: '可可粉要幫摩根船長修船才有。',
  },
  {
    id: 'cake',
    name: '綿密蛋糕',
    enName: 'Cake',
    image: 'cake',
    required: ['flour', 'sugar', 'eggs', 'milk', 'baking_powder'],
    category: 'cake',
    keywords: ['蛋糕', 'cake'],
  },
  {
    id: 'vanilla_cake',
    name: '香草蛋糕',
    enName: 'Vanilla Cake',
    image: 'cake',
    required: ['flour', 'sugar', 'butter', 'eggs', 'vanilla'],
    category: 'cake',
    keywords: ['香草蛋糕', 'vanilla cake'],
    note: '香草精要幫露娜船長修船才有。',
  },
  {
    id: 'banana_bread',
    name: '香蕉麵包',
    enName: 'Banana Bread',
    image: 'banana_bread',
    required: ['flour', 'banana', 'sugar', 'eggs', 'butter'],
    category: 'bread',
    keywords: ['香蕉麵包', 'banana bread'],
  },
  {
    id: 'pineapple_bun',
    name: '菠蘿包',
    enName: 'Pineapple Bun',
    image: 'pineapple_bun',
    required: ['flour', 'butter', 'sugar', 'eggs', 'yeast'],
    category: 'bread',
    keywords: ['菠蘿包', 'pineapple bun', '菠蘿'],
    note: '菠蘿包裡沒有菠蘿，酥皮烤過以後像菠蘿的紋路。',
  },
  {
    id: 'scone',
    name: '司康',
    enName: 'Scone',
    image: 'scone',
    required: ['flour', 'butter', 'sugar', 'milk', 'baking_powder'],
    category: 'bread',
    keywords: ['司康', 'scone'],
  },
  {
    id: 'bread',
    name: '軟質麵包',
    enName: 'Bread',
    image: 'bread',
    required: ['flour', 'yeast', 'butter', 'milk', 'salt'],
    category: 'bread',
    keywords: ['麵包', 'bread'],
  },
  {
    id: 'egg_tart',
    name: '蛋塔',
    enName: 'Egg Tart',
    image: 'egg_tart',
    required: ['flour', 'butter', 'sugar', 'eggs', 'cream'],
    category: 'tart',
    keywords: ['蛋塔', 'egg tart'],
  },
  {
    id: 'pie',
    name: '蘋果派',
    enName: 'Apple Pie',
    image: 'pie',
    required: ['flour', 'butter', 'sugar', 'apple', 'cinnamon'],
    category: 'tart',
    keywords: ['蘋果派', 'apple pie', '肉桂派', '派', 'pie'],
    note: '肉桂粉要幫傑克船長修船才有。',
  },
  {
    id: 'cheese_tart',
    name: '乳酪塔',
    enName: 'Cheese Tart',
    image: 'cheese_tart',
    required: ['flour', 'butter', 'sugar', 'eggs', 'cream_cheese'],
    category: 'tart',
    keywords: ['起司塔', '乳酪塔', 'cheese tart'],
  },
  {
    id: 'strawberry_tart',
    name: '草莓塔',
    enName: 'Strawberry Tart',
    image: 'strawberry_tart',
    required: ['flour', 'butter', 'sugar', 'eggs', 'strawberry'],
    category: 'tart',
    keywords: ['草莓塔', 'strawberry tart'],
  },
  {
    id: 'cinnamon_roll',
    name: '肉桂捲',
    enName: 'Cinnamon Roll',
    image: 'cinnamon_roll',
    required: ['flour', 'butter', 'sugar', 'cinnamon', 'milk'],
    category: 'snack',
    keywords: ['肉桂捲', 'cinnamon roll'],
  },
  {
    id: 'cream_puff',
    name: '奶油泡芙',
    enName: 'Cream Puff',
    image: 'cream_puff',
    required: ['flour', 'butter', 'eggs', 'cream', 'sugar'],
    category: 'snack',
    keywords: ['泡芙', 'cream puff'],
  },
  {
    id: 'swiss_roll',
    name: '草莓瑞士捲',
    enName: 'Swiss Roll',
    image: 'swiss_roll',
    required: ['flour', 'sugar', 'eggs', 'strawberry', 'cream'],
    category: 'snack',
    keywords: ['草莓瑞士捲', '瑞士捲', 'swiss'],
  },
  {
    id: 'donut',
    name: '甜甜圈',
    enName: 'Donut',
    image: 'donut',
    required: ['flour', 'sugar', 'eggs', 'butter', 'milk'],
    category: 'snack',
    keywords: ['甜甜圈', 'donut', 'doughnut'],
  },
  {
    id: 'pumpkin_muffin',
    name: '南瓜瑪芬',
    enName: 'Pumpkin Muffin',
    image: 'pumpkin_muffin',
    required: ['flour', 'pumpkin', 'sugar', 'eggs', 'baking_powder'],
    category: 'snack',
    keywords: ['南瓜瑪芬', 'pumpkin muffin'],
  },
  {
    id: 'blueberry_muffin',
    name: '藍莓瑪芬',
    enName: 'Blueberry Muffin',
    image: 'blueberry_muffin',
    required: ['flour', 'sugar', 'eggs', 'blueberry', 'baking_powder'],
    category: 'snack',
    keywords: ['藍莓瑪芬', 'blueberry muffin', '瑪芬', 'muffin'],
  },
  {
    id: 'pancake',
    name: '蜂蜜鬆餅',
    enName: 'Honey Pancake',
    image: 'pancake',
    required: ['flour', 'milk', 'eggs', 'honey', 'baking_powder'],
    category: 'snack',
    keywords: ['蜂蜜鬆餅', '蜂蜜蛋糕', '鬆餅', 'pancake'],
    note: '百花蜜要幫蔻拉船長修船才有。',
  },
  {
    id: 'croissant',
    name: '可頌',
    enName: 'Croissant',
    image: 'croissant',
    required: ['flour', 'butter', 'sugar', 'yeast', 'milk'],
    category: 'bread',
    keywords: ['可頌', 'croissant', '牛角包'],
    note: '可頌要摺很多層奶油，烤出來才會一層一層的。',
  },
  {
    id: 'madeleine',
    name: '瑪德蓮',
    enName: 'Madeleine',
    image: 'madeleine',
    required: ['flour', 'butter', 'sugar', 'eggs', 'lemon'],
    category: 'cake',
    keywords: ['瑪德蓮', 'madeleine'],
    note: '貝殼形的小蛋糕，檸檬讓它聞起來亮一點。',
  },
  {
    id: 'raisin_bread',
    name: '葡萄乾麵包',
    enName: 'Raisin Bread',
    image: 'raisin_bread',
    required: ['flour', 'raisin', 'sugar', 'yeast', 'butter'],
    category: 'bread',
    keywords: ['葡萄乾麵包', 'raisin bread'],
  },
  {
    id: 'lemon_tart',
    name: '檸檬塔',
    enName: 'Lemon Tart',
    image: 'lemon_tart',
    required: ['flour', 'butter', 'sugar', 'eggs', 'lemon'],
    category: 'tart',
    keywords: ['檸檬塔', 'lemon tart'],
  },
  {
    id: 'chocolate_muffin',
    name: '巧克力瑪芬',
    enName: 'Chocolate Muffin',
    image: 'chocolate_muffin',
    required: ['flour', 'sugar', 'eggs', 'chocolate', 'baking_powder'],
    category: 'snack',
    keywords: ['巧克力瑪芬', 'chocolate muffin'],
  },
  {
    id: 'banana_muffin',
    name: '香蕉瑪芬',
    enName: 'Banana Muffin',
    image: 'banana_muffin',
    required: ['flour', 'banana', 'sugar', 'eggs', 'baking_powder'],
    category: 'snack',
    keywords: ['香蕉瑪芬', 'banana muffin'],
  },
  {
    id: 'pastry',
    name: '奶油酥',
    enName: 'Pastry',
    image: 'pastry',
    required: ['flour', 'sugar', 'butter', 'eggs'],
    category: 'snack',
    keywords: ['奶油酥', '酥皮', 'pastry'],
  },
]

const pastry = dishes.find((dish) => dish.id === 'pastry')!

export interface DishMatch {
  id: string
  enName: string
  image: ImageKey
  required: string[]
  note?: string
  hit: boolean
}

function pack(dish: Dish, hit: boolean): DishMatch {
  return {
    id: dish.id,
    enName: dish.enName,
    image: dish.image,
    required: [...dish.required],
    note: dish.note,
    hit,
  }
}

export function matchDish(raw: string): DishMatch {
  const text = raw.trim().toLowerCase()
  const hits = dishes.flatMap((dish) =>
    dish.keywords
      .map((keyword) => keyword.toLowerCase())
      .filter((keyword) => keyword.length > 0 && text.includes(keyword))
      .map((keyword) => ({ dish, keyword })),
  )
  if (!hits.length) return pack(pastry, false)
  hits.sort((a, b) => b.keyword.length - a.keyword.length || Number(text.endsWith(b.keyword)) - Number(text.endsWith(a.keyword)))
  const top = hits.filter((hit) => hit.keyword.length === hits[0].keyword.length)
  const named = top.find((hit) => text.includes(hit.dish.name.toLowerCase()))
  const ending = top.find((hit) => text.endsWith(hit.keyword))
  return pack((named ?? ending ?? top[0]).dish, true)
}

export function shopOnly(required: string[], exclusive: Set<string>) {
  return required.every((id) => !exclusive.has(id))
}

const guestIds = ['brother', 'jack', 'morgan', 'coral', 'luna', 'neighbor'] as const
export type GuestId = (typeof guestIds)[number]

export function guestName(guest: GuestId) {
  if (guest === 'brother') return '弟弟'
  if (guest === 'jack') return '傑克船長'
  if (guest === 'morgan') return '摩根船長'
  if (guest === 'coral') return '蔻拉船長'
  if (guest === 'luna') return '露娜船長'
  return '鄰居'
}

export function guestLine(guest: GuestId, dishName: string) {
  if (guest === 'brother') return `弟弟抱著盤子說，想吃一份${dishName}。`
  if (guest === 'jack') return `傑克船長出海前，想帶一份${dishName}。`
  if (guest === 'morgan') return `摩根船長說，長途航行要帶一份${dishName}。`
  if (guest === 'coral') return `蔻拉船長想給船上的人帶一份${dishName}。`
  if (guest === 'luna') return `露娜船長夜航前，想帶一份${dishName}。`
  return `沙灣鎮的鄰居聞到香味，想來買一份${dishName}。`
}

export function guestImage(guest: GuestId): ImageKey {
  if (guest === 'brother') return 'brother'
  if (guest === 'jack') return 'jack'
  if (guest === 'morgan') return 'morgan'
  if (guest === 'coral') return 'coral'
  if (guest === 'luna') return 'luna'
  return 'basket'
}

export function nextOrder(discovered: readonly string[], previousId: string, exclusive: Set<string>) {
  const fresh = dishes.filter((dish) => !discovered.includes(dish.id) && dish.id !== previousId)
  const easy = fresh.filter((dish) => shopOnly(dish.required, exclusive))
  const pool = (easy.length ? easy : fresh.length ? fresh : dishes.filter((dish) => dish.id !== previousId))
  const dish = pool[Math.floor(Math.random() * pool.length)] ?? dishes[0]
  const guestPool = discovered.length < 2 ? (['brother', 'neighbor'] as GuestId[]) : [...guestIds]
  const guest = guestPool[Math.floor(Math.random() * guestPool.length)]
  return { recipeId: dish.id, guestId: guest }
}

export function orderBonus(price: number) {
  return 16 + Math.round(price * 0.2)
}
