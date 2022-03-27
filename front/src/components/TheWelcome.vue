<script lang="ts">

import {getTronWeb} from '../services/tronLink';


export default {
  data() {
    return {
      count: 1
    }
  },

  methods: {
    onSubmit: () => { 
      const tronWeb = getTronWeb();

      console.log(tronWeb.defaultAddress.base58);
    }
  },

  // `mounted` is a lifecycle hook which we will explain later
  mounted() {
    // `this` refers to the component instance.
    // data can be mutated as well
    this.count = 2
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <label class="block mb-3">
      <span class="text-gray-700">Address</span>
      <input type="text" class="mt-1 block w-full" placeholder="">
    </label>
    <label class="block mb-3">
      <span class="text-gray-700">Amount</span>
      <input type="text" class="mt-1 block w-full" placeholder="">
    </label>
    <div>
      <button type="submit" class="bg-indigo-600 text-white text-sm leading-6 font-medium py-2 px-3 rounded-lg">Connect</button>
    </div>
  </form>

</template>

  function getTronWeb() {
    throw new Error('Function not implemented.')
  }

  function getTronWeb() {
    throw new Error('Function not implemented.')
  }
