<template>
  <div class="seasonal-product">
    <div class="seasonal-header">
      <h3>当季农产品</h3>
    </div>
    <div class="seasonal-list">
      <div
        v-for="item in products"
        :key="item.id"
        class="seasonal-item"
        @click="handleClick(item)"
      >
        <div class="item-image">
          <img :src="item.image" :alt="item.name" />
        </div>
        <div class="item-info">
          <div class="item-desc">{{ item.description }}</div>
          <div class="item-tags">
            <span class="tag">{{ item.quality }}</span>
            <span class="tag">{{ item.origin }}</span>
            <span class="tag">{{ item.season }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['click'])

const handleClick = (item) => {
  emit('click', item)
}
</script>

<style lang="scss" scoped>
@use './SeasonalProduct.scss' as *;
</style>
