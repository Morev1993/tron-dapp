<template>

  <div class="relative">
    <dt>
      <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
        <ServerIcon class="h-6 w-6" aria-hidden="true" />
        {{icon}}
      </div>
      <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{{title}}</p>
    </dt>
    <dd class="mt-2 ml-16 text-base text-lime-500">
      {{value}}
    </dd>
  </div>
</template>

<script setup lang="ts">

import { reactive, ref } from "vue";
import { ServerIcon } from '@heroicons/vue/outline'


const props = defineProps({
  title: String,
  value: String,
  icon: Object

})

</script>