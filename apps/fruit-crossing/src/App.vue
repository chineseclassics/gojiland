<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide } from 'vue'
import GameCanvas from './components/GameCanvas.vue'
import GameHeader from './components/GameHeader.vue'
import GameHud from './components/GameHud.vue'
import GameToast from './components/GameToast.vue'
import CardInspectOverlay from './components/cards/CardInspectOverlay.vue'
import CustomizerModal from './components/modals/CustomizerModal.vue'
import HomeModal from './components/modals/HomeModal.vue'
import HotelModal from './components/modals/HotelModal.vue'
import PauseModal from './components/modals/PauseModal.vue'
import ShelterModal from './components/modals/ShelterModal.vue'
import ShopModal from './components/modals/ShopModal.vue'
import SummaryModal from './components/modals/SummaryModal.vue'
import SundayModal from './components/modals/SundayModal.vue'
import { fruitGameKey } from './game/key'
import { useFruitGame } from './game/useFruitGame'

const game = useFruitGame()
provide(fruitGameKey, game)

const s = game.raw
const sunday = game.sunday
const fruitStacks = game.fruitStacks
const cardAlbum = game.cardAlbum
const inspectHint = game.inspectHint
const hotelGuest = game.hotelGuest
const hotelCandidates = game.hotelCandidates

const shelterStatus = computed(() => {
  if (s.thunder) return '外面在打雷，出去可能被閃電打到。'
  if (s.raining) return '外面還在下雨，出去會淋濕，但水果不會壞。'
  return '雨停了，可以出去繼續玩。'
})

const leaveLabel = computed(() => {
  if (s.thunder) return '冒雨出去（可能被閃電打到）'
  if (s.raining) return '出去淋雨'
  return '離開小木棚'
})

function onKeyDown(e: KeyboardEvent) {
  const k = e.key.toLowerCase()
  if (k === 'arrowleft' || k === 'a') game.keys.left = true
  if (k === 'arrowright' || k === 'd') game.keys.right = true
  if (k === 'arrowup' || k === 'w') game.keys.up = true
  if (k === 'arrowdown' || k === 's') game.keys.down = true
  if (e.key === ' ' || k === 'e') {
    e.preventDefault()
    if (s.mode === 'TOWN') game.tryEnterPlace(s.nearPlace)
  }
  if (k === 'p') game.togglePause()
  if (e.key === 'Escape' && s.inspectOpen) game.closeInspect()
}

function onKeyUp(e: KeyboardEvent) {
  const k = e.key.toLowerCase()
  if (k === 'arrowleft' || k === 'a') game.keys.left = false
  if (k === 'arrowright' || k === 'd') game.keys.right = false
  if (k === 'arrowup' || k === 'w') game.keys.up = false
  if (k === 'arrowdown' || k === 's') game.keys.down = false
}

let weatherTimer = 0
onMounted(() => {
  void game.refreshWeather()
  weatherTimer = window.setInterval(() => {
    void game.refreshWeather()
  }, 10 * 60 * 1000)
  const unlock = () => game.unlockAudio()
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onUnmounted(() => {
  window.clearInterval(weatherTimer)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<template>
  <div class="shell">
    <GameHeader />
    <main class="stage">
      <GameCanvas />
    </main>
    <GameHud />
    <GameToast :message="s.toast" />
    <SundayModal :open="s.sundayOpen" @close="game.closeSunday" />
    <ShelterModal
      :open="s.shelterOpen"
      :count="s.backpack.length"
      :message="s.shelterEatMsg"
      :ok="s.shelterEatOk"
      :status="shelterStatus"
      :leave-label="leaveLabel"
      @eat="game.eatInShelter"
      @leave="game.leaveShelter"
    />
    <ShopModal
      :open="s.shopOpen"
      :money="s.money"
      :tab="s.shopTab"
      :seeds="game.shopSeeds"
      :decors="game.shopDecor"
      :backpack="s.backpack"
      :owned="s.furniture"
      :sunday="sunday"
      :dialog="s.mrDialog"
      :fruit-stacks="fruitStacks"
      @close="game.closeShop"
      @tab="game.switchShopTab"
      @buy-seed="game.buySeed"
      @buy-decor="game.buyDecor"
      @sell="game.sellItem"
      @talk="game.talkMrFruit"
      @exchange="game.exchangeFlashCard"
    />
    <HotelModal
      :open="s.hotelOpen"
      :guest="hotelGuest"
      :candidates="hotelCandidates"
      :dialog="s.guestDialog"
      @close="game.closeHotel"
      @invite="game.inviteGuest"
      @talk="game.talkHotelGuest"
    />
    <HomeModal
      :open="s.homeOpen"
      :furniture="s.furniture"
      :album="cardAlbum"
      @close="game.closeHome"
      @inspect="game.inspectOwnedCard"
    />
    <CardInspectOverlay
      :open="s.inspectOpen"
      :fruit-name="s.inspectName"
      :flipped="s.inspectFlipped"
      :hint="inspectHint"
      @close="game.closeInspect"
    />
    <CustomizerModal
      :open="s.customOpen"
      @close="game.closeCustom"
      @hair="game.changeHair"
      @shirt="game.changeShirt"
    />
    <PauseModal :open="s.pauseOpen" @resume="game.togglePause" />
    <SummaryModal
      :open="s.summaryOpen"
      :title="s.summaryTitle"
      :score="s.score"
      :combo="s.bestCombo"
      :eaten="s.eaten"
      :bag="s.backpack.length"
      @restart="game.restartGame"
      @town="game.closeSummaryToTown"
    />
  </div>
</template>

<style scoped>
.shell {
  height: 100dvh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #88c9b0;
}
.stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
@supports (height: 100dvh) {
  .shell { height: 100dvh; }
}
</style>
