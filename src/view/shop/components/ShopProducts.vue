<template>
  <div class="shop-products">
    <!-- 分类导航栏 -->
    <div class="category-nav">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        :class="{ active: activeCategory === category.id }"
        @click="handleCategoryChange(category.id)"
      >
        {{ category.name }}
        <span class="category-count">({{ category.count }})</span>
      </div>
    </div>

    <!-- 农产品列表 -->
    <div class="products-section">
      <div class="products-header">
        <div class="products-count">共 {{ filteredProducts.length }} 件农产品</div>
        <div class="products-sort">
          <el-select v-model="sortType" placeholder="排序方式" style="width: 150px">
            <el-option label="综合排序" value="default" />
            <el-option label="销量优先" value="sales" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
          </el-select>
        </div>
      </div>

      <div class="products-grid">
        <ProductCard
          v-for="product in sortedProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <!-- 分页 -->
      <div v-if="filteredProducts.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="filteredProducts.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProductCard from '@/components/product-card/index.vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    required: true
  }
})

const activeCategory = ref('all')
const sortType = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)

// 计算属性
const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') {
    return props.products
  }
  return props.products.filter(p => p.category === activeCategory.value)
})

const sortedProducts = computed(() => {
  let result = [...filteredProducts.value]
  
  switch (sortType.value) {
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    default:
      // 综合排序
      break
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 方法
const handleCategoryChange = (categoryId) => {
  activeCategory.value = categoryId
  currentPage.value = 1 // 切换分类时重置页码
}
</script>

<style lang="scss" scoped>
@use './ShopProducts.scss' as *;
</style>
