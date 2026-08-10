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

popupManager.installPopupGuard()

window.addEventListener('beforeunload', () => {
  // no-op; keeps the popup guard in place for browser-friendly handling
})

app.mount('#app')
