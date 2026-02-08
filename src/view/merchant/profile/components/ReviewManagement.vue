<template>
  <div class="review-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>评价管理</span>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-radio-group v-model="statusFilter" @change="handleFilterChange">
          <el-radio-button label="">全部评价</el-radio-button>
          <el-radio-button label="pending">待回复</el-radio-button>
          <el-radio-button label="replied">已回复</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 评价表格 -->
      <el-table
        :data="displayReviews"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f5f5', color: '#262626', fontWeight: '600' }"
      >
        <el-table-column label="用户信息" width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.user.avatar" :size="40" />
              <div class="user-details">
                <div class="user-name">{{ row.user.name }}</div>
                <div class="review-time">{{ row.createTime }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" width="250">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.product.image" style="width: 50px; height: 50px; border-radius: 4px;" fit="cover" />
              <div class="product-details">
                <div class="product-name">{{ row.product.name }}</div>
                <div class="product-spec">{{ row.product.spec }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="180">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" score-template="{value}" allow-half />
          </template>
        </el-table-column>
        <el-table-column label="评价内容" min-width="300">
          <template #default="{ row }">
            <div class="review-content">
              <div class="review-text">{{ row.content }}</div>
              <div v-if="row.images && row.images.length" class="review-images">
                <el-image
                  v-for="(img, index) in row.images"
                  :key="index"
                  :src="img"
                  :preview-src-list="row.images"
                  style="width: 60px; height: 60px; margin-right: 8px; border-radius: 4px;"
                  fit="cover"
                />
              </div>
              <div v-if="row.reply" class="reply-content">
                <div class="reply-label">商家回复：</div>
                <div class="reply-text">{{ row.reply }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'replied' ? 'success' : 'warning'">
              {{ row.status === 'replied' ? '已回复' : '待回复' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              size="small"
              @click="handleReply(row)"
            >
              回复
            </el-button>
            <el-button
              v-else
              type="warning"
              size="small"
              @click="handleEditReply(row)"
            >
              修改回复
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredReviews.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复评价" width="600px">
      <div v-if="currentReview" class="reply-dialog-content">
        <div class="review-info">
          <div class="info-item">
            <span class="label">用户：</span>
            <span class="value">{{ currentReview.user.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">商品：</span>
            <span class="value">{{ currentReview.product.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">评分：</span>
            <el-rate v-model="currentReview.rating" disabled show-score text-color="#ff9900" />
          </div>
          <div class="info-item">
            <span class="label">评价：</span>
            <span class="value">{{ currentReview.content }}</span>
          </div>
        </div>
        <el-form :model="replyForm" label-width="80px">
          <el-form-item label="回复内容" required>
            <el-input
              v-model="replyForm.reply"
              type="textarea"
              :rows="4"
              placeholder="请输入回复内容"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReply">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟评价数据
const mockReviews = ref([
  {
    id: 1,
    user: {
      name: '张三',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    product: {
      name: '有机西红柿',
      spec: '500g/份',
      image: 'https://via.placeholder.com/100'
    },
    rating: 4.5,
    content: '非常新鲜，口感很好，下次还会再买！',
    images: ['https://via.placeholder.com/200', 'https://via.placeholder.com/200'],
    createTime: '2024-02-08 10:30',
    status: 'pending',
    reply: ''
  },
  {
    id: 2,
    user: {
      name: '李四',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    product: {
      name: '新鲜黄瓜',
      spec: '500g/份',
      image: 'https://via.placeholder.com/100'
    },
    rating: 3.5,
    content: '黄瓜很脆，就是有点小',
    images: [],
    createTime: '2024-02-07 15:20',
    status: 'replied',
    reply: '感谢您的评价，我们会继续努力提供更好的产品！'
  },
  {
    id: 3,
    user: {
      name: '王五',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    product: {
      name: '有机生菜',
      spec: '300g/份',
      image: 'https://via.placeholder.com/100'
    },
    rating: 5,
    content: '生菜很新鲜，包装也很好，物流很快',
    images: ['https://via.placeholder.com/200'],
    createTime: '2024-02-06 09:15',
    status: 'pending',
    reply: ''
  }
])

const loading = ref(false)
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 回复对话框
const replyDialogVisible = ref(false)
const currentReview = ref(null)
const replyForm = ref({
  reply: ''
})

// 筛选评价
const filteredReviews = computed(() => {
  if (!statusFilter.value) {
    return mockReviews.value
  }
  return mockReviews.value.filter(r => r.status === statusFilter.value)
})

// 分页显示的评价
const displayReviews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredReviews.value.slice(start, end)
})

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSizeChange = () => {
  currentPage.value = 1
}

const handleCurrentChange = () => {
  // 页码变化
}

const handleReply = (row) => {
  currentReview.value = row
  replyForm.value.reply = ''
  replyDialogVisible.value = true
}

const handleEditReply = (row) => {
  currentReview.value = row
  replyForm.value.reply = row.reply
  replyDialogVisible.value = true
}

const confirmReply = () => {
  if (!replyForm.value.reply.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  currentReview.value.reply = replyForm.value.reply
  currentReview.value.status = 'replied'
  ElMessage.success('回复成功')
  replyDialogVisible.value = false
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该评价吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockReviews.value.findIndex(r => r.id === row.id)
    if (index > -1) {
      mockReviews.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.review-management {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    .card-header {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .filter-bar {
    margin-bottom: 20px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-details {
      .user-name {
        font-size: 14px;
        color: #262626;
        margin-bottom: 4px;
      }

      .review-time {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }

  .product-info {
    display: flex;
    gap: 12px;

    .product-details {
      flex: 1;

      .product-name {
        font-size: 14px;
        color: #262626;
        margin-bottom: 4px;
      }

      .product-spec {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }

  .review-content {
    .review-text {
      font-size: 14px;
      color: #262626;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .review-images {
      margin-bottom: 8px;
    }

    .reply-content {
      margin-top: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;

      .reply-label {
        font-size: 13px;
        color: #8c8c8c;
        margin-bottom: 4px;
      }

      .reply-text {
        font-size: 14px;
        color: #262626;
        line-height: 1.6;
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .reply-dialog-content {
    .review-info {
      margin-bottom: 20px;
      padding: 16px;
      background: #fafafa;
      border-radius: 4px;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 60px;
          color: #8c8c8c;
          font-size: 14px;
        }

        .value {
          flex: 1;
          color: #262626;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
