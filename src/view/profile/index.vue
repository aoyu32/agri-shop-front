<template>
  <div class="profile-page">
    <!-- 个人信息展示区域 -->
    <div class="profile-header">
      <div class="user-info">
        <el-avatar :src="userStore.userInfo.avatar" :size="80" />
        <div class="user-details">
          <h2 class="username">{{ userStore.userInfo.username }}</h2>
          <div class="user-meta">
            <div class="meta-item">
              <i class="iconfont icon-shouji"></i>
              <span>{{ userInfo.phone }}</span>
            </div>
            <div class="meta-item">
              <i class="iconfont icon-didian"></i>
              <span>{{ userInfo.city }}</span>
            </div>
          </div>
          <div class="user-bio">{{ userInfo.bio }}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-value">{{ stats.orders }}</div>
            <div class="stat-label">订单数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.favorites }}</div>
            <div class="stat-label">收藏数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.footprints }}</div>
            <div class="stat-label">足迹数</div>
          </div>
        </div>
        <el-button type="danger" @click="handleLogout">
          <i class="iconfont icon-tuichu"></i>
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="profile-content">
      <!-- 侧边栏 -->
      <ProfileSidebar :active-menu="activeMenu" @menu-change="handleMenuChange" />

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <component :is="currentComponent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import ProfileSidebar from './components/ProfileSidebar.vue'
import CartList from './components/CartList.vue'
import OrderList from './components/OrderList.vue'
import ReviewList from './components/ReviewList.vue'
import FavoriteList from './components/FavoriteList.vue'
import FootprintList from './components/FootprintList.vue'
import AddressList from './components/AddressList.vue'
import ProfileEdit from './components/ProfileEdit.vue'
import SecuritySettings from './components/SecuritySettings.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 用户详细信息
const userInfo = ref({
  phone: '138****0001',
  city: '北京市 朝阳区',
  bio: '热爱生活，喜欢购买新鲜的农产品，支持绿色健康的生活方式。'
})

// 用户统计数据
const stats = ref({
  orders: 28,
  favorites: 45,
  footprints: 156
})

// 当前激活的菜单
const activeMenu = ref(route.query.menu || 'cart')

// 组件映射
const componentMap = {
  cart: CartList,
  'order-all': OrderList,
  'order-pending': OrderList,
  'order-paid': OrderList,
  'order-shipped': OrderList,
  'order-refund': OrderList,
  'review-pending': ReviewList,
  'review-done': ReviewList,
  favorite: FavoriteList,
  footprint: FootprintList,
  address: AddressList,
  'profile-edit': ProfileEdit,
  'security-settings': SecuritySettings
}

// 当前显示的组件
const currentComponent = computed(() => {
  return componentMap[activeMenu.value] || CartList
})

// 菜单切换处理
const handleMenuChange = (menu) => {
  activeMenu.value = menu
  router.push({ query: { menu } })
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
