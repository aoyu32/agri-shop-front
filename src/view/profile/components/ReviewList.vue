<template>
  <div class="review-list" v-loading="loading">
    <div class="list-header">
      <h3>{{ pageTitle }}</h3>
    </div>

    <div v-if="reviews.length === 0" class="empty-state">
      <i class="iconfont icon-pinglun"></i>
      <p>{{ emptyText }}</p>
    </div>

    <!-- 待评价列表 -->
    <div v-else-if="route.query.menu === 'review-pending'" class="review-items">
      <div v-for="order in reviews" :key="order.order_id" class="review-card">
        <div class="card-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.order_no }}</span>
            <span class="shop-name">店铺：{{ order.shop_name }}</span>
            <span class="order-time">完成时间：{{ order.complete_time }}</span>
          </div>
        </div>

        <div class="card-body">
          <div v-for="item in order.items" :key="item.order_item_id" class="product-info">
            <img :src="item.product_image" :alt="item.product_name" />
            <div class="info">
              <div class="product-name">{{ item.product_name }}</div>
              <div class="product-spec">{{ item.spec_label }} × {{ item.quantity }}</div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="review-action">
            <el-button type="primary" @click="handleReview(order)">立即评价</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已评价列表 -->
    <div v-else class="review-items">
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="card-header">
          <div class="order-info">
            <span class="shop-name">店铺：{{ review.shop_name }}</span>
            <span class="review-time">评价时间：{{ review.created_at }}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="product-info">
            <img :src="review.product_image" :alt="review.product_name" />
            <div class="info">
              <div class="product-name">{{ review.product_name }}</div>
            </div>
          </div>

          <div class="review-content">
            <div class="review-header">
              <el-rate v-model="review.rating" disabled />
            </div>
            <div class="review-text">{{ review.content }}</div>
            <div v-if="review.images && review.images.length > 0" class="review-images">
              <el-image
                v-for="(image, index) in review.images"
                :key="index"
                :src="image"
                :preview-src-list="review.images"
                :initial-index="index"
                fit="cover"
                class="review-image"
              />
            </div>
            <div v-if="review.reply_content" class="shop-reply">
              <div class="reply-label">商家回复：</div>
              <div class="reply-content">{{ review.reply_content }}</div>
              <div class="reply-time">{{ review.reply_time }}</div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="review-actions">
            <el-button type="danger" size="small" @click="handleDeleteReview(review)">删除评价</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价弹窗 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="发表评价"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="review-dialog">
        <div class="order-info-header">
          <span>订单号：{{ currentOrder.order_no }}</span>
          <span>店铺：{{ currentOrder.shop_name }}</span>
        </div>

        <div v-for="(item, index) in reviewForm.reviews" :key="item.order_item_id" class="review-item">
          <div class="product-info">
            <img :src="item.product_image" :alt="item.product_name" />
            <div class="info">
              <div class="product-name">{{ item.product_name }}</div>
              <div class="product-spec">{{ item.spec_label }}</div>
            </div>
          </div>

          <div class="review-form">
            <div class="form-item">
              <h4>商品评分</h4>
              <el-rate v-model="item.rating" :colors="['#f5222d', '#faad14', '#52c41a']" size="large" />
            </div>

            <div class="form-item">
              <h4>评价内容</h4>
              <el-input
                v-model="item.content"
                type="textarea"
                :rows="4"
                placeholder="请分享您的使用感受，帮助其他买家更好地了解商品"
                maxlength="500"
                show-word-limit
              />
            </div>

            <div class="form-item">
              <h4>上传图片（选填，最多5张）</h4>
              <div class="image-upload-area">
                <div v-for="(image, imgIndex) in item.images" :key="imgIndex" class="image-item">
                  <img :src="image" alt="评价图片" />
                  <div class="image-mask">
                    <i class="iconfont icon-shanchu" @click="handleRemoveImage(index, imgIndex)"></i>
                  </div>
                </div>
                <el-upload
                  v-if="item.images.length < 5"
                  class="image-uploader"
                  :show-file-list="false"
                  :before-upload="(file) => handleImageUpload(file, index)"
                  accept="image/*"
                >
                  <div class="upload-trigger">
                    <i class="iconfont icon-tupian"></i>
                    <span>上传图片</span>
                  </div>
                </el-upload>
              </div>
            </div>

            <div class="form-item">
              <el-checkbox v-model="item.is_anonymous" :true-label="1" :false-label="0">
                匿名评价
              </el-checkbox>
            </div>
          </div>

          <el-divider v-if="index < reviewForm.reviews.length - 1" />
        </div>
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReview">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingReviewList, submitReview, getMyReviews, deleteReview } from '@/apis/review'
import { uploadFile } from '@/apis/oss'

const route = useRoute()
const router = useRouter()

// 评价弹窗
const reviewDialogVisible = ref(false)
const currentOrder = ref(null)
const reviewForm = ref({
  reviews: []
})

// 数据加载
const loading = ref(false)
const reviews = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const pageTitle = computed(() => {
  return route.query.menu === 'review-pending' ? '待评价' : '已评价'
})

const emptyText = computed(() => {
  return route.query.menu === 'review-pending' ? '暂无待评价商品' : '暂无评价记录'
})

