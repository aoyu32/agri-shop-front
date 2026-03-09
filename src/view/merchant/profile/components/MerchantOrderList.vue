<template>
  <div class="merchant-order-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号/买家名称"
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <i class="iconfont icon-sousuo"></i>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <i class="iconfont icon-sousuo"></i>
          搜索
        </el-button>
      </div>

      <!-- 订单表格 -->
      <el-table
        :data="displayOrders"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f5f5', color: '#262626', fontWeight: '600' }"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="买家信息" width="200">
          <template #default="{ row }">
            <div class="buyer-info">
              <el-avatar :src="row.buyer.avatar" :size="32" />
              <div class="buyer-details">
                <div class="buyer-name">{{ row.buyer.name }}</div>
                <div class="buyer-phone">{{ row.buyer.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-list">
              <div v-for="item in row.products" :key="item.id" class="product-item">
                <el-image :src="item.image" style="width: 50px; height: 50px; border-radius: 4px;" fit="cover" />
                <div class="product-details">
                  <div class="product-name">{{ item.name }}</div>
                  <div class="product-spec">{{ item.spec }} × {{ item.quantity }}</div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button v-if="row.status === 'paid'" type="success" size="small" @click="handleShip(row)">发货</el-button>
            <el-button v-if="row.status === 'shipped'" type="info" size="small" @click="handleViewLogistics(row)">查看物流</el-button>
            <el-button v-if="row.status === 'refund'" type="success" size="small" @click="handleRefundApprove(row)">同意{{ row.refundType === 'refund' ? '退款' : '退货' }}</el-button>
            <el-button v-if="row.status === 'refund'" type="danger" size="small" @click="handleRefundReject(row)">拒绝</el-button>
            <el-button v-if="row.status === 'completed' || row.status === 'refund'" type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="shipForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="物流公司" required>
          <el-select v-model="shipForm.logistics" placeholder="请选择物流公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="邮政EMS" value="邮政EMS" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" required>
          <el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="700px">
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <div class="detail-item">
            <span class="label">订单号：</span>
            <span class="value">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">下单时间：</span>
            <span class="value">{{ currentOrder.createTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
          </div>
          <div v-if="currentOrder.refundType" class="detail-item">
            <span class="label">退款类型：</span>
            <span class="value">{{ currentOrder.refundType === 'refund' ? '仅退款' : '退货退款' }}</span>
          </div>
          <div v-if="currentOrder.refundReason" class="detail-item">
            <span class="label">退款原因：</span>
            <span class="value">{{ currentOrder.refundReason }}</span>
          </div>
          <div v-if="currentOrder.refundDescription" class="detail-item">
            <span class="label">问题描述：</span>
            <span class="value">{{ currentOrder.refundDescription }}</span>
          </div>
          <div v-if="currentOrder.refundStatus" class="detail-item">
            <span class="label">退款状态：</span>
            <span class="value">{{ currentOrder.refundStatus }}</span>
          </div>
          <div v-if="currentOrder.refundTime" class="detail-item">
            <span class="label">申请时间：</span>
            <span class="value">{{ currentOrder.refundTime }}</span>
          </div>
          <div v-if="currentOrder.refundImages && currentOrder.refundImages.length > 0" class="detail-item">
            <span class="label">退款凭证：</span>
            <div class="refund-images">
              <el-image
                v-for="(image, index) in currentOrder.refundImages"
                :key="index"
                :src="image.url"
                :preview-src-list="currentOrder.refundImages.map(img => img.url)"
                :initial-index="index"
                fit="cover"
                class="refund-image"
              />
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>买家信息</h4>
          <div class="detail-item">
            <span class="label">买家姓名：</span>
            <span class="value">{{ currentOrder.buyer.name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ currentOrder.buyer.phone }}</span>
          </div>
          <div class="detail-item">
            <span class="label">收货地址：</span>
            <span class="value">{{ currentOrder.address }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>商品信息</h4>
          <el-table :data="currentOrder.products" style="width: 100%">
            <el-table-column label="商品" min-width="200">
              <template #default="{ row }">
                <div class="product-info">
                  <el-image :src="row.image" style="width: 60px; height: 60px; border-radius: 4px;" fit="cover" />
                  <div class="product-text">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-spec">{{ row.spec }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column label="小计" width="100">
              <template #default="{ row }">¥{{ (row.price * row.quantity).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
          <div class="order-footer">
            <div class="total-amount">
              <span>订单总额：</span>
              <span class="amount">¥{{ currentOrder.totalAmount }}</span>
            </div>
            <div class="order-actions">
              <el-button v-if="currentOrder.status === 'paid'" type="success" @click="handleShipFromDetail">发货</el-button>
              <el-button v-if="currentOrder.status === 'shipped'" type="info" @click="handleViewLogistics(currentOrder)">查看物流</el-button>
              <el-button v-if="currentOrder.status === 'refund'" type="success" @click="handleRefundApproveFromDetail">同意{{ currentOrder.refundType === 'refund' ? '退款' : '退货' }}</el-button>
              <el-button v-if="currentOrder.status === 'refund'" type="danger" @click="handleRefundRejectFromDetail">拒绝</el-button>
              <el-button v-if="currentOrder.status === 'completed' || currentOrder.status === 'refund'" type="danger" @click="handleDeleteFromDetail">删除</el-button>
              <el-button @click="detailDialogVisible = false">关闭</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMerchantOrderList,
  getMerchantOrderDetail,
  shipOrder,
  approveRefund,
  rejectRefund,
  deleteMerchantOrder
} from '@/apis/merchantOrder'

const route = useRoute()

// 订单数据
const orders = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 发货对话框
const shipDialogVisible = ref(false)
const shipForm = ref({
  orderId: null,
  orderNo: '',
  logistics: '',
  trackingNo: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 根据路由获取页面标题和筛选状态
const pageTitle = computed(() => {
  const menu = route.query.menu
  const titleMap = {
    'order-pending': '待发货订单',
    'order-shipped': '已发货订单',
    'order-completed': '已完成订单',
    'order-refund': '退货退款',
    'order-all': '所有订单'
  }
  return titleMap[menu] || '订单管理'
})

const currentStatus = computed(() => {
  const menu = route.query.menu
  const statusMap = {
    'order-pending': 'pending',
    'order-shipped': 'shipped',
    'order-completed': 'completed',
    'order-refund': 'refund'
  }
  return statusMap[menu] || ''
})

// 分页显示的订单
const displayOrders = computed(() => {
  return orders.value
})

// 监听路由变化，重置页码并重新加载
watch(() => route.query.menu, () => {
  currentPage.value = 1
  fetchOrders()
})

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }

    if (currentStatus.value) {
      params.status = currentStatus.value
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    const res = await getMerchantOrderList(params)
    orders.value = res.data.list.map(order => ({
      id: order.id,
      orderNo: order.order_no,
      buyer: order.buyer,
      products: order.products,
      totalAmount: order.total_amount,
      status: order.status,
      createTime: order.create_time,
      address: order.address,
      refundType: order.refund_type,
      refundReason: order.refund_reason,
      refundDescription: order.refund_description,
      refundStatus: order.refund_status,
      refundTime: order.refund_time,
      refundImages: order.refund_images || []
    }))
    total.value = res.data.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'paid': 'warning',
    'shipped': 'primary',
    'completed': 'success',
    'refund': 'danger',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '已发货',
    'completed': '已完成',
    'refund': '退款中',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchOrders()
}

const handleViewDetail = async (row) => {
  try {
    const res = await getMerchantOrderDetail(row.id)
    currentOrder.value = {
      ...res.data.order,
      orderNo: res.data.order.order_no,
      createTime: res.data.order.create_time,
      totalAmount: res.data.order.total_amount,
      refundType: res.data.order.refund_type,
      refundReason: res.data.order.refund_reason,
      refundDescription: res.data.order.refund_description,
      refundStatus: res.data.order.refund_status,
      refundTime: res.data.order.refund_time,
      refundImages: res.data.order.refund_images || []
    }
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error(error.message || '获取订单详情失败')
  }
}

const handleShip = (row) => {
  shipForm.value = {
    orderId: row.id,
    orderNo: row.orderNo,
    logistics: '',
    trackingNo: ''
  }
  shipDialogVisible.value = true
}

const confirmShip = async () => {
  if (!shipForm.value.logistics || !shipForm.value.trackingNo) {
    ElMessage.warning('请填写完整的物流信息')
    return
  }

  try {
    await shipOrder({
      order_id: shipForm.value.orderId,
      logistics: shipForm.value.logistics,
      tracking_no: shipForm.value.trackingNo
    })
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    fetchOrders()
  } catch (error) {
    console.error('发货失败:', error)
    ElMessage.error(error.message || '发货失败')
  }
}

const handleViewLogistics = (row) => {
  ElMessage.info(`查看订单 ${row.orderNo} 的物流信息`)
}

const handleShipFromDetail = () => {
  if (currentOrder.value) {
    detailDialogVisible.value = false
    handleShip(currentOrder.value)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该订单吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMerchantOrder(row.id)
      ElMessage.success('删除成功')
      fetchOrders()
    } catch (error) {
      console.error('删除订单失败:', error)
      ElMessage.error(error.message || '删除订单失败')
    }
  }).catch(() => {})
}

const handleDeleteFromDetail = () => {
  if (currentOrder.value) {
    detailDialogVisible.value = false
    handleDelete(currentOrder.value)
  }
}

const handleRefundApprove = (row) => {
  const isRefundOnly = row.refundType === 'refund'
  const typeText = isRefundOnly ? '仅退款' : '退货退款'
  
  if (isRefundOnly) {
    // 仅退款：直接同意
    ElMessageBox.confirm(
      `确定同意该${typeText}申请吗？同意后将直接退款给买家。`,
      '同意退款',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    ).then(async () => {
      try {
        await approveRefund(row.id)
        ElMessage.success('已同意退款申请，系统将自动退款给买家')
        fetchOrders()
      } catch (error) {
        console.error('处理退款申请失败:', error)
        ElMessage.error(error.message || '处理退款申请失败')
      }
    }).catch(() => {})
  } else {
    // 退货退款：需要买家退货
    ElMessageBox.confirm(
      `确定同意该${typeText}申请吗？同意后买家需要先退货，收到货后再退款。`,
      '同意退货',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    ).then(async () => {
      try {
        await approveRefund(row.id)
        ElMessage.success('已同意退货申请，请等待买家退货')
        fetchOrders()
      } catch (error) {
        console.error('处理退款申请失败:', error)
        ElMessage.error(error.message || '处理退款申请失败')
      }
    }).catch(() => {})
  }
}

const handleRefundReject = (row) => {
  const typeText = row.refundType === 'refund' ? '仅退款' : '退货退款'
  ElMessageBox.prompt(`请输入拒绝${typeText}的原因`, '拒绝申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入拒绝原因',
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '请输入拒绝原因'
      }
      return true
    }
  }).then(async ({ value }) => {
    try {
      await rejectRefund({
        order_id: row.id,
        reject_reason: value
      })
      ElMessage.success('已拒绝申请')
      fetchOrders()
    } catch (error) {
      console.error('处理退款申请失败:', error)
      ElMessage.error(error.message || '处理退款申请失败')
    }
  }).catch(() => {})
}

