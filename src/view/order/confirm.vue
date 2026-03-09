<template>
  <div class="order-confirm-page">
    <div class="page-header">
      <h2>确认订单</h2>
    </div>

    <div class="confirm-content">
      <!-- 收货地址 -->
      <div class="section-card address-section">
        <div class="section-title">
          <i class="iconfont icon-didian"></i>
          收货地址
        </div>
        
        <!-- 有地址时显示 -->
        <div v-if="addresses.length > 0" class="address-content">
          <!-- 当前选中的地址 -->
          <div v-if="selectedAddress" class="selected-address" @click="showAddressSelector = true">
            <div class="address-info">
              <div class="address-header">
                <span class="name">{{ selectedAddress.receiver_name }}</span>
                <span class="phone">{{ selectedAddress.receiver_phone }}</span>
                <el-tag v-if="selectedAddress.is_default === 1" type="success" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ selectedAddress.full_address }}
              </div>
            </div>
            <div class="change-btn">
              <span>更换地址</span>
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>

          <!-- 地址选择对话框 -->
          <el-dialog
            v-model="showAddressSelector"
            title="选择收货地址"
            width="600px"
          >
            <div class="address-selector">
              <div
                v-for="address in addresses"
                :key="address.id"
                class="address-item"
                :class="{ active: selectedAddressId === address.id }"
                @click="selectAddress(address)"
              >
                <div class="address-radio">
                  <el-radio :model-value="selectedAddressId" :label="address.id" />
                </div>
                <div class="address-info">
                  <div class="address-header">
                    <span class="name">{{ address.receiver_name }}</span>
                    <span class="phone">{{ address.receiver_phone }}</span>
                    <el-tag v-if="address.is_default === 1" type="success" size="small">默认</el-tag>
                  </div>
                  <div class="address-detail">
                    {{ address.full_address }}
                  </div>
                </div>
              </div>
            </div>
            <template #footer>
              <el-button @click="handleAddAddress">新增地址</el-button>
              <el-button type="primary" @click="confirmAddress">确定</el-button>
            </template>
          </el-dialog>
        </div>

        <!-- 无地址时显示 -->
        <div v-else class="no-address">
          <div class="empty-state">
            <i class="iconfont icon-didian"></i>
            <p>您还没有收货地址</p>
            <el-button type="primary" @click="handleAddAddress">添加收货地址</el-button>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="section-card goods-section">
        <div class="section-title">
          <i class="iconfont icon-shangpin"></i>
          商品信息
        </div>
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else class="goods-list">
          <div v-for="item in cartItems" :key="item.id" class="goods-item">
            <img :src="item.image" :alt="item.name" class="goods-image" />
            <div class="goods-info">
              <div class="goods-name">{{ item.name }}</div>
              <div class="goods-spec">{{ item.spec }}</div>
            </div>
            <div class="goods-price">¥{{ item.price }}</div>
            <div class="goods-quantity">x{{ item.quantity }}</div>
            <div class="goods-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- 订单备注 -->
      <div class="section-card remark-section">
        <div class="section-title">
          <i class="iconfont icon-bianji"></i>
          订单备注
        </div>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="选填，可以告诉商家您的特殊需求"
          maxlength="200"
          show-word-limit
        />
      </div>

      <!-- 订单金额 -->
      <div class="section-card amount-section">
        <div class="section-title">
          <i class="iconfont icon-jine"></i>
          订单金额
        </div>
        <div class="amount-list">
          <div class="amount-item">
            <span class="amount-label">商品总额</span>
            <span class="amount-value">¥{{ totalAmount }}</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">运费</span>
            <span class="amount-value">¥0.00</span>
          </div>
          <div class="amount-item total">
            <span class="amount-label">应付总额</span>
            <span class="amount-value highlight">¥{{ totalAmount }}</span>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="section-card footer-section">
        <div class="footer-content">
          <div class="footer-left">
            <span class="total-text">
              共 <span class="highlight">{{ cartItems.length }}</span> 件商品，
              合计：<span class="total-price">¥{{ totalAmount }}</span>
            </span>
          </div>
          <div class="footer-right">
            <el-button size="large" @click="handleBack">返回购物车</el-button>
            <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getCartList } from '@/apis/cart'
