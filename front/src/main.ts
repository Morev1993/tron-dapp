import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './index.css'
import type TronWeb from 'tronweb'

import VueToast from 'vue-toast-notification';
// Import one of the available themes
//import 'vue-toast-notification/dist/theme-default.css';
import 'vue-toast-notification/dist/theme-sugar.css';

declare global {
  interface Window {
    tronWeb: TronWeb;
  }
}

const app = createApp(App);

app.use(router).use(VueToast,  {
  position: 'top'
}).mount('#app');


app.config.globalProperties.$filters = {
  amount(value: number) {
    var formatter = new Intl.NumberFormat('en-US');
    return formatter.format(value);
  }
}