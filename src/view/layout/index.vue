<template>
  <div class="app-layout">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
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
  }

  // ==================== 响应式适配 ====================

  // 平板设备 (768px - 1024px)
  @media screen and (max-width: 1024px) {
    .main-content {
      padding: 20px 16px;
    }
  }

  // 小屏设备 (481px - 768px)
  @media screen and (max-width: 768px) {
    .main-content {
      padding: 16px 12px;
    }
  }

  // 手机设备 (最大 480px)
  @media screen and (max-width: 480px) {
    .main-content {
      padding: 12px 8px;
    }
  }
}
</style>