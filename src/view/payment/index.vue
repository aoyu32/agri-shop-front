<template>
  <div class="payment-page">
    <div class="payment-container">
      <div class="payment-header">
        <h2>订单支付</h2>
        <div class="order-info">
          <span>订单号：{{ orderNo }}</span>
        </div>
      </div>

      <div class="payment-content">
        <!-- 商品信息 -->
        <div class="product-section">
          <h3>商品信息</h3>
          <div class="product-list">
            <div v-for="product in products" :key="product.id" class="product-item">
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
          <div class="amount-summary">
            <span>应付金额：</span>
            <span class="price">¥{{ amount }}</span>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-method">
          <h3>支付方式</h3>
          <div class="method-list">
            <div class="method-item active">
              <div class="method-icon alipay">
                <img src="@/assets/alipay.png" alt="支付宝" />
              </div>
              <div class="method-info">
                <div class="method-name">支付宝支付</div>
                <div class="method-desc">推荐使用支付宝支付</div>
              </div>
              <i class="iconfont icon-xuanzhong check-icon"></i>
            </div>
          </div>
        </div>

        <!-- 温馨提示 -->
        <div class="payment-tips">
          <h4><i class="iconfont icon-tishi"></i> 温馨提示</h4>
          <ul>
            <li>请在30分钟内完成支付，否则订单将自动取消</li>
            <li>支付成功后，商家会尽快为您发货</li>
            <li>如有疑问，请联系客服</li>
          </ul>
        </div>
      </div>

      <div class="payment-footer">
        <el-button @click="handleCancel">取消支付</el-button>
        <el-button type="primary" @click="handlePay">
          确认支付 ¥{{ amount }}
        </el-button>
      </div>
    </div>

    <!-- 支付二维码弹窗 -->
    <el-dialog
      v-model="qrcodeDialogVisible"
      title="支付宝扫码支付"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="qrcode-content">
        <div class="qrcode-box">
          <div class="qrcode-placeholder">
            <i class="iconfont icon-erweima"></i>
            <p>请使用支付宝扫描二维码完成支付</p>
          </div>
        </div>
        <div class="qrcode-amount">
          <span>支付金额：</span>
          <span class="price">¥{{ amount }}</span>
        </div>
        <div class="qrcode-tips">
          <i class="iconfont icon-tishi"></i>
          <span>支付完成前请不要关闭此窗口</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="qrcodeDialogVisible = false">取消支付</el-button>
        <el-button type="success" @click="handlePaySuccess">已完成支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const orderNo = ref('')
const amount = ref('0.00')
const products = ref([])
const qrcodeDialogVisible = ref(false)

onMounted(() => {
  orderNo.value = route.query.orderNo || ''
  amount.value = route.query.amount || '0.00'
  
  // 从 query 中获取商品信息
  if (route.query.products) {
    try {
      products.value = JSON.parse(decodeURIComponent(route.query.products))
    } catch (e) {
      console.error('解析商品信息失败', e)
    }
  }

  if (!orderNo.value) {
    ElMessage.error('订单信息错误')
    router.back()
  }
})

const handleCancel = () => {
  router.back()
}

const handlePay = () => {
  qrcodeDialogVisible.value = true
}

const handlePaySuccess = () => {
  qrcodeDialogVisible.value = false
  ElMessage.success('支付成功！')
  setTimeout(() => {
    router.push('/profile?menu=order-paid')
  }, 1500)
}
</script>

<style lang="scss" scoped>
.payment-page {
  .payment-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .payment-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      color: #fff;

      h2 {
        margin: 0 0 12px 0;
        font-size: 22px;
        font-weight: 600;
      }

      .order-info {
        font-size: 14px;
      }
    }

    .payment-content {
      padding: 24px;

      .product-section {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--border-color);

        h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary-color);
        }

        .product-list {
          .product-item {
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

        .amount-summary {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px dashed var(--border-color);
          font-size: 16px;
          color: var(--text-secondary-color);

          .price {
            font-size: 24px;
            font-weight: 600;
            color: #f5222d;
            margin-left: 12px;
          }
        }
      }

      .payment-method {
        margin-bottom: 24px;

        h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary-color);
        }

        .method-list {
          .method-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;

            &:hover {
              border-color: var(--theme-primary-color);
            }

            &.active {
              border-color: var(--theme-primary-color);
              background: rgba(82, 196, 26, 0.05);

              .check-icon {
                display: block;
              }
            }

            .method-icon {
              width: 48px;
              height: 48px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;

              &.alipay {
                background: #fff;
              }

              img {
                width: 40px;
                height: 40px;
                object-fit: contain;
              }

              .iconfont {
                font-size: 28px;
                color: #fff;
              }
            }

            .method-info {
              flex: 1;

              .method-name {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary-color);
                margin-bottom: 4px;
              }

              .method-desc {
                font-size: 13px;
                color: var(--text-secondary-color);
              }
            }

            .check-icon {
              display: none;
              font-size: 24px;
              color: var(--theme-primary-color);
            }
          }
        }
      }

      .payment-tips {
        padding: 20px;
        background: #fffbe6;
        border: 1px solid #ffe58f;
        border-radius: 8px;

        h4 {
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: 600;
          color: #faad14;
          display: flex;
          align-items: center;
          gap: 6px;

          .iconfont {
            font-size: 18px;
          }
        }

        ul {
          margin: 0;
          padding-left: 20px;

          li {
            font-size: 14px;
            color: #8c8c8c;
            line-height: 1.8;
          }
        }
      }
    }

    .payment-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      background: #fafafa;
    }
  }
}

// 二维码弹窗样式
.qrcode-content {
  text-align: center;

  .qrcode-box {
    margin-bottom: 20px;

    .qrcode-placeholder {
      width: 200px;
      height: 200px;
      margin: 0 auto;
      border: 2px dashed var(--border-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;

      .iconfont {
        font-size: 64px;
        color: var(--text-placeholder-color);
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary-color);
        padding: 0 20px;
      }
    }
  }

  .qrcode-amount {
    font-size: 16px;
    color: var(--text-secondary-color);
    margin-bottom: 16px;

    .price {
      font-size: 24px;
      font-weight: 600;
      color: #f5222d;
      margin-left: 8px;
    }
  }

  .qrcode-tips {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    color: #faad14;

    .iconfont {
      font-size: 16px;
    }
  }
}
</style>
