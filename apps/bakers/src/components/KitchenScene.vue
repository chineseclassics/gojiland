<script setup lang="ts">
import { images } from '../game/images'
import { ingredients, presets } from '../game/catalog'
import { useBakers } from '../composables/useGame'

const {
  state,
  customDraft,
  prep,
  tray,
  recipePrice,
  selectPreset,
  toggleCustom,
  submitCustom,
  place,
  unplace,
  startBake,
  seekShop,
  switchScene,
} = useBakers()

function filled(id: string) {
  return state.table.includes(id)
}

const whereText = {
  bag: '還在包包裡，點下面放上來',
  shop: '商店買得到',
  beach: '要去海邊找船長',
} as const
</script>

<template>
  <section class="kitchen" :style="{ backgroundImage: `url(${images.kitchen})` }">
    <div v-if="state.baking" class="glow" />

    <div class="play">
      <article class="paper order">
        <p class="kicker">今天做什麼</p>
        <h2>先選點心，再把食材放到空位上。</h2>

        <div class="choices">
          <button
            v-for="preset in presets"
            :key="preset.id"
            type="button"
            class="choice"
            :class="{ on: state.recipe?.id === preset.id }"
            @click="selectPreset(preset.id)"
          >
            <img :src="images[preset.image]" :alt="preset.name" />
            <span>
              <strong>{{ preset.name }}</strong>
              <em>{{ preset.enName }}</em>
            </span>
          </button>
          <button type="button" class="choice own" :class="{ on: state.customOpen || state.recipe?.custom }" @click="toggleCustom">
            <img :src="images.pastry" alt="" />
            <span>
              <strong>自己取名</strong>
              <em>Your own bake</em>
            </span>
          </button>
        </div>

        <form v-if="state.customOpen" class="custom" @submit.prevent="submitCustom">
          <input v-model="customDraft" maxlength="16" placeholder="例如蘋果派、蜂蜜鬆餅" />
          <button type="submit">擺好空位</button>
        </form>
      </article>

      <article class="paper board">
        <template v-if="state.recipe">
          <header class="board-head">
            <img :src="images[state.recipe.image]" :alt="state.recipe.name" />
            <div>
              <h2>{{ state.recipe.name }}</h2>
              <p>{{ state.recipe.enName }} · 賣出可得 {{ recipePrice }} 金幣</p>
            </div>
          </header>

          <div class="slots">
            <div v-for="id in state.recipe.required" :key="id" class="slot" :class="{ filled: filled(id) }">
              <button v-if="filled(id)" type="button" @click="unplace(id)">
                <img :src="images[ingredients[id].image]" :alt="ingredients[id].name" />
                <strong>{{ ingredients[id].name }}</strong>
                <em>{{ ingredients[id].enName }}</em>
              </button>
              <div v-else class="ghost">
                <img :src="images[ingredients[id].image]" alt="" />
                <strong>{{ ingredients[id].name }}</strong>
                <em>還沒放</em>
              </div>
            </div>
          </div>

          <ul v-if="prep.missing.length && !state.baking" class="gaps">
            <li v-for="need in prep.missing" :key="need.id">
              <img :src="images[ingredients[need.id].image]" alt="" />
              <span>{{ ingredients[need.id].name }}，{{ whereText[need.where] }}</span>
            </li>
          </ul>

          <div class="actions">
            <button v-if="!state.baking && prep.missing.some((item) => item.where === 'shop')" type="button" class="quiet" @click="seekShop">去商店</button>
            <button v-if="!state.baking && prep.missing.some((item) => item.where === 'beach')" type="button" class="quiet" @click="switchScene('beach')">去海邊</button>
            <button type="button" class="bake" :disabled="state.baking" @click="startBake">
              {{ state.baking ? '烤箱亮著…' : '送進烤箱' }}
            </button>
          </div>
        </template>
        <div v-else class="waiting">
          <img :src="images.basket" alt="" />
          <p>選好左邊的點心，這裡會出現要放的食材。</p>
        </div>
      </article>
    </div>

    <div class="tray">
      <div class="tray-label">
        <img :src="images.basket" alt="" />
        <span>包包裡的食材。點一下放到空位，再點桌上的可以放回來，也會唸英文。</span>
      </div>
      <div v-if="tray.length" class="tray-row">
        <button
          v-for="item in tray"
          :key="item.id"
          type="button"
          class="piece"
          :class="{ needed: item.needed, done: item.done }"
          @click="place(item.id)"
        >
          <img :src="images[item.image]" :alt="item.name" />
          <strong>{{ item.name }}</strong>
          <em>{{ item.enName }}</em>
          <span class="count">{{ item.count }}</span>
        </button>
      </div>
      <p v-else class="empty">包包裡還沒有食材。</p>
    </div>
  </section>
