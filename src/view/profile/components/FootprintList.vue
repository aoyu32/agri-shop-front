<template>
  <div class="footprint-list">
    <div class="list-header">
      <h3>我的足迹</h3>
      <div class="header-actions">
        <span v-if="statistics.total > 0" class="statistics">
          共 {{ statistics.total }} 条浏览记录
        </span>
        <el-button v-if="footprints.length > 0" type="danger" text @click="handleClearAll">
          清空足迹
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="footprints.length === 0" class="empty-state">
      <i class="iconfont icon-time"></i>
      <p>还没有浏览记录</p>
      <el-button type="primary" @click="goShopping">去逛逛</el-button>
    </div>

    <!-- 足迹列表 -->
    <div v-else class="footprint-timeline">
      <div v-for="group in footprints" :key="group.date" class="date-group">
        <div class="date-header">{{ group.date_label }}</div>
        <div class="footprint-grid">
          <div v-for="item in group.items" :key="item.id" class="footprint-item">
            <div class="item-image" @click="handleViewProduct(item)">
              <img :src="item.product_image" :alt="item.product_name" />
              <!-- 商品状态标签 -->
              <div v-if="item.status !== 'on_sale'" class="status-tag">
                {{ item.status === 'off_sale' ? '已下架' : '已售罄' }}
              </div>
            </div>
            <div class="item-info">
              <div class="item-name" @click="handleViewProduct(item)" :title="item.product_name">
                {{ item.product_name }}
              </div>
              <div v-if="item.product_subtitle" class="item-subtitle">
                {{ item.product_subtitle }}
              </div>
              <div class="price-info">
                <span class="item-price">¥{{ item.price }}</span>
                <span v-if="item.original_price" class="original-price">¥{{ item.original_price }}</span>
              </div>
              <div class="item-meta">
                <span class="item-time">{{ formatTime(item.last_view_time) }}</span>
                <span v-if="item.view_count > 1" class="view-count">浏览 {{ item.view_count }} 次</span>
              </div>
            </div>
            <el-button type="danger" text size="small" @click="handleRemove(item)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > limit" class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFootprintListByDate, deleteFootprint, clearFootprint, getFootprintStatistics } from '@/apis/footprint'

const router = useRouter()

const loading = ref(false)
const footprints = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const statistics = ref({
  total: 0,
  today: 0,
  week: 0
})

// 获取足迹列表
const fetchFootprints = async () => {
  try {
    loading.value = true
    const res = await getFootprintListByDate({
      page: page.value,
      limit: limit.value
    })
    
    footprints.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取足迹列表失败:', error)
    ElMessage.error(error.message || '获取足迹列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const fetchStatistics = async () => {
  try {
    const res = await getFootprintStatistics()
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

// 格式化时间
const formatTime = (datetime) => {
  const date = new Date(datetime)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 查看商品详情
const handleViewProduct = (item) => {
  router.push({ name: 'ProductDetail', params: { id: item.product_id } })
}

// 删除单条足迹
const handleRemove = async (item) => {
  try {
    await deleteFootprint({ id: item.id })
    ElMessage.success('已删除')
    
    // 重新加载列表
    await fetchFootprints()
    await fetchStatistics()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error(error.message || '删除失败')
  }
}

// 清空所有足迹
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有足迹吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await clearFootprint()
    ElMessage.success('已清空足迹')
    
    // 重新加载列表
    footprints.value = []
    total.value = 0
    page.value = 1
    statistics.value = { total: 0, today: 0, week: 0 }
    await fetchFootprints()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空失败:', error)
      ElMessage.error(error.message || '清空失败')
    }
  }
}

// 去逛逛
const goShopping = () => {
  router.push('/home')
}

// 分页大小改变
const handleSizeChange = () => {
  page.value = 1
  fetchFootprints()
}

// 页码改变
const handlePageChange = () => {
  fetchFootprints()
}

// 页面加载时获取数据
onMounted(() => {
  fetchFootprints()
  fetchStatistics()
})
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .statistics {
        font-size: 14px;
        color: var(--text-secondary-color);
      }
    }
  }

  .loading-state {
    padding: 20px 0;
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
            position: relative;
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

            .status-tag {
              position: absolute;
              top: 4px;
              right: 4px;
              padding: 2px 8px;
              background-color: rgba(0, 0, 0, 0.6);
              color: #fff;
              font-size: 10px;
              border-radius: 3px;
            }
          }

          .item-info {
            flex: 1;
            min-width: 0;

            .item-name {
              font-size: 15px;
              font-weight: 500;
              color: var(--text-primary-color);
              margin-bottom: 4px;
              cursor: pointer;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;

              &:hover {
                color: var(--theme-primary-color);
              }
            }

            .item-subtitle {
              font-size: 12px;
              color: var(--text-secondary-color);
              margin-bottom: 6px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .price-info {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;

              .item-price {
                font-size: 16px;
                font-weight: 600;
                color: #f5222d;
              }

              .original-price {
                font-size: 12px;
                color: var(--text-placeholder-color);
                text-decoration: line-through;
              }
            }

            .item-meta {
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 12px;
              color: var(--text-secondary-color);

              .view-count {
                &::before {
                  content: '•';
                  margin-right: 8px;
                }
              }
            }
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }
}
</style>
