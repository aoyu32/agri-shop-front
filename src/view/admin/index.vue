<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="header-left">
        <div class="logo">
          <img src="@/assets/logo/logo.jpg" alt="农购宝管理后台" />
          <span>农购宝管理后台</span>
        </div>
      </div>

      <div class="header-right">
        <el-button text class="logout-btn" @click="handleLogout">
          <i class="iconfont icon-tuichu"></i>
          退出登录
        </el-button>

        <div class="admin-user">
          <el-avatar :src="userStore.userInfo.avatar" :size="34">
            {{ displayName.slice(0, 1) }}
          </el-avatar>
          <div class="user-meta">
            <span class="username">{{ displayName }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="admin-shell">
      <aside class="admin-sidebar">
        <AdminSidebar :active-menu="activeMenu" @menu-change="handleMenuChange" />
      </aside>

      <section class="admin-main">
        <main class="admin-content">
          <component :is="currentComponent" />
        </main>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminDashboard from './dashboard/index.vue'
import AdminUsers from './users/index.vue'
import AdminMerchants from './merchants/index.vue'
import AdminCategories from './categories/index.vue'
import AdminCommunity from './community/index.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const defaultMenu = 'dashboard'
const activeMenu = ref(typeof route.query.menu === 'string' ? route.query.menu : defaultMenu)

watch(
  () => route.query.menu,
  (menu) => {
    activeMenu.value = typeof menu === 'string' && menu ? menu : defaultMenu
  }
)

const componentMap = {
  dashboard: AdminDashboard,
  users: AdminUsers,
  merchants: AdminMerchants,
  categories: AdminCategories,
  community: AdminCommunity
}

const currentComponent = computed(() => componentMap[activeMenu.value] || AdminDashboard)
const displayName = computed(() => userStore.userInfo.nickname || userStore.userInfo.username || '系统管理员')

const handleMenuChange = (menu) => {
  activeMenu.value = menu
  router.push({ path: '/admin', query: { menu } })
}

const handleLogout = async () => {
  await userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/auth/login')
}
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
