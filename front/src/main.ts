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

createApp(App).use(router).use(VueToast,  {
    // One of the options
    position: 'top'
}).mount('#app');

// let instance = app.$toast.open('You did it!');

// Force dismiss specific toast
// instance.dismiss();
// // Dismiss all opened toast immediately
// app.$toast.clear();