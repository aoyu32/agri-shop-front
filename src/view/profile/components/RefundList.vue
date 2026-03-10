<template>
  <div class="refund-list" v-loading="loading">
    <div class="list-header">
      <h3>退货退款</h3>
    </div>

    <div v-if="refunds.length === 0" class="empty-state">
      <i class="iconfont icon-dingdan"></i>
      <p>暂无退款记录</p>
    </div>

    <div v-else class="refund-items">
      <div v-for="refund in refunds" :key="refund.id" class="refund-card">
        <div class="card-header">
          <div class="refund-info">
            <span class="refund-no">退款单号：{{ refund.refund_no }}</span>
            <span class="order-no">订单号：{{ refund.order_no }}</span>
            <span class="refund-time">申请时间：{{ refund.created_at }}</span>
          </div>
          <div class="refund-status" :class="'status-' + refund.status">
            {{ refund.status_text }}
          </div>
        </div>

        <div class="card-body">
          <div class="refund-detail">
            <div class="detail-row">
              <span class="label">退款类型：</span>
              <span class="value">{{ refund.refund_type_text }}</span>
            </div>
            <div class="detail-row">
              <span class="label">退款金额：</span>
              <span class="value amount">¥{{ refund.refund_amount }}</span>
            </div>
            <div class="detail-row">
              <span class="label">退款原因：</span>
              <span class="value">{{ refund.refund_reason }}</span>
            </div>
            <div v-if="refund.refund_description" class="detail-row">
              <span class="label">退款说明：</span>
              <span class="value">{{ refund.refund_description }}</span>
            </div>
            <div v-if="refund.reject_reason" class="detail-row">
              <span class="label">拒绝原因：</span>
              <span class="value reject">{{ refund.reject_reason }}</span>
            </div>
          </div>

          <div v-if="refund.refund_images && refund.refund_images.length > 0" class="refund-images">
            <el-image
              v-for="(image, index) in refund.refund_images"
              :key="index"
              :src="image"
              :preview-src-list="refund.refund_images"
              :initial-index="index"
              fit="cover"
              class="refund-image"
            />
          </div>
        </div>

        <div class="card-footer">
          <div class="refund-actions">
            <el-button
              v-if="refund.status === 'pending'"
              type="danger"
              size="small"
              @click="handleCancelRefund(refund)"
            >
              取消申请
            </el-button>
            <el-button size="small" @click="handleViewDetail(refund)">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchRefunds"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyRefundList, cancelRefund } from '@/apis/refund'

const loading = ref(false)
const refunds = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取退款列表
const fetchRefunds = async () => {
  loading.value = true
  try {
    const res = await getMyRefundList({
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

// 取消退款申请
const handleCancelRefund = (refund) => {
  ElMessageBox.confirm('确定要取消退款申请吗？', '取消退款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await cancelRefund({ refund_id: refund.id })
      ElMessage.success('已取消退款申请')
      fetchRefunds()
    } catch (error) {
      console.error('取消退款失败:', error)
    }
  }).catch(() => {})
}

// 查看详情
const handleViewDetail = (refund) => {
  ElMessage.info('查看退款详情')
  // TODO: 跳转到退款详情页或打开详情弹窗
}

onMounted(() => {
  fetchRefunds()
})
</script>

<style lang="scss" scoped>
.refund-list {
  .list-header {
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

  .refund-items {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .refund-card {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: var(--bg-gray);
        border-bottom: 1px solid var(--border-color);

        .refund-info {
          display: flex;
          align-items: center;
          gap: 24px;
          font-size: 13px;
          color: var(--text-secondary-color);

          .refund-no {
            font-weight: 500;
            color: var(--text-primary-color);
          }
        }

        .refund-status {
          font-size: 14px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 4px;

          &.status-pending {
            color: #faad14;
            background-color: #fffbe6;
          }

          &.status-approved {
            color: #52c41a;
            background-color: #f6ffed;
          }

          &.status-rejected {
            color: #f5222d;
            background-color: #fff1f0;
          }

          &.status-refunded {
            color: #1890ff;
            background-color: #e6f7ff;
          }

          &.status-closed {
            color: #8c8c8c;
            background-color: #f5f5f5;
          }
        }
      }

      .card-body {
        padding: 16px;

        .refund-detail {
          .detail-row {
            display: flex;
            margin-bottom: 8px;
            font-size: 14px;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              width: 80px;
              color: var(--text-secondary-color);
              flex-shrink: 0;
            }

            .value {
              flex: 1;
              color: var(--text-primary-color);

              &.amount {
                color: #f5222d;
                font-weight: 600;
                font-size: 16px;
              }

              &.reject {
                color: #f5222d;
              }
            }
          }
        }

        .refund-images {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;

          .refund-image {
            width: 80px;
            height: 80px;
            border-radius: 6px;
            cursor: pointer;
          }
        }
      }

      .card-footer {
        padding: 12px 16px;
        background-color: var(--bg-gray);
        border-top: 1px solid var(--border-color);

        .refund-actions {
          display: flex;
          justify-content: flex-end;
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
</style>
