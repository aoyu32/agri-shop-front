<template>
  <div class="admin-sidebar">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      @select="handleSelect"
    >
      <el-menu-item index="dashboard">
        <i class="iconfont icon-shuju"></i>
        <span>数据统计</span>
      </el-menu-item>

      <el-menu-item index="users">
        <i class="iconfont icon-yonghu"></i>
        <span>用户管理</span>
      </el-menu-item>

      <el-menu-item index="merchants">
        <i class="iconfont icon-shangdian-2"></i>
        <span>店铺管理</span>
      </el-menu-item>

      <el-menu-item index="categories">
        <i class="iconfont icon-fenlei"></i>
        <span>分类管理</span>
      </el-menu-item>

      <el-menu-item index="community">
        <i class="iconfont icon-pinglun"></i>
        <span>社区管理</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
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
.admin-sidebar {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
}

.sidebar-menu {
  border-right: none;
  padding: 14px 0;
  height: 100%;

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    margin: 0 10px 8px;
    border-radius: 12px;
    color: var(--text-primary-color);
    display: flex;
    align-items: center;
    gap: 12px;

    .iconfont {
      font-size: 18px;
    }

    span {
      font-size: 14px;
      font-weight: 500;
    }

    &:hover {
      background: rgba(82, 196, 26, 0.08);
      color: var(--theme-primary-dark);
    }

    &.is-active {
      background: rgba(82, 196, 26, 0.12);
      color: var(--theme-primary-color);
      box-shadow: none;
    }
  }
}

.admin-sidebar::-webkit-scrollbar {
  width: 6px;
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;

  &:hover {
    background: #bfbfbf;
  }
}
</style>
