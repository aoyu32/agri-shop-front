<template>
  <div class="seasonal-card" @click="handleClick">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
    </div>
    <div class="product-name">{{ product.name }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.product)
}
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>

