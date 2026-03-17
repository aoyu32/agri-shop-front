<template>
  <aside class="chat-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title">
        <i class="iconfont icon-damoxingjichengpingtai"></i>
        <span>AI咨询</span>
      </div>
      <div class="toggle-btn" @click="handleToggle">
        <i class="iconfont icon-zuochuangkou"></i>
      </div>
    </div>

    <!-- 新对话按钮 -->
    <div class="new-chat-btn" @click="handleNewChat">
      <span>新对话</span>
      <span><i class="iconfont icon-plus"></i></span>
    </div>

    <!-- 聊天记录列表 -->
    <div class="chat-list">
      <div v-for="chat in chatList" :key="chat.id" class="chat-item" :class="{ active: activeChatId === chat.id }"
        @click="handleSelectChat(chat.id)">
        <div class="chat-item-content">
          <div class="chat-title">{{ chat.title }}</div>
          <div class="chat-preview">{{ chat.preview }}</div>
          <div class="chat-footer">
            <div class="chat-time">{{ chat.time }}</div>
            <div class="chat-delete" @click.stop="handleDeleteChat(chat.id)" title="删除对话">
              <i class="iconfont icon-delete"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="chatList.length === 0" class="empty-state">
        <i class="iconfont icon-xinduihua"></i>
        <p>暂无聊天记录</p>
        <p class="empty-hint">点击"新对话"开始咨询</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  chatList: {
    type: Array,
    default: () => []
  },
  activeChatId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['new-chat', 'select-chat', 'delete-chat', 'toggle-sidebar'])

const handleToggle = () => {
  emit('toggle-sidebar')
}

const handleNewChat = () => {
  emit('new-chat')
}

const handleSelectChat = (chatId) => {
  emit('select-chat', chatId)
}

const handleDeleteChat = async (chatId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个对话吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('delete-chat', chatId)
  } catch {
    // 用户取消删除
  }
}
</script>

<style lang="scss" scoped>
@use './ChatSidebar.scss' as *;
</style>
