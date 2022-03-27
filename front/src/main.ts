import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './index.css'
import type TronWeb from 'tronweb'

declare global {
  interface Window {
    tronWeb: TronWeb;
  }
}

const app = createApp(App)

app.use(router)

app.mount('#app')
