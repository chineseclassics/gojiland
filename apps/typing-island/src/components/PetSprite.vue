<script setup lang="ts">
defineProps<{
  hungry?: boolean
  happy?: boolean
}>()
</script>

<template>
  <div class="pet" :class="{ hungry, happy }">
    <div class="pet-ear l" />
    <div class="pet-ear r" />
    <div class="pet-tail" />
    <div class="pet-body" />
    <div class="pet-face">
      <div class="pet-eye l" />
      <div class="pet-eye r" />
      <div class="pet-nose" />
    </div>
  </div>
</template>
