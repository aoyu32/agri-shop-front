<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-left">
        <div class="logo-wrapper">
          <img src="@/assets/logo/logo.jpg" alt="农购宝" class="logo-img" />
          <span class="platform-name">农购宝</span>
        </div>

        <!-- 菜单按钮 -->
        <div class="mobile-menu-btn" @click="showMobileMenu = true">
          <i class="iconfont icon-menu-unfold"></i>
        </div>

        <!-- 导航栏 -->
        <nav class="nav-menu desktop-nav">
          <router-link v-for="item in navMenus" :key="item.path" :to="item.path" class="nav-item" active-class="active">
            <i class="iconfont" :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <div class="header-right">
        <!-- 桌面端搜索框 -->
        <div v-if="!isSearchPage" class="search-box desktop-search">
          <el-input v-model="searchKeyword" placeholder="搜索农产品" :prefix-icon="Search" clearable
            @keyup.enter="handleSearch" />
        </div>

        <!-- 移动端搜索图标 -->
        <div v-if="!isSearchPage" class="mobile-search-icon" @click="showMobileSearch = true">
          <i class="iconfont icon-sousuo"></i>
        </div>

        <!-- 未登录状态 -->
        <div v-if="!userStore.userInfo.isLogin" class="auth-section">
          <el-avatar :size="36" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          <div class="auth-links">
            <span class="auth-link" @click="handleLogin">登录</span>
            <div class="auth-divider"></div>
            <span class="auth-link" @click="handleRegister">注册</span>
          </div>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="user-info">
          <div v-if="userStore.isConsumer" class="icon-item cart-item" @click="goToCart">
            <el-badge :value="100" :hidden="userStore.cartCount === 0" :max="99">
              <i class="iconfont icon-gouwuche"></i>
            </el-badge>
            <span class="icon-text">购物车</span>
          </div>

          <div class="icon-item" @click="goToOrders">
            <i class="iconfont icon-renwu"></i>
            <span class="icon-text">订单</span>
          </div>

          <div class="icon-item message-item" @click="goToMessages">
            <el-badge :value="userStore.unreadMessages" :hidden="userStore.unreadMessages === 0" :max="99">
              <i class="iconfont icon-xiaoxi"></i>
            </el-badge>
            <span class="icon-text">消息</span>
          </div>

          <el-dropdown trigger="hover" @command="handleCommand">
            <div class="user-avatar-wrapper">
              <el-avatar :src="userStore.userInfo.avatar" :size="36" />
              <span class="username">{{ userStore.userInfo.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <i class="iconfont icon-yonghu"></i>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isMerchant" command="shop">
                  <i class="iconfont icon-building-store"></i>
                  我的店铺
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <i class="iconfont icon-shezhi"></i>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <i class="iconfont icon-tuichu"></i>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 移动端导航抽屉 -->
    <el-drawer v-model="showMobileMenu" direction="ltr" :size="280" title="导航菜单">
      <nav class="mobile-nav-menu">
        <router-link v-for="item in navMenus" :key="item.path" :to="item.path" class="mobile-nav-item"
          active-class="active" @click="showMobileMenu = false">
          <i class="iconfont" :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
    </el-drawer>

    <!-- 移动端搜索对话框 -->
    <el-dialog v-model="showMobileSearch" title="搜索" width="90%" :close-on-click-modal="true">
      <el-input v-model="searchKeyword" placeholder="搜索农产品" :prefix-icon="Search" clearable size="large"
        @keyup.enter="handleMobileSearch" autofocus />
      <template #footer>
        <el-button @click="showMobileSearch = false">取消</el-button>
        <el-button type="primary" @click="handleMobileSearch">搜索</el-button>
      </template>
    </el-dialog>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 判断是否是搜索页面
const isSearchPage = computed(() => route.name === 'Search')

// 搜索关键词
const searchKeyword = ref('')

// 移动端菜单和搜索状态
const showMobileMenu = ref(false)
const showMobileSearch = ref(false)

// 基础导航菜单
const baseNavMenus = [
  { name: '首页', path: '/home', icon: 'icon-shangdian-1' },
  { name: '分类', path: '/category', icon: 'icon-app-store' },
  { name: 'AI咨询', path: '/ai-consult', icon: 'icon-damoxingjichengpingtai' },
  { name: '社区', path: '/community', icon: 'icon-diqiu' }
]

// 商户专属导航
const merchantNavMenus = [
  { name: '行情预测', path: '/market-forecast', icon: 'icon-zhuzhuangtu' }
]

// 根据用户角色动态生成导航菜单
const navMenus = computed(() => {
  if (userStore.isMerchant) {
    return [...baseNavMenus, ...merchantNavMenus]
  }
  return baseNavMenus
})

// 监听窗口大小变化，自动关闭移动端菜单
const handleResize = () => {
  if (window.innerWidth > 768) {
    showMobileMenu.value = false
    showMobileSearch.value = false
  }
}

// 组件挂载时添加监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  // 在新标签页打开搜索页面
  const searchUrl = router.resolve({
    name: 'Search',
    query: { q: searchKeyword.value.trim() }
  })
  window.open(searchUrl.href, '_blank')
  
  // 清空搜索框
  searchKeyword.value = ''
}

// 移动端搜索处理
const handleMobileSearch = () => {
  handleSearch()
  showMobileSearch.value = false
}

// 登录
const handleLogin = () => {
  router.push('/auth/login')
}

// 注册
const handleRegister = () => {
  router.push('/auth/register')
}

// 跳转购物车
const goToCart = () => {
  router.push('/profile?menu=cart')
}

// 跳转订单
const goToOrders = () => {
  router.push('/profile?menu=order-all')
}

// 跳转消息
const goToMessages = () => {
  ElMessage.info('消息功能开发中')
}

// 下拉菜单命令处理
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'shop':
      if (userStore.userInfo.role === 'merchant') {
        router.push('/merchant')
      } else {
        ElMessage.info('我的店铺功能开发中')
      }
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/home')
      break
  }
}
</script>

<style lang="scss" scoped>
@use './Header.scss' as *;
</style>