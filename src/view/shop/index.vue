<template>
  <div class="shop-page" v-if="shopInfo">
    <!-- 店铺信息卡片 -->
    <ShopHeader :shop-info="shopInfo" />

    <!-- 分类导航栏和农产品列表 -->
    <ShopProducts :categories="categories" :products="products" />
  </div>
  <div v-else class="loading-container">
    <el-empty description="店铺信息加载中..." />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ShopHeader from './components/ShopHeader.vue'
import ShopProducts from './components/ShopProducts.vue'
import { shopData, shopProducts, shopCategories } from '@/mock/shop/shop-data'

const route = useRoute()

// 店铺信息
const shopInfo = ref(null)

// 分类数据
const categories = ref([])

// 农产品数据
const products = ref([])

onMounted(() => {
  // 根据路由参数加载店铺数据
  const shopId = parseInt(route.params.id) || 1
  
  // 加载店铺信息
  shopInfo.value = shopData[shopId] || shopData[1]
  
  // 加载店铺分类
  categories.value = shopCategories[shopId] || shopCategories[1]
  
  // 加载店铺农产品
  products.value = shopProducts[shopId] || shopProducts[1]
})
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>


<style lang="scss" scoped>
@use './index.scss' as *;
</style>
