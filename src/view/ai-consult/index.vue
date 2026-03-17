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
        ref="chatWindowRef"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatWindow from './components/ChatWindow.vue'
import ChatInput from './components/ChatInput.vue'
import { getConversations, getMessages, sendMessageStream, deleteConversation } from '@/apis/ai-consult'

// 聊天列表
const chatList = ref([])

// ChatWindow 引用
const chatWindowRef = ref(null)

// 当前选中的聊天ID
const activeChatId = ref(null)

// 当前聊天的消息列表
const messagesMap = ref({})

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

// 加载会话列表
const loadConversations = async () => {
  try {
    const res = await getConversations({ page: 1, page_size: 100 })
    if (res.code === 200) {
      chatList.value = res.data.list.map(item => {
        let preview = ''
        if (item.last_message) {
          // 尝试解析为 JSON（图文混合消息）
          try {
            const parsed = JSON.parse(item.last_message)
            if (parsed.text || parsed.images) {
              const textPart = parsed.text || ''
              const imagePart = parsed.images && parsed.images.length > 0 ? `[图片${parsed.images.length}张]` : ''
              preview = textPart ? textPart : imagePart
            } else {
              preview = item.last_message
            }
          } catch {
            // 不是 JSON，直接使用原文本
            preview = item.last_message
          }
          
          if (preview.length > 30) {
            preview = preview.substring(0, 30) + '...'
          }
        }
        
        return {
          id: item.id,
          title: item.title,
          time: item.last_message_time || item.created_at,
          preview
        }
      })
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
  }
}

// 加载会话消息
const loadMessages = async (conversationId) => {
  try {
    const res = await getMessages({ conversation_id: conversationId, page: 1, page_size: 100 })
    if (res.code === 200) {
      messagesMap.value[conversationId] = res.data.messages.map(msg => {
        // 处理图文混合消息
        if (msg.content_type === 'mixed') {
          return {
            id: msg.id,
            role: msg.role,
            content: msg.text || '',
            images: (msg.images || []).map(url => ({ url })),
            time: msg.created_at
          }
        }
        // 处理纯文本消息
        return {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          images: [],
          time: msg.created_at
        }
      })
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    ElMessage.error('加载消息失败')
  }
}

// 创建新对话
const handleNewChat = () => {
  activeChatId.value = null
}

// 选择聊天
const handleSelectChat = async (chatId) => {
  activeChatId.value = chatId
  
  // 如果还没有加载过这个会话的消息，则加载
  if (!messagesMap.value[chatId]) {
    await loadMessages(chatId)
  }
}

// 删除聊天
const handleDeleteChat = async (chatId) => {
  try {
    const res = await deleteConversation({ id: chatId })
    if (res.code === 200) {
      const index = chatList.value.findIndex(chat => chat.id === chatId)
      if (index > -1) {
        chatList.value.splice(index, 1)
        delete messagesMap.value[chatId]
        if (activeChatId.value === chatId) {
          activeChatId.value = null
        }
      }
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除会话失败:', error)
    ElMessage.error('删除失败')
  }
}

// 发送消息（使用流式输出）
const handleSendMessage = async (data) => {
  const content = data.content || ''
  const images = data.images || [] // 现在是 URL 数组
  
  if (!content.trim() && images.length === 0) {
    return
  }

  // 临时显示用户消息
  const tempUserMessage = {
    id: 'temp-user-' + Date.now(),
    role: 'user',
    content: content,
    images: images.map(url => ({
      name: '',
      url: url
    })),
    time: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 如果是新对话，创建临时会话
  if (!activeChatId.value) {
    const tempChatId = 'temp-' + Date.now()
    activeChatId.value = tempChatId
    const titleText = content || (images.length > 0 ? `[图片] ${images.length}张` : '新对话')
    chatList.value.unshift({
      id: tempChatId,
      title: titleText.length > 20 ? titleText.substring(0, 20) + '...' : titleText,
      time: tempUserMessage.time,
      preview: content || (images.length > 0 ? `[图片] ${images.length}张` : '')
    })
    messagesMap.value[tempChatId] = []
  }

  // 添加临时用户消息
  messagesMap.value[activeChatId.value].push(tempUserMessage)

  // 立即创建一个带 loading 状态的助手消息
  const tempAssistantMessage = {
    id: 'temp-assistant-' + Date.now(),
    role: 'assistant',
    content: '',
    images: [],
    isLoading: true,  // 添加 loading 标记
    time: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  messagesMap.value[activeChatId.value].push(tempAssistantMessage)

  // 发送消息到后端（流式）
  isLoading.value = true
  
  const requestData = {
    content: content
  }
  
  // 添加图片URL（如果有）
  if (images.length > 0) {
    requestData.images = images
  }
  
  // 如果不是临时会话，传递会话ID
  if (!activeChatId.value.toString().startsWith('temp-')) {
    requestData.conversation_id = activeChatId.value
  }

  let realConversationId = null
  let realUserMessageId = null
  let realAssistantMessageId = null

  sendMessageStream(
    requestData,
    // onMessage - 接收消息片段
    (messageContent, startData) => {
      if (startData && startData.type === 'start') {
        // 开始事件，获取真实的会话ID
        realConversationId = startData.conversation_id
        realUserMessageId = startData.user_message?.id
        
        // 如果是新会话，更新会话ID
        if (activeChatId.value.toString().startsWith('temp-')) {
          const oldChatId = activeChatId.value
          const newChatId = realConversationId
          
          // 更新chatList中的ID
          const chatIndex = chatList.value.findIndex(chat => chat.id === oldChatId)
          if (chatIndex > -1) {
            chatList.value[chatIndex].id = newChatId
          }
          
          // 更新messagesMap
          messagesMap.value[newChatId] = messagesMap.value[oldChatId]
          delete messagesMap.value[oldChatId]
          
          activeChatId.value = newChatId
        }
        
        // start 事件不包含消息内容，直接返回
        return
      }
      
      // 收到第一条消息内容时，取消 loading 状态
      if (messageContent && tempAssistantMessage.isLoading) {
        tempAssistantMessage.isLoading = false
        isLoading.value = false
        console.log('取消 loading 状态')
      }
      
      // 更新AI消息内容 - 使用数组替换强制更新
      if (messageContent) {
        console.log('收到消息片段:', messageContent)
        const currentChatId = activeChatId.value
        const messages = messagesMap.value[currentChatId]
        const assistantIndex = messages.findIndex(msg => msg.id === tempAssistantMessage.id)
        if (assistantIndex > -1) {
          // 创建新的消息对象
          const updatedMessage = {
            ...messages[assistantIndex],
            content: messages[assistantIndex].content + messageContent
          }
          // 创建新的消息数组
          const newMessages = [...messages]
          newMessages[assistantIndex] = updatedMessage
          // 替换整个消息数组
          messagesMap.value[currentChatId] = newMessages
          
          console.log('当前完整内容:', updatedMessage.content)
          
          // 触发滚动到底部
          nextTick(() => {
            if (chatWindowRef.value && chatWindowRef.value.scrollToBottom) {
              chatWindowRef.value.scrollToBottom()
            }
          })
        }
      }
    },
    // onError - 错误处理
    (error) => {
      console.error('发送消息失败:', error)
      ElMessage.error(typeof error === 'string' ? error : '发送失败')
      
      // 移除临时消息
      const messages = messagesMap.value[activeChatId.value]
      const userIndex = messages.findIndex(msg => msg.id === tempUserMessage.id)
      if (userIndex > -1) {
        messages.splice(userIndex, 1)
      }
      
      const assistantIndex = messages.findIndex(msg => msg.id === tempAssistantMessage.id)
      if (assistantIndex > -1) {
        messages.splice(assistantIndex, 1)
      }
      
      isLoading.value = false
    },
    // onComplete - 完成处理
    (doneData) => {
      isLoading.value = false
      
      // 确保 loading 状态被清除
      if (tempAssistantMessage.isLoading) {
        tempAssistantMessage.isLoading = false
      }
      
      console.log('流式输出完成')
      
      if (doneData && doneData.assistant_message) {
        realAssistantMessageId = doneData.assistant_message.id
      }
      
      // 更新消息ID为真实ID（现在使用索引作为 key，所以不会触发重新渲染）
      const messages = messagesMap.value[activeChatId.value]
      
      // 更新用户消息ID
      if (realUserMessageId) {
        const userMsg = messages.find(msg => msg.id === tempUserMessage.id)
        if (userMsg) {
          userMsg.id = realUserMessageId
        }
      }
      
      // 更新AI消息ID
      if (realAssistantMessageId) {
        const assistantMsg = messages.find(msg => msg.id === tempAssistantMessage.id)
        if (assistantMsg) {
          assistantMsg.id = realAssistantMessageId
        }
      }
      
      // 更新聊天列表的预览和时间
      const currentChat = chatList.value.find(chat => chat.id === activeChatId.value)
      if (currentChat) {
        const assistantMsg = messages[messages.length - 1] // 最后一条消息就是 AI 回复
        if (assistantMsg && assistantMsg.role === 'assistant') {
          const previewText = assistantMsg.content
          currentChat.preview = previewText.length > 30 ? previewText.substring(0, 30) + '...' : previewText
          currentChat.time = assistantMsg.time
        }
      }
    }
  )
}

onMounted(() => {
  // 加载历史聊天记录
  loadConversations()
})
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
