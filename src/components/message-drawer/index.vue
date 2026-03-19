<template>
  <el-drawer
    v-model="visible"
    title="消息通知"
    direction="rtl"
    size="400px"
    @close="handleClose"
  >
    <!-- 消息筛选 -->
    <div class="message-filter">
      <el-radio-group v-model="filterType" @change="handleFilterChange">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="unread">未读</el-radio-button>
        <el-radio-button value="read">已读</el-radio-button>
      </el-radio-group>
      <el-button v-if="unreadCount > 0" text type="primary" @click="markAllAsReadHandler">
        全部已读
      </el-button>
    </div>

    <!-- 消息列表 -->
    <div v-if="filteredMessages.length > 0" class="message-list">
      <div
        v-for="message in filteredMessages"
        :key="message.id"
        class="message-item"
        :class="{ unread: !message.isRead }"
        @click="handleMessageClick(message)"
      >
        <div class="message-icon" :class="`type-${message.type}`">
          <i class="iconfont" :class="getMessageIcon(message.type)"></i>
        </div>
        <div class="message-content">
          <div class="message-title">{{ message.title }}</div>
          <div class="message-desc">{{ message.content }}</div>
          <div class="message-time">{{ message.time }}</div>
        </div>
        <div v-if="!message.isRead" class="unread-badge"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无消息" :image-size="120" />
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { 
  getNotificationList, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '@/apis/notification'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()
const router = useRouter()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filterType = ref('all')
const messages = ref([])
const loading = ref(false)

// 筛选后的消息列表
const filteredMessages = computed(() => {
  if (filterType.value === 'all') {
    return messages.value
  } else if (filterType.value === 'unread') {
    return messages.value.filter(m => !m.isRead)
  } else {
    return messages.value.filter(m => m.isRead)
  }
})

// 未读消息数量
const unreadCount = computed(() => {
  return messages.value.filter(m => !m.isRead).length
})

// 监听未读消息数量变化，更新 store
watch(unreadCount, (newCount) => {
  userStore.setUnreadMessages(newCount)
}, { immediate: true })

// 监听抽屉打开，加载消息列表
watch(visible, (newVal) => {
  if (newVal) {
    loadMessages()
  }
})

// 加载消息列表
const loadMessages = async () => {
  try {
    loading.value = true
    const res = await getNotificationList({
      page: 1,
      page_size: 50
    })
    
    if (res.code === 200) {
      messages.value = res.data.list.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        time: item.time,
        isRead: item.is_read === 1,
        relatedId: item.related_id,
        relatedType: item.related_type
      }))
    }
  } catch (error) {
    console.error('加载消息列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    if (res.code === 200) {
      userStore.setUnreadMessages(res.data.count)
    }
  } catch (error) {
    console.error('加载未读数量失败:', error)
  }
}

// 获取消息图标
const getMessageIcon = (type) => {
  const iconMap = {
    order: 'icon-zhangdan',
    system: 'icon-asset-monitor',
    promotion: 'icon-liwu',
    reply: 'icon-pinglun',
    review: 'icon-pinglun',
    stock: 'icon-chuxuguan'
  }
  return iconMap[type] || 'icon-xiaoxi'
}

// 筛选变化
const handleFilterChange = () => {
  // 筛选逻辑已在 computed 中处理
}

// 标记所有消息为已读
const markAllAsReadHandler = async () => {
  try {
    const res = await markAllAsRead()
    if (res.code === 200) {
      messages.value.forEach(m => {
        m.isRead = true
      })
      ElMessage.success('已全部标记为已读')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 点击消息
const handleMessageClick = async (message) => {
  // 标记为已读
  if (!message.isRead) {
    try {
      await markAsRead(message.id)
      message.isRead = true
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 根据消息类型跳转到相应页面
  if (message.relatedType === 'order' && message.relatedId) {
    // 跳转到订单详情
    if (userStore.isMerchant) {
      router.push({
        path: '/merchant/profile',
        query: { tab: 'orders', orderId: message.relatedId }
      })
    } else {
      router.push({
        path: '/profile',
        query: { tab: 'orders', orderId: message.relatedId }
      })
    }
    visible.value = false
  } else if (message.relatedType === 'review' && message.relatedId) {
    // 跳转到评价管理或商品详情
    if (userStore.isMerchant) {
      router.push({
        path: '/merchant/profile',
        query: { tab: 'reviews' }
      })
    } else {
      // 消费者查看商品详情
      router.push(`/product/${message.relatedId}`)
    }
    visible.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
}

// 组件挂载时加载未读数量
onMounted(() => {
  loadUnreadCount()
})
</script>

<style lang="scss" scoped>
.message-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.message-list {
  .message-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    background: #fafafa;

    &.unread {
      background: #e6f7ff;
    }

    &:hover {
      background: #f0f0f0;

      &.unread {
        background: #d9f0ff;
      }
    }

    .message-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .iconfont {
        font-size: 20px;
        color: #fff;
      }

      &.type-order {
        background: #1890ff;
      }

      &.type-system {
        background: #faad14;
      }

      &.type-promotion {
        background: #f5222d;
      }

      &.type-reply {
        background: #52c41a;
      }

      &.type-review {
        background: #722ed1;
      }

      &.type-stock {
        background: #fa8c16;
      }
    }

    .message-content {
      flex: 1;
      min-width: 0;

      .message-title {
        font-size: 14px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 4px;
      }

      .message-desc {
        font-size: 13px;
        color: #8c8c8c;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .message-time {
        font-size: 12px;
        color: #bfbfbf;
      }
    }

    .unread-badge {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f5222d;
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-drawer__body) {
  padding: 20px;
}
</style>
