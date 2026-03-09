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
      <div v-if="displayProducts.length > 0" class="product-list">
        <ProductCard
          v-for="product in displayProducts"
          :key="product.id"
          :product="product"
          @click="handleProductClick"
        />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state">
        <div class="empty-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#f5f5f5"/>
            <path d="M40 55C40 52.2386 42.2386 50 45 50H75C77.7614 50 80 52.2386 80 55V75C80 77.7614 77.7614 80 75 80H45C42.2386 80 40 77.7614 40 75V55Z" fill="#d9d9d9"/>
            <circle cx="52" cy="62" r="4" fill="#bfbfbf"/>
            <circle cx="68" cy="62" r="4" fill="#bfbfbf"/>
            <path d="M52 70C52 70 56 74 60 74C64 74 68 70 68 70" stroke="#bfbfbf" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-text">暂无商品</p>
        <p class="empty-desc">该分类下还没有商品，试试调整筛选条件吧~</p>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-state">
        <el-icon class="is-loading" :size="40">
          <Loading />
        </el-icon>
        <p>加载中...</p>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Loading } from '@element-plus/icons-vue'
import CategorySidebar from './components/CategorySidebar.vue'
import FilterPanel from './components/FilterPanel.vue'
import ProductCard from '@/components/product-card/index.vue'
import { getCategoryTree } from '@/apis/category'
import { filterProducts, getOrigins } from '@/apis/product'

const router = useRouter()
const route = useRoute()

// 分类树数据
const categoryTree = ref([])

// 选中的分类
const selectedCategory = ref(null)
const selectedSubCategory = ref(null)

// 筛选选项
const filterOptions = ref({
  priceRanges: [
    { id: 1, label: '0-50元', min: 0, max: 50 },
    { id: 2, label: '50-100元', min: 50, max: 100 },
    { id: 3, label: '100-200元', min: 100, max: 200 },
    { id: 4, label: '200-500元', min: 200, max: 500 },
    { id: 5, label: '500元以上', min: 500, max: null }
  ],
  origins: [],
  sortOptions: [
    { id: 1, label: '综合排序', value: 'default' },
    { id: 2, label: '销量优先', value: 'sales' },
    { id: 3, label: '价格从低到高', value: 'price_asc' },
    { id: 4, label: '价格从高到低', value: 'price_desc' },
    { id: 5, label: '最新上架', value: 'newest' }
  ]
})

// 筛选条件
const selectedPrice = ref(null)
const selectedOrigin = ref(null)
const sortValue = ref('default')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 商品列表
const displayProducts = ref([])
const loading = ref(false)

// 加载分类树
const loadCategories = async () => {
  try {
    const res = await getCategoryTree()
    if (res.code === 200) {
      categoryTree.value = res.data.list
      
      // 从路由参数获取分类ID，或默认选择第一个分类
      const categoryId = route.query.categoryId
      if (categoryId) {
        const category = categoryTree.value.find(c => c.id === parseInt(categoryId))
        if (category) {
          selectedCategory.value = category
        }
      } else if (categoryTree.value.length > 0) {
        selectedCategory.value = categoryTree.value[0]
      }
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  }
}

// 加载产地列表
const loadOrigins = async () => {
  try {
    const res = await getOrigins()
    if (res.code === 200) {
      filterOptions.value.origins = res.data.list.map((origin, index) => ({
        id: index + 1,
        name: origin
      }))
    }
  } catch (error) {
    console.error('加载产地失败:', error)
  }
}

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: sortValue.value
    }

    // 分类筛选
    if (selectedSubCategory.value) {
      params.category_id = selectedSubCategory.value.id
    } else if (selectedCategory.value) {
      params.category_id = selectedCategory.value.id
    }

    // 价格筛选
    if (selectedPrice.value) {
      params.min_price = selectedPrice.value.min
      if (selectedPrice.value.max !== null) {
        params.max_price = selectedPrice.value.max
      }
    }

    // 产地筛选
    if (selectedOrigin.value) {
      params.origin = selectedOrigin.value.name
    }

    const res = await filterProducts(params)
    if (res.code === 200) {
      displayProducts.value = res.data.list.map(item => ({
        id: item.id,
        name: item.name,
        description: item.subtitle,
        image: item.main_image,
        price: item.price,
        originalPrice: item.original_price,
        unit: item.unit,
        sales: item.sales,
        origin: item.origin,
        shopName: item.shop?.shop_name || '未知店铺',
        tags: item.tags?.map(tag => tag.tag_name) || []
      }))
      total.value = res.data.total
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

// 分类点击
const handleCategoryChange = (category) => {
  selectedCategory.value = category
  selectedSubCategory.value = null
  currentPage.value = 1
  loadProducts()
}

// 二级分类点击
const handleSubCategoryChange = (subCategory) => {
  selectedSubCategory.value = subCategory
  currentPage.value = 1
  loadProducts()
}

// 价格筛选
const handlePriceChange = (range) => {
  selectedPrice.value = range
  currentPage.value = 1
  loadProducts()
}

// 产地筛选
const handleOriginChange = (origin) => {
  selectedOrigin.value = origin
  currentPage.value = 1
  loadProducts()
}

// 排序变化
const handleSortChange = (value) => {
  sortValue.value = value
  currentPage.value = 1
  loadProducts()
}

// 重置筛选
const handleReset = () => {
  selectedPrice.value = null
  selectedOrigin.value = null
  sortValue.value = 'default'
  currentPage.value = 1
  loadProducts()
}

// 产品点击
const handleProductClick = (product) => {
  const route = router.resolve({ name: 'ProductDetail', params: { id: product.id } })
  window.open(route.href, '_blank')
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 初始化
onMounted(async () => {
  await loadCategories()
  await loadOrigins()
  loadProducts()
})

// 监听路由参数变化
watch(() => route.query.categoryId, async (newCategoryId) => {
  if (newCategoryId && categoryTree.value.length > 0) {
    const category = categoryTree.value.find(c => c.id === parseInt(newCategoryId))
    if (category) {
      selectedCategory.value = category
      selectedSubCategory.value = null
      currentPage.value = 1
      loadProducts()
    }
  }
})
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
