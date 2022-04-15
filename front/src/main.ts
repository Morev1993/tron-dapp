import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './index.css'
import type TronWeb from 'tronweb'

import VueToast from 'vue-toast-notification';
// Import one of the available themes
//import 'vue-toast-notification/dist/theme-default.css';
import 'vue-toast-notification/dist/theme-sugar.css';
import type { TronLinkParams } from './models/tronLink'
declare global {
  interface Window {
    tronWeb: TronWeb;
    tronLink: TronLinkParams;
  }
}

appConfig();

function appConfig() {
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
}

window.addEventListener('message', function (e) {
  if (e.data.message && e.data.message.action == "setNode") {
    console.log("setNode event", e.data.message);
    // location.reload();
  }
})