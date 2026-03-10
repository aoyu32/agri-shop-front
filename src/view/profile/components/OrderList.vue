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
          <el-tag :type="getStatusType(orderStatus === 'refund' ? order.refund_status : order.status)">
            {{ orderStatus === 'refund' ? getRefundStatusText(order.refund_status) : order.status_text }}
          </el-tag>
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
            <!-- 非退款页面的按钮 -->
            <template v-if="orderStatus !== 'refund'">
              <el-button v-if="order.status === 'pending'" type="primary" size="small" @click="handlePay(order)">
                去支付
              </el-button>
              <el-button v-if="order.status === 'shipped'" type="primary" size="small" @click="handleConfirm(order)">
                确认收货
              </el-button>
              <el-button v-if="order.status === 'completed' && !order.is_reviewed" type="primary" size="small" @click="handleReview(order)">
                去评价
              </el-button>
              <el-button v-if="order.status === 'completed' && order.is_reviewed" type="info" size="small" disabled>
                已评价
              </el-button>
              <el-button v-if="order.status === 'completed' && !order.refund_status" type="warning" size="small" @click="handleApplyRefund(order)">
                申请退款
              </el-button>
              <el-button v-if="order.refund_status === 'applying'" type="info" size="small" disabled>
                退款审核中
              </el-button>
              <el-button size="small" @click="handleViewDetail(order)">查看详情</el-button>
              <el-button v-if="order.status === 'pending' || order.status === 'paid'" size="small" @click="handleCancel(order)">
                取消订单
              </el-button>
              <el-button v-if="order.status === 'completed' || order.status === 'cancelled'" type="danger" size="small" @click="handleDelete(order)">
                删除订单
              </el-button>
            </template>

            <!-- 退款页面的按钮 -->
            <template v-else>
              <el-button size="small" @click="handleViewRefundDetail(order)">查看详情</el-button>
              <el-button v-if="order.refund_status === 'applying'" type="danger" size="small" @click="handleCancelRefund(order)">
                取消退款
              </el-button>
            </template>
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

    <!-- 退款详情弹窗 -->
    <el-dialog
      v-model="refundDetailDialogVisible"
      title="退款详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRefund" class="refund-detail">
        <div class="detail-section">
          <h4>退款信息</h4>
          <div class="detail-row">
            <span class="label">退款单号：</span>
            <span class="value">{{ currentRefund.refund_no }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">{{ currentRefund.order_no }}</span>
          </div>
          <div class="detail-row">
            <span class="label">退款状态：</span>
            <el-tag :type="getStatusType(currentRefund.status)">{{ currentRefund.status_text }}</el-tag>
          </div>
          <div class="detail-row">
            <span class="label">退款类型：</span>
            <span class="value">{{ currentRefund.refund_type_text }}</span>
          </div>
          <div class="detail-row">
            <span class="label">退款金额：</span>
            <span class="value amount">¥{{ currentRefund.refund_amount }}</span>
          </div>
          <div class="detail-row">
            <span class="label">申请时间：</span>
            <span class="value">{{ currentRefund.created_at }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>退款原因</h4>
          <div class="detail-row">
            <span class="label">退款原因：</span>
            <span class="value">{{ currentRefund.refund_reason }}</span>
          </div>
          <div v-if="currentRefund.refund_description" class="detail-row">
            <span class="label">退款说明：</span>
            <span class="value">{{ currentRefund.refund_description }}</span>
          </div>
          <div v-if="currentRefund.refund_images && currentRefund.refund_images.length > 0" class="detail-row">
            <span class="label">退款凭证：</span>
            <div class="refund-images">
              <el-image
                v-for="(image, index) in currentRefund.refund_images"
                :key="index"
                :src="image"
                :preview-src-list="currentRefund.refund_images"
                :initial-index="index"
                fit="cover"
                class="refund-image"
              />
            </div>
          </div>
        </div>

        <div v-if="currentRefund.reject_reason" class="detail-section">
          <h4>拒绝原因</h4>
          <div class="detail-row">
            <span class="value reject">{{ currentRefund.reject_reason }}</span>
          </div>
        </div>

        <div v-if="currentRefund.logistics_company || currentRefund.tracking_no" class="detail-section">
          <h4>退货物流</h4>
          <div v-if="currentRefund.logistics_company" class="detail-row">
            <span class="label">物流公司：</span>
            <span class="value">{{ currentRefund.logistics_company }}</span>
          </div>
          <div v-if="currentRefund.tracking_no" class="detail-row">
            <span class="label">物流单号：</span>
            <span class="value">{{ currentRefund.tracking_no }}</span>
          </div>
        </div>

        <div v-if="currentRefund.refund_time" class="detail-section">
          <h4>退款完成</h4>
          <div class="detail-row">
            <span class="label">退款时间：</span>
            <span class="value">{{ currentRefund.refund_time }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 退款申请弹窗 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="申请退款"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form v-if="refundForm" :model="refundForm" label-width="100px">
        <el-form-item label="退款类型">
          <el-radio-group v-model="refundForm.refund_type">
            <el-radio :label="1">仅退款</el-radio>
            <el-radio :label="2">退货退款</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="退款金额">
          <el-input v-model="refundForm.refund_amount" disabled>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>

        <el-form-item label="退款原因" required>
          <el-select v-model="refundForm.refund_reason" placeholder="请选择退款原因" style="width: 100%">
            <el-option label="不想要了" value="不想要了" />
            <el-option label="商品质量问题" value="商品质量问题" />
            <el-option label="商品与描述不符" value="商品与描述不符" />
            <el-option label="发错货" value="发错货" />
            <el-option label="商品破损" value="商品破损" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>

        <el-form-item label="退款说明">
          <el-input
            v-model="refundForm.refund_description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述退款原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="上传凭证">
          <div class="image-upload-area">
            <div v-for="(image, index) in refundForm.refund_images" :key="index" class="image-item">
              <img :src="image" alt="退款凭证" />
              <div class="image-mask">
                <i class="iconfont icon-shanchu" @click="handleRemoveRefundImage(index)"></i>
              </div>
            </div>
            <el-upload
              v-if="refundForm.refund_images.length < 5"
              class="image-uploader"
              :show-file-list="false"
              :before-upload="handleRefundImageUpload"
              accept="image/*"
            >
              <div class="upload-trigger">
                <i class="iconfont icon-tupian"></i>
                <span>上传图片</span>
              </div>
            </el-upload>
          </div>
          <div class="upload-tip">最多上传5张图片，支持jpg、png格式</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRefund" :loading="refundSubmitting">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, getOrderDetail, cancelOrder, confirmOrder, deleteOrder } from '@/apis/order'
import { applyRefund, cancelRefund, getRefundDetail } from '@/apis/refund'
import { uploadFile } from '@/apis/oss'

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

// 退款详情弹窗
const refundDetailDialogVisible = ref(false)
const currentRefund = ref(null)

// 退款申请弹窗
const refundDialogVisible = ref(false)
const refundForm = ref(null)
const refundSubmitting = ref(false)

// 根据路由菜单确定订单状态
const orderStatus = computed(() => {
  const menu = route.query.menu || 'order-all'
  const statusMap = {
    'order-all': 'all',
    'order-pending': 'pending',
    'order-paid': 'paid',
    'order-shipped': 'shipped',
    'order-completed': 'completed',
    'order-refund': 'refund'  // 查询有退款申请的订单
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
    'refund': 'danger',
    'applying': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'refunded': 'success',
    'closed': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取退款状态文本
const getRefundStatusText = (refundStatus) => {
  const statusMap = {
    'applying': '退款审核中',
    'approved': '退款已同意',
    'rejected': '退款已拒绝',
    'refunded': '已退款',
    'closed': '退款已关闭'
  }
  return statusMap[refundStatus] || '未知状态'
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
  // 跳转到待评价页面，并传递订单ID
  router.push({
    path: '/profile',
    query: {
      menu: 'review-pending',
      orderId: order.id
    }
  })
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

// 查看退款详情
const handleViewRefundDetail = async (order) => {
  if (!order.refund_id) {
    ElMessage.error('退款记录不存在')
    return
  }

  try {
    const res = await getRefundDetail({ refund_id: order.refund_id })
    currentRefund.value = res.data
    refundDetailDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '获取退款详情失败')
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

// 申请退款
const handleApplyRefund = (order) => {
  refundForm.value = {
    order_id: order.id,
    refund_type: 1,
    refund_amount: order.actual_amount,
    refund_reason: '',
    refund_description: '',
    refund_images: []
  }
  refundDialogVisible.value = true
}

// 上传退款凭证图片
const handleRefundImageUpload = async (file) => {
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.warning('图片大小不能超过 5MB')
    return false
  }

  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return false
  }

  if (refundForm.value.refund_images.length >= 5) {
    ElMessage.warning('最多只能上传5张图片')
    return false
  }

  try {
    const res = await uploadFile(file, 'refund')
    refundForm.value.refund_images.push(res.data.url)
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
  }
  
  return false
}

// 删除退款凭证图片
const handleRemoveRefundImage = (index) => {
  refundForm.value.refund_images.splice(index, 1)
}

// 提交退款申请
const handleSubmitRefund = async () => {
  if (!refundForm.value.refund_reason) {
    ElMessage.warning('请选择退款原因')
    return
  }

  refundSubmitting.value = true
  try {
    await applyRefund(refundForm.value)
    ElMessage.success('退款申请提交成功')
    refundDialogVisible.value = false
    fetchOrders()
  } catch (error) {
    console.error('提交退款申请失败:', error)
  } finally {
    refundSubmitting.value = false
  }
}

// 取消退款
const handleCancelRefund = (order) => {
  if (!order.refund_id) {
    ElMessage.error('退款记录不存在')
    return
  }

  ElMessageBox.confirm('确定要取消退款申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await cancelRefund({ refund_id: order.refund_id })
      ElMessage.success('已取消退款申请')
      fetchOrders()
    } catch (error) {
      console.error('取消退款失败:', error)
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

.refund-detail {
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
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 100px;
        color: var(--text-secondary-color);
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        color: var(--text-primary-color);

        &.amount {
          color: #f5222d;
          font-weight: 600;
          font-size: 18px;
        }

        &.reject {
          color: #f5222d;
        }
      }
    }

    .refund-images {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .refund-image {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        cursor: pointer;
      }
    }
  }
}
</style>

// 退款申请弹窗样式
:deep(.el-dialog) {
  .image-upload-area {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .image-item {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #d9d9d9;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .image-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        i {
          font-size: 24px;
          color: #fff;
          cursor: pointer;

          &:hover {
            color: #f5222d;
          }
        }
      }

      &:hover .image-mask {
        opacity: 1;
      }
    }

    .image-uploader {
      width: 80px;
      height: 80px;

      .el-upload {
        width: 100%;
        height: 100%;
        border: none;
      }

      .upload-trigger {
        width: 80px;
        height: 80px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #52c41a;
          color: #52c41a;
        }

        i {
          font-size: 24px;
          color: #8c8c8c;
          margin-bottom: 4px;
        }

        span {
          font-size: 12px;
          color: #8c8c8c;
        }

        &:hover i,
        &:hover span {
          color: #52c41a;
        }
      }
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #8c8c8c;
    line-height: 1.5;
  }
}




