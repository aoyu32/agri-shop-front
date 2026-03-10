<template>
  <div class="merchant-refund-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>退款管理</span>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="statusFilter" placeholder="退款状态" style="width: 150px" @change="fetchRefunds">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已同意" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已退款" value="refunded" />
          <el-option label="已关闭" value="closed" />
        </el-select>
      </div>

      <!-- 退款表格 -->
      <el-table
        :data="refunds"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f5f5', color: '#262626', fontWeight: '600' }"
      >
        <el-table-column prop="refund_no" label="退款单号" width="180" />
        <el-table-column label="买家信息" width="200">
          <template #default="{ row }">
            <div class="buyer-info">
              <el-avatar :src="row.buyer.avatar" :size="32">
                <i class="iconfont icon-yonghu"></i>
              </el-avatar>
              <div class="buyer-details">
                <div class="buyer-name">{{ row.buyer.name }}</div>
                <div class="buyer-phone">{{ row.buyer.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column label="退款信息" min-width="200">
          <template #default="{ row }">
            <div class="refund-info">
              <div class="refund-type">{{ row.refund_type_text }}</div>
              <div class="refund-reason">{{ row.refund_reason }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="refund_amount" label="退款金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.refund_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="退款状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              同意退款
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝退款
            </el-button>
            <el-button
              v-if="row.status === 'approved'"
              type="primary"
              size="small"
              @click="handleConfirm(row)"
            >
              确认退款完成
            </el-button>
            <el-button
              v-if="['rejected', 'refunded', 'closed'].includes(row.status)"
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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

    <!-- 退款详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="退款详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRefund" class="refund-detail">
        <div class="detail-section">
          <h4>退款信息</h4>
          <div class="detail-item">
            <span class="label">退款单号：</span>
            <span class="value">{{ currentRefund.refund_no }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单号：</span>
            <span class="value">{{ currentRefund.order_no }}</span>
          </div>
          <div class="detail-item">
            <span class="label">退款状态：</span>
            <el-tag :type="getStatusType(currentRefund.status)">{{ currentRefund.status_text }}</el-tag>
          </div>
          <div class="detail-item">
            <span class="label">退款类型：</span>
            <span class="value">{{ currentRefund.refund_type_text }}</span>
          </div>
          <div class="detail-item">
            <span class="label">退款金额：</span>
            <span class="value amount">¥{{ currentRefund.refund_amount }}</span>
          </div>
          <div class="detail-item">
            <span class="label">申请时间：</span>
            <span class="value">{{ currentRefund.created_at }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>买家信息</h4>
          <div class="detail-item">
            <span class="label">买家姓名：</span>
            <span class="value">{{ currentRefund.buyer.name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ currentRefund.buyer.phone }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>退款原因</h4>
          <div class="detail-item">
            <span class="label">退款原因：</span>
            <span class="value">{{ currentRefund.refund_reason }}</span>
          </div>
          <div v-if="currentRefund.refund_description" class="detail-item">
            <span class="label">退款说明：</span>
            <span class="value">{{ currentRefund.refund_description }}</span>
          </div>
          <div v-if="currentRefund.refund_images && currentRefund.refund_images.length > 0" class="detail-item">
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
          <div class="detail-item">
            <span class="value reject">{{ currentRefund.reject_reason }}</span>
          </div>
        </div>

        <div v-if="currentRefund.order_info" class="detail-section">
          <h4>订单信息</h4>
          <div class="detail-item">
            <span class="label">订单号：</span>
            <span class="value">{{ currentRefund.order_info.order_no }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单金额：</span>
            <span class="value">¥{{ currentRefund.order_info.actual_amount }}</span>
          </div>
          <div class="detail-item">
            <span class="label">收货地址：</span>
            <span class="value">{{ currentRefund.order_info.receiver_address }}</span>
          </div>
          <el-table :data="currentRefund.order_info.items" style="width: 100%; margin-top: 12px">
            <el-table-column label="商品" min-width="200">
              <template #default="{ row }">
                <div class="product-info">
                  <el-image :src="row.product_image" style="width: 60px; height: 60px; border-radius: 4px;" fit="cover" />
                  <div class="product-text">
                    <div class="product-name">{{ row.product_name }}</div>
                    <div class="product-spec">{{ row.spec_label || '默认' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
          </el-table>
        </div>

        <div class="detail-actions">
          <el-button
            v-if="currentRefund.status === 'pending'"
            type="success"
            @click="handleApproveFromDetail"
          >
            同意退款
          </el-button>
          <el-button
            v-if="currentRefund.status === 'pending'"
            type="danger"
            @click="handleRejectFromDetail"
          >
            拒绝退款
          </el-button>
          <el-button
            v-if="currentRefund.status === 'approved'"
            type="primary"
            @click="handleConfirmFromDetail"
          >
            确认退款完成
          </el-button>
          <el-button
            v-if="['rejected', 'refunded', 'closed'].includes(currentRefund.status)"
            type="danger"
            @click="handleDeleteFromDetail"
          >
            删除
          </el-button>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 拒绝退款弹窗 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝退款"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reject_reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleSubmitReject" :loading="rejecting">确定拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMerchantRefundList,
  getMerchantRefundDetail,
  approveRefund,
  rejectRefund,
  confirmRefund,
  deleteRefund
} from '@/apis/merchantRefund'

const loading = ref(false)
const refunds = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const statusFilter = ref('')

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRefund = ref(null)

// 拒绝弹窗
const rejectDialogVisible = ref(false)
const rejectForm = ref({
  refund_id: null,
  reject_reason: ''
})
const rejecting = ref(false)

// 获取退款列表
const fetchRefunds = async () => {
  loading.value = true
  try {
    const res = await getMerchantRefundList({
      status: statusFilter.value,
      page: currentPage.value,
      page_size: pageSize.value
    })
    refunds.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取退款列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'refunded': 'success',
    'closed': 'info'
  }
  return typeMap[status] || 'info'
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchRefunds()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchRefunds()
}

// 查看详情
const handleViewDetail = async (refund) => {
  try {
    const res = await getMerchantRefundDetail({ refund_id: refund.id })
    currentRefund.value = res.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取退款详情失败:', error)
  }
}

// 同意退款
const handleApprove = (refund) => {
  ElMessageBox.confirm(
    `确定同意退款申请吗？退款金额：¥${refund.refund_amount}`,
    '同意退款',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await approveRefund({ refund_id: refund.id })
      ElMessage.success('已同意退款申请')
      fetchRefunds()
    } catch (error) {
      console.error('同意退款失败:', error)
    }
  }).catch(() => {})
}

// 拒绝退款
const handleReject = (refund) => {
  rejectForm.value = {
    refund_id: refund.id,
    reject_reason: ''
  }
  rejectDialogVisible.value = true
}

// 提交拒绝
const handleSubmitReject = async () => {
  if (!rejectForm.value.reject_reason) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  rejecting.value = true
  try {
    await rejectRefund(rejectForm.value)
    ElMessage.success('已拒绝退款申请')
    rejectDialogVisible.value = false
    fetchRefunds()
  } catch (error) {
    console.error('拒绝退款失败:', error)
  } finally {
    rejecting.value = false
  }
}

// 确认退款完成
const handleConfirm = (refund) => {
  ElMessageBox.confirm(
    '确认已完成退款操作吗？',
    '确认退款',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await confirmRefund({ refund_id: refund.id })
      ElMessage.success('退款已完成')
      fetchRefunds()
    } catch (error) {
      console.error('确认退款失败:', error)
    }
  }).catch(() => {})
}

// 删除退款记录
const handleDelete = (refund) => {
  ElMessageBox.confirm(
    '确定要删除这条退款记录吗？删除后将无法恢复。',
    '删除退款记录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteRefund({ refund_id: refund.id })
      ElMessage.success('删除成功')
      fetchRefunds()
    } catch (error) {
      console.error('删除退款记录失败:', error)
    }
  }).catch(() => {})
}

// 从详情页操作
const handleApproveFromDetail = () => {
  if (currentRefund.value) {
    detailDialogVisible.value = false
    handleApprove(currentRefund.value)
  }
}

const handleRejectFromDetail = () => {
  if (currentRefund.value) {
    detailDialogVisible.value = false
    handleReject(currentRefund.value)
  }
}

const handleConfirmFromDetail = () => {
  if (currentRefund.value) {
    detailDialogVisible.value = false
    handleConfirm(currentRefund.value)
  }
}

const handleDeleteFromDetail = () => {
  if (currentRefund.value) {
    detailDialogVisible.value = false
    handleDelete(currentRefund.value)
  }
}

onMounted(() => {
  fetchRefunds()
})
</script>

<style lang="scss" scoped>
.merchant-refund-list {
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

  .refund-info {
    .refund-type {
      font-size: 14px;
      color: #262626;
      margin-bottom: 4px;
    }

    .refund-reason {
      font-size: 12px;
      color: #8c8c8c;
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

  .refund-detail {
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
        align-items: flex-start;

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

          &.amount {
            color: #f5222d;
            font-weight: 600;
            font-size: 18px;
          }

          &.reject {
            color: #f5222d;
          }
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
    }

    .detail-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>
