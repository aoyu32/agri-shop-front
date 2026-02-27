<template>
  <div class="category-bar" ref="categoryBarRef">
    <div class="category-list" ref="categoryListRef">
      <!-- 全部选项 -->
      <div
        :class="['category-item', { active: activeId === 0 }]"
        @click="handleClick({ id: 0, name: '全部' })"
      >
        全部
      </div>
      
      <!-- 其他分类 -->
      <div
        v-for="category in categories"
        :key="category.id"
        :class="['category-item', { active: activeId === category.id }]"
        @click="handleClick(category)"
      >
        {{ category.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  defaultActive: {
    type: [String, Number],
    default: 0  // 默认选中"全部"
  }
})

const emit = defineEmits(['change'])

const activeId = ref(props.defaultActive)

const handleClick = (category) => {
  activeId.value = category.id
  emit('change', category)
}
</script>

<style lang="scss" scoped>
.category-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg-white);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
  overflow-y: hidden;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-gray);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
    
    &:hover {
      background: #999;
    }
  }

  .category-list {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .category-item {
    padding: 8px 20px;
    font-size: 14px;
    color: var(--text-primary-color);
    background-color: var(--bg-gray);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(82, 196, 26, 0.1);
      color: var(--theme-primary-color);
    }

    &.active {
      background-color: var(--theme-primary-color);
      color: #fff;
    }
  }
}
</style>
