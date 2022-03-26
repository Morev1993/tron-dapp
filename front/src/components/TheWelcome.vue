<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
</script>

<template>
  <form>
    <SupportIcon/>
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
