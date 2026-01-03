<template>
  <div class="app-layout">
    <Header />
    <main class="main-content" :class="{ 'ai-consult-page': isAiConsultPage }">
      <router-view />
    </main>
    <Footer v-if="!hideFooter" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const hideFooter = computed(() => route.meta.hideFooter === true)
const isAiConsultPage = computed(() => route.name === 'AiConsult')
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .main-content {
    flex: 1;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    
    // AI咨询页面特殊样式
    &.ai-consult-page {
      padding-top: 20px;
      padding-bottom: 20px;
    }
  }

  // ==================== 响应式适配 ====================

  // 平板设备 (768px - 1024px)
  @media screen and (max-width: 1024px) {
    .main-content {
      padding: 20px 16px;
      
      &.ai-consult-page {
        padding-top: 20px;
        padding-bottom: 20px;
      }
    }
  }

  // 小屏设备 (481px - 768px)
  @media screen and (max-width: 768px) {
    .main-content {
      padding: 16px 12px;
      
      &.ai-consult-page {
        padding-top: 20px;
        padding-bottom: 20px;
      }
    }
  }

  // 手机设备 (最大 480px)
  @media screen and (max-width: 480px) {
    .main-content {
      padding: 12px 8px;
      
      &.ai-consult-page {
        padding-top: 20px;
        padding-bottom: 20px;
      }
    }
  }
}
</style>