// 获取评价列表
const fetchReviews = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }

    let res
    if (route.query.menu === 'review-pending') {
      // 获取待评价订单
      res = await getPendingReviewList(params)
      reviews.value = res.data.list
      
      // 如果URL中有orderId参数，自动打开该订单的评价弹窗
      if (route.query.orderId) {
        const order = reviews.value.find(o => o.order_id == route.query.orderId)
        if (order) {
          handleReview(order)
          // 清除URL中的orderId参数
          router.replace({ query: { ...route.query, orderId: undefined } })
        }
      }
    } else {
      // 获取已评价列表
      res = await getMyReviews(params)
      reviews.value = res.data.list
      
      // 调试：打印评价数据查看图片字段
      console.log('已评价列表数据:', reviews.value)
      reviews.value.forEach((review, index) => {
        console.log(`评价${index + 1}:`, {
          id: review.id,
          product_name: review.product_name,
          images: review.images,
          images_length: review.images?.length || 0,
          images_content: JSON.stringify(review.images)
        })
      })
    }
    
    total.value = res.data.total
  } catch (error) {
    console.error('获取评价列表失败:', error)
    ElMessage.error(error.message || '获取评价列表失败')
  } finally {
    loading.value = false
  }
}

// 监听路由变化
watch(() => route.query.menu, () => {
  currentPage.value = 1
  fetchReviews()
})

// 打开评价弹窗
const handleReview = (order) => {
  currentOrder.value = order
  // 为每个商品初始化评价表单
  reviewForm.value.reviews = order.items.map(item => ({
    order_item_id: item.order_item_id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_image: item.product_image,
    spec_label: item.spec_label,
    rating: 5,
    content: '',
    images: [],
    is_anonymous: 0
  }))
  reviewDialogVisible.value = true
}

// 上传图片
const handleImageUpload = async (file, reviewIndex) => {
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
  if (reviewForm.value.reviews[reviewIndex].images.length >= 5) {
    ElMessage.warning('最多只能上传5张图片')
    return false
  }

  try {
    // 调用 OSS 上传接口
    const res = await uploadFile(file, 'review')
    
    console.log('图片上传成功:', res.data)
    reviewForm.value.reviews[reviewIndex].images.push(res.data.url)
    console.log(`评价${reviewIndex + 1}当前图片列表:`, reviewForm.value.reviews[reviewIndex].images)
    
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error(error.message || '图片上传失败')
  }
  
  return false
}

// 删除图片
const handleRemoveImage = (reviewIndex, imageIndex) => {
  reviewForm.value.reviews[reviewIndex].images.splice(imageIndex, 1)
}

// 提交评价
const handleSubmitReview = async () => {
  // 验证所有商品都有评价内容
  const hasEmptyContent = reviewForm.value.reviews.some(r => !r.content.trim())
  if (hasEmptyContent) {
    ElMessage.warning('请为所有商品填写评价内容')
    return
  }

  try {
    const reviewData = reviewForm.value.reviews.map(r => ({
      order_item_id: r.order_item_id,
      rating: r.rating,
      content: r.content,
      images: r.images,
      is_anonymous: r.is_anonymous
    }))
    
    // 调试：打印提交的评价数据
    console.log('提交评价数据:', {
      order_id: currentOrder.value.order_id,
      reviews: reviewData
    })
    reviewData.forEach((r, index) => {
      console.log(`评价${index + 1} - images:`, r.images, 'count:', r.images.length)
    })
    
    await submitReview({
      order_id: currentOrder.value.order_id,
      reviews: reviewData
    })
    
    ElMessage.success('评价提交成功')
    reviewDialogVisible.value = false
    fetchReviews()
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error(error.message || '提交评价失败')
  }
}

// 删除评价
const handleDeleteReview = (review) => {
  ElMessageBox.confirm('确定要删除该评价吗？删除后无法恢复。', '删除评价', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteReview({ review_id: review.id })
      ElMessage.success('删除成功')
      fetchReviews()
    } catch (error) {
      console.error('删除评价失败:', error)
      ElMessage.error(error.message || '删除评价失败')
    }
  }).catch(() => {})
}

// 初始化
onMounted(() => {
  fetchReviews()
})
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
  .order-info-header {
    display: flex;
    gap: 24px;
    padding: 12px 16px;
    background-color: var(--bg-gray);
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 13px;
    color: var(--text-secondary-color);
  }

  .review-item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .product-info {
    display: flex;
    gap: 12px;
    padding: 12px;
    background-color: var(--bg-gray);
    border-radius: 8px;
    margin-bottom: 16px;

    img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
    }

    .info {
      flex: 1;

      .product-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary-color);
        margin-bottom: 6px;
      }

      .product-spec {
        font-size: 12px;
        color: var(--text-secondary-color);
      }
    }
  }

  .review-form {
    .form-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary-color);
      }
    }

    .image-upload-area {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

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
  }
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;

  .review-image {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    cursor: pointer;
  }
}

.shop-reply {
  margin-top: 12px;
  padding: 12px;
  background-color: #fff9e6;
  border-radius: 6px;
  border-left: 3px solid var(--theme-primary-color);

  .reply-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary-color);
    margin-bottom: 6px;
  }

  .reply-content {
    font-size: 13px;
    color: var(--text-primary-color);
    line-height: 1.6;
    margin-bottom: 6px;
  }

  .reply-time {
    font-size: 12px;
    color: var(--text-secondary-color);
  }
}
</style>
