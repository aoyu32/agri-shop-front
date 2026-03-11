<template>
  <div class="shop-header">
    <div class="shop-banner">
      <img :src="shopInfo.shop_banner" alt="店铺封面" class="banner-image" />
    </div>
    <div class="shop-main-info">
      <div class="shop-left">
        <img :src="shopInfo.shop_logo" alt="店铺logo" class="shop-logo" />
        <div class="shop-details">
          <h1 class="shop-name">{{ shopInfo.shop_name }}</h1>
          <div class="shop-desc">{{ shopInfo.description }}</div>
          <div class="shop-meta">
            <span class="meta-item">
              <i class="iconfont icon-dingwei"></i>
              {{ shopInfo.location }}
            </span>
            <span class="meta-item">
              <i class="iconfont icon-shijian"></i>
              开店时间：{{ shopInfo.open_time }}
            </span>
            <span v-if="merchantInfo" class="meta-item">
              <i class="iconfont icon-yonghu"></i>
              农户：{{ merchantInfo.nickname }}
            </span>
            <span v-if="merchantInfo" class="meta-item">
              <i class="iconfont icon-dianhua"></i>
              {{ merchantInfo.phone }}
            </span>
          </div>
        </div>
      </div>
      <div class="shop-right">
        <div class="shop-stats">
          <div class="stat-item">
            <div class="stat-value">{{ shopInfo.product_count }}</div>
            <div class="stat-label">农产品</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ shopInfo.sales_count }}</div>
            <div class="stat-label">销量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ shopInfo.rating }}</div>
            <div class="stat-label">评分</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  shopInfo: {
    type: Object,
    required: true
  },
  merchantInfo: {
    type: Object,
    default: null
  }
})
</script>

<style lang="scss" scoped>
@use './ShopHeader.scss' as *;
</style>
