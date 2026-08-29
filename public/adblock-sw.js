// Simple adblock service worker
// Maintains an in-memory list of filter substrings/regex strings (regex wrapped with /.../)
self.filters = [
  'doubleclick.net',
  'googlesyndication.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'amazon-adsystem.com'
]

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

function matchesFilter(url) {
  try {
    return self.filters.some((f) => {
      if (!f) return false
      if (f.startsWith('/') && f.endsWith('/')) {
        const re = new RegExp(f.slice(1, -1))
        return re.test(url)
      }
      return url.includes(f)
    })
  } catch (e) {
    return false
  }
}

self.addEventListener('message', (e) => {
  if (!e.data) return
  if (e.data.type === 'updateFilters') {
    self.filters = Array.isArray(e.data.filters) ? e.data.filters : self.filters
  }
})

self.addEventListener('fetch', (event) => {
  const url = event.request.url
  if (matchesFilter(url)) {
    // Return an empty response for blocked requests
    event.respondWith(new Response('', { status: 204, statusText: 'No Content' }))
    return
  }

  // Default: forward the request
  event.respondWith(fetch(event.request))
})
