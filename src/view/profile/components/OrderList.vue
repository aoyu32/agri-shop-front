<template>
  <div class="order-list">
    <div class="list-header">
      <h3>{{ pageTitle }}</h3>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索订单"
        style="width: 240px"
        clearable
      >
        <template #prefix>
          <i class="iconfont icon-sousuo"></i>
        </template>
      </el-input>
    </div>

    <div v-if="filteredOrders.length === 0" class="empty-state">
      <i class="iconfont icon-renwu"></i>
      <p>暂无订单</p>
    </div>

    <div v-else class="order-items">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ order.createTime }}</span>
          <el-tag :type="getStatusType(order.status)">{{ order.statusText }}</el-tag>
        </div>

        <div class="order-products">
          <div v-for="product in order.products" :key="product.id" class="product-item">
            <img :src="product.image" :alt="product.name" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-spec">{{ product.spec }}</div>
            </div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-quantity">x{{ product.quantity }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            实付款：<span class="price">¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-actions">
            <el-button v-if="order.status === 'pending'" type="primary" size="small" @click="handlePay(order)">
              去支付
            </el-button>
            <el-button v-if="order.status === 'shipped'" type="primary" size="small" @click="handleConfirm(order)">
              确认收货
            </el-button>
            <el-button v-if="order.status === 'received'" type="primary" size="small" @click="handleReview(order)">
              去评价
            </el-button>
            <el-button size="small" @click="handleViewDetail(order)">查看详情</el-button>
            <el-button v-if="order.status === 'pending'" size="small" @click="handleCancel(order)">
              取消订单
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()

const searchKeyword = ref('')

// 模拟订单数据
const orders = ref([
  {
    id: 1,
    orderNo: '202601220001',
    status: 'pending',
    statusText: '待付款',
    createTime: '2026-01-22 10:30:00',
    totalAmount: '68.60',
    products: [
      {
        id: 1,
        name: '新鲜有机西红柿',
        spec: '500g/份',
        price: '12.80',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1546470427-227e2e1e8c8e?w=100&h=100&fit=crop'
      },
      {
        id: 2,
        name: '农家土鸡蛋',
        spec: '30枚/盒',
        price: '45.00',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    id: 2,
    orderNo: '202601210002',
    status: 'paid',
    statusText: '待发货',
    createTime: '2026-01-21 15:20:00',
    totalAmount: '25.50',
    products: [
      {
        id: 3,
        name: '新鲜黄瓜',
        spec: '1kg/份',
        price: '8.50',
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    id: 3,
    orderNo: '202601200003',
    status: 'shipped',
    statusText: '待收货',
    createTime: '2026-01-20 09:15:00',
    totalAmount: '89.00',
    products: [
      {
        id: 4,
        name: '有机大米',
        spec: '5kg/袋',
        price: '89.00',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop'
      }
    ]
  }
])

// 页面标题
const pageTitle = computed(() => {
  const menu = route.query.menu
  const titles = {
    'order-all': '所有订单',
    'order-pending': '待付款',
    'order-paid': '待发货',
    'order-shipped': '待收货',
    'order-refund': '退货退款'
  }
  return titles[menu] || '我的订单'
})

// 过滤订单
const filteredOrders = computed(() => {
  let result = orders.value

  // 根据菜单过滤
  const menu = route.query.menu
  if (menu === 'order-pending') {
    result = result.filter(o => o.status === 'pending')
  } else if (menu === 'order-paid') {
    result = result.filter(o => o.status === 'paid')
  } else if (menu === 'order-shipped') {
    result = result.filter(o => o.status === 'shipped')
  } else if (menu === 'order-refund') {
    result = result.filter(o => o.status === 'refund')
  }

  // 搜索过滤
  if (searchKeyword.value) {
    result = result.filter(o => 
      o.orderNo.includes(searchKeyword.value) ||
      o.products.some(p => p.name.includes(searchKeyword.value))
    )
  }

  return result
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'info',
    shipped: 'primary',
    received: 'success',
    refund: 'danger'
  }
  return types[status] || 'info'
}

const handlePay = (order) => {
  ElMessage.success(`跳转到支付页面，订单号：${order.orderNo}`)
}

const handleConfirm = (order) => {
  ElMessageBox.confirm('确认收到商品了吗？', '确认收货', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    order.status = 'received'
    order.statusText = '待评价'
    ElMessage.success('确认收货成功')
  }).catch(() => {})
}

const handleReview = (order) => {
  ElMessage.info('跳转到评价页面')
}

const handleViewDetail = (order) => {
  ElMessage.info(`查看订单详情：${order.orderNo}`)
}

const handleCancel = (order) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = orders.value.findIndex(o => o.id === order.id)
    if (index > -1) {
      orders.value.splice(index, 1)
      ElMessage.success('订单已取消')
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.order-list {
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
    }
  }

  .order-items {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .order-card {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;

      .order-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background-color: var(--bg-gray);
        border-bottom: 1px solid var(--border-color);

        .order-no {
          font-size: 14px;
          color: var(--text-primary-color);
          font-weight: 500;
        }

        .order-time {
          font-size: 13px;
          color: var(--text-secondary-color);
          margin-left: auto;
        }
      }

      .order-products {
        padding: 16px;

        .product-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;

          &:not(:last-child) {
            border-bottom: 1px dashed var(--border-color);
          }

          img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
          }

          .product-info {
            flex: 1;

            .product-name {
              font-size: 15px;
              color: var(--text-primary-color);
              margin-bottom: 6px;
            }

            .product-spec {
              font-size: 13px;
              color: var(--text-secondary-color);
            }
          }

          .product-price {
            font-size: 16px;
            font-weight: 600;
            color: var(--theme-primary-color);
          }

          .product-quantity {
            width: 60px;
            text-align: right;
            font-size: 14px;
            color: var(--text-secondary-color);
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: var(--bg-gray);
        border-top: 1px solid var(--border-color);

        .order-total {
          font-size: 14px;
          color: var(--text-secondary-color);

          .price {
            font-size: 20px;
            font-weight: 600;
            color: var(--theme-primary-color);
            margin-left: 8px;
          }
        }

        .order-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}
</style>
