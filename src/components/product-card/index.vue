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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .card-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background-color: var(--bg-gray);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  .card-content {
    padding: 16px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary-color);
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-desc {
      font-size: 13px;
      color: var(--text-secondary-color);
      line-height: 1.5;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 40px;
    }

    .card-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;

      .tag {
        padding: 3px 8px;
        font-size: 11px;
        color: var(--theme-primary-color);
        background-color: #f6ffed;
        border-radius: 4px;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price-info {
        .price {
          font-size: 18px;
          font-weight: 600;
          color: #ff4d4f;
        }
      }

      .sales-info {
        .sales {
          font-size: 12px;
          color: var(--text-placeholder-color);
        }
      }
    }
  }
}
</style>
