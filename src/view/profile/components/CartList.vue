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
        <el-checkbox v-model="item.checked" @change="handleCheckChange" />
        <img :src="item.image" :alt="item.name" class="item-image" />
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-spec">{{ item.spec }}</div>
        </div>
        <div class="item-price">¥{{ item.price }}</div>
        <el-input-number
          v-model="item.quantity"
          :min="1"
          :max="99"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 购物车数据
const cartItems = ref([
  {
    id: 1,
    name: '新鲜有机西红柿',
    spec: '500g/份',
    price: 12.8,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop',
    checked: false
  },
  {
    id: 2,
    name: '农家土鸡蛋',
    spec: '30枚/盒',
    price: 45.0,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop',
    checked: false
  },
  {
    id: 3,
    name: '新鲜黄瓜',
    spec: '1kg/份',
    price: 8.5,
    quantity: 3,
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=200&h=200&fit=crop',
    checked: false
  }
])

// 全选状态
const allChecked = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every(item => item.checked),
  set: (val) => {
    cartItems.value.forEach(item => item.checked = val)
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

const handleCheckChange = () => {
  // 选中状态变化
}

const handleCheckAll = () => {
  // 全选/取消全选
}

const handleQuantityChange = (item) => {
  ElMessage.success(`已更新 ${item.name} 的数量`)
}

const handleRemove = (item) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = cartItems.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleClearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value = []
    ElMessage.success('购物车已清空')
  }).catch(() => {})
}

const handleCheckout = () => {
  if (checkedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  ElMessage.success('跳转到结算页面')
}

const goShopping = () => {
  router.push('/home')
}
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
