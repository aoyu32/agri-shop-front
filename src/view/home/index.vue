<template>
  <div class="home-page">
    <!-- 顶部区域：轮播图 + 用户信息卡片 -->
    <div class="top-section">
      <div class="carousel-wrapper">
        <Carousel :banners="banners" />
      </div>
      <div class="user-info-wrapper">
        <UserInfoCard />
        <SeasonalProducts />
      </div>
    </div>

    <!-- 中部区域：三个列表 -->
    <div class="middle-section">
      <!-- 热销农产品 -->
      <ProductList
        title="热销农产品"
        :products="hotProducts"
        @click="handleProductClick"
      >
        <template #default="{ item }">
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-footer">
              <div class="item-tags">
                <span v-for="(tag, index) in item.tags.slice(0, 2)" :key="index" class="tag">
                  {{ tag }}
                </span>
              </div>
              <div class="item-sales">销量 {{ item.sales }}</div>
            </div>
          </div>
        </template>
      </ProductList>

      <!-- 促销农产品 -->
      <ProductList
        title="促销农产品"
        :products="promotionProducts"
        @click="handleProductClick"
      >
        <template #default="{ item }">
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-footer">
              <div class="item-tags">
                <span v-for="(tag, index) in item.tags.slice(0, 2)" :key="index" class="tag">
                  {{ tag }}
                </span>
              </div>
              <div class="item-price">
                <span class="discount-price">¥{{ item.price }}/{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </template>
      </ProductList>

      <!-- 农户推荐 -->
      <ProductList
        title="农户推荐"
        :products="farmerProducts"
        @click="handleFarmerClick"
      >
        <template #default="{ item }">
          <div class="farmer-avatar">
            <img :src="item.avatar" :alt="item.shopName" />
          </div>
          <div class="farmer-info">
            <div class="farmer-header">
              <span class="shop-name">{{ item.shopName }}</span>
              <span class="rating">⭐ {{ item.rating }}</span>
            </div>
            <div class="farmer-desc">{{ item.description }}</div>
            <div class="farmer-stats">
              <span>商品 {{ item.productCount }}</span>
              <span>销量 {{ item.sales }}</span>
            </div>
          </div>
        </template>
      </ProductList>
    </div>

    <!-- 分类栏 -->
    <div class="category-section">
      <CategoryBar :categories="categories" @change="handleCategoryChange" />
    </div>

    <!-- 产品卡片网格 -->
    <div class="products-grid-wrapper">
      <!-- 有商品时显示网格 -->
      <div v-if="displayProducts.length > 0" class="products-grid">
        <ProductCard
          v-for="product in displayProducts"
          :key="product.id"
          :product="product"
          @click="handleProductClick"
        />
      </div>
      
      <!-- 无商品时显示空状态 -->
      <div v-else class="empty-state">
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
        <p class="empty-desc">该分类下还没有商品，去看看其他分类吧~</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Carousel from '@/components/carousel/index.vue'
import UserInfoCard from './components/UserInfoCard.vue'
import SeasonalProducts from './components/SeasonalProducts.vue'
import ProductList from './components/ProductList.vue'
import CategoryBar from './components/CategoryBar.vue'
import ProductCard from '@/components/product-card/index.vue'

// 导入 API
import { getHotProducts, getPromotionProducts, getProductsByCategory, getAllProducts } from '@/apis/product'
import { getCategoryTree } from '@/apis/category'
import { getRecommendedShops } from '@/apis/shop'

// 导入 mock 数据（轮播图暂时保留 mock）
import { bannerList } from '@/mock/home/banner'

const router = useRouter()

// 轮播图数据
const banners = ref(bannerList)

// 热销农产品
const hotProducts = ref([])

// 促销农产品
const promotionProducts = ref([])

// 农户推荐
const farmerProducts = ref([])

// 分类数据
const categories = ref([])

// 产品卡片数据
const displayProducts = ref([])

// 当前选中的分类
const currentCategoryId = ref(null)

// 加载热销商品
const loadHotProducts = async () => {
  try {
    const res = await getHotProducts(6)
    if (res.code === 200) {
      hotProducts.value = res.data.list.map(item => ({
        id: item.id,
        name: item.name,
        image: item.main_image,
        sales: item.sales,
        tags: item.tags?.map(tag => tag.tag_name) || []
      }))
    }
  } catch (error) {
    console.error('加载热销商品失败:', error)
  }
}

// 加载促销商品
const loadPromotionProducts = async () => {
  try {
    const res = await getPromotionProducts(6)
    if (res.code === 200) {
      promotionProducts.value = res.data.list.map(item => ({
        id: item.id,
        name: item.name,
        image: item.main_image,
        price: item.price,
        unit: item.unit,
        tags: item.tags?.map(tag => tag.tag_name) || []
      }))
    }
  } catch (error) {
    console.error('加载促销商品失败:', error)
  }
}

// 加载推荐店铺
const loadRecommendedShops = async () => {
  try {
    const res = await getRecommendedShops({ limit: 6 })
    if (res.code === 200) {
      farmerProducts.value = res.data.list.map(item => ({
        shopId: item.id,
        shopName: item.shop_name,
        avatar: item.shop_logo || 'https://via.placeholder.com/80',
        rating: item.rating,
        description: item.description || '暂无简介',
        productCount: item.product_count,
        sales: item.sales_count
      }))
    }
  } catch (error) {
    console.error('加载推荐店铺失败:', error)
  }
}

// 加载分类树
const loadCategories = async () => {
  try {
    const res = await getCategoryTree()
    console.log('分类数据响应:', res)
    if (res.code === 200) {
      categories.value = res.data.list.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon
      }))
      console.log('处理后的分类数据:', categories.value)
      
      // 默认加载全部商品
      currentCategoryId.value = 0
      loadAllProducts()
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载全部商品
const loadAllProducts = async () => {
  try {
    const res = await getAllProducts({
      page: 1,
      page_size: 12
    })
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
    }
  } catch (error) {
    console.error('加载全部商品失败:', error)
  }
}

// 根据分类加载商品
const loadProductsByCategory = async (categoryId) => {
  try {
    const res = await getProductsByCategory({
      category_id: categoryId,
      page: 1,
      page_size: 12
    })
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
    }
  } catch (error) {
    console.error('加载分类商品失败:', error)
  }
}

// 事件处理
const handleProductClick = (product) => {
  // 在新标签页打开商品详情页
  const route = router.resolve({ name: 'ProductDetail', params: { id: product.id } })
  window.open(route.href, '_blank')
}

const handleFarmerClick = (farmer) => {
  // 在新标签页打开店铺页面
  const route = router.resolve({ name: 'Shop', params: { id: farmer.shopId } })
  window.open(route.href, '_blank')
}

const handleCategoryChange = (category) => {
  currentCategoryId.value = category.id
  if (category.id === 0) {
    // 加载全部商品
    loadAllProducts()
  } else {
    // 加载指定分类的商品
    loadProductsByCategory(category.id)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadHotProducts()
  loadPromotionProducts()
  loadRecommendedShops()
  loadCategories()
})
</script>

<style lang="scss" scoped>
@use './index.scss'
</style>
