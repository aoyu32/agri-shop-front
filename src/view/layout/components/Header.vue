<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 左侧：Logo + 平台名称 + 导航 -->
      <div class="header-left">
        <!-- Logo -->
        <div class="logo-wrapper">
          <img src="@/assets/vue.svg" alt="农购宝" class="logo-img" />
          <span class="platform-name">农购宝</span>
        </div>

        <!-- 导航栏 -->
        <nav class="nav-menu">
          <router-link
            v-for="item in navMenus"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            active-class="active"
          >
            <i class="iconfont" :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <!-- 右侧：搜索框 + 用户信息 -->
      <div class="header-right">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索农产品"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- 未登录状态 -->
        <div v-if="!userStore.userInfo.isLogin" class="auth-buttons">
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button @click="handleRegister">注册</el-button>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="user-info">
          <!-- 购物车（仅消费者显示） -->
          <div v-if="userStore.isConsumer" class="icon-item cart-icon" @click="goToCart">
            <el-badge :value="userStore.cartCount" :hidden="userStore.cartCount === 0">
              <i class="iconfont icon-gouwuche"></i>
            </el-badge>
          </div>

          <!-- 我的订单 -->
          <div class="icon-item" @click="goToOrders">
            <i class="iconfont icon-gongdan"></i>
            <span class="icon-text">订单</span>
          </div>

          <!-- 我的消息 -->
          <div class="icon-item" @click="goToMessages">
            <el-badge :value="userStore.unreadMessages" :hidden="userStore.unreadMessages === 0">
              <i class="iconfont icon-xiaoxi"></i>
            </el-badge>
            <span class="icon-text">消息</span>
          </div>

          <!-- 用户头像和下拉菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-avatar-wrapper">
              <el-avatar :src="userStore.userInfo.avatar" :size="36" />
              <span class="username">{{ userStore.userInfo.username }}</span>
              <i class="iconfont icon-arrow-down"></i>
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
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 搜索关键词
const searchKeyword = ref('')

// 基础导航菜单
const baseNavMenus = [
  { name: '首页', path: '/home', icon: 'icon-a-zhuyeshouye' },
  { name: '分类', path: '/category', icon: 'icon-caidan' },
  { name: 'AI咨询', path: '/ai-consult', icon: 'icon-a-zifuwenben' },
  { name: '社区', path: '/community', icon: 'icon-yonghuqunzu' }
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

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  console.log('搜索:', searchKeyword.value)
  // TODO: 实现搜索功能
}

// 登录
const handleLogin = () => {
  // 模拟登录 - 开发阶段
  userStore.mockLogin('consumer')
  ElMessage.success('登录成功')
}

// 注册
const handleRegister = () => {
  ElMessage.info('注册功能开发中')
}

// 跳转购物车
const goToCart = () => {
  ElMessage.info('购物车功能开发中')
}

// 跳转订单
const goToOrders = () => {
  ElMessage.info('订单功能开发中')
}

// 跳转消息
const goToMessages = () => {
  ElMessage.info('消息功能开发中')
}

// 下拉菜单命令处理
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中')
      break
    case 'shop':
      ElMessage.info('我的店铺功能开发中')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  height: var(--header-height);
  background-color: var(--bg-white);
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-container {
    max-width: 1400px;
    height: 100%;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 48px;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;

    .logo-img {
      width: 40px;
      height: 40px;
    }

    .platform-name {
      font-size: 24px;
      font-weight: bold;
      color: var(--theme-primary-color);
      font-family: 'ZCOOL XiaoWei', serif;
    }
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 32px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 16px;
      color: var(--text-primary-color);
      padding: 8px 0;
      position: relative;
      transition: color 0.3s;

      i {
        font-size: 18px;
      }

      &:hover {
        color: var(--theme-primary-color);
      }

      &.active {
        color: var(--theme-primary-color);
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--theme-primary-color);
          border-radius: 2px;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .search-box {
    width: 280px;

    :deep(.el-input__wrapper) {
      border-radius: 20px;
      background-color: var(--bg-gray);
      box-shadow: none;

      &:hover, &.is-focus {
        background-color: var(--bg-white);
        box-shadow: 0 0 0 1px var(--theme-primary-color) inset;
      }
    }
  }

  .auth-buttons {
    display: flex;
    gap: 12px;

    .el-button {
      border-radius: 20px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 20px;

    .icon-item {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      color: var(--text-secondary-color);
      transition: color 0.3s;

      i {
        font-size: 20px;
      }

      .icon-text {
        font-size: 14px;
      }

      &:hover {
        color: var(--theme-primary-color);
      }

      &.cart-icon i {
        font-size: 24px;
      }
    }

    .user-avatar-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 20px;
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--bg-gray);
      }

      .username {
        font-size: 14px;
        color: var(--text-primary-color);
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      i {
        font-size: 12px;
        color: var(--text-secondary-color);
      }
    }
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 16px;
  }
}
</style>