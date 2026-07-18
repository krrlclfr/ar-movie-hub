<template>
  <v-card class="movie-card" rounded="lg" variant="outlined" @click="emit('select', movie.id)">
    <v-img
      :src="posterUrl"
      :alt="movie.title"
      height="320"
      cover
    />

    <v-card-title class="text-body-2 font-weight-bold line-clamp">
      {{ movie.title }}
    </v-card-title>

    <v-card-text>
      <div class="text-caption text-medium-emphasis">
        Release: {{ releaseDate }}
      </div>
      <div class="text-caption text-medium-emphasis">
        Vote: {{ voteAverage }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Movie {
    id: number
    title: string
    poster_path?: string | null
    release_date?: string | null
    vote_average?: number | null
  }

  const props = defineProps<{
    movie: Movie
  }>()

  const emit = defineEmits<{
    (e: 'select', value: number): void
  }>()

  const posterUrl = computed(() => {
    if (!props.movie.poster_path) return 'https://via.placeholder.com/240x320?text=No+Image'
    return `https://image.tmdb.org/t/p/w500${props.movie.poster_path}`
  })

  const releaseDate = computed(() => props.movie.release_date || 'N/A')
  const voteAverage = computed(() => {
    if (props.movie.vote_average == null) return 'N/A'
    return `${props.movie.vote_average.toFixed(1)} / 10`
  })
</script>

<style scoped>
  .movie-card {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    background: rgba(255, 255, 255, 0.96);
  }

  .movie-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
  }

  .line-clamp {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.8rem;
  }
</style>
