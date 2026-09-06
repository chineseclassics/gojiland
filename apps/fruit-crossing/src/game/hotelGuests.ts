export interface HotelGuest {
  id: string
  name: string
  emoji: string
  title: string
  lines: [string, string, string]
}

export const HOTEL_GUESTS: HotelGuest[] = [
  { id: 'momo', name: '桃桃', emoji: '🍑', title: '南邊來的旅人', lines: ['這間旅館聞起來像剛烤的麵包。', '我只住今晚，明天就往山裡走。', '謝謝你留一盞燈給我。'] },
  { id: 'yuzu', name: '柚子', emoji: '🍋', title: '賣香囊的行商', lines: ['我沿路採柚皮，做成香囊。', '老闆說稀有種子很貴，我買不起。', '下次若還能見面……大概不會了。'] },
  { id: 'lychee', name: '荔荔', emoji: '🍒', title: '找姐姐的孩子', lines: ['姐姐說在果園工作，我還沒找到她。', '你的小屋很暖，我好想家。', '我把住址寫在櫃檯了，請別丟。'] },
  { id: 'melon', name: '瓜瓜', emoji: '🍈', title: '過路的樂手', lines: ['我用空心瓜殼做琴。', '今晚想在門廊彈一首就走。', '音樂留下，人不必留下。'] },
  { id: 'kiwi', name: '奇奇', emoji: '🥝', title: '地圖學徒', lines: ['我在畫這座小鎮的路。', '旅館旁邊那條土路彎得正好。', '地圖畫完，我就去下一鎮。'] },
  { id: 'plum', name: '梅梅', emoji: '🟣', title: '採藥人', lines: ['雨棚底下的土很潮，藥草喜歡。', '我不會久留，草乾了就走。', '若你肚子疼，煮梅子水就好。'] },
  { id: 'coco', name: '椰椰', emoji: '🥥', title: '海邊來的郵差', lines: ['信只送到這一晚。', '有一封是給水果商店老闆的。', '我啊，信送完就搭早船。'] },
  { id: 'berry', name: '莓莓', emoji: '🍓', title: '害羞的畫家', lines: ['我想畫你家屋頂的煙。', '閃卡的箔光太亮，我畫不出來。', '畫完這張速寫，我就不來了。'] },
  { id: 'fig', name: '無花', emoji: '🪴', title: '沉默的園丁', lines: ['……種子要藏在暗處。', '普通種子不要賣，會把品種弄亂。', '我只來這一夜，土會記得我。'] },
  { id: 'persimmon', name: '柿柿', emoji: '🧡', title: '退休的船長', lines: ['風停了，船也該停。', '我年輕時也換過一張閃卡。', '今晚借你們的床，明早出海。'] },
  { id: 'olive', name: '橄欖', emoji: '🫒', title: '記帳的先生', lines: ['旅館的帳要記清楚。', '有人來過一次，就從名單劃掉。', '我自己，也只來這一筆。'] },
  { id: 'sakura', name: '櫻櫻', emoji: '🌸', title: '迷路的老師', lines: ['我帶學生來看果樹，自己先迷路了。', '謝謝你讓我坐一下。', '花謝了我就回城，不會再來。'] },
]

export function guestById(id: string): HotelGuest | null {
  return HOTEL_GUESTS.find((g) => g.id === id) ?? null
}

export function remainingGuests(visited: readonly string[]): HotelGuest[] {
  const seen = new Set(visited)
  return HOTEL_GUESTS.filter((g) => !seen.has(g.id))
}
