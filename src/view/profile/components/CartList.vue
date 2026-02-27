<template>
  <div class="cart-list">
    <div class="list-header">
      <h3>购物车</h3>
      <el-button v-if="cartItems.length > 0" type="danger" text @click="handleClearCart">
        清空购物车
      </el-button>
    </div>

    <div v-if="cartItems.length === 0" class="empty-state">
      <i class="iconfont icon-gouwuche"></i>
      <p>购物车是空的</p>
      <el-button type="primary" @click="goShopping">去逛逛</el-button>
    </div>

    <div v-else class="cart-items">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <el-checkbox v-model="item.checked" @change="handleCheckChange(item)" />
        <img :src="item.image" :alt="item.name" class="item-image" />
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-spec">{{ item.spec }}</div>
          <div class="item-shop">
            <i class="iconfont icon-dianpu"></i>
            {{ item.shopName }}
          </div>
        </div>
        <div class="item-price">¥{{ item.price }}</div>
        <el-input-number
          v-model="item.quantity"
          :min="1"
          :max="item.stock"
          size="small"
          @change="handleQuantityChange(item)"
        />
        <div class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
        <el-button type="danger" text @click="handleRemove(item)">删除</el-button>
      </div>
    </div>

    <div v-if="cartItems.length > 0" class="cart-footer">
      <el-checkbox v-model="allChecked" @change="handleCheckAll">全选</el-checkbox>
      <div class="footer-right">
        <span class="total-text">
          已选 <span class="highlight">{{ checkedCount }}</span> 件商品，
          总计：<span class="total-price">¥{{ totalPrice }}</span>
        </span>
        <el-button type="primary" size="large" @click="handleCheckout">去结算</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import {
  getCartList,
  updateCartQuantity,
  toggleCartCheck,
  checkAllCart,
  deleteCartItems,
  clearCart
} from '@/apis/cart'

const router = useRouter()
const userStore = useUserStore()

// 购物车数据
const cartItems = ref([])
const loading = ref(false)

// 全选状态
const allChecked = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every(item => item.checked),
  set: async (val) => {
    try {
      await checkAllCart({ checked: val ? 1 : 0 })
      cartItems.value.forEach(item => item.checked = val)
      updateCartCount()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }
})

// 已选数量
const checkedCount = computed(() => {
  return cartItems.value.filter(item => item.checked).length
})

// 总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

// 获取购物车列表
const fetchCartList = async () => {
  try {
    loading.value = true
    const res = await getCartList()
    cartItems.value = res.data.list.map(item => ({
      id: item.id,
      name: item.product_name,
      spec: item.spec_label,
      price: item.price,
      quantity: item.quantity,
      image: item.product_image,
      checked: item.checked === 1,
      stock: item.stock,
      productId: item.product_id,
      specId: item.spec_id,
      shopName: item.shop_name,
      tags: item.tags
    }))
    updateCartCount()
  } catch (error) {
    ElMessage.error(error.message || '获取购物车失败')
  } finally {
    loading.value = false
  }
}

// 更新购物车数量（在 store 中）
const updateCartCount = () => {
  userStore.setCartCount(cartItems.value.length)
}

// 选中状态变化
const handleCheckChange = async (item) => {
  try {
    await toggleCartCheck({
      cart_id: item.id,
      checked: item.checked ? 1 : 0
    })
    updateCartCount()
  } catch (error) {
    item.checked = !item.checked
    ElMessage.error(error.message || '操作失败')
  }
}

// 全选/取消全选
const handleCheckAll = () => {
  // 由 computed setter 处理
}

// 数量变化
const handleQuantityChange = async (item) => {
  try {
    await updateCartQuantity({
      cart_id: item.id,
      quantity: item.quantity
    })
    ElMessage.success('已更新数量')
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
    // 重新获取列表以恢复正确的数量
    fetchCartList()
  }
}

// 删除商品
const handleRemove = (item) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCartItems({ cart_ids: [item.id] })
      const index = cartItems.value.findIndex(i => i.id === item.id)
      if (index > -1) {
        cartItems.value.splice(index, 1)
      }
      updateCartCount()
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 清空购物车
const handleClearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await clearCart()
      cartItems.value = []
      updateCartCount()
      ElMessage.success('购物车已清空')
    } catch (error) {
      ElMessage.error(error.message || '清空失败')
    }
  }).catch(() => {})
}

// 去结算
const handleCheckout = () => {
  if (checkedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  const checkedItems = cartItems.value.filter(item => item.checked)
  // 跳转到支付页面，传递选中的商品
  router.push({
    path: '/payment',
    query: {
      from: 'cart',
      items: JSON.stringify(checkedItems.map(item => ({
        id: item.id,
        productId: item.productId,
        specId: item.specId,
        quantity: item.quantity
      })))
    }
  })
}

// 去逛逛
const goShopping = () => {
  router.push('/home')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCartList()
})
</script>

<style lang="scss" scoped>
.cart-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;

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
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

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

  .cart-items {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;

    .cart-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--bg-gray);
      }

      .item-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 6px;
      }

      .item-info {
        flex: 1;

        .item-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary-color);
          margin-bottom: 6px;
        }

        .item-spec {
          font-size: 13px;
          color: var(--text-secondary-color);
          margin-bottom: 4px;
        }

        .item-shop {
          font-size: 12px;
          color: var(--text-placeholder-color);
          display: flex;
          align-items: center;
          gap: 4px;

          i {
            font-size: 12px;
          }
        }
      }

      .item-price {
        width: 80px;
        font-size: 16px;
        font-weight: 600;
        color: #f5222d;
      }

      .item-total {
        width: 100px;
        font-size: 18px;
        font-weight: 600;
        color: #f5222d;
        text-align: right;
      }
    }
  }

  .cart-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #fff;
    border-top: 1px solid var(--border-color);
    z-index: 10;

    .footer-right {
      display: flex;
      align-items: center;
      gap: 24px;

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
  }
}

// 购物车列表滚动条样式
.cart-items::-webkit-scrollbar {
  width: 6px;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;

  &:hover {
    background: #bfbfbf;
  }
}
</style>
