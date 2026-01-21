<template>
  <div class="search-filter">
    <div class="filter-content">
      <!-- 排序选项 -->
      <div class="sort-options">
        <div
          v-for="option in sortOptions"
          :key="option.value"
          class="sort-option"
          :class="{ active: sortBy === option.value }"
          @click="handleSortChange(option.value)"
        >
          {{ option.label }}
          <i
            v-if="option.value.includes('price')"
            class="iconfont"
            :class="sortBy === option.value ? 
              (option.value === 'price_asc' ? 'icon-arrow-up' : 'icon-arrow-down') : 
              'icon-arrow-up'"
          ></i>
        </div>
      </div>
      
      <!-- 重置按钮 -->
      <div class="filter-actions">
        <el-button @click="handleReset">
          <i class="iconfont icon-shuaxin"></i>
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  sortOptions: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['sort-change', 'reset'])

const handleSortChange = (value) => {
  emit('sort-change', value)
}

const handleReset = () => {
  emit('reset')
}
</script>

<style lang="scss" scoped>
.search-filter {
  background-color: var(--bg-white);
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;

  .filter-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .sort-options {
      display: flex;
      align-items: center;
      gap: 10px;

      .sort-option {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        font-size: 13px;
        color: var(--text-secondary-color);
        background-color: #f5f7fa;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s;
        border: 1px solid #e4e7ed;
        white-space: nowrap;

        &:hover {
          color: var(--theme-primary-color);
          background-color: rgba(82, 196, 26, 0.08);
          border-color: var(--theme-primary-color);
        }

        &.active {
          color: #fff;
          background-color: var(--theme-primary-color);
          border-color: var(--theme-primary-color);
        }

        i {
          font-size: 11px;
        }
      }
    }

    .filter-actions {
      .el-button {
        height: 32px;
        padding: 0 12px;
        font-size: 13px;
        border-radius: 16px;

        i {
          margin-right: 4px;
          font-size: 13px;
        }
      }
    }
  }

  // 响应式适配
  @media screen and (max-width: 1024px) {
    .filter-content {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;

      .sort-options {
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .filter-actions {
        text-align: center;
      }
    }
  }

  @media screen and (max-width: 768px) {
    padding: 10px 12px;

    .filter-content {
      gap: 8px;

      .sort-options {
        gap: 6px;

        .sort-option {
          padding: 5px 10px;
          font-size: 12px;
        }
      }

      .filter-actions .el-button {
        height: 30px;
        font-size: 12px;
      }
    }
  }
}
</style>