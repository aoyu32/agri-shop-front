<template>
  <div class="favorite-list">
    <div class="list-header">
      <h3>我的收藏</h3>
      <el-button v-if="favorites.length > 0" type="danger" text @click="handleClearAll">
        清空收藏
      </el-button>
    </div>

    <div v-if="favorites.length === 0" class="empty-state">
      <i class="iconfont icon-shoucang"></i>
      <p>还没有收藏任何商品</p>
      <el-button type="primary" @click="goShopping">去逛逛</el-button>
    </div>

    <div v-else class="favorite-grid">
      <div v-for="item in favorites" :key="item.id" class="favorite-item">
        <div class="item-image" @click="handleViewProduct(item)">
          <img :src="item.image" :alt="item.name" />
        </div>
        <div class="item-info">
          <div class="item-name" @click="handleViewProduct(item)">{{ item.name }}</div>
          <div class="item-footer">
            <span class="item-price">¥{{ item.price }}</span>
            <div class="item-actions">
              <el-button type="primary" size="small" @click="handleViewProduct(item)">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const favorites = ref([
  {
    id: 1,
    name: '新鲜有机西红柿',
    price: '12.80',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop'
  },
  {
    id: 2,
    name: '农家土鸡蛋',
    price: '45.00',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop'
  },
  {
    id: 3,
    name: '新鲜黄瓜',
    price: '8.50',
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=300&h=300&fit=crop'
  },
  {
    id: 4,
    name: '有机大米',
    price: '89.00',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop'
  }
])

const handleViewProduct = (item) => {
  router.push(`/product/${item.id}`)
}

const handleRemove = (item) => {
  ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    const index = favorites.value.findIndex(f => f.id === item.id)
    if (index > -1) {
      favorites.value.splice(index, 1)
      ElMessage.success('已取消收藏')
    }
  }).catch(() => {})
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favorites.value = []
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}

const goShopping = () => {
  router.push('/home')
}
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
      }

      .item-info {
        padding: 12px;

        .item-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary-color);
          margin-bottom: 8px;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          &:hover {
            color: var(--theme-primary-color);
          }
        }

        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .item-price {
            font-size: 18px;
            font-weight: 600;
            color: #f5222d;
          }

          .item-actions {
            display: flex;
            gap: 12px;

            :deep(.el-button+.el-button) {
              margin-left: 0;
              padding-left: 0;
            }
          }
        }
      }
    }
  }
}
</style>
