<template>
  <div class="category-bar" ref="categoryBarRef">
    <div class="category-list" ref="categoryListRef">
      <div
        v-for="(category, index) in displayCategories"
        :key="category.id"
        :class="['category-item', { active: activeId === category.id, hidden: index >= visibleCount }]"
        @click="handleClick(category)"
      >
        {{ category.name }}
      </div>
    </div>
    
    <!-- 更多按钮 -->
    <el-dropdown 
      v-if="hiddenCategories.length > 0" 
      trigger="click"
      @command="handleDropdownClick"
    >
      <div class="more-btn">
        更多
        <i class="iconfont icon-arrow-down"></i>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="category in hiddenCategories"
            :key="category.id"
            :command="category"
            :class="{ 'is-active': activeId === category.id }"
          >
            {{ category.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  defaultActive: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['change'])

const categoryBarRef = ref(null)
const categoryListRef = ref(null)
const activeId = ref(props.defaultActive || (props.categories[0]?.id))
const visibleCount = ref(props.categories.length)

// 始终渲染所有分类项用于计算，但隐藏超出的
const displayCategories = computed(() => {
  return props.categories
})

// 隐藏的分类
const hiddenCategories = computed(() => {
  return props.categories.slice(visibleCount.value)
})

const handleClick = (category) => {
  activeId.value = category.id
  emit('change', category)
}

const handleDropdownClick = (category) => {
  activeId.value = category.id
  emit('change', category)
}

// 计算可见的分类数量
const calculateVisibleCount = async () => {
  if (!categoryBarRef.value || !categoryListRef.value) return
  
  await nextTick()
  
  const containerWidth = categoryBarRef.value.offsetWidth
  const moreBtnWidth = 80 // 更多按钮的宽度
  const gap = 12 // 分类项之间的间距
  let totalWidth = 0
  let count = 0
  
  // 遍历所有分类项，计算可以显示多少个
  const items = categoryListRef.value?.children || []
  
  for (let i = 0; i < items.length; i++) {
    const itemWidth = items[i].offsetWidth
    const needWidth = totalWidth + itemWidth + (i > 0 ? gap : 0)
    
    // 如果不是最后一个分类，需要预留更多按钮的空间
    const availableWidth = i < props.categories.length - 1 
      ? containerWidth - moreBtnWidth - gap 
      : containerWidth
    
    if (needWidth > availableWidth) {
      break
    }
    
    totalWidth = needWidth
    count++
  }
  
  // 至少显示一个分类
  visibleCount.value = Math.max(1, count)
}

// 防抖函数
let resizeTimer = null
const handleResize = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
  resizeTimer = setTimeout(() => {
    calculateVisibleCount()
  }, 150)
}

onMounted(() => {
  // 初始计算
  setTimeout(() => {
    calculateVisibleCount()
  }, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
})
</script>

<style lang="scss" scoped>
.category-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--bg-white);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  .category-list {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
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

    &.hidden {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
    }

    &:hover {
      background-color: rgba(82, 196, 26, 0.1);
      color: var(--theme-primary-color);
    }

    &.active {
      background-color: var(--theme-primary-color);
      color: #fff;
    }
  }

  .more-btn {
    padding: 8px 16px;
    font-size: 14px;
    color: var(--text-primary-color);
    background-color: var(--bg-gray);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    i {
      font-size: 12px;
    }

    &:hover {
      background-color: rgba(82, 196, 26, 0.1);
      color: var(--theme-primary-color);
    }
  }
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--theme-primary-color);
  background-color: rgba(82, 196, 26, 0.1);
}
</style>
