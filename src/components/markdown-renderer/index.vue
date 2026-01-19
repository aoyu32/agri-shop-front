<template>
  <div class="markdown-renderer" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  return marked(props.content)
})
</script>

<style lang="scss" scoped>
.markdown-renderer {
  line-height: 1.6;
  color: var(--text-primary-color);

  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 16px 0 8px 0;
    font-weight: 600;
    color: var(--text-primary-color);
  }

  :deep(h1) { font-size: 24px; }
  :deep(h2) { font-size: 20px; }
  :deep(h3) { font-size: 18px; }
  :deep(h4) { font-size: 16px; }
  :deep(h5) { font-size: 14px; }
  :deep(h6) { font-size: 12px; }

  :deep(p) {
    margin: 8px 0;
    line-height: 1.6;
  }

  :deep(ul), :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(blockquote) {
    margin: 16px 0;
    padding: 8px 16px;
    border-left: 4px solid var(--theme-primary-color);
    background-color: var(--bg-gray);
    color: var(--text-secondary-color);
  }

  :deep(code) {
    padding: 2px 4px;
    background-color: var(--bg-gray);
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
  }

  :deep(pre) {
    margin: 16px 0;
    padding: 16px;
    background-color: var(--bg-gray);
    border-radius: 8px;
    overflow-x: auto;

    code {
      padding: 0;
      background: none;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
  }

  :deep(a) {
    color: var(--theme-primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;

    th, td {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      text-align: left;
    }

    th {
      background-color: var(--bg-gray);
      font-weight: 600;
    }
  }
}
</style>