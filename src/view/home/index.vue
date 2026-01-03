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
        @click="handleProductClick"
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
              <span>关注 {{ item.followers }}</span>
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
    <div class="products-grid">
      <ProductCard
        v-for="product in displayProducts"
        :key="product.id"
        :product="product"
        @click="handleProductClick(product)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Carousel from '@/components/carousel/index.vue'
import UserInfoCard from './components/UserInfoCard.vue'
import SeasonalProducts from './components/SeasonalProducts.vue'
import ProductList from './components/ProductList.vue'
import CategoryBar from './components/CategoryBar.vue'
import ProductCard from '@/components/product-card/index.vue'

// 导入 mock 数据
import { bannerList } from '@/mock/home/banner'
import { hotProducts as hotData, promotionProducts as promotionData, farmerProducts as farmerData } from '@/mock/home/product-list'
import { categories as categoryData } from '@/mock/home/category'
import { productCards } from '@/mock/home/products'

// 轮播图数据
const banners = ref(bannerList)

// 热销农产品
const hotProducts = ref(hotData)

// 促销农产品
const promotionProducts = ref(promotionData)

// 农户推荐
const farmerProducts = ref(farmerData)

// 分类数据
const categories = ref(categoryData)

// 产品卡片数据
const displayProducts = ref(productCards)

// 事件处理
const handleProductClick = (product) => {
  ElMessage.info(`点击了产品: ${product.name || product.description}`)
}

const handleCategoryChange = (category) => {
  ElMessage.info(`切换分类: ${category.name}`)
}
</script>

<style lang="scss" scoped>
@use './index.scss'
</style>
