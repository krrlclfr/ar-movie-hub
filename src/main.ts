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

app.mount('#app')
