<template>
  <div class="product-detail-page">
    <!-- 商品主要信息区域 -->
    <div class="product-main">
      <!-- 左侧：店铺信息和图片 -->
      <div class="product-left">
        <ShopInfo :shop="product.shop" />
        <ProductImages :images="product.images" :product-name="product.name" />
      </div>
      
      <!-- 右侧：商品信息 -->
      <div class="product-right">
        <ProductInfo
          :product="product"
          @add-to-cart="handleAddToCart"
          @buy-now="handleBuyNow"
        />
      </div>
    </div>

    <!-- 商品详情和评价 -->
    <div class="product-content">
      <!-- 详情和评价Tab -->
      <div class="content-main">
        <div class="section-card">
          <ProductDetail :content="product.detail">
            <template #comments>
              <ProductComments :comments="comments" />
            </template>
          </ProductDetail>
        </div>
      </div>

      <!-- 右侧：推荐商品 -->
      <div class="content-sidebar">
        <div class="section-card">
          <div class="section-title">
            <h3>相关推荐</h3>
          </div>
          <div class="recommend-list">
            <div
              v-for="item in recommendProducts"
              :key="item.id"
              class="recommend-item"
              @click="handleProductClick(item)"
            >
              <img :src="item.image" :alt="item.name" class="recommend-image" />
              <div class="recommend-info">
                <div class="recommend-name">{{ item.name }}</div>
                <div class="recommend-price">¥{{ item.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ShopInfo from './components/ShopInfo.vue'
import ProductImages from './components/ProductImages.vue'
import ProductInfo from './components/ProductInfo.vue'
import ProductDetail from './components/ProductDetail.vue'
import ProductComments from './components/ProductComments.vue'
import { getProductDetail, getRecommendProducts } from '@/apis/product'

const route = useRoute()
const router = useRouter()

// 商品详情数据
const product = ref({
  id: 0,
  name: '',
  subtitle: '',
  price: 0,
  originalPrice: 0,
  unit: '',
  sales: 0,
  stock: 0,
  tags: [],
  rating: 0,
  commentCount: 0,
  origin: '',
  images: [],
  specs: [],
  detail: '',
  shop: {
    id: 0,
    name: '',
    avatar: '',
    rating: 0,
    description: '',
    followers: 0,
    productCount: 0
  }
})

// 评论数据（暂时使用空数组，评价接口后续实现）
const comments = ref([])

// 推荐商品
const recommendProducts = ref([])

// 加载状态
const loading = ref(false)

// 加载商品详情
const loadProductData = async () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('商品ID不存在')
    return
  }

  loading.value = true
  try {
    const res = await getProductDetail(productId)
    if (res.code === 200) {
      const data = res.data.product
      console.log("产品详情：",data);
      
      
      // 映射商品数据
      product.value = {
        id: data.id,
        name: data.name,
        subtitle: data.subtitle || '',
        price: parseFloat(data.price),
        originalPrice: data.original_price ? parseFloat(data.original_price) : null,
        unit: data.unit || '',
        sales: data.sales || 0,
        stock: data.stock || 0,
        tags: data.tags?.map(tag => tag.tag_name) || [],
        rating: 4.8, // 暂时固定，后续从评价计算
        commentCount: 0, // 暂时固定，后续从评价统计
        origin: data.origin || '',
        images: data.images?.map(img => img.image_url) || [data.main_image],
        specs: data.specs && data.specs.length > 0 ? [{
          name: '规格',
          options: data.specs.map(spec => ({
            id: spec.id,
            label: spec.spec_label,
            price: parseFloat(spec.price_diff),
            stock: spec.stock
          }))
        }] : [],
        detail: data.detail || '暂无详情',
        shop: {
          id: data.shop?.id || 0,
          name: data.shop?.shop_name || '未知店铺',
          avatar: data.shop?.shop_logo || 'https://via.placeholder.com/80',
          rating: data.shop?.rating || 5.0,
          description: data.shop?.description || '',
          followers: data.shop?.followers_count || 0,
          productCount: data.shop?.product_count || 0
        }
      }

      // 加载推荐商品
      loadRecommendProducts(data.category_id, data.id)
    } else {
      ElMessage.error(res.message || '加载商品详情失败')
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    ElMessage.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

// 加载推荐商品
const loadRecommendProducts = async (categoryId, excludeId) => {
  try {
    const res = await getRecommendProducts({
      category_id: categoryId,
      exclude_id: excludeId,
      limit: 6
    })
    if (res.code === 200) {
      recommendProducts.value = res.data.list.map(item => ({
        id: item.id,
        name: item.name,
        image: item.main_image,
        price: item.price
      }))
    }
  } catch (error) {
    console.error('加载推荐商品失败:', error)
  }
}

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProductData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

// 页面加载时获取数据
onMounted(() => {
  loadProductData()
})

// 加入购物车
const handleAddToCart = (data) => {
  console.log('加入购物车:', data)
  ElMessage.success('已加入购物车')
  // TODO: 调用购物车API
}

// 立即购买
const handleBuyNow = (data) => {
  console.log('立即购买:', data)
  ElMessage.info('跳转到结算页面')
  // TODO: 跳转到结算页面
}

// 点击推荐商品
const handleProductClick = (item) => {
  router.push({ name: 'ProductDetail', params: { id: item.id } })
}
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
