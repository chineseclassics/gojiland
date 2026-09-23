<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { images } from '../game/images'
import { categoryLabel, type Dish, type DishCategory } from '../game/recipes'

const props = defineProps<{
  dishes: Dish[]
  activeId: string | null
  orderId: string
  discovered: readonly string[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const category = shallowRef<DishCategory | 'all'>('all')
const tabs: Array<DishCategory | 'all'> = ['all', 'cookie', 'cake', 'bread', 'tart', 'snack']

const shown = computed(() => {
  const list = category.value === 'all' ? props.dishes : props.dishes.filter((dish) => dish.category === category.value)
  return [...list].sort((a, b) => Number(b.id === props.orderId) - Number(a.id === props.orderId))
})

function known(id: string) {
  return props.discovered.includes(id)
}
</script>

<template>
  <div class="book">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        :class="{ on: category === tab }"
        @click="category = tab"
      >
        {{ categoryLabel[tab] }}
      </button>
    </div>
    <div class="list">
      <button
        v-for="dish in shown"
        :key="dish.id"
        type="button"
        class="row"
        :class="{ on: activeId === dish.id }"
        @click="emit('select', dish.id)"
      >
        <img :src="images[dish.image]" :alt="dish.name" />
        <span>
          <strong>{{ dish.name }}</strong>
          <em>{{ dish.enName }}</em>
        </span>
        <span class="badges">
          <i v-if="dish.id === orderId" class="ask">客人要</i>
          <i v-if="known(dish.id)">烤過</i>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.tabs button {
  border: 0;
  background: var(--paper-2);
  color: var(--ink-soft);
  border-radius: 999px;
  min-height: 40px;
  padding: 6px 12px;
  font-weight: 700;
  white-space: nowrap;
}

.tabs button.on {
  background: var(--cocoa);
  color: var(--paper);
}

.list {
  display: grid;
  gap: 8px;
  max-height: 240px;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.row {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 8px;
  align-items: center;
  text-align: left;
  border: 1px solid var(--line);
  background: oklch(0.98 0.01 90);
  border-radius: 14px;
  min-height: 64px;
  padding: 6px;
}

.row.on {
  border-color: var(--cocoa);
  background: oklch(0.95 0.03 80);
}

.row img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.row strong { display: block; font-size: 0.95rem; }
.row em {
  display: block;
  font-style: normal;
  color: var(--ink-soft);
  font-size: 0.75rem;
}

.badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.row i {
  font-style: normal;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--cocoa-deep);
  background: var(--apricot);
  border-radius: 999px;
  padding: 2px 6px;
}

.row i.ask {
  background: var(--sea);
  color: var(--paper);
}

@media (min-width: 768px) and (max-width: 1180px) {
  .list { max-height: 300px; }
  .row { min-height: 72px; }
}
</style>
