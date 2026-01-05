<template>
  <div class="product-detail">
    <div class="detail-tabs">
      <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </div>
    </div>

    <div class="detail-content">
      <div v-if="activeTab === 'detail'" class="markdown-content" v-html="renderedContent"></div>
      <div v-else-if="activeTab === 'comments'" class="comments-content">
        <slot name="comments"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const activeTab = ref('detail')

const tabs = [
  { key: 'detail', label: '图文详情' },
  { key: 'comments', label: '商品评价' }
]

// 使用marked渲染Markdown内容
const renderedContent = computed(() => {
  return marked(props.content)
})
</script>

<style lang="scss" scoped>
@use './ProductDetail.scss' as *;
</style>
