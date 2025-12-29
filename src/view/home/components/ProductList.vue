<template>
  <div class="product-list">
    <div class="list-header">
      <h3>{{ title }}</h3>
      <div class="nav-buttons">
        <div 
          class="nav-btn" 
          :class="{ disabled: currentPage === 0 }"
          @click="handlePrev"
        >
          <i class="iconfont icon-xiangzuo-1"></i>
        </div>
        <div 
          class="nav-btn"
          :class="{ disabled: currentPage === totalPages - 1 }"
          @click="handleNext"
        >
          <i class="iconfont icon-xiangyou-1"></i>
        </div>
      </div>
    </div>
    <div class="list-content">
      <div class="list-page">
        <div
          v-for="item in currentPageItems"
          :key="item.id"
          class="list-item"
          @click="handleClick(item)"
        >
          <slot :item="item"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  pageSize: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['click'])

const currentPage = ref(0)

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.products.length / props.pageSize)
})

// 当前页的数据
const currentPageItems = computed(() => {
  const start = currentPage.value * props.pageSize
  const end = start + props.pageSize
  return props.products.slice(start, end)
})

const handleClick = (item) => {
  emit('click', item)
}

const handlePrev = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const handleNext = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}
</script>

<style lang="scss" scoped>
@use './ProductList.scss' as *;
</style>
