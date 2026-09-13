export interface HotelGuest {
  id: string
  name: string
  emoji: string
  title: string
  lines: [string, string, string]
  townLines: [string, string, string]
  playLines: [string, string]
  buildLines: [string, string]
}

export const HOTEL_ROOM_COUNT = 2
export const TOWN_RESIDENT_MAX = 2
export const HOUSE_BUILD_MS = 5 * 60 * 1000

export const HOTEL_GUESTS: HotelGuest[] = [
  { id: 'momo', name: '桃桃', emoji: '🍑', title: '南邊來的旅人', lines: ['這間客房好香，像剛烤的麵包。', '我想在窗邊擺一盆花。', '若你願意，我也可以在小鎮住下來。'], townLines: ['新家的屋頂還沒乾透。', '晚上我想請你來喝茶。', '謝謝你讓我留下。'], playLines: ['我們沿著土路走一圈吧！', '你跑比較快，我跟在後面。'], buildLines: ['工地有點吵，不過我很期待。', '再一下下，房子就好了。'] },
  { id: 'yuzu', name: '柚子', emoji: '🍋', title: '賣香囊的行商', lines: ['客房裡可以掛香囊嗎？', '我喜歡把房間弄得暖暖的。', '跟我說一聲，我就搬進小鎮。'], townLines: ['門口要曬柚皮。', '鄰居好，香囊也好賣。', '這鎮的路，我已經畫進心裡。'], playLines: ['來，跟著柚香走。', '別走太快，香囊會晃。'], buildLines: ['木料味道像新柚。', '蓋好了我請你喝柚子茶。'] },
  { id: 'lychee', name: '荔荔', emoji: '🍒', title: '找姐姐的孩子', lines: ['這張床好高，我要墊腳。', '房間可以放姐姐的畫嗎？', '我想住在小鎮，就近找她。'], townLines: ['姐姐如果經過，會看到煙囪。', '新家好亮。', '你常來找我玩喔。'], playLines: ['捉迷藏！你先數到十。', '我跑去棚子後面。'], buildLines: ['釘子聲音好響。', '房子好了，姐姐就找得到我。'] },
  { id: 'melon', name: '瓜瓜', emoji: '🍈', title: '過路的樂手', lines: ['客房迴音不錯，可以練琴。', '我想在牆邊放一把空心瓜琴。', '留下也行，小鎮需要音樂。'], townLines: ['門廊就是舞台。', '晚上我彈琴給路燈聽。', '你想聽哪一首？'], playLines: ['跟著節拍走路。', '左腳一下，右腳一下。'], buildLines: ['工地也能打拍子。', '屋頂一蓋好我就開場。'] },
  { id: 'kiwi', name: '奇奇', emoji: '🥝', title: '地圖學徒', lines: ['我把客房也畫進地圖了。', '桌子上可以攤開紙。', '讓我留下來，我幫小鎮畫一張完整的圖。'], townLines: ['新家就是地圖的原點。', '路又彎了一點。', '明天我想測雨棚到商店的步數。'], playLines: ['我們去量那條土路。', '你當標竿，我來走。'], buildLines: ['地基的方位我對過了。', '五分鐘很短，對蓋房子來說。'] },
  { id: 'plum', name: '梅梅', emoji: '🟣', title: '採藥人', lines: ['客房陰涼，藥草不會乾。', '窗臺適合放罐子。', '小鎮的土不錯，我想住下來種。'], townLines: ['屋後可以種梅。', '肚子疼就來找我。', '新家有藥香。'], playLines: ['我們去田邊走走，別踩苗。', '深呼吸，梅香來了。'], buildLines: ['木屑能當藥引，可惜太新。', '蓋好了我煮梅子水。'] },
  { id: 'coco', name: '椰椰', emoji: '🥥', title: '海邊來的郵差', lines: ['客房可以當臨時郵局。', '信就放在門口小桌。', '說一聲，我就把信箱搬進小鎮。'], townLines: ['新家就是這鎮的第二個郵局。', '信送到門口就好。', '早船改成早路了。'], playLines: ['賽跑送信！你當收件人。', '我跑前面，你追。'], buildLines: ['釘子聲像碼頭。', '房子一好，信箱就釘上。'] },
  { id: 'berry', name: '莓莓', emoji: '🍓', title: '害羞的畫家', lines: ['窗光剛好畫畫。', '房間不要太亂，我容易緊張。', '若你點頭，我就在小鎮住下，慢慢畫。'], townLines: ['新家的牆還是白的，正好畫。', '別突然開門，我會嚇到。', '你願意當模特兒嗎？'], playLines: ['我們慢慢走，我要看顏色。', '停一下，雲的顏色變了。'], buildLines: ['工地線條很亂，但很有力。', '蓋好了請你來看第一幅。'] },
  { id: 'fig', name: '無花', emoji: '🪴', title: '沉默的園丁', lines: ['……這間房能放土就好。', '種子要藏在暗處。', '……讓我留下的話，點一下就行。'], townLines: ['屋邊那塊土，我認了。', '……謝謝。', '花會自己開。'], playLines: ['……走吧。', '別踩那棵小苗。'], buildLines: ['……木也是樹。', '等。'] },
  { id: 'persimmon', name: '柿柿', emoji: '🧡', title: '退休的船長', lines: ['客房穩，不像船。', '我想掛一張舊海圖。', '風停了，我也想把錨下在這鎮。'], townLines: ['新家沒有浪，只有土路。', '煙囪像小桅杆。', '你若無聊，我講航海。'], playLines: ['我們繞鎮一圈，當巡航。', '左舷是商店，右舷是棚子。'], buildLines: ['骨架先立，像造船。', '五分鐘，比我年輕時快多了。'] },
  { id: 'olive', name: '橄欖', emoji: '🫒', title: '記帳的先生', lines: ['客房的帳要分開記。', '家具買了就入冊。', '小鎮名額只有兩個，我懂。讓我留下的話，請登記。'], townLines: ['新家的門牌我寫好了。', '離開也可以再來，帳上留空位。', '你來，我就泡茶。'], playLines: ['散步也要算步數嗎？……算了，走吧。', '別跑，帳會記亂。'], buildLines: ['工時大約五分鐘，我計過。', '竣工後再結一次帳。'] },
  { id: 'sakura', name: '櫻櫻', emoji: '🌸', title: '迷路的老師', lines: ['客房很安靜，可以備課。', '我想在桌邊放一瓶花。', '學生若問起，我就說老師住在這小鎮。'], townLines: ['新家就是教室門口。', '花開了記得來看。', '迷路也不怕，家就在這裡。'], playLines: ['我們當散步課。', '看到花就停下來數花瓣。'], buildLines: ['蓋房子也是一課。', '完工那天，我請大家吃點心。'] },
]

export function guestById(id: string): HotelGuest | null {
  return HOTEL_GUESTS.find((g) => g.id === id) ?? null
}

export function busyGuestIds(hotelIds: readonly string[], townIds: readonly string[]): Set<string> {
  return new Set([...hotelIds, ...townIds])
}

export function inviteCandidates(hotelIds: readonly string[], townIds: readonly string[]): HotelGuest[] {
  const busy = busyGuestIds(hotelIds, townIds)
  return HOTEL_GUESTS.filter((g) => !busy.has(g.id))
}

export function houseProgress(buildStart: number, now = Date.now()): number {
  return Math.min(1, Math.max(0, (now - buildStart) / HOUSE_BUILD_MS))
}

export function houseReady(buildStart: number, now = Date.now()): boolean {
  return houseProgress(buildStart, now) >= 1
}

export function houseRemainLabel(buildStart: number, now = Date.now()): string {
  const ms = Math.max(0, HOUSE_BUILD_MS - (now - buildStart))
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (m <= 0 && s <= 0) return '就快好了'
  if (m <= 0) return `還有 ${s} 秒`
  return `大約還有 ${m} 分 ${s.toString().padStart(2, '0')} 秒`
}
