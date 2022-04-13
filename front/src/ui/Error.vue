<template>
    <div class="text-red-600 mt-1" v-if="message">
        {{ message }}
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
  message: String
})
</script>