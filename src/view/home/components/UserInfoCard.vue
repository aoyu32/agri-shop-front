<template>
  <div class="user-info-card">
    <!-- 上部分：用户信息卡片 -->
    <div class="user-info-section">
      <!-- 未登录状态 -->
      <div v-if="!userStore.userInfo.isLogin" class="login-section">
        <div class="avatar-placeholder">
          <i class="iconfont icon-yonghu"></i>
        </div>
        <div class="login-text">Hi，欢迎来到农购宝</div>
        <div class="login-actions">
          <el-button type="primary" size="small" @click="handleLogin">登录</el-button>
          <el-button size="small" @click="handleRegister">注册</el-button>
        </div>
      </div>

      <!-- 已登录 - 普通消费者 -->
      <div v-else-if="userStore.isConsumer" class="consumer-section">
        <div class="user-header">
          <div class="user-info">
            <el-avatar :src="userStore.userInfo.avatar" :size="45" />
            <div class="user-name">{{ userStore.userInfo.username }}</div>
          </div>
          <div class="header-buttons">
            <div class="address-btn" @click="handleLinkClick('favorite')">
              <i class="iconfont icon-shoucang"></i>
              <span>我的收藏</span>
            </div>
            <div class="address-btn" @click="handleLinkClick('address')">
              <i class="iconfont icon-didian"></i>
              <span>收货地址</span>
            </div>
          </div>
        </div>

        <div class="order-status">
          <div class="status-item" @click="handleOrderClick('shipped')">
            <el-badge :value="orderCounts.shipped" :max="99" :hidden="orderCounts.shipped === 0">
              <i class="iconfont icon-shopping"></i>
            </el-badge>
            <span>待收货</span>
          </div>
          <div class="status-item" @click="handleOrderClick('paid')">
            <el-badge :value="orderCounts.paid" :max="99" :hidden="orderCounts.paid === 0">
              <i class="iconfont icon-truck"></i>
            </el-badge>
            <span>待发货</span>
          </div>
          <div class="status-item" @click="handleOrderClick('pending')">
            <el-badge :value="orderCounts.pending" :max="99" :hidden="orderCounts.pending === 0">
              <i class="iconfont icon-zhifu"></i>
            </el-badge>
            <span>待付款</span>
          </div>
          <div class="status-item" @click="handleOrderClick('received')">
            <el-badge :value="orderCounts.received" :max="99" :hidden="orderCounts.received === 0">
              <i class="iconfont icon-pinglun"></i>
            </el-badge>
            <span>待评价</span>
          </div>
          <div class="status-item" @click="handleLinkClick('footprint')">
            <i class="iconfont icon-time"></i>
            <span>我的足迹</span>
          </div>
        </div>

        <!-- 日期信息 -->
        <div class="date-info">
          <div class="date-item">
            <span class="date-label">阳历：</span>
            <span class="date-value">{{ solarDate }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">阴历：</span>
            <span class="date-value">{{ lunarDate }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">星期：</span>
            <span class="date-value">{{ weekDay }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">季节：</span>
            <span class="date-value">{{ season }}</span>
          </div>
        </div>
      </div>

      <!-- 已登录 - 农户商户 -->
      <div v-else-if="userStore.isMerchant" class="merchant-section">
        <div class="user-header">
          <el-avatar :src="userStore.userInfo.avatar" :size="45" />
          <div class="user-name">{{ userStore.userInfo.username }}</div>
        </div>

        <div class="order-status">
          <div class="status-item" @click="handleMerchantClick('pending')">
            <el-badge :value="merchantStats.pending" :max="99" :hidden="merchantStats.pending === 0">
              <i class="iconfont icon-truck"></i>
            </el-badge>
            <span>待发货</span>
          </div>
          <div class="status-item" @click="handleMerchantClick('shipped')">
            <el-badge :value="merchantStats.shipped" :max="99" :hidden="merchantStats.shipped === 0">
              <i class="iconfont icon-shopping"></i>
            </el-badge>
            <span>已发货</span>
          </div>
          <div class="status-item" @click="handleMerchantClick('reviews')">
            <i class="iconfont icon-pinglun"></i>
            <span>我的评价</span>
          </div>
          <div class="status-item" @click="handleMerchantClick('orders')">
            <i class="iconfont icon-dingdan"></i>
            <span>所有订单</span>
          </div>
        </div>

        <div class="quick-links">
          <div class="link-item" @click="handleMerchantClick('products')">
            <i class="iconfont icon-shangpin"></i>
            <span>我的商品数</span>
            <span class="link-value">{{ merchantStats.products }}</span>
          </div>
        </div>

        <!-- 日期信息 -->
        <div class="date-info">
          <div class="date-item">
            <span class="date-label">阳历：</span>
            <span class="date-value">{{ solarDate }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">阴历：</span>
            <span class="date-value">{{ lunarDate }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">星期：</span>
            <span class="date-value">{{ weekDay }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">季节：</span>
            <span class="date-value">{{ season }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getLunarDate } from '@/utils/lunar'

const userStore = useUserStore()

// 消费者订单数量
const orderCounts = ref({
  pending: 2,
  paid: 1,
  shipped: 3,
  received: 5
})

// 商户统计数据
const merchantStats = ref({
  pending: 8,
  shipped: 12,
  products: 48
})

// 获取当前日期信息
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1
const day = now.getDate()

// 阳历日期
const solarDate = computed(() => {
  return `${year}年${month}月${day}日`
})

// 星期几
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const weekDay = computed(() => {
  return `星期${weekDays[now.getDay()]}`
})

// 季节
const season = computed(() => {
  const month = now.getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
})

// 阴历日期
const lunarDate = computed(() => {
  return getLunarDate(now)
})

const handleLogin = () => {
  ElMessage.info('跳转到登录页面')
}

const handleRegister = () => {
  ElMessage.info('跳转到注册页面')
}

const handleOrderClick = (status) => {
  ElMessage.info(`查看${status}订单`)
}

const handleLinkClick = (type) => {
  ElMessage.info(`跳转到${type}`)
}

const handleMerchantClick = (type) => {
  ElMessage.info(`跳转到商户${type}`)
}

</script>

<style lang="scss" scoped>
@use './UserInfoCard.scss' as *;
</style>
