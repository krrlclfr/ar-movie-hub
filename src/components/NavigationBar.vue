<template>
  <v-app-bar density="compact" flat class="mx-auto mb-4" app>
    <template #append>
      <v-btn-toggle v-model="activeCategory" color="white" mandatory divided>
        <v-btn :class="{ 'nav-active': activeCategory === 'movies' }" value="movies" size="large">Movies</v-btn>
        <v-btn :class="{ 'nav-active': activeCategory === 'tv' }" value="tv" size="large">TV Show</v-btn>
      </v-btn-toggle>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{
    modelValue?: string
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  const activeCategory = ref(props.modelValue ?? 'movies')

  watch(activeCategory, value => {
    emit('update:modelValue', value)
  })

  watch(() => props.modelValue, value => {
    if (value && value !== activeCategory.value) {
      activeCategory.value = value
    }
  })
</script>

<style scoped>
  .nav-active {
    box-shadow: none;
    border-bottom: 3px solid rgba(70, 0, 0, 0.92);
    border-radius: 0 !important;
  }
</style>
