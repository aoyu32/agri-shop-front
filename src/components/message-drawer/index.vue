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
      <el-button v-if="unreadCount > 0" text type="primary" @click="markAllAsRead">
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filterType = ref('all')

// 模拟消息数据 - 消费者端
const consumerMessages = ref([
  {
    id: 1,
    type: 'order',
    title: '订单发货通知',
    content: '您的订单【有机西红柿】已发货，请注意查收',
    time: '2024-02-08 10:30',
    isRead: false
  },
  {
    id: 2,
    type: 'system',
    title: '系统通知',
    content: '您有一张优惠券即将过期，请尽快使用',
    time: '2024-02-08 09:15',
    isRead: false
  },
  {
    id: 3,
    type: 'promotion',
    title: '促销活动',
    content: '春季新品上市，全场8折优惠，快来选购吧！',
    time: '2024-02-07 16:20',
    isRead: true
  },
  {
    id: 4,
    type: 'order',
    title: '订单完成通知',
    content: '您的订单【新鲜黄瓜】已完成，期待您的评价',
    time: '2024-02-07 14:30',
    isRead: true
  },
  {
    id: 5,
    type: 'reply',
    title: '商家回复',
    content: '商家已回复您的评价，快去查看吧',
    time: '2024-02-06 11:20',
    isRead: true
  }
])

// 模拟消息数据 - 农户端
const merchantMessages = ref([
  {
    id: 1,
    type: 'order',
    title: '新订单通知',
    content: '您有一个新订单【有机西红柿 x2】，请及时处理',
    time: '2024-02-08 10:30',
    isRead: false
  },
  {
    id: 2,
    type: 'review',
    title: '新评价通知',
    content: '用户【张三】对【新鲜黄瓜】进行了评价',
    time: '2024-02-08 09:15',
    isRead: false
  },
  {
    id: 3,
    type: 'stock',
    title: '库存预警',
    content: '【有机生菜】库存不足10件，请及时补货',
    time: '2024-02-07 16:20',
    isRead: false
  },
  {
    id: 4,
    type: 'system',
    title: '系统通知',
    content: '您的店铺认证即将到期，请及时续费',
    time: '2024-02-07 14:30',
    isRead: true
  },
  {
    id: 5,
    type: 'order',
    title: '退款申请',
    content: '用户【李四】申请退款，订单号：ORD202402070001',
    time: '2024-02-06 11:20',
    isRead: true
  }
])

// 根据用户角色获取消息列表
const messages = computed(() => {
  return userStore.isMerchant ? merchantMessages.value : consumerMessages.value
})

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
const markAllAsRead = () => {
  messages.value.forEach(m => {
    m.isRead = true
  })
  ElMessage.success('已全部标记为已读')
}

// 点击消息
const handleMessageClick = (message) => {
  if (!message.isRead) {
    message.isRead = true
  }
  ElMessage.info('查看消息详情')
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
}
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
