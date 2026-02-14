<template>
  <div class="shop-info">
    <div class="shop-avatar">
      <img :src="shop.avatar" :alt="shop.name" />
    </div>
    <div class="shop-details">
      <div class="shop-name">{{ shop.name }}</div>
      <div class="shop-stats">
        <span>⭐ {{ shop.rating }}分</span>
        <span>{{ shop.followers }}关注</span>
        <span>{{ shop.productCount }}商品</span>
      </div>
    </div>
    <el-button type="primary" plain size="small" @click="goToShop">进店逛逛</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  shop: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToShop = () => {
  router.push({ name: 'Shop', params: { id: props.shop.id } })
}
</script>

<style lang="scss" scoped>
@use './ShopInfo.scss' as *;
</style>
