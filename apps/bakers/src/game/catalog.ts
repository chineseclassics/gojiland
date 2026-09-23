import type { Captain, Ingredient, Tool } from './types'

export const ingredients: Record<string, Ingredient> = {
  flour: { id: 'flour', name: '麵粉', enName: 'Flour', price: 12, image: 'flour', tip: '麵粉把點心的形狀撐起來。', exclusive: false },
  sugar: { id: 'sugar', name: '糖', enName: 'Sugar', price: 8, image: 'sugar', tip: '糖帶來甜味，也會讓表面上色。', exclusive: false },
  salt: { id: 'salt', name: '鹽', enName: 'Salt', price: 5, image: 'salt', tip: '一點點鹽，會讓甜味更清楚。', exclusive: false },
  baking_powder: { id: 'baking_powder', name: '泡打粉', enName: 'Baking Powder', price: 12, image: 'baking_powder', tip: '泡打粉讓蛋糕烤的時候膨脹。', exclusive: false },
  baking_soda: { id: 'baking_soda', name: '小蘇打', enName: 'Baking Soda', price: 10, image: 'baking_soda', tip: '小蘇打讓餅乾更酥。', exclusive: false },
  yeast: { id: 'yeast', name: '酵母', enName: 'Yeast', price: 14, image: 'yeast', tip: '酵母讓麵團發酵、變得鬆軟。', exclusive: false },
  butter: { id: 'butter', name: '奶油', enName: 'Butter', price: 18, image: 'butter', tip: '奶油帶來香氣，也讓口感更酥。', exclusive: false },
  eggs: { id: 'eggs', name: '雞蛋', enName: 'Eggs', price: 10, image: 'eggs', tip: '雞蛋把材料黏在一起。', exclusive: false },
  milk: { id: 'milk', name: '牛奶', enName: 'Milk', price: 12, image: 'milk', tip: '牛奶讓麵糊更滑。', exclusive: false },
  chocolate: { id: 'chocolate', name: '巧克力豆', enName: 'Chocolate Chips', price: 22, image: 'chocolate', tip: '巧克力豆會在餅乾裡融化。', exclusive: false },
  cream_cheese: { id: 'cream_cheese', name: '奶油乳酪', enName: 'Cream Cheese', price: 22, image: 'cream_cheese', tip: '奶油乳酪做塔的內餡很合適。', exclusive: false },
  strawberry: { id: 'strawberry', name: '草莓', enName: 'Strawberry', price: 16, image: 'strawberry', tip: '草莓適合鋪在塔上面。', exclusive: false },
  apple: { id: 'apple', name: '蘋果', enName: 'Apple', price: 14, image: 'apple', tip: '蘋果可以做派，也可以做蛋糕。', exclusive: false },
  oats: { id: 'oats', name: '燕麥', enName: 'Oats', price: 10, image: 'oats', tip: '燕麥讓餅乾更有嚼勁。', exclusive: false },
  lemon: { id: 'lemon', name: '檸檬', enName: 'Lemon', price: 14, image: 'lemon', tip: '檸檬帶來清爽的酸味。', exclusive: false },
  blueberry: { id: 'blueberry', name: '藍莓', enName: 'Blueberry', price: 18, image: 'blueberry', tip: '藍莓放進瑪芬裡會微微爆開。', exclusive: false },
  banana: { id: 'banana', name: '香蕉', enName: 'Banana', price: 12, image: 'banana', tip: '熟香蕉會讓麵包又濕又香。', exclusive: false },
  almond: { id: 'almond', name: '杏仁', enName: 'Almond', price: 16, image: 'almond', tip: '杏仁烤過以後更香。', exclusive: false },
  coconut: { id: 'coconut', name: '椰子', enName: 'Coconut', price: 14, image: 'coconut', tip: '椰子絲帶來海邊的甜香。', exclusive: false },
  raisin: { id: 'raisin', name: '葡萄乾', enName: 'Raisin', price: 12, image: 'raisin', tip: '葡萄乾藏在餅乾裡，咬到會甜一下。', exclusive: false },
  pumpkin: { id: 'pumpkin', name: '南瓜', enName: 'Pumpkin', price: 14, image: 'pumpkin', tip: '南瓜泥讓瑪芬顏色變暖。', exclusive: false },
  cream: { id: 'cream', name: '鮮奶油', enName: 'Cream', price: 18, image: 'cream', tip: '鮮奶油做蛋塔和泡芙的內餡。', exclusive: false },
  cinnamon: { id: 'cinnamon', name: '肉桂粉', enName: 'Cinnamon', price: 0, image: 'cinnamon', tip: '肉桂是蘋果派的香氣。商店不賣，要找傑克船長。', exclusive: true },
  cocoa: { id: 'cocoa', name: '可可粉', enName: 'Cocoa', price: 0, image: 'cocoa', tip: '可可粉是布朗尼的深色來源。商店不賣，要找摩根船長。', exclusive: true },
  honey: { id: 'honey', name: '百花蜜', enName: 'Honey', price: 0, image: 'honey', tip: '百花蜜比糖更有花香。商店不賣，要找蔻拉船長。', exclusive: true },
  vanilla: { id: 'vanilla', name: '香草精', enName: 'Vanilla', price: 0, image: 'vanilla', tip: '香草精讓蛋味變柔和。商店不賣，要找露娜船長。', exclusive: true },
}

