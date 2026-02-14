<template>
  <div class="category-page">
    <!-- 左侧分类侧边栏 -->
    <CategorySidebar
      :categories="categoryTree"
      :selected-category="selectedCategory"
      :selected-sub-category="selectedSubCategory"
      @category-change="handleCategoryChange"
      @sub-category-change="handleSubCategoryChange"
    />

    <!-- 右侧内容区域 -->
    <main class="category-content">
      <!-- 筛选面板 -->
      <FilterPanel
        :price-ranges="filterOptions.priceRanges"
        :origins="filterOptions.origins"
        :sort-options="filterOptions.sortOptions"
        :selected-price="selectedPrice"
        :selected-origin="selectedOrigin"
        :sort-value="sortValue"
        @price-change="handlePriceChange"
        @origin-change="handleOriginChange"
        @sort-change="handleSortChange"
        @reset="handleReset"
      />

      <!-- 产品列表 -->
      <div class="product-list">
        <ProductCard
          v-for="product in displayProducts"
          :key="product.id"
          :product="product"
          @click="handleProductClick"
        />
      </div>

      <!-- Element Plus 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :pager-count="11"
          background
          layout="prev, pager, next, jumper"
          :prev-icon="ArrowLeft"
          :next-icon="ArrowRight"
          @current-change="handlePageChange"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import CategorySidebar from './components/CategorySidebar.vue'
import FilterPanel from './components/FilterPanel.vue'
import ProductCard from '@/components/product-card/index.vue'
import { categoryTree, filterOptions } from '@/mock/category/categories'
import { productCards } from '@/mock/home/products'

const router = useRouter()

// 选中的分类
const selectedCategory = ref(categoryTree[0])
const selectedSubCategory = ref(null)

// 筛选条件
const selectedPrice = ref(null)
const selectedOrigin = ref(null)
const sortValue = ref('default')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(100)

// 显示的产品列表
const displayProducts = computed(() => {
  // 这里应该根据筛选条件和分页参数从后端获取数据
  // 现在使用 mock 数据
  return productCards
})

// 分类点击
const handleCategoryChange = (category) => {
  selectedCategory.value = category
  selectedSubCategory.value = null
  handleReset()
}

// 二级分类点击
const handleSubCategoryChange = (subCategory) => {
  selectedSubCategory.value = subCategory
  handleReset()
}

// 价格筛选
const handlePriceChange = (range) => {
  selectedPrice.value = range
}

// 产地筛选
const handleOriginChange = (origin) => {
  selectedOrigin.value = origin
}

// 排序变化
const handleSortChange = (value) => {
  sortValue.value = value
}

// 重置筛选
const handleReset = () => {
  selectedPrice.value = null
  selectedOrigin.value = null
  sortValue.value = 'default'
  currentPage.value = 1
}

// 产品点击
const handleProductClick = (product) => {
  // 在新标签页打开商品详情页
  const route = router.resolve({ name: 'ProductDetail', params: { id: product.id } })
  window.open(route.href, '_blank')
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
