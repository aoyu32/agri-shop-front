<template>
  <div class="shop-page" v-if="shopInfo">
    <!-- 店铺信息卡片 -->
    <ShopHeader :shop-info="shopInfo" :merchant-info="merchantInfo" />

    <!-- 分类导航栏和农产品列表 -->
    <ShopProducts 
      :categories="categories" 
      :products="products" 
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @category-change="handleCategoryChange"
      @page-change="handlePageChange"
    />
  </div>
  <div v-else-if="loading" class="loading-container">
    <el-empty description="店铺信息加载中..." />
  </div>
  <div v-else class="loading-container">
    <el-empty description="店铺不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ShopHeader from './components/ShopHeader.vue'
import ShopProducts from './components/ShopProducts.vue'
import { getShopPage } from '@/apis/shop'

const route = useRoute()

// 店铺信息
const shopInfo = ref(null)
const merchantInfo = ref(null)

// 分类数据
const categories = ref([])

// 农产品数据
const products = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 当前选中的分类
const selectedCategoryId = ref('')

// 加载状态
const loading = ref(false)

// 加载店铺数据
const loadShopData = async () => {
  loading.value = true
  try {
    const shopId = route.params.id || route.query.shop_id
    if (!shopId) {
      ElMessage.error('店铺ID不能为空')
      return
    }

    const res = await getShopPage({
      shop_id: shopId,
      category_id: selectedCategoryId.value,
      page: currentPage.value,
      page_size: pageSize.value
    })

    shopInfo.value = res.data.shop
    merchantInfo.value = res.data.merchant
    categories.value = res.data.categories
    products.value = res.data.products.list
    total.value = res.data.products.total
  } catch (error) {
    console.error('加载店铺数据失败:', error)
    ElMessage.error('加载店铺数据失败')
  } finally {
    loading.value = false
  }
}

// 分类切换
const handleCategoryChange = (categoryId) => {
  selectedCategoryId.value = categoryId
  currentPage.value = 1
  loadShopData()
}

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page
  loadShopData()
}

onMounted(() => {
  loadShopData()
})
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
