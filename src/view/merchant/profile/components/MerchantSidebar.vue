<template>
  <div class="merchant-sidebar">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      @select="handleSelect"
    >
      <el-menu-item index="dashboard">
        <i class="iconfont icon-shuju"></i>
        <span>数据概览</span>
      </el-menu-item>
      
      <el-sub-menu index="orders">
        <template #title>
          <i class="iconfont icon-zhangdan"></i>
          <span>订单管理</span>
        </template>
        <el-menu-item index="order-pending">待发货</el-menu-item>
        <el-menu-item index="order-shipped">已发货</el-menu-item>
        <el-menu-item index="order-completed">已完成</el-menu-item>
        <el-menu-item index="order-all">所有订单</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="products">
        <template #title>
          <i class="iconfont icon-shangpin"></i>
          <span>农产品管理</span>
        </template>
        <el-menu-item index="product-list">农产品列表</el-menu-item>
        <el-menu-item index="category-manage">分类管理</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="reviews">
        <i class="iconfont icon-pinglun"></i>
        <span>评价管理</span>
      </el-menu-item>

      <el-menu-item index="shop-settings">
        <i class="iconfont icon-shezhi"></i>
        <span>店铺设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  activeMenu: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['menu-change'])

const handleSelect = (index) => {
  emit('menu-change', index)
}
</script>

<style lang="scss" scoped>
.merchant-sidebar {
  width: 220px;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  height: 100%;
  flex-shrink: 0;

  .sidebar-menu {
    border-right: none;
    padding: 16px 0;
    height: 100%;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 48px;
      line-height: 48px;
      padding-left: 24px !important;
      display: flex;
      align-items: center;
      gap: 12px;

      .iconfont {
        font-size: 18px;
      }

      span {
        font-size: 14px;
      }
    }

    :deep(.el-menu-item) {
      &.is-active {
        background: #e6f7ff;
        color: var(--theme-primary-color);
        border-right: 3px solid var(--theme-primary-color);
      }

      &:hover {
        background: #f5f5f5;
      }
    }

    :deep(.el-sub-menu) {
      .el-menu-item {
        padding-left: 48px !important;
        height: 40px;
        line-height: 40px;
      }
    }
  }
}

// 侧边栏滚动条样式
.merchant-sidebar::-webkit-scrollbar {
  width: 6px;
}

.merchant-sidebar::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;

  &:hover {
    background: #bfbfbf;
  }
}
</style>
