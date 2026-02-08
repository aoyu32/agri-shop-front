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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button v-if="row.status === 'pending'" type="success" size="small" @click="handleShip(row)">发货</el-button>
            <el-button v-if="row.status === 'shipped'" type="info" size="small" @click="handleViewLogistics(row)">查看物流</el-button>
            <el-button v-if="row.status === 'completed'" type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredOrders.length"
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
              <el-button v-if="currentOrder.status === 'pending'" type="success" @click="handleShipFromDetail">发货</el-button>
              <el-button v-if="currentOrder.status === 'shipped'" type="info" @click="handleViewLogistics(currentOrder)">查看物流</el-button>
              <el-button v-if="currentOrder.status === 'completed'" type="danger" @click="handleDeleteFromDetail">删除</el-button>
              <el-button @click="detailDialogVisible = false">关闭</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()

// 模拟订单数据
const mockOrders = ref([
  {
    id: 1,
    orderNo: 'ORD202402080001',
    buyer: {
      name: '张三',
      phone: '138****1234',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    products: [
      { id: 1, name: '有机西红柿', spec: '500g/份', quantity: 2, price: 15.80, image: 'https://via.placeholder.com/100' },
      { id: 2, name: '新鲜黄瓜', spec: '500g/份', quantity: 1, price: 8.50, image: 'https://via.placeholder.com/100' }
    ],
    totalAmount: 40.10,
    status: 'pending',
    createTime: '2024-02-08 10:30:25',
    address: '山东省济南市历下区解放路100号'
  },
  {
    id: 2,
    orderNo: 'ORD202402080002',
    buyer: {
      name: '李四',
      phone: '139****5678',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    products: [
      { id: 3, name: '有机生菜', spec: '300g/份', quantity: 3, price: 12.00, image: 'https://via.placeholder.com/100' }
    ],
    totalAmount: 36.00,
    status: 'shipped',
    createTime: '2024-02-07 15:20:10',
    address: '山东省青岛市市南区香港中路200号'
  },
  {
    id: 3,
    orderNo: 'ORD202402080003',
    buyer: {
      name: '王五',
      phone: '137****9012',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    products: [
      { id: 4, name: '新鲜菠菜', spec: '500g/份', quantity: 1, price: 9.90, image: 'https://via.placeholder.com/100' },
      { id: 5, name: '有机芹菜', spec: '500g/份', quantity: 2, price: 11.50, image: 'https://via.placeholder.com/100' }
    ],
    totalAmount: 32.90,
    status: 'completed',
    createTime: '2024-02-06 09:15:30',
    address: '山东省烟台市芝罘区南大街300号'
  }
])

const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 发货对话框
const shipDialogVisible = ref(false)
const shipForm = ref({
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
    'order-all': '所有订单'
  }
  return titleMap[menu] || '订单管理'
})

const currentStatus = computed(() => {
  const menu = route.query.menu
  const statusMap = {
    'order-pending': 'pending',
    'order-shipped': 'shipped',
    'order-completed': 'completed'
  }
  return statusMap[menu] || 'all'
})

// 筛选订单
const filteredOrders = computed(() => {
  let orders = mockOrders.value

  // 按状态筛选
  if (currentStatus.value !== 'all') {
    orders = orders.filter(order => order.status === currentStatus.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    orders = orders.filter(order =>
      order.orderNo.toLowerCase().includes(keyword) ||
      order.buyer.name.toLowerCase().includes(keyword)
    )
  }

  return orders
})

// 分页显示的订单
const displayOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

// 监听路由变化，重置页码
watch(() => route.query.menu, () => {
  currentPage.value = 1
})

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'shipped': 'primary',
    'completed': 'success'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待发货',
    'shipped': '已发货',
    'completed': '已完成'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = () => {
  currentPage.value = 1
}

const handleCurrentChange = () => {
  // 页码变化
}

const handleViewDetail = (row) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

const handleShip = (row) => {
  shipForm.value = {
    orderNo: row.orderNo,
    logistics: '',
    trackingNo: ''
  }
  shipDialogVisible.value = true
}

const confirmShip = () => {
  if (!shipForm.value.logistics || !shipForm.value.trackingNo) {
    ElMessage.warning('请填写完整的物流信息')
    return
  }

  // 模拟发货
  const order = mockOrders.value.find(o => o.orderNo === shipForm.value.orderNo)
  if (order) {
    order.status = 'shipped'
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
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
  }).then(() => {
    const index = mockOrders.value.findIndex(o => o.id === row.id)
    if (index > -1) {
      mockOrders.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleDeleteFromDetail = () => {
  if (currentOrder.value) {
    detailDialogVisible.value = false
    handleDelete(currentOrder.value)
  }
}
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
        }

        .value {
          flex: 1;
          color: #262626;
          font-size: 14px;
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
