<template>
  <aside class="category-sidebar">
    <div class="sidebar-header">
      <i class="iconfont icon-fenlei"></i>
      <span>全部分类</span>
    </div>
    <div class="category-list">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        :class="{ active: selectedCategory?.id === category.id }"
      >
        <div class="category-main" @click="handleCategoryClick(category)">
          <i class="iconfont" :class="category.icon"></i>
          <span>{{ category.name }}</span>
          <i class="iconfont icon-arrow-right arrow"></i>
        </div>
        <!-- 二级分类 -->
        <div v-if="selectedCategory?.id === category.id" class="sub-category-list">
          <div
            v-for="sub in category.children"
            :key="sub.id"
            class="sub-category-item"
            :class="{ active: selectedSubCategory?.id === sub.id }"
            @click="handleSubCategoryClick(sub)"
          >
            {{ sub.name }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: Object,
    default: null
  },
  selectedSubCategory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['category-change', 'sub-category-change'])

const handleCategoryClick = (category) => {
  emit('category-change', category)
}

const handleSubCategoryClick = (subCategory) => {
  emit('sub-category-change', subCategory)
}
</script>

<style lang="scss" scoped>
@use './CategorySidebar.scss' as *;
</style>
