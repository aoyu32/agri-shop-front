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
        <div class="card-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ review.orderNo }}</span>
            <span class="order-time">下单时间：{{ review.orderTime }}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="product-info">
            <img :src="review.product.image" :alt="review.product.name" />
            <div class="info">
              <div class="product-name">{{ review.product.name }}</div>
              <div class="product-spec">{{ review.product.spec }}</div>
            </div>
          </div>

          <div v-if="review.reviewed" class="review-content">
            <div class="review-header">
              <el-rate v-model="review.rating" disabled />
              <div class="review-time">评价时间：{{ review.reviewTime }}</div>
            </div>
            <div class="review-text">{{ review.content }}</div>
          </div>
        </div>

        <div class="card-footer">
          <div v-if="!review.reviewed" class="review-action">
            <el-button type="primary" @click="handleReview(review)">立即评价</el-button>
          </div>
          <div v-else class="review-actions">
            <el-button @click="handleEditReview(review)">修改评价</el-button>
            <el-button @click="handleDeleteReview(review)">删除评价</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价弹窗 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="isEditMode ? '修改评价' : '发表评价'"
      width="600px"
    >
      <div v-if="currentReview" class="review-dialog">
        <div class="product-info">
          <img :src="currentReview.product.image" :alt="currentReview.product.name" />
          <div class="info">
            <div class="product-name">{{ currentReview.product.name }}</div>
            <div class="product-spec">{{ currentReview.product.spec }}</div>
          </div>
        </div>

        <div class="review-form">
          <div class="form-item">
            <h4>商品评分</h4>
            <el-rate v-model="reviewForm.rating" :colors="['#f5222d', '#faad14', '#52c41a']" size="large" />
          </div>

          <div class="form-item">
            <h4>评价内容</h4>
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="6"
              placeholder="请分享您的使用感受，帮助其他买家更好地了解商品"
              maxlength="500"
              show-word-limit
            />
          </div>

          <div class="form-item">
            <h4>上传图片（选填，最多5张）</h4>
            <div class="image-upload-area">
              <div v-for="(image, index) in reviewForm.images" :key="index" class="image-item">
                <img :src="image.url" :alt="image.name" />
                <div class="image-mask">
                  <i class="iconfont icon-shanchu" @click="handleRemoveImage(index)"></i>
                </div>
              </div>
              <el-upload
                v-if="reviewForm.images.length < 5"
                class="image-uploader"
                :show-file-list="false"
                :before-upload="handleImageUpload"
                accept="image/*"
              >
                <div class="upload-trigger">
                  <i class="iconfont icon-tupian"></i>
                  <span>上传图片</span>
                </div>
              </el-upload>
            </div>
            <div class="upload-tips">
              <i class="iconfont icon-tishi"></i>
              <span>支持jpg、png格式，单张图片不超过5MB</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReview">
          {{ isEditMode ? '保存修改' : '提交评价' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()

// 评价弹窗
const reviewDialogVisible = ref(false)
const currentReview = ref(null)
const isEditMode = ref(false)
const reviewForm = ref({
  rating: 5,
  content: '',
  images: []
})

// 模拟评价数据
const reviews = ref([
  {
    id: 1,
    reviewed: false,
    orderNo: '202601220001',
    orderTime: '2026-01-22 10:30:00',
    product: {
      name: '新鲜有机西红柿',
      spec: '500g/份',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop'
    }
  },
  {
    id: 2,
    reviewed: false,
    orderNo: '202601210002',
    orderTime: '2026-01-21 15:20:00',
    product: {
      name: '新鲜黄瓜',
      spec: '1kg/份',
      image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=100&h=100&fit=crop'
    }
  },
  {
    id: 3,
    reviewed: true,
    rating: 5,
    content: '非常新鲜，品质很好，下次还会购买！',
    reviewTime: '2026-01-20 14:30:00',
    orderNo: '202601190003',
    orderTime: '2026-01-19 14:30:00',
    product: {
      name: '农家土鸡蛋',
      spec: '30枚/盒',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop'
    }
  },
  {
    id: 4,
    reviewed: true,
    rating: 4,
    content: '质量不错，物流也很快',
    reviewTime: '2026-01-18 10:15:00',
    orderNo: '202601170004',
    orderTime: '2026-01-17 09:20:00',
    product: {
      name: '有机大米',
      spec: '5kg/袋',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop'
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
  currentReview.value = review
  reviewForm.value = {
    rating: 5,
    content: '',
    images: []
  }
  isEditMode.value = false
  reviewDialogVisible.value = true
}

const handleEditReview = (review) => {
  currentReview.value = review
  reviewForm.value = {
    rating: review.rating,
    content: review.content,
    images: review.images || []
  }
  isEditMode.value = true
  reviewDialogVisible.value = true
}

const handleImageUpload = (file) => {
  // 检查文件大小（5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.warning('图片大小不能超过 5MB')
    return false
  }

  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return false
  }

  // 检查数量
  if (reviewForm.value.images.length >= 5) {
    ElMessage.warning('最多只能上传5张图片')
    return false
  }

  // 模拟图片上传
  const reader = new FileReader()
  reader.onload = (e) => {
    reviewForm.value.images.push({
      url: e.target.result,
      name: file.name
    })
  }
  reader.readAsDataURL(file)
  return false
}

const handleRemoveImage = (index) => {
  reviewForm.value.images.splice(index, 1)
}

const handleSubmitReview = () => {
  if (!reviewForm.value.content.trim()) {
    ElMessage.warning('请填写评价内容')
    return
  }

  const review = currentReview.value
  const now = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')

  review.reviewed = true
  review.rating = reviewForm.value.rating
  review.content = reviewForm.value.content
  review.images = [...reviewForm.value.images]
  review.reviewTime = now

  reviewDialogVisible.value = false
  ElMessage.success(isEditMode.value ? '评价修改成功' : '评价提交成功')
}

const handleDeleteReview = (review) => {
  ElMessageBox.confirm('确定要删除该评价吗？删除后无法恢复。', '删除评价', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    review.reviewed = false
    review.rating = 0
    review.content = ''
    review.images = []
    review.reviewTime = ''
    ElMessage.success('评价已删除')
  }).catch(() => {})
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
      overflow: hidden;

      .card-header {
        padding: 12px 16px;
        background-color: var(--bg-gray);
        border-bottom: 1px solid var(--border-color);

        .order-info {
          display: flex;
          align-items: center;
          gap: 24px;
          font-size: 13px;
          color: var(--text-secondary-color);

          .order-no {
            font-weight: 500;
            color: var(--text-primary-color);
          }
        }
      }

      .card-body {
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

          .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .review-time {
              font-size: 12px;
              color: var(--text-secondary-color);
            }
          }

          .review-text {
            font-size: 14px;
            color: var(--text-primary-color);
            line-height: 1.6;
          }
        }
      }

      .card-footer {
        padding: 12px 16px;
        background-color: var(--bg-gray);
        border-top: 1px solid var(--border-color);

        .review-action,
        .review-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
      }
    }
  }
}

// 评价弹窗样式
.review-dialog {
  .product-info {
    display: flex;
    gap: 12px;
    padding: 16px;
    background-color: var(--bg-gray);
    border-radius: 8px;
    margin-bottom: 24px;

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

  .review-form {
    .form-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 12px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary-color);
      }
    }

    .image-upload-area {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 8px;

      .image-item {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--border-color);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;

          i {
            font-size: 24px;
            color: #fff;
            cursor: pointer;

            &:hover {
              color: #f5222d;
            }
          }
        }

        &:hover .image-mask {
          opacity: 1;
        }
      }

      .image-uploader {
        width: 80px;
        height: 80px;

        .upload-trigger {
          width: 80px;
          height: 80px;
          border: 1px dashed var(--border-color);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--theme-primary-color);
            color: var(--theme-primary-color);
          }

          i {
            font-size: 24px;
            color: var(--text-placeholder-color);
            margin-bottom: 4px;
          }

          span {
            font-size: 12px;
            color: var(--text-secondary-color);
          }

          &:hover i,
          &:hover span {
            color: var(--theme-primary-color);
          }
        }
      }
    }

    .upload-tips {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary-color);

      i {
        font-size: 14px;
      }
    }
  }
}
</style>