import { createOrder } from '@/apis/order'
import { getAddressList, getDefaultAddress } from '@/apis/address'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const submitting = ref(false)
const cartItems = ref([])
const remark = ref('')
const addresses = ref([])
const selectedAddressId = ref(null)
const selectedAddress = ref(null)
const showAddressSelector = ref(false)

// 收货地址表单（无地址时使用）
const addressForm = ref({
  receiver_name: userStore.userInfo.username || '',
  receiver_phone: userStore.userInfo.phone || '',
  receiver_address: userStore.userInfo.address || ''
})

// 总金额
const totalAmount = computed(() => {
  return cartItems.value
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

// 获取地址列表
const fetchAddresses = async () => {
  try {
    const res = await getAddressList()
    addresses.value = res.data.list
    
    // 如果有地址，选择默认地址或第一个地址
    if (addresses.value.length > 0) {
      const defaultAddr = addresses.value.find(addr => addr.is_default === 1)
      const targetAddr = defaultAddr || addresses.value[0]
      selectedAddressId.value = targetAddr.id
      selectedAddress.value = targetAddr
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

// 选择地址
const selectAddress = (address) => {
  selectedAddressId.value = address.id
}

// 确认选择地址
const confirmAddress = () => {
  const address = addresses.value.find(addr => addr.id === selectedAddressId.value)
  if (address) {
    selectedAddress.value = address
  }
  showAddressSelector.value = false
}

// 添加新地址
const handleAddAddress = () => {
  // 保存当前购物车ID到sessionStorage
  const cartIds = route.query.cart_ids
  if (cartIds) {
    sessionStorage.setItem('pendingOrderCartIds', cartIds)
  }
  router.push('/profile?menu=address')
}

// 获取购物车商品
const fetchCartItems = async () => {
  try {
    loading.value = true
    const cartIds = route.query.cart_ids?.split(',').map(id => parseInt(id)) || []
    
    if (cartIds.length === 0) {
      ElMessage.warning('请选择要购买的商品')
      router.back()
      return
    }

    const res = await getCartList()
    // 筛选出选中的商品
    cartItems.value = res.data.list
      .filter(item => cartIds.includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.product_name,
        spec: item.spec_label,
        price: item.price,
        quantity: item.quantity,
        image: item.product_image
      }))

    if (cartItems.value.length === 0) {
      ElMessage.warning('购物车商品不存在')
      router.back()
    }
  } catch (error) {
    ElMessage.error(error.message || '获取商品信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 提交订单
const handleSubmit = async () => {
  // 验证是否有地址
  if (addresses.value.length === 0) {
    ElMessage.warning('请先添加收货地址')
    handleAddAddress()
    return
  }

  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  try {
    submitting.value = true
    const cartIds = route.query.cart_ids?.split(',').map(id => parseInt(id)) || []
    
    const orderData = {
      cart_ids: cartIds,
      address_id: selectedAddressId.value,
      remark: remark.value
    }

    const res = await createOrder(orderData)

    console.log('创建订单响应:', res)
    
    // 跳转到支付页面或订单列表
    if (res.data && res.data.orders && res.data.orders.length > 0) {
      // 如果只有一个订单，跳转到支付页面
      if (res.data.orders.length === 1) {
        const orderId = res.data.orders[0].order_id
        
        setTimeout(() => {
          ElMessage.success('订单创建成功')
        }, 100)
        
        router.replace({
          path: '/payment',
          query: {
            order_id: orderId
          }
        })
      } else {
        // 多个订单，跳转到订单列表
        ElMessage.success('订单创建成功')
        router.replace('/profile?menu=order-pending')
      }
    } else {
      ElMessage.success('订单创建成功')
      router.replace('/profile?menu=order-pending')
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error(error.message || '创建订单失败')
  } finally {
    submitting.value = false
  }
}

// 返回购物车
const handleBack = () => {
  router.back()
}

onMounted(() => {
  fetchAddresses()
  fetchCartItems()
})
</script>

<style lang="scss" scoped>
.order-confirm-page {
  min-height: 100vh;
  background-color: var(--bg-gray);
  padding-bottom: 20px;

  .page-header {
    background-color: #fff;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .confirm-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    .section-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary-color);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          font-size: 18px;
          color: var(--theme-primary-color);
        }
      }
    }

    .address-section {
      .address-content {
        .selected-address {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border: 2px solid var(--theme-primary-color);
          border-radius: 8px;
          background-color: rgba(82, 196, 26, 0.05);
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background-color: rgba(82, 196, 26, 0.1);
          }

          .address-info {
            flex: 1;

            .address-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 8px;

              .name {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary-color);
              }

              .phone {
                font-size: 14px;
                color: var(--text-secondary-color);
              }
            }

            .address-detail {
              font-size: 14px;
              color: var(--text-primary-color);
              line-height: 1.6;
            }
          }

          .change-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--theme-primary-color);
            font-size: 14px;

            i {
              font-size: 16px;
            }
          }
        }
      }

      .address-selector {
        max-height: 400px;
        overflow-y: auto;

        .address-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--theme-primary-color);
            background-color: rgba(82, 196, 26, 0.02);
          }

          &.active {
            border-color: var(--theme-primary-color);
            background-color: rgba(82, 196, 26, 0.05);
          }

          .address-radio {
            padding-top: 2px;
          }

          .address-info {
            flex: 1;

            .address-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 8px;

              .name {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary-color);
              }

              .phone {
                font-size: 14px;
                color: var(--text-secondary-color);
              }
            }

            .address-detail {
              font-size: 14px;
              color: var(--text-primary-color);
              line-height: 1.6;
            }
          }
        }
      }

      .no-address {
        .empty-state {
          text-align: center;
          padding: 60px 20px;

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
      }
    }

    .goods-section {
      .loading-state {
        padding: 20px 0;
      }

      .goods-list {
        .goods-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);

          &:last-child {
            border-bottom: none;
          }

          .goods-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
          }

          .goods-info {
            flex: 1;

            .goods-name {
              font-size: 15px;
              font-weight: 500;
              color: var(--text-primary-color);
              margin-bottom: 6px;
            }

            .goods-spec {
              font-size: 13px;
              color: var(--text-secondary-color);
            }
          }

          .goods-price {
            width: 100px;
            font-size: 16px;
            font-weight: 600;
            color: #f5222d;
          }

          .goods-quantity {
            width: 80px;
            text-align: center;
            font-size: 14px;
            color: var(--text-secondary-color);
          }

          .goods-total {
            width: 120px;
            text-align: right;
            font-size: 18px;
            font-weight: 600;
            color: #f5222d;
          }
        }
      }
    }

    .amount-section {
      .amount-list {
        .amount-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          font-size: 14px;

          &.total {
            border-top: 1px solid var(--border-color);
            margin-top: 8px;
            padding-top: 16px;
            font-size: 16px;
            font-weight: 600;
          }

          .amount-label {
            color: var(--text-secondary-color);
          }

          .amount-value {
            color: var(--text-primary-color);

            &.highlight {
              font-size: 24px;
              color: #f5222d;
            }
          }
        }
      }
    }

    .footer-section {
      margin-bottom: 0;

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .footer-left {
          .total-text {
            font-size: 14px;
            color: var(--text-secondary-color);

            .highlight {
              color: var(--theme-primary-color);
              font-weight: 600;
            }

            .total-price {
              font-size: 24px;
              font-weight: 600;
              color: #f5222d;
              margin-left: 8px;
            }
          }
        }

        .footer-right {
          display: flex;
          gap: 16px;
        }
      }
    }
  }
}
</style>
