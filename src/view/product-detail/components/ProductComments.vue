<template>
  <div class="product-comments">
    <!-- 评价统计 -->
    <div class="comment-summary">
      <div class="summary-left">
        <div class="rating-score">{{ averageRating }}</div>
        <el-rate v-model="averageRating" disabled show-score text-color="#ff9900" score-template="{value}分" />
        <div class="total-comments">共 {{ comments.length }} 条评价</div>
      </div>
      <div class="summary-right">
        <div v-for="filter in ratingFilters" :key="filter.key" class="filter-item"
          :class="{ active: activeFilter === filter.key }" @click="activeFilter = filter.key">
          {{ filter.label }} ({{ filter.count }})
        </div>
      </div>
    </div>

    <!-- 评价列表 -->
    <div class="comment-list">
      <div v-for="comment in filteredComments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <div class="user-info">
            <img :src="comment.avatar" :alt="comment.userName" class="user-avatar" />
            <div class="user-details">
              <div class="user-name">{{ comment.userName }}</div>
              <el-rate v-model="comment.rating" disabled size="small" />
            </div>
          </div>
          <div class="comment-time">{{ comment.createTime }}</div>
        </div>

        <div class="comment-content">{{ comment.content }}</div>

        <div v-if="comment.spec" class="comment-spec">规格：{{ comment.spec }}</div>

        <div v-if="comment.images && comment.images.length > 0" class="comment-images">
          <img v-for="(image, index) in comment.images" :key="index" :src="image" :alt="`评价图片${index + 1}`"
            class="comment-image" @click="previewImage(comment.images, index)" />
        </div>

        <div class="comment-footer">
          <div class="comment-action" @click="likeComment(comment)">
            <span>👍</span>
            <span>{{ comment.likes }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="filteredComments.length > 0" class="comment-pagination">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="filteredComments.length"
        layout="prev, pager, next" background />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  comments: {
    type: Array,
    required: true
  }
})

// 当前筛选
const activeFilter = ref('all')

// 分页
const currentPage = ref(1)
const pageSize = ref(5)

// 平均评分
const averageRating = computed(() => {
  if (props.comments.length === 0) return 0
  const total = props.comments.reduce((sum, comment) => sum + comment.rating, 0)
  return (total / props.comments.length).toFixed(1)
})

// 评分筛选
const ratingFilters = computed(() => {
  const all = props.comments.length
  const good = props.comments.filter(c => c.rating >= 4).length
  const medium = props.comments.filter(c => c.rating === 3).length
  const bad = props.comments.filter(c => c.rating < 3).length
  const withImages = props.comments.filter(c => c.images && c.images.length > 0).length

  return [
    { key: 'all', label: '全部', count: all },
    { key: 'good', label: '好评', count: good },
    { key: 'medium', label: '中评', count: medium },
    { key: 'bad', label: '差评', count: bad },
    { key: 'images', label: '有图', count: withImages }
  ]
})

// 筛选后的评论
const filteredComments = computed(() => {
  let result = props.comments

  if (activeFilter.value === 'good') {
    result = result.filter(c => c.rating >= 4)
  } else if (activeFilter.value === 'medium') {
    result = result.filter(c => c.rating === 3)
  } else if (activeFilter.value === 'bad') {
    result = result.filter(c => c.rating < 3)
  } else if (activeFilter.value === 'images') {
    result = result.filter(c => c.images && c.images.length > 0)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 点赞评论
const likeComment = (comment) => {
  comment.likes++
  ElMessage.success('点赞成功')
}

// 预览图片
const previewImage = (images, index) => {
  // 这里可以使用 Element Plus 的图片预览组件
  ElMessage.info('图片预览功能')
}
</script>

<style lang="scss" scoped>
@use './ProductComments.scss' as *;
</style>
