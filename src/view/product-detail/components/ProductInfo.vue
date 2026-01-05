<template>
  <div class="product-info">
    <!-- 收藏按钮 -->
    <div class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
      <el-icon>
        <Star />
      </el-icon>
      <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
    </div>

    <!-- 商品标题 -->
    <h1 class="product-title">{{ product.name }}</h1>
    <p class="product-subtitle">{{ product.subtitle }}</p>

    <!-- 商品标签 -->
    <div class="product-tags">
      <span v-for="(tag, index) in product.tags" :key="index" class="tag">
        {{ tag }}
      </span>
    </div>

    <!-- 价格信息 -->
    <div class="price-section">
      <div class="price-main">
        <span class="label">价格</span>
        <span class="current-price">¥{{ currentPrice }}</span>
        <span class="unit">/{{ product.unit }}</span>
        <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
      </div>
      <div class="price-info">
        <span class="sales">已售 {{ product.sales }}</span>
        <span class="rating">
          <el-icon>
            <StarFilled />
          </el-icon>
          {{ product.rating }}分
        </span>
        <span class="comments">{{ product.commentCount }}条评价</span>
      </div>
    </div>

    <!-- 产地信息 -->
    <div class="origin-section">
      <span class="origin-label">产地</span>
      <span class="origin-value">{{ product.origin }}</span>
    </div>

    <!-- 规格选择 -->
    <div class="spec-section">
      <div v-for="spec in product.specs" :key="spec.name" class="spec-group">
        <div class="spec-label">{{ spec.name }}</div>
        <div class="spec-options">
          <div v-for="option in spec.options" :key="option.id" class="spec-option"
            :class="{ active: isSpecSelected(spec.name, option.id), disabled: option.stock === 0 }"
            @click="selectSpec(spec.name, option)">
            {{ option.label }}
            <span v-if="option.price > 0" class="spec-price">+¥{{ option.price }}</span>
            <span v-if="option.stock === 0" class="stock-tip">缺货</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数量选择 -->
    <div class="quantity-section">
      <span class="quantity-label">数量</span>
      <el-input-number v-model="quantity" :min="1" :max="product.stock" size="large" />
      <span class="stock-info">库存 {{ product.stock }} 件</span>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" size="large" @click="handleAddToCart">
        <el-icon>
          <ShoppingCart />
        </el-icon>
        加入购物车
      </el-button>
      <el-button type="danger" size="large" @click="handleBuyNow">
        立即购买
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { StarFilled, ShoppingCart, Star } from '@element-plus/icons-vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart', 'buy-now'])

// 收藏状态
const isFavorite = ref(false)

// 选中的规格
const selectedSpecs = ref({})

// 数量
const quantity = ref(1)

// 当前价格（根据选中的规格计算）
const currentPrice = computed(() => {
  let price = props.product.price
  Object.values(selectedSpecs.value).forEach(spec => {
    if (spec.price) {
      price += spec.price
    }
  })
  return price.toFixed(2)
})

// 切换收藏
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  ElMessage.success(isFavorite.value ? '收藏成功' : '取消收藏')
}

// 判断规格是否选中
const isSpecSelected = (specName, optionId) => {
  return selectedSpecs.value[specName]?.id === optionId
}

// 选择规格
const selectSpec = (specName, option) => {
  if (option.stock === 0) {
    ElMessage.warning('该规格暂时缺货')
    return
  }
  selectedSpecs.value[specName] = option
}

// 加入购物车
const handleAddToCart = () => {
  // 检查是否选择了所有必选规格
  const requiredSpecs = props.product.specs.filter(spec => spec.required !== false)
  const missingSpecs = requiredSpecs.filter(spec => !selectedSpecs.value[spec.name])

  if (missingSpecs.length > 0) {
    ElMessage.warning(`请选择${missingSpecs[0].name}`)
    return
  }

  emit('add-to-cart', {
    product: props.product,
    specs: selectedSpecs.value,
    quantity: quantity.value
  })
  ElMessage.success('已加入购物车')
}

// 立即购买
const handleBuyNow = () => {
  // 检查是否选择了所有必选规格
  const requiredSpecs = props.product.specs.filter(spec => spec.required !== false)
  const missingSpecs = requiredSpecs.filter(spec => !selectedSpecs.value[spec.name])

  if (missingSpecs.length > 0) {
    ElMessage.warning(`请选择${missingSpecs[0].name}`)
    return
  }

  emit('buy-now', {
    product: props.product,
    specs: selectedSpecs.value,
    quantity: quantity.value
  })
  ElMessage.success('正在跳转到结算页面...')
}
</script>

<style lang="scss" scoped>
@use './ProductInfo.scss' as *;
</style>
