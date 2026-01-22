<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>系统管理端</h1>
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </div>
    <div class="admin-content">
      <el-card>
        <h2>欢迎，{{ userStore.userInfo.username }}</h2>
        <p>这是系统管理端页面，您可以在这里管理整个平台的运营。</p>
        <div class="features">
          <el-button type="primary" size="large">用户管理</el-button>
          <el-button type="primary" size="large">商品审核</el-button>
          <el-button type="primary" size="large">订单管理</el-button>
          <el-button type="primary" size="large">系统设置</el-button>
          <el-button type="primary" size="large">数据分析</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/auth/login')
}
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  background: var(--app-layout-bg-color);

  .admin-header {
    background: var(--bg-white);
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h1 {
      font-size: 24px;
      color: var(--text-primary-color);
    }
  }

  .admin-content {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;

    .el-card {
      text-align: center;
      padding: 40px;

      h2 {
        font-size: 28px;
        color: var(--text-primary-color);
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: var(--text-secondary-color);
        margin-bottom: 40px;
      }

      .features {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
