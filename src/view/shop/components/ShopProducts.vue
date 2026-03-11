<template>
  <div class="shop-products">
    <!-- 分类导航栏 -->
    <div class="category-nav">
      <div
        class="category-item"
        :class="{ active: activeCategory === '' }"
        @click="handleCategoryChange('')"
      >
        全部
        <span class="category-count">({{ total }})</span>
      </div>
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        :class="{ active: activeCategory === category.id }"
        @click="handleCategoryChange(category.id)"
      >
        {{ category.icon }} {{ category.name }}
        <span class="category-count">({{ category.product_count }})</span>
      </div>
    </div>

    <!-- 农产品列表 -->
    <div class="products-section">
      <div class="products-header">
        <div class="products-count">共 {{ total }} 件农产品</div>
      </div>

      <div class="products-grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @click="handleProductClick"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="products.length === 0" class="empty-state">
        <el-empty description="暂无农产品" />
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '@/components/product-card/index.vue'

const router = useRouter()

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['category-change', 'page-change'])

const activeCategory = ref('')

// 方法
const handleCategoryChange = (categoryId) => {
  activeCategory.value = categoryId
  emit('category-change', categoryId)
}

const handlePageChange = (page) => {
  emit('page-change', page)
}

const handleProductClick = (product) => {
  router.push(`/product/${product.id}`)
}
</script>

<style lang="scss" scoped>
@use './ShopProducts.scss' as *;
</style>
