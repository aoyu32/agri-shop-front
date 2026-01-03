<template>
  <div class="chat-window">
    <!-- 左上角操作按钮 -->
    <div v-if="!sidebarVisible" class="top-actions">
      <div class="action-btn" @click="handleToggleSidebar" title="展开侧边栏">
        <i class="iconfont icon-zuochuangkou"></i>
      </div>
      <div class="action-btn" @click="handleNewChat" title="新对话">
        <i class="iconfont icon-xinjianduihua"></i>
      </div>
    </div>
    <!-- 有消息时显示消息列表 -->
    <div v-if="hasMessages" class="messages-container" ref="messagesContainerRef">
      <div class="messages-list">
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
        <!-- 加载中提示 -->
        <div v-if="isLoading" class="loading-message">
          <div class="loading-avatar">
            <i class="iconfont icon-damoxingjichengpingtai"></i>
          </div>
          <div class="loading-content">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新对话状态页面 -->
    <div v-else class="empty-chat">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="iconfont icon-damoxingjichengpingtai"></i>
        </div>
        <h3>欢迎使用AI咨询</h3>
        <p>我是您的农业智能助手，可以为您解答：</p>
        <ul class="feature-list">
          <li>
            <i class="iconfont icon-shangdian-1"></i>
            <span>农产品种植技术</span>
          </li>
          <li>
            <i class="iconfont icon-zhuzhuangtu"></i>
            <span>市场行情分析</span>
          </li>
          <li>
            <i class="iconfont icon-leidatu"></i>
            <span>病虫害防治</span>
          </li>
          <li>
            <i class="iconfont icon-phone"></i>
            <span>农业政策咨询</span>
          </li>
        </ul>
        <p class="empty-hint">在下方输入框输入您的问题，开始咨询吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  hasMessages: {
    type: Boolean,
    default: false
  },
  sidebarVisible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-sidebar', 'new-chat'])

const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleNewChat = () => {
  emit('new-chat')
}

const messagesContainerRef = ref(null)

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(() => props.messages.length, () => {
  scrollToBottom()
})

// 监听加载状态变化
watch(() => props.isLoading, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})
</script>

<style lang="scss" scoped>
@use './ChatWindow.scss' as *;
</style>

