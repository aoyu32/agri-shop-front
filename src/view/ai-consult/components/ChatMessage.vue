<template>
  <div class="chat-message" :class="{ 'is-user': message.role === 'user', 'is-assistant': message.role === 'assistant' }">
    <div class="message-avatar">
      <div v-if="message.role === 'user'" class="user-avatar">
        <i class="iconfont icon-yonghu"></i>
      </div>
      <div v-else class="assistant-avatar">
        <i class="iconfont icon-damoxingjichengpingtai"></i>
      </div>
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <!-- 图片展示 -->
        <div v-if="message.images && message.images.length > 0" class="message-images">
          <div
            v-for="(image, index) in message.images"
            :key="index"
            class="image-item"
            @click="previewImage(image.url)"
          >
            <img :src="image.url" :alt="image.name" />
          </div>
        </div>
        <!-- 文本内容 -->
        <div v-if="message.role === 'assistant'" class="markdown-content" v-html="renderedContent"></div>
        <div v-else-if="message.content" class="text-content">{{ message.content }}</div>
      </div>
      <div class="message-time">{{ message.time }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

// 配置marked选项
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // GitHub风格的Markdown
  headerIds: false, // 禁用标题ID（避免XSS风险）
  mangle: false // 禁用邮箱混淆
})

// 渲染markdown内容
const renderedContent = computed(() => {
  if (props.message.role === 'assistant' && props.message.content) {
    return marked.parse(props.message.content)
  }
  return props.message.content || ''
})

// 预览图片
const previewImage = (url) => {
  // 在新窗口打开图片预览
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
@use './ChatMessage.scss' as *;
</style>

