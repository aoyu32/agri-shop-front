<template>
  <div class="ai-consult-page">
    <!-- 左侧：聊天记录侧边栏 -->
    <ChatSidebar
      v-show="sidebarVisible"
      :chat-list="chatList"
      :active-chat-id="activeChatId"
      :class="{ 'sidebar-hidden': !sidebarVisible }"
      @new-chat="handleNewChat"
      @select-chat="handleSelectChat"
      @delete-chat="handleDeleteChat"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- 右侧：聊天窗口和输入框 -->
    <div class="chat-container" :class="{ 'full-width': !sidebarVisible }">
      <ChatWindow
        :messages="currentMessages"
        :is-loading="isLoading"
        :has-messages="currentMessages.length > 0"
        :sidebar-visible="sidebarVisible"
        @toggle-sidebar="toggleSidebar"
        @new-chat="handleNewChat"
      />
      <ChatInput
        :disabled="isLoading"
        @send="handleSendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatWindow from './components/ChatWindow.vue'
import ChatInput from './components/ChatInput.vue'
import { chatListData } from '@/mock/ai-consult/chat-list'
import { messagesData, generateMockResponse } from '@/mock/ai-consult/messages'

// 聊天列表
const chatList = ref([...chatListData])

// 当前选中的聊天ID
const activeChatId = ref(null)

// 当前聊天的消息列表
const messagesMap = ref({ ...messagesData })

// 当前显示的消息列表
const currentMessages = computed(() => {
  if (!activeChatId.value) {
    return []
  }
  return messagesMap.value[activeChatId.value] || []
})

// 是否正在加载
const isLoading = ref(false)

// 侧边栏是否可见
const sidebarVisible = ref(true)

// 切换侧边栏显示/隐藏
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

// 创建新对话
const handleNewChat = () => {
  activeChatId.value = null
}

// 选择聊天
const handleSelectChat = (chatId) => {
  activeChatId.value = chatId
}

// 删除聊天
const handleDeleteChat = (chatId) => {
  const index = chatList.value.findIndex(chat => chat.id === chatId)
  if (index > -1) {
    chatList.value.splice(index, 1)
    delete messagesMap.value[chatId]
    if (activeChatId.value === chatId) {
      activeChatId.value = null
    }
  }
}

// 发送消息
const handleSendMessage = async (data) => {
  const content = data.content || ''
  const images = data.images || []
  
  if (!content.trim() && images.length === 0) {
    return
  }

  // 如果是新对话，创建新的聊天记录
  if (!activeChatId.value) {
    const newChatId = Date.now().toString()
    activeChatId.value = newChatId
    const titleText = content || (images.length > 0 ? `[图片] ${images.length}张` : '新对话')
    chatList.value.unshift({
      id: newChatId,
      title: titleText.length > 20 ? titleText.substring(0, 20) + '...' : titleText,
      time: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      preview: content || (images.length > 0 ? `[图片] ${images.length}张` : '')
    })
    messagesMap.value[newChatId] = []
  }

  // 添加用户消息
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: content,
    images: images.map(img => ({
      name: img.name,
      url: img.url
    })),
    time: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  messagesMap.value[activeChatId.value].push(userMessage)

  // 更新聊天列表的预览和时间
  const currentChat = chatList.value.find(chat => chat.id === activeChatId.value)
  if (currentChat) {
    const previewText = content || (images.length > 0 ? `[图片] ${images.length}张` : '')
    currentChat.preview = previewText.length > 30 ? previewText.substring(0, 30) + '...' : previewText
    currentChat.time = userMessage.time
  }

  // 模拟AI回复
  isLoading.value = true
  setTimeout(() => {
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateMockResponse(content || '查看图片'),
      time: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    messagesMap.value[activeChatId.value].push(assistantMessage)
    isLoading.value = false

    // 更新聊天标题（如果还是默认标题）
    if (currentChat) {
      const titleText = content || (images.length > 0 ? `[图片] ${images.length}张` : '')
      const defaultTitle = titleText.length > 20 ? titleText.substring(0, 20) + '...' : titleText
      if (currentChat.title === defaultTitle) {
        currentChat.title = defaultTitle
      }
    }
  }, 1500)
}


onMounted(() => {
  // 可以在这里加载历史聊天记录
})
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
