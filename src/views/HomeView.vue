<template>
  <v-main class="bg-grey-lighten-4">
    <v-container class="py-8">
      <div class="text-center mb-6">
        <div class="text-h4 font-weight-bold mb-2">AR Movie Hub</div>
        <div class="text-body-1 text-medium-emphasis">Browse your favorite content</div>
      </div>

      <v-row v-if="featuredMovies.length" class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="text-h6 font-weight-bold">Latest Movies</div>
            <div class="text-body-2 text-medium-emphasis">Newest releases</div>
          </div>

          <v-carousel
            height="660"
            cycle
            show-arrows="hover"
            hide-delimiters
            class="overflow-hidden carousel-full"
          >
            <v-carousel-item v-for="movie in featuredMovies" :key="movie.id">
              <v-img :src="getBackdropUrl(movie.backdrop_path)" :alt="movie.title" cover class="carousel-image">
                <div class="d-flex fill-height align-end">
                  <div class="pa-4 text-white carousel-caption w-100">
                    <div class="text-h6 font-weight-bold">{{ movie.title }}</div>
                    <div class="text-caption">{{ movie.release_date }}</div>
                  </div>
                </div>
              </v-img>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>

      <v-text-field
        v-model="searchQuery"
        class="mx-auto mb-4"
        label="Search movie title"
        prepend-inner-icon="mdi-magnify"
        placeholder="Enter a movie title"
        variant="outlined"
        clearable
        @click:clear="handleClearSearch"
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

      <div v-else-if="movies.length">
        <v-row dense>
            <v-col cols="6" sm="6" md="2" lg="2" v-for="movie in movies" :key="movie.id" class="movie-item">
              <MovieCard :movie="movie" @select="goToMovieDetail" />
            </v-col>
        </v-row>
      </div>

      <div v-if="movies.length" class="d-flex justify-center mt-6 pagination-wrapper">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="paginationTotalVisible"
          size="small"
          @update:model-value="handlePageChange"
          class="pagination-sm"
        />
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import NavigationBar from '@/components/NavigationBar.vue'
  import MovieCard from '@/components/MovieCard.vue'
  import { discoverMovies, discoverTvShows, getMovieGenres, getNowPlayingMovies, searchMovies } from '@/services/tmdb'

  const router = useRouter()
  const selectedCategory = ref('movies')
  const searchQuery = ref('')
  const movies = ref<any[]>([])
  const featuredMovies = ref<any[]>([])
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

  const getBackdropUrl = (backdropPath?: string) => {
    if (!backdropPath) {
      return 'https://placehold.co/1280x720/1f2937/ffffff?text=No+Image'
    }

    return `https://image.tmdb.org/t/p/w1280${backdropPath}`
  }

  const loadFeaturedMovies = async () => {
    try {
      const data = await getNowPlayingMovies({ page: 1, language: 'en' })
      featuredMovies.value = (data.results || []).slice(0, 10)
    } catch (error) {
      console.error('TMDB featured movies error:', error)
    }
  }

  const handleClearSearch = async () => {
    searchQuery.value = ''
    page.value = 1
    totalPages.value = 1
    await loadContent()
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
      const data = await searchMovies({
        query,
        page: page.value,
        language: 'en',
        mediaType: selectedCategory.value === 'tv' ? 'tv' : 'movie',
      })
      movies.value = data.results || []
      totalPages.value = Math.min(data.total_pages || 1, 100)
    } catch (error) {
      console.error('TMDB search error:', error)
    } finally {
      isLoading.value = false
    }
  }

  const isMdDown = ref(false)
  const paginationTotalVisible = computed(() => (isMdDown.value ? 3 : 7))

  const updatePaginationBreakpoint = () => {
    isMdDown.value = window.matchMedia('(max-width: 960px)').matches
  }

  const goToMovieDetail = (movieId: number, mediaType: 'movie' | 'tv') => {
    if (!movieId) return
    const routeName = mediaType === 'tv' ? 'tv-detail' : 'movie-detail'
    router.push({ name: routeName, params: { id: movieId } })
  }

  onMounted(() => {
    void Promise.all([loadContent(), loadFeaturedMovies()])
    updatePaginationBreakpoint()
    window.addEventListener('resize', updatePaginationBreakpoint)
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

  onUnmounted(() => {
    window.removeEventListener('resize', updatePaginationBreakpoint)
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

  .carousel-full {
    width: 100%;
  }

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .carousel-caption {
    background: rgba(236, 231, 231, 0.6);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .pagination-wrapper {
    width: 100%;
    overflow-x: hidden;
    min-width: 0;
  }

  .pagination-sm {
    width: 100%;
    max-width: 100%;
    font-size: 0.8rem;
    min-height: 32px;
    padding: 0 4px;
  }
</style>
