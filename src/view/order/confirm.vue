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
        <div class="address-form">
          <el-form :model="addressForm" label-width="100px">
            <el-form-item label="收货人">
              <el-input v-model="addressForm.receiver_name" placeholder="请输入收货人姓名" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="addressForm.receiver_phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="收货地址">
              <el-input
                v-model="addressForm.receiver_address"
                type="textarea"
                :rows="3"
                placeholder="请输入详细地址"
              />
            </el-form-item>
          </el-form>
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

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const submitting = ref(false)
const cartItems = ref([])
const remark = ref('')

// 收货地址表单
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
  // 验证收货信息
  if (!addressForm.value.receiver_name) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!addressForm.value.receiver_phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(addressForm.value.receiver_phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!addressForm.value.receiver_address) {
    ElMessage.warning('请输入收货地址')
    return
  }

  try {
    submitting.value = true
    const cartIds = route.query.cart_ids?.split(',').map(id => parseInt(id)) || []
    
    const res = await createOrder({
      cart_ids: cartIds,
      receiver_name: addressForm.value.receiver_name,
      receiver_phone: addressForm.value.receiver_phone,
      receiver_address: addressForm.value.receiver_address,
      remark: remark.value
    })

    console.log('创建订单响应:', res)
    console.log('订单数据:', res.data)
    console.log('订单列表:', res.data.orders)
    
    // 跳转到支付页面或订单列表
    if (res.data && res.data.orders && res.data.orders.length > 0) {
      console.log('准备跳转，订单数量:', res.data.orders.length)
      console.log('第一个订单:', res.data.orders[0])
      
      // 如果只有一个订单，跳转到支付页面
      if (res.data.orders.length === 1) {
        const orderId = res.data.orders[0].order_id
        console.log('跳转到支付页面，订单ID:', orderId)
        
        // 延迟显示成功消息，先跳转
        setTimeout(() => {
          ElMessage.success('订单创建成功')
        }, 100)
        
        // 使用 replace 替代 push，避免可以返回
        router.replace({
          path: '/payment',
          query: {
            order_id: orderId
          }
        })
      } else {
        // 多个订单，跳转到订单列表
        console.log('跳转到订单列表')
        ElMessage.success('订单创建成功')
        router.replace('/profile?menu=order-pending')
      }
    } else {
      // 如果没有订单数据，默认跳转到订单列表
      console.log('没有订单数据，跳转到订单列表')
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
      .address-form {
        :deep(.el-form-item) {
          margin-bottom: 16px;
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
