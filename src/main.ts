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
import { popupManager } from '@/utils/popupManager'

// Styles
const app = createApp(App)

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $popupManager: typeof popupManager
  }
}

registerPlugins(app)
app.use(router)
app.config.globalProperties.$popupManager = popupManager

const redirectPath = new URLSearchParams(window.location.search).get('p')
if (redirectPath) {
  router.replace(redirectPath)
}

const originalWindowOpen = window.open.bind(window)
window.open = ((url?: string | URL | null, target?: string, features?: string | null) => {
  const parsedUrl = typeof url === 'string' ? url : url?.toString() ?? ''
  const allowedHosts = ['localhost', '127.0.0.1', 'github.io', 'githubusercontent.com', 'vercel.app']
  const isAllowed = allowedHosts.some((host) => parsedUrl.includes(host)) || parsedUrl.startsWith('/') || parsedUrl.startsWith('./') || parsedUrl.startsWith('../') || parsedUrl.startsWith(window.location.origin)

  if (!isAllowed) {
    return null
  }

  const popup = originalWindowOpen(parsedUrl, target ?? '_self', features ?? '')
  if (popup) {
    popupManager.trackPopup(popup, parsedUrl, typeof target === 'string' ? target : null)
  }

  return popup
}) as typeof window.open

window.addEventListener('beforeunload', () => {
  // no-op; keeps the popup guard in place for browser-friendly handling
})

app.mount('#app')
