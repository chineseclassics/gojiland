import type { ImageKey } from './images'

export interface DishMatch {
  enName: string
  image: ImageKey
  required: string[]
}

function has(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

export function matchDish(raw: string): DishMatch {
  const text = raw.toLowerCase()

  if (has(text, ['派', 'pie', '蘋果', '肉桂', 'cinnamon', 'apple'])) {
    return {
      enName: 'Apple Pie',
      image: 'pie',
      required: ['flour', 'butter', 'sugar', 'eggs', 'cinnamon'],
    }
  }
  if (has(text, ['餅乾', 'cookie'])) {
    const required = ['flour', 'sugar', 'butter', 'baking_soda']
    if (has(text, ['巧克力', 'chocolate'])) required.push('chocolate')
    return { enName: 'Cookies', image: 'cookies', required }
  }
  if (has(text, ['布朗尼', 'brownie', '可可', 'cocoa', '巧克力', 'chocolate'])) {
    return {
      enName: 'Brownie',
      image: 'brownie',
      required: ['flour', 'butter', 'sugar', 'eggs', 'cocoa'],
    }
  }
  if (has(text, ['蜂蜜', 'honey', '鬆餅', 'pancake'])) {
    return {
      enName: 'Honey Pancake',
      image: 'pancake',
      required: ['flour', 'milk', 'eggs', 'honey', 'baking_powder'],
    }
  }
  if (has(text, ['香草', 'vanilla'])) {
    return {
      enName: 'Vanilla Cake',
      image: 'cake',
      required: ['flour', 'sugar', 'butter', 'eggs', 'vanilla'],
    }
  }
  if (has(text, ['麵包', 'bread', '可頌'])) {
    return {
      enName: 'Bread',
      image: 'bread',
      required: ['flour', 'yeast', 'butter', 'milk', 'salt'],
    }
  }
  if (has(text, ['起司', '乳酪', 'cheese'])) {
    return {
      enName: 'Cheese Tart',
      image: 'cheese_tart',
      required: ['flour', 'butter', 'sugar', 'eggs', 'cream_cheese'],
    }
  }
  if (has(text, ['草莓', 'strawberry'])) {
    return {
      enName: 'Strawberry Tart',
      image: 'strawberry_tart',
      required: ['flour', 'butter', 'sugar', 'eggs', 'strawberry'],
    }
  }
  if (has(text, ['蛋糕', 'cake'])) {
    return {
      enName: 'Cake',
      image: 'cake',
      required: ['flour', 'sugar', 'eggs', 'milk', 'baking_powder'],
    }
  }
  return {
    enName: 'Pastry',
    image: 'pastry',
    required: ['flour', 'sugar', 'butter', 'eggs'],
  }
}
