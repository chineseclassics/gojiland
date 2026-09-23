<script setup lang="ts">
import { images } from '../game/images'
import { useBakers } from '../composables/useGame'

const {
  state,
  bagEntries,
  setBagFilter,
  closeBag,
  eatSaved,
  sellSaved,
  askReset,
  cancelReset,
  resetGame,
} = useBakers()

const filters = [
  { id: 'all', label: '全部' },
  { id: 'baked', label: '點心' },
  { id: 'stock', label: '材料' },
] as const
</script>

<template>
  <Transition name="fade">
    <div v-if="state.bagOpen" class="mask" @click.self="closeBag">
      <section class="panel">
        <header>
          <img :src="images.satchel" alt="" />
          <h2>包包</h2>
          <button type="button" class="close" @click="closeBag">關閉</button>
        </header>

        <div class="filters">
          <button
            v-for="filter in filters"
            :key="filter.id"
            type="button"
            :class="{ on: state.bagFilter === filter.id }"
            @click="setBagFilter(filter.id)"
          >
            {{ filter.label }}
          </button>
        </div>

        <div v-if="bagEntries.length" class="grid">
          <article v-for="item in bagEntries" :key="item.kind + item.id" class="item">
            <img :src="images[item.image]" :alt="item.name" />
            <strong>{{ item.name }}</strong>
            <em v-if="item.kind === 'stock'">{{ item.enName }}</em>
            <span v-if="item.kind === 'stock' && item.exclusive" class="tag">船長才有</span>
            <span class="count">× {{ item.count }}</span>
            <div v-if="item.kind === 'baked'" class="row">
              <button type="button" @click="eatSaved(item.id)">吃掉</button>
              <button type="button" @click="sellSaved(item.id)">賣 {{ item.price }}</button>
            </div>
          </article>
        </div>
        <p v-else class="empty">這裡還是空的。</p>

        <footer>
          <button v-if="!state.confirmReset" type="button" class="reset" @click="askReset">重新開始這一天</button>
          <div v-else class="confirm">
            <p>進度會清除，回到第一天。</p>
            <button type="button" @click="resetGame">確定</button>
            <button type="button" @click="cancelReset">先不要</button>
          </div>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: oklch(0.28 0.04 50 / 0.35);
  display: flex;
  justify-content: flex-end;
}

.panel {
  width: min(460px, 100%);
  height: 100%;
  background: var(--paper);
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
}

header {
  display: flex;
  align-items: center;
  gap: 8px;
}

header img { width: 36px; height: 36px; object-fit: contain; }

h2 {
  font-family: "Noto Serif TC", serif;
  margin: 0;
  flex: 1;
}

.close, .filters button, .row button, .reset, .confirm button {
  border: 0;
  border-radius: 10px;
  background: var(--paper-2);
  padding: 6px 10px;
  font-weight: 700;
}

.filters { display: flex; gap: 6px; margin: 12px 0; }

.filters button.on {
  background: var(--cocoa);
  color: var(--paper);
}

.grid {
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  align-content: start;
}

.item {
  background: oklch(0.98 0.012 90);
  border-radius: 14px;
  padding: 8px;
  text-align: center;
}

.item img { width: 72px; height: 72px; margin: 0 auto; object-fit: contain; }
.item strong, .item em { display: block; }
.item em { font-style: normal; color: var(--ink-soft); font-size: 0.75rem; }

.tag, .count {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.72rem;
  border-radius: 999px;
  padding: 1px 6px;
}

.tag { background: oklch(0.9 0.04 200); color: var(--sea); }
.count { background: var(--paper-2); }

.row { display: flex; gap: 4px; margin-top: 6px; }
.row button { flex: 1; font-size: 0.75rem; padding: 6px 2px; }

.empty { color: var(--ink-soft); }

footer { margin-top: auto; padding-top: 12px; }

.reset { color: var(--ink-soft); }

.confirm p { margin-bottom: 8px; font-size: 0.9rem; }
.confirm { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
</style>
