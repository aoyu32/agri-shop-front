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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ShopInfo from './components/ShopInfo.vue'
import ProductImages from './components/ProductImages.vue'
import ProductInfo from './components/ProductInfo.vue'
import ProductDetail from './components/ProductDetail.vue'
import ProductComments from './components/ProductComments.vue'
import { productDetail, productComments } from '@/mock/product-detail/detail'
import { productCards } from '@/mock/home/products'

const route = useRoute()
const router = useRouter()

// 商品详情数据（实际应该根据route.params.id从API获取）
const product = ref(productDetail)

// 评论数据
const comments = ref(productComments)

// 推荐商品（从产品列表中随机选择）
const recommendProducts = ref(productCards.slice(0, 6))

// 根据路由参数加载商品数据
const loadProductData = () => {
  const productId = route.params.id
  console.log('加载商品ID:', productId)
  
  // 这里应该调用API获取商品详情
  // 现在使用mock数据
  product.value = productDetail
  comments.value = productComments
}

// 页面加载时获取数据
onMounted(() => {
  loadProductData()
})

// 加入购物车
const handleAddToCart = (data) => {
  console.log('加入购物车:', data)
  // 这里可以调用购物车相关的API
}

// 立即购买
const handleBuyNow = (data) => {
  console.log('立即购买:', data)
  // 这里可以跳转到结算页面
}

// 点击推荐商品
const handleProductClick = (item) => {
  // 跳转到对应的商品详情页
  router.push({ name: 'ProductDetail', params: { id: item.id } })
  // 重新加载数据
  loadProductData()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