</template>

<style scoped>
.kitchen {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px;
  background-position: center 30%;
  background-size: cover;
  position: relative;
}

.glow {
  position: absolute;
  right: 6%;
  top: 8%;
  width: min(240px, 30vw);
  height: min(240px, 30vw);
  border-radius: 50%;
  background: radial-gradient(circle, oklch(0.82 0.14 68 / 0.85), transparent 68%);
  animation: oven 0.9s ease-in-out infinite;
  pointer-events: none;
}

@keyframes oven {
  50% { opacity: 0.45; transform: scale(0.92); }
}

.play {
  display: grid;
  grid-template-columns: minmax(230px, 300px) minmax(280px, 620px);
  justify-content: start;
  gap: 12px;
  align-items: end;
  align-content: end;
  position: relative;
  z-index: 1;
}

.order, .board { align-self: end; height: auto; }

.paper {
  background: color-mix(in oklch, var(--paper) 94%, white);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 14px;
}

.kicker {
  font-family: "Noto Serif TC", serif;
  color: var(--cocoa);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.order h2, .waiting p {
  font-family: "Noto Serif TC", serif;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.35;
  margin: 4px 0 10px;
}

.choices {
  display: grid;
  gap: 8px;
}

.choice {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 8px;
  align-items: center;
  text-align: left;
  border: 1px solid var(--line);
  background: oklch(0.98 0.01 90);
  border-radius: 14px;
  padding: 6px;
}

.choice.on {
  border-color: var(--cocoa);
  background: oklch(0.95 0.03 80);
}

.choice img, .board-head img, .waiting img {
  width: 58px;
  height: 58px;
  object-fit: contain;
}

.choice strong, .piece strong, .slot strong {
  display: block;
  font-size: 0.95rem;
}

.choice em, .piece em, .slot em, .board-head p {
  display: block;
  font-style: normal;
  color: var(--ink-soft);
  font-size: 0.75rem;
}

.custom {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.custom input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 12px;
  padding: 8px 10px;
}

.custom button, .bake, .quiet {
  border: 0;
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 700;
}

.custom button, .bake {
  background: var(--cocoa);
  color: var(--paper);
}

.bake:disabled { opacity: 0.7; }

.quiet {
  background: var(--paper-2);
  color: var(--ink);
}

.board-head {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.board-head h2 {
  font-family: "Noto Serif TC", serif;
  font-size: 1.35rem;
  margin: 0;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slot {
  width: 104px;
  min-height: 124px;
  border-radius: 14px;
  background: oklch(0.94 0.02 85);
}

.slot.filled { background: oklch(0.97 0.03 90); }

.slot button, .ghost {
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  padding: 8px 6px;
  text-align: center;
}

.slot img {
  width: 64px;
  height: 64px;
  margin: 0 auto 4px;
  object-fit: contain;
}

.ghost { opacity: 0.45; }

.gaps {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: grid;
  gap: 4px;
}

.gaps li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.gaps img { width: 28px; height: 28px; object-fit: contain; }

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.waiting {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
}

.tray {
  position: relative;
  z-index: 1;
  background: color-mix(in oklch, var(--paper) 92%, white);
  border-radius: 16px;
  padding: 8px 10px 10px;
  box-shadow: var(--shadow);
}

.tray-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-soft);
  font-size: 0.78rem;
  margin-bottom: 6px;
}

.tray-label img { width: 28px; height: 28px; object-fit: contain; }

.tray-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.piece {
  position: relative;
  flex: 0 0 96px;
  border: 1px solid transparent;
  background: oklch(0.96 0.015 88);
  border-radius: 14px;
  padding: 6px 4px 8px;
  text-align: center;
}

.piece.needed { border-color: var(--apricot); }
.piece.done { opacity: 0.45; }

.piece img {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  object-fit: contain;
}

.count {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 1.2rem;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--cocoa);
  color: var(--paper);
  font-size: 0.72rem;
  font-weight: 700;
}

.empty { color: var(--ink-soft); font-size: 0.85rem; }

@media (max-width: 800px) {
  .play { grid-template-columns: 1fr; }
  .kitchen { overflow: auto; justify-content: flex-start; }
}
</style>
