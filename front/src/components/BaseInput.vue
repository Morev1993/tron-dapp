<!-- BaseInput.vue component -->

<template>
  <label class="block">
      <span class="text-gray-700 dark:text-white">{{label}}</span>
      <input type="text" class="mt-1 block w-full rounded-md border-4 border-indigo-400 focus:border-indigo-500 disabled:border-lime-500 text-black" placeholder="" :value="modelValue" @input="updateValue">
    </label>
</template>

<script setup lang="ts">
  const props = defineProps({
    label: String,
    modelValue: String
  })

  const emit = defineEmits(['update:modelValue'])

  const updateValue = (event: any) => {
    emit('update:modelValue', event.target.value)
  }
</script>