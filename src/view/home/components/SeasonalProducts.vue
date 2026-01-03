<template>
  <div class="seasonal-products">
    <div class="section-header">
      <div class="section-title">当季农产品</div>
      <div class="season-info">{{ seasonText }}</div>
    </div>
    <div class="products-list">
      <SeasonalProductCard
        v-for="product in displayProducts"
        :key="product.id"
        :product="product"
        @click="handleProductClick"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import SeasonalProductCard from '@/components/seasonal-card/index.vue'
import { seasonalProducts } from '@/mock/home/seasonal'

// 只显示前6个产品
const displayProducts = computed(() => {
  return seasonalProducts.slice(0, 6)
})

// 获取当前季节
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

// 季节文本
const seasonText = computed(() => {
  const season = getCurrentSeason()
  const year = '推荐食用的农产品'
  return `${season}${year}`
})

const handleProductClick = (product) => {
  ElMessage.info(`查看产品: ${product.name}`)
}
</script>

<style lang="scss" scoped>
@use './SeasonalProducts.scss' as *;
</style>

