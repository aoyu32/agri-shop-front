<template>
  <div class="seasonal-products">
    <div class="section-header">
      <div class="section-title">当季农产品</div>
      <div class="season-info">{{ seasonText }}</div>
    </div>
    <div v-loading="loading" class="products-list">
      <SeasonalProductCard
        v-for="product in displayProducts"
        :key="product.id"
        :product="product"
        @click="handleProductClick"
      />
    </div>
    <div v-if="!loading && displayProducts.length === 0" class="empty-state">
      <el-empty description="暂无当季农产品" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SeasonalProductCard from '@/components/seasonal-card/index.vue'
import { getSeasonalProducts } from '@/apis/seasonal'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const currentSeason = ref('')

// 季节名称映射
const seasonNames = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季'
}

// 只显示前6个产品
const displayProducts = computed(() => {
  return products.value.slice(0, 6)
})

// 季节文本
const seasonText = computed(() => {
  const seasonName = seasonNames[currentSeason.value] || '当季'
  return `${seasonName}推荐食用的农产品`
})

// 获取当季农产品
const fetchSeasonalProducts = async () => {
  loading.value = true
  try {
    const res = await getSeasonalProducts()
    products.value = res.data.products || []
    currentSeason.value = res.data.selected_season || ''
  } catch (error) {
    console.error('获取当季农产品失败:', error)
    ElMessage.error('获取当季农产品失败')
  } finally {
    loading.value = false
  }
}

const handleProductClick = (product) => {
  // 跳转到分类页面，并传递分类ID
  router.push({
    path: '/category',
    query: {
      categoryId: product.category_id
    }
  })
}

onMounted(() => {
  fetchSeasonalProducts()
})
</script>

<style lang="scss" scoped>
@use './SeasonalProducts.scss' as *;
</style>