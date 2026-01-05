<template>
  <div class="product-images">
    <!-- 主图 -->
    <div class="main-image">
      <img :src="currentImage" :alt="productName" />
      
      <!-- 前后切换按钮 -->
      <div class="image-nav">
        <div 
          class="nav-btn prev-btn" 
          :class="{ disabled: currentIndex === 0 }"
          @click="prevImage"
        >
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div 
          class="nav-btn next-btn"
          :class="{ disabled: currentIndex === images.length - 1 }"
          @click="nextImage"
        >
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <!-- 图片指示器 -->
      <div class="image-indicator">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
    
    <!-- 缩略图列表 -->
    <div class="thumbnail-list">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail-item"
        :class="{ active: currentIndex === index }"
        @click="selectImage(index)"
      >
        <img :src="image" :alt="`${productName}-${index + 1}`" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  productName: {
    type: String,
    default: ''
  }
})

const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value])

const selectImage = (index) => {
  currentIndex.value = index
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}
</script>

<style lang="scss" scoped>
@use './ProductImages.scss' as *;
</style>
