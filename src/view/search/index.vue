<template>
  <div class="search-page">
    <!-- 搜索框组件 -->
    <SearchBox
      v-model="searchKeyword"
      :has-searched="hasSearched"
      @search="handleSearch"
      @hot-keyword-click="handleHotKeywordClick"
    />

    <!-- 筛选和排序区域 -->
    <SearchFilter
      v-if="hasSearched"
      :sort-options="sortOptions"
      :sort-by="sortBy"
      @sort-change="handleSortChange"
      @reset="handleReset"
    />

    <!-- 商品列表区域 -->
    <div v-if="hasSearched" class="results-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="4" animated />
      </div>
      
      <!-- 空结果 -->
      <div v-else-if="products.length === 0" class="empty-result">
        <el-empty description="没有找到相关商品">
          <el-button type="primary" @click="handleReset">重置筛选条件</el-button>
        </el-empty>
      </div>
      
      <!-- 商品网格 -->
      <div v-else class="products-grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @click="handleProductClick"
        />
      </div>

      <!-- 分页 -->
      <div v-if="!loading && products.length > 0" class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :pager-count="7"
          background
          layout="prev, pager, next"
          :prev-icon="ArrowLeft"
          :next-icon="ArrowRight"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import SearchBox from './components/SearchBox.vue'
import SearchFilter from './components/SearchFilter.vue'
import ProductCard from '@/components/product-card/index.vue'
import { searchProducts } from '@/mock/search/search-results'

const route = useRoute()
const router = useRouter()

// 搜索参数
const searchKeyword = ref('')
const currentSearchKeyword = ref('')
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = ref(10)
const hasSearched = ref(false)

// 数据
const products = ref([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(false)

// 静态数据
const sortOptions = [
  { label: '销量优先', value: 'sales' },
  { label: '价格升序', value: 'price_asc' },
  { label: '价格降序', value: 'price_desc' },
  { label: '评分优先', value: 'rating' },
  { label: '最新上架', value: 'newest' }
]

// 执行搜索
const performSearch = async () => {
  loading.value = true
  hasSearched.value = true
  currentSearchKeyword.value = searchKeyword.value
  
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const params = {
      keyword: searchKeyword.value,
      sortBy: sortBy.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    const result = searchProducts(params)
    
    products.value = result.results
    total.value = result.total
    totalPages.value = result.totalPages
    
    // 更新URL参数
    updateUrlParams()
    
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

// 更新URL参数
const updateUrlParams = () => {
  const query = {}
  
  if (searchKeyword.value) query.q = searchKeyword.value
  if (sortBy.value !== 'default') query.sort = sortBy.value
  if (currentPage.value > 1) query.page = currentPage.value
  
  router.replace({ query })
}

// 从URL参数初始化搜索条件
const initFromUrlParams = () => {
  const query = route.query
  
  searchKeyword.value = query.q || ''
  sortBy.value = query.sort || 'default'
  currentPage.value = parseInt(query.page) || 1
  
  // 如果有搜索参数，标记为已搜索
  if (query.q) {
    hasSearched.value = true
    currentSearchKeyword.value = searchKeyword.value
  }
}

// 搜索处理
const handleSearch = (keyword) => {
  searchKeyword.value = keyword
  currentPage.value = 1
  performSearch()
}

// 事件处理
const handleHotKeywordClick = (keyword) => {
  searchKeyword.value = keyword
  currentPage.value = 1
  performSearch()
}

const handleSortChange = (sort) => {
  sortBy.value = sort
  currentPage.value = 1
  performSearch()
}

const handlePageChange = (page) => {
  currentPage.value = page
  performSearch()
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleReset = () => {
  sortBy.value = 'default'
  currentPage.value = 1
  // 不清空搜索关键词，保持搜索状态
  // 重新执行搜索，使用默认排序
  performSearch()
}

const handleProductClick = (product) => {
  // 在新标签页打开商品详情
  const productUrl = router.resolve(`/product/${product.id}`)
  window.open(productUrl.href, '_blank')
}

// 监听路由变化
watch(() => route.query, () => {
  if (route.name === 'Search') {
    initFromUrlParams()
    if (hasSearched.value) {
      performSearch()
    }
  }
}, { immediate: false })

onMounted(() => {
  initFromUrlParams()
  if (hasSearched.value) {
    performSearch()
  }
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>