export const tools: Record<string, Tool> = {
  wood_plank: { id: 'wood_plank', name: '木板', enName: 'Wood Plank', price: 28, image: 'wood_plank', tip: '用來補船身上的裂口。' },
  hammer_nails: { id: 'hammer_nails', name: '鐵鎚與釘子', enName: 'Hammer and Nails', price: 24, image: 'hammer_nails', tip: '把木板釘穩。' },
  tape: { id: 'tape', name: '防水膠帶', enName: 'Waterproof Tape', price: 18, image: 'tape', tip: '封住縫，不讓海水滲進去。' },
  lubricant: { id: 'lubricant', name: '潤滑油', enName: 'Lubricant', price: 22, image: 'lubricant', tip: '讓卡住的船舵轉得動。' },
  screwdriver: { id: 'screwdriver', name: '螺絲起子', enName: 'Screwdriver', price: 20, image: 'screwdriver', tip: '鎖緊船上的零件。' },
  sewing_kit: { id: 'sewing_kit', name: '針線包', enName: 'Sewing Kit', price: 16, image: 'sewing_kit', tip: '把破掉的帆縫起來。' },
  canvas_fabric: { id: 'canvas_fabric', name: '帆布', enName: 'Canvas', price: 26, image: 'canvas_fabric', tip: '替換被風吹破的帆。' },
  rope: { id: 'rope', name: '麻繩', enName: 'Rope', price: 18, image: 'rope', tip: '綁住鬆掉的船舷。' },
  varnish: { id: 'varnish', name: '亮光漆', enName: 'Varnish', price: 22, image: 'varnish', tip: '讓木色重新亮起來，也防水。' },
}

export const captains: Captain[] = [
  {
    id: 'jack',
    name: '傑克船長',
    image: 'jack',
    plea: '船身裂了一道口，出不了海。木板、鐵鎚釘子和防水膠帶齊了，我就能補上。補好送你商店沒有的肉桂粉。',
    tools: ['wood_plank', 'hammer_nails', 'tape'],
    rewardGold: 35,
    rewardItem: 'cinnamon',
    rewardCount: 2,
  },
  {
    id: 'morgan',
    name: '摩根船長',
    image: 'morgan',
    plea: '我在沙灣鎮跑船最久。這回船舵卡住了，潤滑油和螺絲起子能讓它重新轉動。謝禮是商店買不到的可可粉。',
    tools: ['lubricant', 'screwdriver'],
    rewardGold: 40,
    rewardItem: 'cocoa',
    rewardCount: 2,
  },
  {
    id: 'coral',
    name: '蔻拉船長',
    image: 'coral',
    plea: '風把帆吹破了。針線包和一塊新帆布就夠。我身上有商店沒有的百花蜜。',
    tools: ['sewing_kit', 'canvas_fabric'],
    rewardGold: 40,
    rewardItem: 'honey',
    rewardCount: 2,
  },
  {
    id: 'luna',
    name: '露娜船長',
    image: 'luna',
    plea: '船舷的木頭斑駁了。麻繩和亮光漆可以收拾。我留了一小瓶香草精，商店裡沒有。',
    tools: ['rope', 'varnish'],
    rewardGold: 45,
    rewardItem: 'vanilla',
    rewardCount: 2,
  },
]

export const ingredientList = Object.values(ingredients).filter((item) => !item.exclusive)
export const toolList = Object.values(tools)

export function toolOwners(toolId: string) {
  return captains.filter((captain) => captain.tools.includes(toolId)).map((captain) => captain.name)
}
