<template>
  <div class="merchant-admin">
    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <div class="header-left">
        <div class="logo">
          <i class="iconfont icon-shangdian-2"></i>
          <span>农户店铺管理</span>
        </div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <el-avatar :src="userStore.userInfo.avatar" :size="32" />
          <span class="username">{{ userStore.userInfo.username }}</span>
        </div>
        <el-button text @click="goToHome" class="home-btn">
          <i class="iconfont icon-shouye"></i>
          返回首页
        </el-button>
        <el-button text type="danger" @click="handleLogout">
          <i class="iconfont icon-tuichu"></i>
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="admin-container">
      <!-- 左侧边栏 -->
      <MerchantSidebar :active-menu="activeMenu" @menu-change="handleMenuSelect" />

      <!-- 右侧内容区域 -->
      <div class="admin-content">
        <component :is="currentComponent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import MerchantSidebar from './components/MerchantSidebar.vue'
import Dashboard from './components/Dashboard.vue'
import MerchantOrderList from './components/MerchantOrderList.vue'
import ProductManagement from './components/ProductManagement.vue'
import CategoryManagement from './components/CategoryManagement.vue'
import ReviewManagement from './components/ReviewManagement.vue'
import ShopSettings from './components/ShopSettings.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = ref(route.query.menu || 'dashboard')

// 监听路由变化
watch(
  () => route.query.menu,
  (newMenu) => {
    if (newMenu) {
      activeMenu.value = newMenu
    }
  }
)

// 组件映射
const componentMap = {
  'dashboard': Dashboard,
  'order-pending': MerchantOrderList,
  'order-shipped': MerchantOrderList,
  'order-completed': MerchantOrderList,
  'order-all': MerchantOrderList,
  'product-list': ProductManagement,
  'product-add': ProductManagement,
  'category-manage': CategoryManagement,
  'reviews': ReviewManagement,
  'shop-settings': ShopSettings
}

// 当前显示的组件
const currentComponent = computed(() => {
  return componentMap[activeMenu.value] || Dashboard
})

// 菜单切换处理
const handleMenuSelect = (menu) => {
  activeMenu.value = menu
  router.push({ query: { menu } })
}

// 返回首页
const goToHome = () => {
  router.push('/home')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/home')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
