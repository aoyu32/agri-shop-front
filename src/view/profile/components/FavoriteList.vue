<template>
  <div class="favorite-list">
    <div class="list-header">
      <h3>我的收藏</h3>
      <el-button v-if="favorites.length > 0" type="danger" text @click="handleClearAll">
        清空收藏
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="favorites.length === 0" class="empty-state">
      <i class="iconfont icon-shoucang"></i>
      <p>还没有收藏任何商品</p>
      <el-button type="primary" @click="goShopping">去逛逛</el-button>
    </div>

    <!-- 收藏列表 -->
    <div v-else class="favorite-grid">
      <div v-for="item in favorites" :key="item.id" class="favorite-item">
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
          <div class="item-footer">
            <div class="price-info">
              <span class="item-price">¥{{ item.price }}</span>
              <span v-if="item.original_price" class="original-price">¥{{ item.original_price }}</span>
            </div>
            <div class="item-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleViewProduct(item)"
                :disabled="item.status !== 'on_sale'"
              >
                查看详情
              </el-button>
              <el-button type="danger" text size="small" @click="handleRemove(item)">
                取消收藏
              </el-button>
            </div>
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
        :page-sizes="[12, 24, 36, 48]"
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
import { getFavoriteList, batchRemoveFavorite, removeFavorite } from '@/apis/favorite'

const router = useRouter()

const loading = ref(false)
const favorites = ref([])
const page = ref(1)
const limit = ref(12)
const total = ref(0)

// 获取收藏列表
const fetchFavorites = async () => {
  try {
    loading.value = true
    const res = await getFavoriteList({
      page: page.value,
      limit: limit.value
    })
    
    favorites.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error(error.message || '获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

// 查看商品详情
const handleViewProduct = (item) => {
  router.push({ name: 'ProductDetail', params: { id: item.product_id } })
}

// 取消收藏
const handleRemove = async (item) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await removeFavorite({ product_id: item.product_id })
    ElMessage.success('已取消收藏')
    
    // 重新加载列表
    await fetchFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error(error.message || '取消收藏失败')
    }
  }
}

// 清空所有收藏
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 获取所有收藏ID
    const ids = favorites.value.map(item => item.id)
    
    await batchRemoveFavorite({ ids })
    ElMessage.success('已清空收藏')
    
    // 重新加载列表
    favorites.value = []
    total.value = 0
    page.value = 1
    await fetchFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空收藏失败:', error)
      ElMessage.error(error.message || '清空收藏失败')
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
  fetchFavorites()
}

// 页码改变
const handlePageChange = () => {
  fetchFavorites()
}

// 页面加载时获取数据
onMounted(() => {
  fetchFavorites()
})
</script>

<style lang="scss" scoped>
.favorite-list {
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

  .favorite-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;

    .favorite-item {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .item-image {
        position: relative;
        width: 100%;
        padding-top: 100%;
        overflow: hidden;
        cursor: pointer;

        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        &:hover {
          img {
            transform: scale(1.05);
          }
        }

        .status-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 12px;
          background-color: rgba(0, 0, 0, 0.6);
          color: #fff;
          font-size: 12px;
          border-radius: 4px;
        }
      }

      .item-info {
        padding: 12px;

        .item-name {
          font-size: 14px;
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
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-footer {
          .price-info {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            .item-price {
              font-size: 18px;
              font-weight: 600;
              color: #f5222d;
            }

            .original-price {
              font-size: 12px;
              color: var(--text-placeholder-color);
              text-decoration: line-through;
            }
          }

          .item-actions {
            display: flex;
            gap: 8px;

            :deep(.el-button) {
              flex: 1;
              margin: 0;
            }

            :deep(.el-button+.el-button) {
              margin-left: 0;
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
