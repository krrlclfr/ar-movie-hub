<template>
  <v-main class="bg-grey-lighten-4">
    <v-container class="py-8" max-width="900">
      <v-btn prepend-icon="mdi-arrow-left" class="mb-4" @click="router.back()">Back</v-btn>

      <v-card v-if="movieDetail" rounded="lg" variant="outlined">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-img :src="posterUrl" :alt="movieDetail.title" height="420" cover />
          </v-col>
          <v-col cols="12" md="8">
            <v-card-title class="text-h5">{{ movieDetail.title }}</v-card-title>
            <v-card-text>
              <p class="mb-3">{{ movieDetail.overview || 'No overview available.' }}</p>
              <div class="mb-2"><strong>Genres:</strong> {{ genresLabel }}</div>
              <div class="mb-2"><strong>Release date:</strong> {{ movieDetail.release_date || 'N/A' }}</div>
              <div class="mb-2"><strong>Vote average:</strong> {{ movieDetail.vote_average?.toFixed(1) || 'N/A' }} / 10</div>
              <div><strong>Cast:</strong> {{ castLabel }}</div>
            </v-card-text>
          </v-col>
        </v-row>

        <v-card-text v-if="movieId">
          <div class="mb-2 text-subtitle-1 font-weight-bold">Watch</div>
          <div class="video-frame">
            <iframe
              :src="videoEmbedUrl"
              title="Movie video"
              allow="autoplay; fullscreen"
              allowfullscreen
              referrerpolicy="origin"
              frameborder="0"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getMovieCredits, getMovieDetails } from '@/services/tmdb'

  const route = useRoute()
  const router = useRouter()
  const movieDetail = ref<any | null>(null)
  const cast = ref<any[]>([])
  const movieId = computed(() => Number(route.params.id))

  const posterUrl = computed(() => {
    if (!movieDetail.value?.poster_path) return 'https://via.placeholder.com/500x750?text=No+Image'
    return `https://image.tmdb.org/t/p/w500${movieDetail.value.poster_path}`
  })

  const genresLabel = computed(() => {
    return movieDetail.value?.genres?.map((genre: any) => genre.name).join(', ') || 'N/A'
  })

  const castLabel = computed(() => {
    return cast.value.slice(0, 6).map((person: any) => person.name).join(', ') || 'N/A'
  })

  const videoEmbedUrl = computed(() => {
    const id = movieId.value
    return id ? `https://vsembed.ru/embed/movie/${id}/` : ''
  })

  onMounted(async () => {
    const movieId = Number(route.params.id)
    if (!movieId) return

    try {
      const [details, credits] = await Promise.all([
        getMovieDetails({ movieId }),
        getMovieCredits({ movieId }),
      ])

      movieDetail.value = details
      cast.value = credits.cast || []
    } catch (error) {
      console.error('TMDB movie detail error:', error)
    }
  })
</script>

<style scoped>
  .video-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 12px;
  }

  .video-frame iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
