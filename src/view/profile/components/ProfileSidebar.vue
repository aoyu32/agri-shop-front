<template>
  <div class="profile-sidebar">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      @select="handleSelect"
    >
      <!-- 购物车 -->
      <el-menu-item index="cart">
        <i class="iconfont icon-gouwuche"></i>
        <span>购物车</span>
      </el-menu-item>

      <!-- 我的订单 -->
      <el-sub-menu index="order">
        <template #title>
          <i class="iconfont icon-renwu"></i>
          <span>我的订单</span>
        </template>
        <el-menu-item index="order-all">所有订单</el-menu-item>
        <el-menu-item index="order-pending">待付款</el-menu-item>
        <el-menu-item index="order-paid">待发货</el-menu-item>
        <el-menu-item index="order-shipped">待收货</el-menu-item>
        <el-menu-item index="order-refund">退货退款</el-menu-item>
      </el-sub-menu>

      <!-- 我的评价 -->
      <el-sub-menu index="review">
        <template #title>
          <i class="iconfont icon-pinglun"></i>
          <span>我的评价</span>
        </template>
        <el-menu-item index="review-pending">待评价</el-menu-item>
        <el-menu-item index="review-done">已评价</el-menu-item>
      </el-sub-menu>

      <!-- 我的收藏 -->
      <el-menu-item index="favorite">
        <i class="iconfont icon-shoucang"></i>
        <span>我的收藏</span>
      </el-menu-item>

      <!-- 我的足迹 -->
      <el-menu-item index="footprint">
        <i class="iconfont icon-time"></i>
        <span>我的足迹</span>
      </el-menu-item>

      <!-- 收货地址 -->
      <el-menu-item index="address">
        <i class="iconfont icon-didian"></i>
        <span>收货地址</span>
      </el-menu-item>

      <!-- 账号安全 -->
      <el-sub-menu index="account">
        <template #title>
          <i class="iconfont icon-anquan"></i>
          <span>账号安全</span>
        </template>
        <el-menu-item index="profile-edit">修改信息</el-menu-item>
        <el-menu-item index="security-settings">安全设置</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  activeMenu: {
    type: String,
    default: 'cart'
  }
})

const emit = defineEmits(['menu-change'])

const handleSelect = (index) => {
  emit('menu-change', index)
}
</script>

<style lang="scss" scoped>
.profile-sidebar {
  width: 220px;
  background: var(--bg-white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .sidebar-menu {
    border: none;
    flex: 1;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 48px;
      line-height: 48px;
      padding-left: 20px !important;

      i {
        margin-right: 10px;
        font-size: 18px;
        color: var(--text-secondary-color);
      }

      &:hover {
        background-color: rgba(82, 196, 26, 0.05);
      }

      &.is-active {
        background-color: rgba(82, 196, 26, 0.1);
        color: var(--theme-primary-color);

        i {
          color: var(--theme-primary-color);
        }
      }
    }

    :deep(.el-sub-menu) {
      .el-menu-item {
        padding-left: 50px !important;
        height: 42px;
        line-height: 42px;
        font-size: 14px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .profile-sidebar {
    width: 100%;
  }
}
</style>
