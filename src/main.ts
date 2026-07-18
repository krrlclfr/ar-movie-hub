/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import router from './router'

// Styles
const app = createApp(App)

registerPlugins(app)
app.use(router)

const redirectPath = new URLSearchParams(window.location.search).get('p')
if (redirectPath) {
  router.replace(redirectPath)
}

const originalWindowOpen = window.open.bind(window)
window.open = ((url?: string | URL | null, target?: string, features?: string | null) => {
  const urlString = typeof url === 'string' ? url : url?.toString() ?? ''
  const targetName = typeof target === 'string' ? target.toLowerCase() : ''
  const isSameOrigin = urlString.startsWith('/') || urlString.startsWith('./') || urlString.startsWith('../') || urlString.startsWith(window.location.origin)

  if (!isSameOrigin && targetName === '_blank') {
    return null
  }

  return originalWindowOpen(url as string, target as string, features as string)
}) as typeof window.open

window.addEventListener('beforeunload', () => {
  // no-op; keeps the popup guard in place for browser-friendly handling
})

const originalOpen = window.open.bind(window)
window.open = ((url?: string | URL | null, target?: string, features?: string | null) => {
  const parsedUrl = typeof url === 'string' ? url : url?.toString() ?? ''
  const allowedHosts = ['localhost', '127.0.0.1', 'github.io', 'githubusercontent.com']
  const isAllowed = allowedHosts.some((host) => parsedUrl.includes(host)) || parsedUrl.startsWith('/') || parsedUrl.startsWith('./') || parsedUrl.startsWith('../')

  if (!isAllowed) {
    return null
  }

  return originalOpen(parsedUrl, target ?? '_self', features ?? '')
}) as typeof window.open

app.mount('#app')
