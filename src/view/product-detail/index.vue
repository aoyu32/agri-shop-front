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
import { useUserStore } from '@/store/modules/user'
import ShopInfo from './components/ShopInfo.vue'
import ProductImages from './components/ProductImages.vue'
import ProductInfo from './components/ProductInfo.vue'
import ProductDetail from './components/ProductDetail.vue'
import ProductComments from './components/ProductComments.vue'
import { getProductDetail, getRecommendProducts } from '@/apis/product'
import { getProductReviews } from '@/apis/review'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

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
    sales: 0,
    productCount: 0
  }
})

// 评论数据
const comments = ref([])

// 加载商品评价
const loadProductReviews = async (productId) => {
  try {
    const res = await getProductReviews({
      product_id: productId,
      page: 1,
      page_size: 100 // 获取所有评价，前端分页
    })
    
    if (res.code === 200) {
      // 映射评价数据到组件需要的格式
      comments.value = res.data.list.map(review => ({
        id: review.id,
        userName: review.user_name,
        avatar: review.user_avatar || 'https://via.placeholder.com/40',
        rating: review.rating,
        content: review.content,
        images: review.images || [],
        spec: '', // 后端暂未返回规格信息
        createTime: review.created_at,
        likes: review.likes_count || 0,
        isLiked: review.is_liked || false
      }))
    }
  } catch (error) {
    console.error('加载商品评价失败:', error)
    // 静默失败，不影响用户体验
  }
}

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
        rating: data.rating || 0,
        commentCount: data.review_count || 0,
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
          sales: data.shop?.sales_count || 0,
          productCount: data.shop?.product_count || 0
        }
      }

      // 加载推荐商品
      loadRecommendProducts(data.category_id, data.id)

      // 加载商品评价
      loadProductReviews(data.id)

      // 记录浏览足迹（仅登录用户）
      if (userStore.isLoggedIn) {
        recordFootprint(data.id)
      }
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

// 记录浏览足迹
const recordFootprint = async (productId) => {
  try {
    const { addFootprint } = await import('@/apis/footprint')
    await addFootprint({ product_id: productId })
  } catch (error) {
    // 静默失败，不影响用户体验
    console.error('记录足迹失败:', error)
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
const handleAddToCart = async (data) => {
  try {
    // 从选中的规格中找到对应的 spec_id
    let specId = null
    if (data.specs && Object.keys(data.specs).length > 0) {
      // data.specs 格式：{规格名: {id: 33, label: "3斤装", price: -8, stock: 350}}
      const specName = Object.keys(data.specs)[0]
      const selectedSpec = data.specs[specName]
      
      // 如果选中的规格是对象且包含 id，直接使用
      if (selectedSpec && typeof selectedSpec === 'object' && selectedSpec.id) {
        specId = selectedSpec.id
      }
    }

    console.log('添加到购物车:', {
      product_id: product.value.id,
      spec_id: specId,
      quantity: data.quantity,
      selectedSpecs: data.specs
    })

    const { addToCart } = await import('@/apis/cart')
    await addToCart({
      product_id: product.value.id,
      spec_id: specId,
      quantity: data.quantity
    })
    ElMessage.success('已加入购物车')
    
    // 更新购物车数量
    const { getCartCount } = await import('@/apis/cart')
    const res = await getCartCount()
    userStore.setCartCount(res.data.count)
  } catch (error) {
    ElMessage.error(error.message || '加入购物车失败')
  }
}

// 立即购买
const handleBuyNow = async (data) => {
  console.log('立即购买:', data)
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }

  try {
    // 从选中的规格中找到对应的 spec_id
    let specId = null
    if (data.specs && Object.keys(data.specs).length > 0) {
      const specName = Object.keys(data.specs)[0]
      const selectedSpec = data.specs[specName]
      
      if (selectedSpec && typeof selectedSpec === 'object' && selectedSpec.id) {
        specId = selectedSpec.id
      }
    }

    // 构建购买数据，存储到 sessionStorage
    const buyNowData = {
      product_id: product.value.id,
      product_name: product.value.name,
      product_image: product.value.images[0] || '',
      spec_id: specId,
      spec_label: specId ? data.specs[Object.keys(data.specs)[0]].label : null,
      price: parseFloat(data.specs && Object.keys(data.specs).length > 0 
        ? (product.value.price + data.specs[Object.keys(data.specs)[0]].price).toFixed(2)
        : product.value.price),
      quantity: data.quantity,
      shop_id: product.value.shop.id
    }

    // 存储到 sessionStorage
    sessionStorage.setItem('buyNowData', JSON.stringify(buyNowData))

    // 跳转到订单确认页面
    router.push({
      path: '/order/confirm',
      query: {
        type: 'buy_now'
      }
    })
  } catch (error) {
    console.error('立即购买失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 点击推荐商品
const handleProductClick = (item) => {
  router.push({ name: 'ProductDetail', params: { id: item.id } })
}
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
