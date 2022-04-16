<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import tronLogo from "@/assets/tron-logo.svg";
import { onBeforeMount } from 'vue';
import { getTronLink } from './services/tronLink';

onBeforeMount(async () => {
  window.addEventListener('message', (e) => {
    // console.log('events', e);
    if (e.data.message && e.data.message.action == "setNode") {
      console.log("setNode event", e.data.message);
      location.reload();
    }
  })

})

</script>

<template>
  <div class="header">
    <img :src="tronLogo" width="200">
  </div>
  <div class="main">
    <RouterView />
  </div>
</template>

<style>
@import '@/assets/base.css';

.main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

.header {
  background: white;
  margin: 0 auto;
  padding: .5rem 2rem;
}

</style>
