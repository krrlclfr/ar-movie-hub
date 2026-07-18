const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export interface DiscoverMovieParams {
  page?: number
  language?: string
  sort_by?: string
}

function getTmdbHeaders() {
  const token = import.meta.env.VITE_TMDB_API_ACCESS_TOKEN

  if (!token) {
    throw new Error('TMDB access token is not configured. Set VITE_TMDB_API_ACCESS_TOKEN in your environment file.')
  }

  return {
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function discoverMovies(params: DiscoverMovieParams = {}) {
  const query = new URLSearchParams({
    ...params,
  } as Record<string, string>)

  const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${query.toString()}`, {
    method: 'GET',
    headers: getTmdbHeaders(),
  })

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`)
  }

  return response.json()
}

export async function discoverTvShows(params: DiscoverMovieParams = {}) {
  const query = new URLSearchParams({
    ...params,
  } as Record<string, string>)

  const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${query.toString()}`, {
    method: 'GET',
    headers: getTmdbHeaders(),
  })

  if (!response.ok) {
    throw new Error(`TMDB TV discover request failed with status ${response.status}`)
  }

  return response.json()
}

export async function getMovieGenres(language = 'en') {
  const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?language=${language}`, {
    method: 'GET',
    headers: getTmdbHeaders(),
  })

  if (!response.ok) {
    throw new Error(`TMDB genres request failed with status ${response.status}`)
  }

  const data = await response.json()
  return data.genres || []
}

export interface SearchMovieParams {
  query: string
  page?: number
  language?: string
}

export async function searchMovies(params: SearchMovieParams) {
  const query = new URLSearchParams({
    query: params.query,
    page: String(params.page ?? 1),
    language: params.language ?? 'en',
  })

  const response = await fetch(`${TMDB_BASE_URL}/search/movie?${query.toString()}`, {
    method: 'GET',
    headers: getTmdbHeaders(),
  })

  if (!response.ok) {
    throw new Error(`TMDB search request failed with status ${response.status}`)
  }

  return response.json()
}

export interface MovieDetailsParams {
  movieId: number | string
  language?: string
}

export async function getMovieDetails(params: MovieDetailsParams) {
  const query = new URLSearchParams({
    language: params.language ?? 'en',
  })

  const response = await fetch(`${TMDB_BASE_URL}/movie/${params.movieId}?${query.toString()}`, {
    method: 'GET',
    headers: getTmdbHeaders(),
  })

  if (!response.ok) {
    throw new Error(`TMDB movie details request failed with status ${response.status}`)
  }

  return response.json()
}

export async function getMovieCredits(params: MovieDetailsParams) {
  const query = new URLSearchParams({
    language: params.language ?? 'en',
  })

  const response = await fetch(`${TMDB_BASE_URL}/movie/${params.movieId}/credits?${query.toString()}`, {
    method: 'GET',
    headers: getTmdbHeaders(),
  })

  if (!response.ok) {
    throw new Error(`TMDB movie credits request failed with status ${response.status}`)
  }

  return response.json()
}

export async function getMovieRecommendations(params: MovieDetailsParams) {
  const query = new URLSearchParams({
    language: params.language ?? 'en',
  })

  const response = await fetch(`${TMDB_BASE_URL}/movie/${params.movieId}/recommendations?${query.toString()}`, {
    method: 'GET',
    headers: getTmdbHeaders(),
  })

  if (!response.ok) {
    throw new Error(`TMDB recommendations request failed with status ${response.status}`)
  }

  return response.json()
}
