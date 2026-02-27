<template>
  <div class="order-list">
    <div class="list-header">
      <h3>{{ pageTitle }}</h3>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <i class="iconfont icon-renwu"></i>
      <p>暂无订单</p>
    </div>

    <div v-else class="order-items">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-info">
            <span class="shop-name">{{ order.shop_name }}</span>
            <span class="order-no">订单号：{{ order.order_no }}</span>
          </span>
          <el-tag :type="getStatusType(order.status)">{{ order.status_text }}</el-tag>
        </div>

        <div class="order-products">
          <div v-for="product in order.items" :key="product.product_id" class="product-item">
            <img :src="product.product_image" :alt="product.product_name" />
            <div class="product-info">
              <div class="product-name">{{ product.product_name }}</div>
              <div class="product-spec">{{ product.spec_label || '默认' }}</div>
            </div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-quantity">x{{ product.quantity }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span class="order-time">{{ order.created_at }}</span>
            <span class="total-amount">
              实付款：<span class="price">¥{{ order.actual_amount }}</span>
            </span>
          </div>
          <div class="order-actions">
            <el-button v-if="order.status === 'pending'" type="primary" size="small" @click="handlePay(order)">
              去支付
            </el-button>
            <el-button v-if="order.status === 'shipped'" type="primary" size="small" @click="handleConfirm(order)">
              确认收货
            </el-button>
            <el-button v-if="order.status === 'completed'" type="primary" size="small" @click="handleReview(order)">
              去评价
            </el-button>
            <el-button size="small" @click="handleViewDetail(order)">查看详情</el-button>
            <el-button v-if="order.status === 'pending' || order.status === 'paid'" size="small" @click="handleCancel(order)">
              取消订单
            </el-button>
            <el-button v-if="order.status === 'completed' || order.status === 'cancelled'" type="danger" size="small" @click="handleDelete(order)">
              删除订单
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
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchOrders"
        @size-change="fetchOrders"
      />
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">{{ currentOrder.order_no }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.status_text }}</el-tag>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span class="value">{{ currentOrder.created_at }}</span>
          </div>
          <div v-if="currentOrder.payment_time" class="detail-row">
            <span class="label">支付时间：</span>
            <span class="value">{{ currentOrder.payment_time }}</span>
          </div>
          <div v-if="currentOrder.ship_time" class="detail-row">
            <span class="label">发货时间：</span>
            <span class="value">{{ currentOrder.ship_time }}</span>
          </div>
          <div v-if="currentOrder.complete_time" class="detail-row">
            <span class="label">完成时间：</span>
            <span class="value">{{ currentOrder.complete_time }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>收货信息</h4>
          <div class="detail-row">
            <span class="label">收货人：</span>
            <span class="value">{{ currentOrder.receiver_name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">联系电话：</span>
            <span class="value">{{ currentOrder.receiver_phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">收货地址：</span>
            <span class="value">{{ currentOrder.receiver_address }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>商品信息</h4>
          <div class="detail-products">
            <div v-for="item in currentOrder.items" :key="item.product_id" class="detail-product-item">
              <img :src="item.product_image" :alt="item.product_name" />
              <div class="product-info">
                <div class="product-name">{{ item.product_name }}</div>
                <div class="product-spec">{{ item.spec_label || '默认' }}</div>
              </div>
              <div class="product-price">¥{{ item.price }}</div>
              <div class="product-quantity">x{{ item.quantity }}</div>
              <div class="product-total">¥{{ item.total_price }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>费用信息</h4>
          <div class="detail-row">
            <span class="label">商品总额：</span>
            <span class="value">¥{{ currentOrder.total_amount }}</span>
          </div>
          <div class="detail-row">
            <span class="label">运费：</span>
            <span class="value">¥{{ currentOrder.shipping_fee }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">实付金额：</span>
            <span class="value highlight">¥{{ currentOrder.actual_amount }}</span>
          </div>
        </div>

        <div v-if="currentOrder.remark" class="detail-section">
          <h4>订单备注</h4>
          <div class="detail-row">
            <span class="value">{{ currentOrder.remark }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, getOrderDetail, cancelOrder, confirmOrder, deleteOrder } from '@/apis/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const orders = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)

// 订单详情弹窗
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 根据路由菜单确定订单状态
const orderStatus = computed(() => {
  const menu = route.query.menu || 'order-all'
  const statusMap = {
    'order-all': 'all',
    'order-pending': 'pending',
    'order-paid': 'paid',
    'order-shipped': 'shipped',
    'order-completed': 'completed',
    'order-refund': 'refund'
  }
  return statusMap[menu] || 'all'
})

// 页面标题
const pageTitle = computed(() => {
  const titleMap = {
    'all': '全部订单',
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '待收货',
    'completed': '已完成',
    'refund': '退款/售后'
  }
  return titleMap[orderStatus.value] || '全部订单'
})

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const res = await getOrderList({
      status: orderStatus.value,
      page: page.value,
      limit: limit.value
    })
    orders.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'paid': 'info',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'info',
    'refund': 'danger'
  }
  return typeMap[status] || 'info'
}

// 去支付
const handlePay = (order) => {
  router.push({
    path: '/payment',
    query: { order_id: order.id }
  })
}

// 确认收货
const handleConfirm = (order) => {
  ElMessageBox.confirm('确认已收到货物吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await confirmOrder(order.id)
      ElMessage.success('确认收货成功')
      fetchOrders()
    } catch (error) {
      ElMessage.error(error.message || '确认收货失败')
    }
  }).catch(() => {})
}

// 去评价
const handleReview = (order) => {
  ElMessage.info('评价功能开发中')
}

// 查看详情
const handleViewDetail = async (order) => {
  try {
    const res = await getOrderDetail(order.id)
    currentOrder.value = res.data.order
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '获取订单详情失败')
  }
}

// 取消订单
const handleCancel = (order) => {
  ElMessageBox.prompt('请输入取消原因', '取消订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入取消原因'
  }).then(async ({ value }) => {
    try {
      await cancelOrder({
        id: order.id,
        reason: value
      })
      ElMessage.success('订单已取消')
      fetchOrders()
    } catch (error) {
      ElMessage.error(error.message || '取消订单失败')
    }
  }).catch(() => {})
}

// 删除订单
const handleDelete = (order) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrder(order.id)
      ElMessage.success('删除成功')
      fetchOrders()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 监听路由变化
watch(() => route.query.menu, () => {
  page.value = 1
  fetchOrders()
})

onMounted(() => {
  fetchOrders()
})
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

  .loading-state,
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
    .order-card {
      background-color: #fff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: var(--bg-gray);
        border-bottom: 1px solid var(--border-color);

        .order-info {
          display: flex;
          align-items: center;
          gap: 16px;

          .shop-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary-color);
          }

          .order-no {
            font-size: 13px;
            color: var(--text-secondary-color);
          }
        }
      }

      .order-products {
        padding: 16px;

        .product-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);

          &:last-child {
            border-bottom: none;
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
              font-weight: 500;
              color: var(--text-primary-color);
              margin-bottom: 6px;
            }

            .product-spec {
              font-size: 13px;
              color: var(--text-secondary-color);
            }
          }

          .product-price {
            width: 100px;
            font-size: 16px;
            font-weight: 600;
            color: #f5222d;
          }

          .product-quantity {
            width: 80px;
            text-align: center;
            font-size: 14px;
            color: var(--text-secondary-color);
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: var(--bg-gray);
        border-top: 1px solid var(--border-color);

        .order-total {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .order-time {
            font-size: 12px;
            color: var(--text-placeholder-color);
          }

          .total-amount {
            font-size: 14px;
            color: var(--text-secondary-color);

            .price {
              font-size: 18px;
              font-weight: 600;
              color: #f5222d;
              margin-left: 4px;
            }
          }
        }

        .order-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}

.order-detail {
  .detail-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary-color);
    }

    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      &.total {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed var(--border-color);
        font-size: 16px;
        font-weight: 600;
      }

      .label {
        width: 100px;
        color: var(--text-secondary-color);
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        color: var(--text-primary-color);

        &.highlight {
          color: #f5222d;
          font-size: 18px;
        }
      }
    }

    .detail-products {
      .detail-product-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background-color: var(--bg-gray);
        border-radius: 6px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-info {
          flex: 1;

          .product-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary-color);
            margin-bottom: 4px;
          }

          .product-spec {
            font-size: 12px;
            color: var(--text-secondary-color);
          }
        }

        .product-price {
          width: 80px;
          text-align: right;
          font-size: 14px;
          color: var(--text-primary-color);
        }

        .product-quantity {
          width: 60px;
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary-color);
        }

        .product-total {
          width: 80px;
          text-align: right;
          font-size: 15px;
          font-weight: 600;
          color: #f5222d;
        }
      }
    }
  }
}
</style>
