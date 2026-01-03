<template>
  <div class="filter-panel">
    <!-- 价格筛选 -->
    <div class="filter-row">
      <div class="filter-label">价格</div>
      <div class="filter-options">
        <div
          class="filter-option"
          :class="{ active: !selectedPrice }"
          @click="handlePriceClick(null)"
        >
          不限
        </div>
        <div
          v-for="range in priceRanges"
          :key="range.id"
          class="filter-option"
          :class="{ active: selectedPrice?.id === range.id }"
          @click="handlePriceClick(range)"
        >
          {{ range.label }}
        </div>
      </div>
    </div>

    <!-- 产地筛选 -->
    <div class="filter-row">
      <div class="filter-label">产地</div>
      <div class="filter-options">
        <div
          class="filter-option"
          :class="{ active: !selectedOrigin }"
          @click="handleOriginClick(null)"
        >
          不限
        </div>
        <div
          v-for="origin in origins"
          :key="origin.id"
          class="filter-option"
          :class="{ active: selectedOrigin?.id === origin.id }"
          @click="handleOriginClick(origin)"
        >
          {{ origin.name }}
        </div>
      </div>
    </div>

    <!-- 排序和重置 -->
    <div class="filter-row">
      <div class="filter-label">排序</div>
      <div class="filter-options">
        <div
          v-for="option in sortOptions"
          :key="option.id"
          class="filter-option"
          :class="{ active: sortValue === option.value }"
          @click="handleSortChange(option.value)"
        >
          {{ option.label }}
        </div>
        <div class="reset-btn" @click="handleReset">
          <i class="iconfont icon-shuaxin"></i>
          重置
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  priceRanges: {
    type: Array,
    default: () => []
  },
  origins: {
    type: Array,
    default: () => []
  },
  sortOptions: {
    type: Array,
    default: () => []
  },
  selectedPrice: {
    type: Object,
    default: null
  },
  selectedOrigin: {
    type: Object,
    default: null
  },
  sortValue: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['price-change', 'origin-change', 'sort-change', 'reset'])

const handlePriceClick = (range) => {
  emit('price-change', range)
}

const handleOriginClick = (origin) => {
  emit('origin-change', origin)
}

const handleSortChange = (value) => {
  emit('sort-change', value)
}

const handleReset = () => {
  emit('reset')
}
</script>

<style lang="scss" scoped>
@use './FilterPanel.scss' as *;
</style>
