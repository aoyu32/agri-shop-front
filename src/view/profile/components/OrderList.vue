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
            <span v-if="order.status === 'refund'" class="refund-info">
              退款原因：{{ order.refundReason }} | {{ order.refundStatus }}
            </span>
            <span v-else>
              实付款：<span class="price">¥{{ order.totalAmount }}</span>
            </span>
          </div>
          <div class="order-actions">
            <el-button v-if="order.status === 'pending'" type="primary" size="small" @click="handlePay(order)">
              去支付
            </el-button>
            <el-button v-if="order.status === 'shipped'" type="primary" size="small" @click="handleConfirm(order)">
              确认收货
            </el-button>
            <el-button v-if="order.status === 'completed' && !order.reviewed" type="primary" size="small" @click="handleReview(order)">
              去评价
            </el-button>
            <el-button v-if="order.status === 'completed'" size="small" @click="handleRefund(order)">
              退货退款
            </el-button>
            <el-button size="small" @click="handleViewDetail(order)">查看详情</el-button>
            <el-button v-if="order.status === 'pending' || order.status === 'paid'" size="small" @click="handleCancel(order)">
              取消订单
            </el-button>
            <el-button v-if="order.status === 'refund'" type="danger" size="small" disabled>
              {{ order.refundStatus }}
            </el-button>
            <el-button v-if="order.status === 'completed'" size="small" @click="handleDelete(order)">
              删除订单
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="700px"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusText }}</el-tag>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span class="value">{{ currentOrder.createTime }}</span>
          </div>
          <div v-if="currentOrder.completeTime" class="detail-row">
            <span class="label">完成时间：</span>
            <span class="value">{{ currentOrder.completeTime }}</span>
          </div>
          <div v-if="currentOrder.refundReason" class="detail-row">
            <span class="label">退款原因：</span>
            <span class="value">{{ currentOrder.refundReason }}</span>
          </div>
          <div v-if="currentOrder.refundStatus" class="detail-row">
            <span class="label">退款状态：</span>
            <span class="value">{{ currentOrder.refundStatus }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>商品信息</h4>
          <div v-for="product in currentOrder.products" :key="product.id" class="detail-product">
            <img :src="product.image" :alt="product.name" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-spec">{{ product.spec }}</div>
            </div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-quantity">x{{ product.quantity }}</div>
            <div class="product-total">¥{{ (product.price * product.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h4>费用信息</h4>
          <div class="detail-row">
            <span class="label">商品总额：</span>
            <span class="value">¥{{ currentOrder.totalAmount }}</span>
          </div>
          <div class="detail-row">
            <span class="label">运费：</span>
            <span class="value">¥0.00</span>
          </div>
          <div class="detail-row total-row">
            <span class="label">实付款：</span>
            <span class="value price">¥{{ currentOrder.totalAmount }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 退货退款弹窗 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="退货退款"
      width="500px"
    >
      <div class="refund-dialog">
        <div class="refund-type-select">
          <h4>请选择服务类型</h4>
          <el-radio-group v-model="refundType" class="refund-type-group">
            <el-radio value="refund" size="large">
              <div class="radio-content">
                <div class="radio-title">仅退款</div>
                <div class="radio-desc">未收到货，或与商家协商同意不退货只退款</div>
              </div>
            </el-radio>
            <el-radio value="return" size="large">
              <div class="radio-content">
                <div class="radio-title">退货退款</div>
                <div class="radio-desc">已收到货，需要退还商品</div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <div class="refund-reason">
          <h4>退款原因</h4>
          <el-select v-model="refundReason" placeholder="请选择退款原因" style="width: 100%">
            <el-option label="商品质量问题" value="商品质量问题" />
            <el-option label="商品与描述不符" value="商品与描述不符" />
            <el-option label="商品破损" value="商品破损" />
            <el-option label="发错货" value="发错货" />
            <el-option label="不想要了" value="不想要了" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </div>

        <div class="refund-description">
          <h4>问题描述（选填）</h4>
          <el-input
            v-model="refundDescription"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的问题，有助于我们更快处理"
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="refund-images">
          <h4>上传凭证（选填，最多5张）</h4>
          <div class="image-upload-area">
            <div v-for="(image, index) in refundImages" :key="index" class="image-item">
              <img :src="image.url" :alt="image.name" />
              <div class="image-mask">
                <i class="iconfont icon-shanchu" @click="handleRemoveImage(index)"></i>
              </div>
            </div>
            <el-upload
              v-if="refundImages.length < 5"
              class="image-uploader"
              :show-file-list="false"
              :before-upload="handleImageUpload"
              accept="image/*"
            >
              <div class="upload-trigger">
                <i class="iconfont icon-tupian"></i>
                <span>上传图片</span>
              </div>
            </el-upload>
          </div>
          <div class="upload-tips">
            <i class="iconfont icon-tishi"></i>
            <span>支持jpg、png格式，单张图片不超过5MB</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRefund">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const searchKeyword = ref('')

// 订单详情弹窗
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 退货退款弹窗
const refundDialogVisible = ref(false)
const refundType = ref('refund')
const refundReason = ref('')
const refundDescription = ref('')
const refundImages = ref([])
const currentRefundOrder = ref(null)

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
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop'
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
  },
  {
    id: 4,
    orderNo: '202601190004',
    status: 'completed',
    statusText: '已完成',
    createTime: '2026-01-19 14:30:00',
    completeTime: '2026-01-21 10:00:00',
    totalAmount: '35.00',
    reviewed: false,
    products: [
      {
        id: 5,
        name: '新鲜菠菜',
        spec: '500g/份',
        price: '12.00',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100&h=100&fit=crop'
      },
      {
        id: 6,
        name: '有机生菜',
        spec: '300g/份',
        price: '11.00',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    id: 5,
    orderNo: '202601180005',
    status: 'completed',
    statusText: '已完成',
    createTime: '2026-01-18 11:20:00',
    completeTime: '2026-01-20 16:30:00',
    totalAmount: '56.00',
    reviewed: true,
    products: [
      {
        id: 7,
        name: '新鲜胡萝卜',
        spec: '1kg/份',
        price: '14.00',
        quantity: 4,
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    id: 6,
    orderNo: '202601170006',
    status: 'refund',
    statusText: '退款中',
    createTime: '2026-01-17 14:30:00',
    totalAmount: '28.00',
    refundReason: '商品质量问题',
    refundStatus: '商家已同意',
    refundTime: '2026-01-18 10:00:00',
    products: [
      {
        id: 8,
        name: '新鲜白菜',
        spec: '1kg/份',
        price: '7.00',
        quantity: 4,
        image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    id: 7,
    orderNo: '202601160007',
    status: 'refund',
    statusText: '退款成功',
    createTime: '2026-01-16 11:20:00',
    totalAmount: '42.00',
    refundReason: '不想要了',
    refundStatus: '退款已完成',
    refundTime: '2026-01-17 16:30:00',
    products: [
      {
        id: 9,
        name: '新鲜土豆',
        spec: '2kg/份',
        price: '21.00',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&h=100&fit=crop'
      }
    ]
  }
])

// 页面标题
const pageTitle = computed(() => {
  const menu = route.query.menu
  const titles = {
    'order-pending': '待付款',
    'order-paid': '待发货',
    'order-shipped': '待收货',
    'order-completed': '已完成',
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
  } else if (menu === 'order-completed') {
    result = result.filter(o => o.status === 'completed')
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
    completed: 'success',
    refund: 'danger'
  }
  return types[status] || 'info'
}

const handlePay = (order) => {
  // 跳转到支付页面，传递商品信息
  router.push({
    path: '/payment',
    query: {
      orderNo: order.orderNo,
      amount: order.totalAmount,
      products: encodeURIComponent(JSON.stringify(order.products))
    }
  })
}

const handleConfirm = (order) => {
  ElMessageBox.confirm('确认收到商品了吗？', '确认收货', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    order.status = 'completed'
    order.statusText = '已完成'
    order.completeTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
    order.reviewed = false
    ElMessage.success('确认收货成功')
  }).catch(() => {})
}

const handleReview = (order) => {
  ElMessage.info('跳转到评价页面')
  // 模拟评价完成
  order.reviewed = true
}

const handleRefund = (order) => {
  currentRefundOrder.value = order
  refundType.value = 'refund'
  refundReason.value = ''
  refundDescription.value = ''
  refundImages.value = []
  refundDialogVisible.value = true
}

const handleImageUpload = (file) => {
  // 检查文件大小（5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.warning('图片大小不能超过 5MB')
    return false
  }

  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return false
  }

  // 检查数量
  if (refundImages.value.length >= 5) {
    ElMessage.warning('最多只能上传5张图片')
    return false
  }

  // 模拟图片上传，实际项目中应该上传到服务器
  const reader = new FileReader()
  reader.onload = (e) => {
    refundImages.value.push({
      url: e.target.result,
      name: file.name
    })
  }
  reader.readAsDataURL(file)
  return false // 阻止自动上传
}

const handleRemoveImage = (index) => {
  refundImages.value.splice(index, 1)
}

const handleSubmitRefund = () => {
  if (!refundReason.value) {
    ElMessage.warning('请选择退款原因')
    return
  }

  const order = currentRefundOrder.value
  const typeText = refundType.value === 'refund' ? '仅退款' : '退货退款'
  
  order.status = 'refund'
  order.statusText = '退款中'
  order.refundType = refundType.value
  order.refundReason = refundReason.value
  order.refundDescription = refundDescription.value
  order.refundImages = [...refundImages.value]
  order.refundStatus = '待商家处理'
  order.refundTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
  
  refundDialogVisible.value = false
  ElMessage.success(`${typeText}申请已提交`)
}

const handleViewDetail = (order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
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

const handleDelete = (order) => {
  ElMessageBox.confirm('确定要删除该订单吗？删除后无法恢复。', '删除订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = orders.value.findIndex(o => o.id === order.id)
    if (index > -1) {
      orders.value.splice(index, 1)
      ElMessage.success('订单已删除')
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
            color: #f5222d;
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

          .refund-info {
            font-size: 14px;
            color: #f5222d;
          }

          .price {
            font-size: 20px;
            font-weight: 600;
            color: #f5222d;
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

// 订单详情弹窗样式
.order-detail {
  .detail-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
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

      &.total-row {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed var(--border-color);
        font-size: 16px;
        font-weight: 600;
        justify-content: flex-end;
        gap: 12px;
      }

      .label {
        width: 100px;
        color: var(--text-secondary-color);
      }

      .value {
        flex: 1;
        color: var(--text-primary-color);

        &.price {
          font-size: 20px;
          font-weight: 600;
          color: #f5222d;
          flex: none;
        }
      }
    }

    .detail-product {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg-gray);
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
        color: #f5222d;
      }

      .product-quantity {
        width: 50px;
        text-align: center;
        font-size: 14px;
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

// 退货退款弹窗样式
.refund-dialog {
  .refund-type-select {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary-color);
    }

    .refund-type-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;

      :deep(.el-radio) {
        width: 100%;
        height: auto;
        margin-right: 0;
        padding: 16px;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          border-color: var(--theme-primary-color);
        }

        &.is-checked {
          border-color: var(--theme-primary-color);
          background: rgba(82, 196, 26, 0.05);
        }

        .el-radio__input {
          display: none;
        }

        .el-radio__label {
          padding-left: 0;
          width: 100%;
        }
      }

      .radio-content {
        .radio-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary-color);
          margin-bottom: 6px;
        }

        .radio-desc {
          font-size: 13px;
          color: var(--text-secondary-color);
          line-height: 1.5;
        }
      }
    }
  }

  .refund-reason,
  .refund-description,
  .refund-images {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      margin: 0 0 12px 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .refund-images {
    .image-upload-area {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 8px;

      .image-item {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--border-color);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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

        .upload-trigger {
          width: 80px;
          height: 80px;
          border: 1px dashed var(--border-color);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--theme-primary-color);
            color: var(--theme-primary-color);
          }

          i {
            font-size: 24px;
            color: var(--text-placeholder-color);
            margin-bottom: 4px;
          }

          span {
            font-size: 12px;
            color: var(--text-secondary-color);
          }

          &:hover i,
          &:hover span {
            color: var(--theme-primary-color);
          }
        }
      }
    }

    .upload-tips {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary-color);

      i {
        font-size: 14px;
      }
    }
  }
}
</style>
