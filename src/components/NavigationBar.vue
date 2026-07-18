<template>
  <v-app-bar density="compact" flat class="mx-auto mb-4" max-width="480">
    <template #append>
      <v-btn-toggle v-model="activeCategory" color="white" mandatory divided>
        <v-btn value="movies" size="large">Movies</v-btn>
        <v-btn value="tv" size="large">TV Show</v-btn>
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
