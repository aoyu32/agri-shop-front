<template>
  <div class="footprint-list">
    <div class="list-header">
      <h3>我的足迹</h3>
      <el-button v-if="footprints.length > 0" type="danger" text @click="handleClearAll">
        清空足迹
      </el-button>
    </div>

    <div v-if="footprints.length === 0" class="empty-state">
      <i class="iconfont icon-time"></i>
      <p>还没有浏览记录</p>
      <el-button type="primary" @click="goShopping">去逛逛</el-button>
    </div>

    <div v-else class="footprint-timeline">
      <div v-for="group in groupedFootprints" :key="group.date" class="date-group">
        <div class="date-header">{{ group.date }}</div>
        <div class="footprint-grid">
          <div v-for="item in group.items" :key="item.id" class="footprint-item">
            <div class="item-image" @click="handleViewProduct(item)">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="item-info">
              <div class="item-name" @click="handleViewProduct(item)">{{ item.name }}</div>
              <div class="item-price">¥{{ item.price }}</div>
              <div class="item-time">{{ item.time }}</div>
            </div>
            <el-button type="danger" text size="small" @click="handleRemove(item)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const footprints = ref([
  {
    id: 1,
    name: '新鲜有机西红柿',
    price: '12.80',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop',
    time: '10:30',
    date: '2026-01-22'
  },
  {
    id: 2,
    name: '农家土鸡蛋',
    price: '45.00',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop',
    time: '09:15',
    date: '2026-01-22'
  },
  {
    id: 3,
    name: '新鲜黄瓜',
    price: '8.50',
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=200&h=200&fit=crop',
    time: '18:45',
    date: '2026-01-21'
  },
  {
    id: 4,
    name: '有机大米',
    price: '89.00',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',
    time: '14:20',
    date: '2026-01-21'
  }
])

// 按日期分组
const groupedFootprints = computed(() => {
  const groups = {}
  footprints.value.forEach(item => {
    if (!groups[item.date]) {
      groups[item.date] = []
    }
    groups[item.date].push(item)
  })

  return Object.keys(groups).map(date => ({
    date: formatDate(date),
    items: groups[date]
  }))
})

const formatDate = (dateStr) => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  if (dateStr === today) return '今天'
  if (dateStr === yesterday) return '昨天'
  return dateStr
}

const handleViewProduct = (item) => {
  router.push(`/product/${item.id}`)
}

const handleRemove = (item) => {
  const index = footprints.value.findIndex(f => f.id === item.id)
  if (index > -1) {
    footprints.value.splice(index, 1)
    ElMessage.success('已删除')
  }
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有足迹吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    footprints.value = []
    ElMessage.success('已清空足迹')
  }).catch(() => {})
}

const goShopping = () => {
  router.push('/home')
}
</script>

<style lang="scss" scoped>
.footprint-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;

    i {
      font-size: 80px;
      color: var(--text-placeholder-color);
      margin-bottom: 20px;
    }

    p {
      font-size: 16px;
      color: var(--text-secondary-color);
      margin-bottom: 24px;
    }
  }

  .footprint-timeline {
    .date-group {
      margin-bottom: 24px;

      .date-header {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary-color);
        margin-bottom: 12px;
        padding-left: 12px;
        border-left: 3px solid var(--theme-primary-color);
      }

      .footprint-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .footprint-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .item-image {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            cursor: pointer;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 6px;
            }
          }

          .item-info {
            flex: 1;

            .item-name {
              font-size: 15px;
              font-weight: 500;
              color: var(--text-primary-color);
              margin-bottom: 6px;
              cursor: pointer;

              &:hover {
                color: var(--theme-primary-color);
              }
            }

            .item-price {
              font-size: 16px;
              font-weight: 600;
              color: var(--theme-primary-color);
              margin-bottom: 4px;
            }

            .item-time {
              font-size: 12px;
              color: var(--text-secondary-color);
            }
          }
        }
      }
    }
  }
}
</style>
