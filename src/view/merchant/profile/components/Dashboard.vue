<template>
  <div class="dashboard">
    <!-- 数据统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="card-icon" style="background: #e6f7ff;">
          <i class="iconfont icon-zhangdan" style="color: #1890ff;"></i>
        </div>
        <div class="card-content">
          <div class="card-title">今日订单</div>
          <div class="card-value">{{ stats.todayOrders }}</div>
          <div class="card-desc">总单量 {{ stats.totalOrders }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon" style="background: #f0f5ff;">
          <i class="iconfont icon-jinbidai" style="color: #52c41a;"></i>
        </div>
        <div class="card-content">
          <div class="card-title">今日销售额</div>
          <div class="card-value">¥{{ stats.todaySales }}</div>
          <div class="card-desc">总销售额 ¥{{ stats.totalSales }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon" style="background: #fff7e6;">
          <i class="iconfont icon-shangpin" style="color: #fa8c16;"></i>
        </div>
        <div class="card-content">
          <div class="card-title">农产品总数</div>
          <div class="card-value">{{ stats.totalProducts }}</div>
          <div class="card-desc">在售农产品 {{ stats.onSaleProducts }} 件</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon" style="background: #fff1f0;">
          <i class="iconfont icon-pinglun" style="color: #f5222d;"></i>
        </div>
        <div class="card-content">
          <div class="card-title">待处理评价</div>
          <div class="card-value">{{ stats.pendingReviews }}</div>
          <div class="card-desc">总评价 {{ stats.totalReviews }} 条</div>
        </div>
      </div>
    </div>

    <!-- 店铺信息 -->
    <el-card class="shop-info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>店铺信息</span>
          <el-button text type="primary" @click="goToSettings">编辑</el-button>
        </div>
      </template>
      <div class="shop-info">
        <div class="info-item">
          <span class="label">店铺名称：</span>
          <span class="value">{{ shopInfo.shopName }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系电话：</span>
          <span class="value">{{ shopInfo.phone }}</span>
        </div>
        <div class="info-item">
          <span class="label">店铺地址：</span>
          <span class="value">{{ shopInfo.address }}</span>
        </div>
        <div class="info-item">
          <span class="label">店铺简介：</span>
          <span class="value">{{ shopInfo.description }}</span>
        </div>
      </div>
    </el-card>

    <!-- 待处理事项 -->
    <el-card class="pending-tasks-card" shadow="never">
      <template #header>
        <span>待处理事项</span>
      </template>
      <div class="tasks-list">
        <div class="task-item" @click="goToOrders('pending')">
          <div class="task-icon">
            <i class="iconfont icon-truck"></i>
          </div>
          <div class="task-content">
            <div class="task-title">待发货订单</div>
            <div class="task-desc">有 {{ pendingTasks.toShip }} 个订单待发货</div>
          </div>
          <el-button text type="primary">去处理</el-button>
        </div>

        <div class="task-item" @click="goToReviews">
          <div class="task-icon">
            <i class="iconfont icon-pinglun"></i>
          </div>
          <div class="task-content">
            <div class="task-title">待回复评价</div>
            <div class="task-desc">有 {{ pendingTasks.toReply }} 条评价待回复</div>
          </div>
          <el-button text type="primary">去处理</el-button>
        </div>

        <div class="task-item" @click="goToProducts">
          <div class="task-icon">
            <i class="iconfont icon-shangpin"></i>
          </div>
          <div class="task-content">
            <div class="task-title">库存预警</div>
            <div class="task-desc">有 {{ pendingTasks.lowStock }} 个农产品库存不足</div>
          </div>
          <el-button text type="primary">去处理</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMerchantDashboard } from '@/apis/merchant'
import { getMyShop } from '@/apis/shop'

const router = useRouter()

// 统计数据
const stats = ref({
  todayOrders: 0,
  todaySales: 0,
  totalOrders: 0,
  totalSales: 0,
  totalProducts: 0,
  onSaleProducts: 0,
  pendingReviews: 0,
  totalReviews: 0
})

// 店铺信息
const shopInfo = ref({
  shopName: '',
  phone: '',
  address: '',
  description: ''
})

// 待处理事项
const pendingTasks = ref({
  toShip: 0,
  toReply: 0,
  lowStock: 0
})

// 加载统计数据
const loadDashboard = async () => {
  try {
    const res = await getMerchantDashboard()
    if (res.code === 200) {
      const data = res.data
      
      // 更新统计数据
      stats.value = {
        todayOrders: data.stats.today_orders,
        todaySales: data.stats.today_sales,
        totalOrders: data.stats.total_orders,
        totalSales: data.stats.total_sales,
        totalProducts: data.stats.total_products,
        onSaleProducts: data.stats.on_sale_products,
        pendingReviews: data.stats.pending_reviews,
        totalReviews: data.stats.total_reviews
      }
      
      // 更新待处理事项
      pendingTasks.value = {
        toShip: data.pending_tasks.to_ship,
        toReply: data.pending_tasks.to_reply,
        lowStock: data.pending_tasks.low_stock
      }
    } else {
      ElMessage.error(res.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载数据概览失败:', error)
    ElMessage.error(error.message || '加载数据失败')
  }
}

// 加载店铺信息
const loadShopInfo = async () => {
  try {
    const res = await getMyShop()
    if (res.code === 200) {
      const shop = res.data.shop
      const user = res.data.user
      shopInfo.value = {
        shopName: shop.shop_name || '',
        phone: user.phone || '',
        address: shop.location || '',
        description: shop.description || ''
      }
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error)
  }
}

const goToSettings = () => {
  router.push('/merchant/profile?menu=shop-settings')
}

const goToOrders = (status) => {
  router.push(`/merchant/profile?menu=order-${status}`)
}

const goToReviews = () => {
  router.push('/merchant/profile?menu=reviews')
}

const goToProducts = () => {
  router.push('/merchant/profile?menu=product-list')
}

// 页面加载时获取数据
onMounted(() => {
  loadDashboard()
  loadShopInfo()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        .iconfont {
          font-size: 28px;
        }
      }

      .card-content {
        flex: 1;

        .card-title {
          font-size: 14px;
          color: #8c8c8c;
          margin-bottom: 8px;
        }

        .card-value {
          font-size: 24px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 4px;
        }

        .card-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          &.up {
            color: #52c41a;
          }

          &.down {
            color: #f5222d;
          }
        }

        .card-desc {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }

  .shop-info-card,
  .pending-tasks-card {
    margin-bottom: 24px;

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .shop-info {
    .info-item {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        width: 100px;
        color: #8c8c8c;
        font-size: 14px;
      }

      .value {
        flex: 1;
        color: #262626;
        font-size: 14px;
      }
    }
  }

  .tasks-list {
    .task-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.3s;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background: #f0f0f0;
      }

      .task-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: var(--theme-primary-color);
        display: flex;
        align-items: center;
        justify-content: center;

        .iconfont {
          font-size: 24px;
          color: #fff;
        }
      }

      .task-content {
        flex: 1;

        .task-title {
          font-size: 15px;
          font-weight: 500;
          color: #262626;
          margin-bottom: 4px;
        }

        .task-desc {
          font-size: 13px;
          color: #8c8c8c;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .dashboard {
    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media screen and (max-width: 768px) {
  .dashboard {
    .stats-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>
