<template>
  <div class="home-page">
    <h1>欢迎来到农购宝</h1>
    <p>智能农产品产销服务平台</p>
    
    <div class="demo-buttons">
      <el-button type="primary" @click="switchRole('consumer')">
        切换为消费者
      </el-button>
      <el-button type="success" @click="switchRole('merchant')">
        切换为商户
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const switchRole = (role) => {
  userStore.mockLogin(role)
  ElMessage.success(`已切换为${role === 'consumer' ? '消费者' : '商户'}角色`)
}
</script>

<style lang="scss" scoped>
.home-page {
  text-align: center;
  padding: 60px 20px;

  h1 {
    font-size: 48px;
    color: var(--theme-primary-color);
    margin-bottom: 16px;
  }

  p {
    font-size: 20px;
    color: var(--text-secondary-color);
    margin-bottom: 48px;
  }

  .demo-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}
</style>