const handleRefundApproveFromDetail = () => {
  if (currentOrder.value) {
    detailDialogVisible.value = false
    handleRefundApprove(currentOrder.value)
  }
}

const handleRefundRejectFromDetail = () => {
  if (currentOrder.value) {
    detailDialogVisible.value = false
    handleRefundReject(currentOrder.value)
  }
}

// 初始化
onMounted(() => {
  fetchOrders()
})
</script>

<style lang="scss" scoped>
.merchant-order-list {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    .card-header {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .buyer-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .buyer-details {
      .buyer-name {
        font-size: 14px;
        color: #262626;
        margin-bottom: 4px;
      }

      .buyer-phone {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }

  .product-list {
    .product-item {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .product-details {
        flex: 1;

        .product-name {
          font-size: 14px;
          color: #262626;
          margin-bottom: 4px;
        }

        .product-spec {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }

  .amount {
    color: #f5222d;
    font-weight: 600;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .order-detail {
    .detail-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: 15px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .detail-item {
        display: flex;
        padding: 8px 0;

        .label {
          width: 100px;
          color: #8c8c8c;
          font-size: 14px;
          flex-shrink: 0;
        }

        .value {
          flex: 1;
          color: #262626;
          font-size: 14px;
        }

        .refund-images {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;

          .refund-image {
            width: 100px;
            height: 100px;
            border-radius: 6px;
            cursor: pointer;
            border: 1px solid #d9d9d9;

            &:hover {
              border-color: var(--theme-primary-color);
            }
          }
        }
      }

      .product-info {
        display: flex;
        gap: 12px;

        .product-text {
          .product-name {
            font-size: 14px;
            color: #262626;
            margin-bottom: 4px;
          }

          .product-spec {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;

        .total-amount {
          font-size: 16px;

          .amount {
            font-size: 20px;
            font-weight: 600;
            color: #f5222d;
            margin-left: 8px;
          }
        }

        .order-actions {
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}
</style>
