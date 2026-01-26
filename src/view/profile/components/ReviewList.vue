<template>
  <div class="review-list">
    <div class="list-header">
      <h3>{{ pageTitle }}</h3>
    </div>

    <div v-if="filteredReviews.length === 0" class="empty-state">
      <i class="iconfont icon-pinglun"></i>
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="review-items">
      <div v-for="review in filteredReviews" :key="review.id" class="review-card">
        <div class="product-info">
          <img :src="review.product.image" :alt="review.product.name" />
          <div class="info">
            <div class="product-name">{{ review.product.name }}</div>
            <div class="product-spec">{{ review.product.spec }}</div>
          </div>
        </div>

        <div v-if="review.reviewed" class="review-content">
          <el-rate v-model="review.rating" disabled />
          <div class="review-text">{{ review.content }}</div>
          <div class="review-time">{{ review.reviewTime }}</div>
        </div>

        <div v-else class="review-action">
          <el-button type="primary" @click="handleReview(review)">立即评价</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

// 模拟评价数据
const reviews = ref([
  {
    id: 1,
    reviewed: false,
    product: {
      name: '新鲜有机西红柿',
      spec: '500g/份',
      image: 'https://images.unsplash.com/photo-1546470427-227e2e1e8c8e?w=100&h=100&fit=crop'
    }
  },
  {
    id: 2,
    reviewed: true,
    rating: 5,
    content: '非常新鲜，品质很好，下次还会购买！',
    reviewTime: '2026-01-20 14:30:00',
    product: {
      name: '农家土鸡蛋',
      spec: '30枚/盒',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop'
    }
  },
  {
    id: 3,
    reviewed: true,
    rating: 4,
    content: '质量不错，物流也很快',
    reviewTime: '2026-01-19 10:15:00',
    product: {
      name: '新鲜黄瓜',
      spec: '1kg/份',
      image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=100&h=100&fit=crop'
    }
  }
])

const pageTitle = computed(() => {
  return route.query.menu === 'review-pending' ? '待评价' : '已评价'
})

const emptyText = computed(() => {
  return route.query.menu === 'review-pending' ? '暂无待评价商品' : '暂无评价记录'
})

const filteredReviews = computed(() => {
  const isPending = route.query.menu === 'review-pending'
  return reviews.value.filter(r => r.reviewed !== isPending)
})

const handleReview = (review) => {
  ElMessage.info('打开评价弹窗')
}
</script>

<style lang="scss" scoped>
.review-list {
  .list-header {
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

  .review-items {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .review-card {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;

      .product-info {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
        }

        .info {
          flex: 1;

          .product-name {
            font-size: 15px;
            font-weight: 500;
            color: var(--text-primary-color);
            margin-bottom: 6px;
          }

          .product-spec {
            font-size: 13px;
            color: var(--text-secondary-color);
          }
        }
      }

      .review-content {
        padding: 16px;
        background-color: var(--bg-gray);
        border-radius: 6px;

        .review-text {
          margin: 12px 0;
          font-size: 14px;
          color: var(--text-primary-color);
          line-height: 1.6;
        }

        .review-time {
          font-size: 12px;
          color: var(--text-secondary-color);
        }
      }

      .review-action {
        text-align: right;
      }
    }
  }
}
</style>
