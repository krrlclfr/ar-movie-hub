<template>
  <v-main class="bg-grey-lighten-4">
    <v-container class="py-8" max-width="1200">
      <div class="text-center mb-6">
        <div class="text-h4 font-weight-bold mb-2">AR Movie Hub</div>
        <div class="text-body-1 text-medium-emphasis">Browse your favorite content</div>
      </div>

      <v-text-field
        v-model="searchQuery"
        class="mx-auto mb-4"
        label="Search movie title"
        prepend-inner-icon="mdi-magnify"
        placeholder="Enter a movie title"
        variant="outlined"
        clearable
      />

      <NavigationBar v-model="selectedCategory" />

      <v-card class="mx-auto mb-6" rounded="lg" variant="outlined">
        <v-card-title class="text-capitalize">{{ selectedCategory }}</v-card-title>
        <v-card-text>
          <div v-if="searchQuery">Searching for: <strong>{{ searchQuery }}</strong></div>
          <div>Showing {{ selectedCategory === 'movies' ? 'movies' : 'TV shows' }}.</div>
        </v-card-text>
      </v-card>

      <div v-if="isLoading" class="movie-grid">
        <div v-for="index in 8" :key="index" class="movie-item">
          <v-skeleton-loader type="card" class="movie-card-skeleton" />
        </div>
      </div>

      <div v-else-if="movies.length" class="movie-grid">
        <div v-for="movie in movies" :key="movie.id" class="movie-item">
          <MovieCard :movie="movie" @select="goToMovieDetail" />
        </div>
      </div>

      <div v-if="movies.length" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          @update:model-value="handlePageChange"
        />
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import NavigationBar from '@/components/NavigationBar.vue'
  import MovieCard from '@/components/MovieCard.vue'
  import { discoverMovies, discoverTvShows, getMovieGenres, searchMovies } from '@/services/tmdb'

  const router = useRouter()
  const selectedCategory = ref('movies')
  const searchQuery = ref('')
  const movies = ref<any[]>([])
  const movieGenres = ref<Record<number, string>>({})
  const page = ref(1)
  const totalPages = ref(1)
  const isLoading = ref(false)

  const loadContent = async () => {
    isLoading.value = true
    try {
      const isTv = selectedCategory.value === 'tv'
      const [data, genres] = await Promise.all([
        isTv ? discoverTvShows({ page: page.value }) : discoverMovies({ page: page.value }),
        getMovieGenres('en'),
      ])

      movies.value = data.results || []
      totalPages.value = Math.min(data.total_pages || 1, 100)
      movieGenres.value = Object.fromEntries(
        genres.map((genre: { id: number, name: string }) => [genre.id, genre.name])
      )
    } catch (error) {
      console.error('TMDB discover error:', error)
    } finally {
      isLoading.value = false
    }
  }

  const handlePageChange = async (newPage: number) => {
    page.value = newPage
    if (searchQuery.value.trim()) {
      await searchMoviesByTitle()
    } else {
      await loadContent()
    }
  }

  const searchMoviesByTitle = async () => {
    const query = searchQuery.value.trim()

    if (!query) {
      page.value = 1
      totalPages.value = 1
      await loadContent()
      return
    }

    isLoading.value = true
    try {
      const data = await searchMovies({ query, page: page.value, language: 'en' })
      movies.value = data.results || []
      totalPages.value = Math.min(data.total_pages || 1, 100)
    } catch (error) {
      console.error('TMDB search error:', error)
    } finally {
      isLoading.value = false
    }
  }

  const goToMovieDetail = (movieId: number) => {
    if (!movieId) return
    router.push(`/movie/${movieId}`)
  }

  onMounted(() => {
    void loadContent()
  })

  watch(searchQuery, () => {
    page.value = 1
    if (searchQuery.value.trim()) {
      void searchMoviesByTitle()
    } else {
      void loadContent()
    }
  })

  watch(selectedCategory, () => {
    page.value = 1
    void loadContent()
  })
</script>

<style scoped>
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    align-items: start;
  }

  .movie-item {
    display: flex;
    width: 100%;
  }

  .movie-item :deep(.movie-card) {
    width: 100%;
    max-width: 100%;
  }

  .movie-card-skeleton {
    width: 100%;
    min-height: 340px;
  }
</style>
