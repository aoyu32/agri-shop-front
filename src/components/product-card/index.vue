<template>
  <div class="product-card" @click="handleClick">
    <div class="card-image">
      <img :src="product.image" :alt="product.name" />
    </div>
    <div class="card-content">
      <h4 class="card-title">{{ product.name }}</h4>
      <p class="card-desc">{{ product.description }}</p>
      <div class="card-tags">
        <span v-for="(tag, index) in product.tags" :key="index" class="tag">
          {{ tag }}
        </span>
      </div>
      <div class="card-footer">
        <div class="price-info">
          <span class="price">¥{{ product.price }}/{{ product.unit }}</span>
        </div>
        <div class="sales-info">
          <span class="sales">销量 {{ product.sales }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.product)
}
</script>

<style lang="scss" scoped>
.product-card {
  background-color: var(--bg-white);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-color: var(--theme-primary-color);
  }

  .card-image {
    width: 100%;
    height: 160px;
    overflow: hidden;
    background-color: var(--bg-gray);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.03);
    }
  }

  .card-content {
    padding: 12px;

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary-color);
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.4;
    }

    .card-desc {
      font-size: 12px;
      color: var(--text-secondary-color);
      line-height: 1.4;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 32px;
    }

    .card-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-bottom: 8px;
      min-height: 20px;

      .tag {
        padding: 2px 6px;
        font-size: 10px;
        color: var(--theme-primary-color);
        background-color: #f6ffed;
        border-radius: 3px;
        line-height: 1.2;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price-info {
        .price {
          font-size: 16px;
          font-weight: 600;
          color: #ff4d4f;
          line-height: 1.2;
        }
      }

      .sales-info {
        .sales {
          font-size: 11px;
          color: var(--text-placeholder-color);
        }
      }
    }
  }

  // 响应式适配
  @media screen and (max-width: 768px) {
    .card-image {
      height: 140px;
    }

    .card-content {
      padding: 10px;

      .card-title {
        font-size: 13px;
      }

      .card-desc {
        font-size: 11px;
        min-height: 28px;
      }

      .card-footer .price-info .price {
        font-size: 15px;
      }
    }
  }
}
</style>
