<template>
  <div class="carousel-container">
    <Swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="0"
      :loop="true"
      :autoplay="{
        delay: 3000,
        disableOnInteraction: false,
      }"
      :pagination="{ clickable: true }"
      :navigation="true"
      class="carousel-swiper"
    >
      <SwiperSlide v-for="(item, index) in banners" :key="index">
        <div class="carousel-item">
          <img :src="item.image" :alt="item.title" @error="handleImageError" />
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

defineProps({
  banners: {
    type: Array,
    default: () => []
  }
})

const modules = [Autoplay, Pagination, Navigation]

const handleImageError = (e) => {
  console.error('图片加载失败:', e.target.src)
  // 设置默认图片
  e.target.src = 'https://via.placeholder.com/800x400/52c41a/ffffff?text=农购宝'
}
</script>

<style lang="scss" scoped>
@use './index.scss'
</style>
