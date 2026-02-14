<template>
  <div class="post-detail-page">
    <div class="post-detail-content">
      <!-- 左侧主内容 -->
      <div class="main-content">
        <!-- 帖子详情 -->
        <div v-if="post" class="post-detail">
          <!-- 帖子头部 -->
          <div class="post-header">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-meta">
              <div class="author-info">
                <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
                <div class="author-details">
                  <div class="author-name">{{ post.author.name }}</div>
                  <div class="post-time">{{ post.createTime }}</div>
                </div>
              </div>
              <div class="post-stats">
                <span class="stat-item">
                  <i class="iconfont icon-eye"></i>
                  {{ post.views }}
                </span>
                <span class="stat-item" :class="{ liked: post.isLiked }" @click="handleLike">
                  <i class="iconfont icon-dianzan"></i>
                  {{ post.likes }}
                </span>
                  <span class="stat-item">
                  <i class="iconfont icon-pinglun"></i>
                  {{ post.comments }}
                </span>
              </div>
            </div>
          </div>

          <!-- 帖子内容 -->
          <div class="post-content">
            <MarkdownRenderer :content="post.content" />
            
            <!-- 帖子图片 -->
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img
                v-for="(image, index) in post.images"
                :key="index"
                :src="image"
                :alt="`图片${index + 1}`"
                class="post-image"
                @click="previewImage(post.images, index)"
              />
            </div>
          </div>

          <!-- 帖子底部操作 -->
          <div class="post-actions">
            <el-button :type="post.isLiked ? 'primary' : 'default'" @click="handleLike">
              <i class="iconfont icon-dianzan"></i>
              {{ post.isLiked ? '已点赞' : '点赞' }} ({{ post.likes }})
            </el-button>
            <el-button @click="handleCollect">
              <i class="iconfont icon-shoucang"></i>
              收藏
            </el-button>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-header">
            <h3>评论 ({{ comments.length }})</h3>
          </div>

          <!-- 发表评论 -->
          <div class="comment-form">
            <div class="comment-input-area">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="用户头像" class="user-avatar" />
              <el-input
                v-model="newComment"
                type="textarea"
                :rows="3"
                placeholder="写下你的评论..."
                class="comment-input"
              />
            </div>
            <div class="comment-actions">
              <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <img :src="comment.author.avatar" :alt="comment.author.name" class="comment-avatar" />
                <div class="comment-info">
                  <div class="comment-author">{{ comment.author.name }}</div>
                  <div class="comment-time">{{ comment.createTime }}</div>
                </div>
                <div class="comment-actions">
                  <span class="action-btn" :class="{ liked: comment.isLiked }" @click="likeComment(comment)">
                    <i class="iconfont icon-dianzan"></i>
                    {{ comment.likes }}
                  </span>
                  <span class="action-btn" @click="replyComment(comment)">
                    <i class="iconfont icon-pinglun"></i>
                    回复
                  </span>
                </div>
              </div>
              
              <div class="comment-content">{{ comment.content }}</div>

              <!-- 回复列表 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <div class="reply-header">
                    <img :src="reply.author.avatar" :alt="reply.author.name" class="reply-avatar" />
                    <div class="reply-info">
                      <div class="reply-author">{{ reply.author.name }}</div>
                      <div class="reply-time">{{ reply.createTime }}</div>
                    </div>
                    <div class="reply-actions">
                      <span class="action-btn" :class="{ liked: reply.isLiked }" @click="likeReply(reply)">
                        <i class="iconfont icon-dianzan"></i>
                        {{ reply.likes }}
                      </span>
                    </div>
                  </div>
                  <div class="reply-content">{{ reply.content }}</div>
                </div>
              </div>

              <!-- 回复输入框 -->
              <div v-if="replyingTo === comment.id" class="reply-form">
                <el-input
                  v-model="replyContent"
                  type="textarea"
                  :rows="2"
                  :placeholder="`回复 ${comment.author.name}...`"
                  class="reply-input"
                />
                <div class="reply-form-actions">
                  <el-button size="small" @click="cancelReply">取消</el-button>
                  <el-button size="small" type="primary" @click="submitReply(comment)" :disabled="!replyContent.trim()">
                    回复
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 作者信息卡片 -->
        <div v-if="post" class="author-card">
          <div class="user-header">
            <div class="user-info">
              <img :src="post.author.avatar" :alt="post.author.name" class="user-avatar" />
              <div class="user-details">
                <div class="user-name">{{ post.author.name }}</div>
              </div>
            </div>
            <el-button type="primary" class="publish-btn" @click="handlePublish">
              <i class="iconfont icon-bianji"></i>
              发布
            </el-button>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">128</div>
              <div class="stat-label">帖子</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">2.3k</div>
              <div class="stat-label">获赞</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">856</div>
              <div class="stat-label">收藏</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">15.6k</div>
              <div class="stat-label">浏览</div>
            </div>
          </div>
        </div>

        <!-- 相关推荐 -->
        <div class="related-posts">
          <h3 class="section-title">相关推荐</h3>
          <div class="related-list">
            <div
              v-for="relatedPost in relatedPosts"
              :key="relatedPost.id"
              class="related-item"
              @click="goToPost(relatedPost.id)"
            >
              <div class="related-title">{{ relatedPost.title }}</div>
              <div class="related-stats">
                <span>{{ relatedPost.views }} 浏览</span>
                <span>{{ relatedPost.likes }} 点赞</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '@/components/markdown-renderer/index.vue'
import { communityPosts } from '@/mock/community/posts'
import { postComments } from '@/mock/community/comments'

const route = useRoute()
const router = useRouter()

// 响应式数据
const post = ref(null)
const comments = ref([])
const newComment = ref('')
const replyContent = ref('')
const replyingTo = ref(null)

// 计算属性
const relatedPosts = computed(() => {
  if (!post.value) return []
  return communityPosts
    .filter(p => p.id !== post.value.id)
    .slice(0, 5)
})

// 生命周期
onMounted(() => {
  loadPost()
})

// 方法
const loadPost = () => {
  const postId = parseInt(route.params.id)
  const foundPost = communityPosts.find(p => p.id === postId)
  
  if (foundPost) {
    post.value = { ...foundPost }
    comments.value = postComments[postId] || []
    // 增加浏览量
    post.value.views += 1
  } else {
    ElMessage.error('帖子不存在')
    router.push({ name: 'Community' })
  }
}

const handleLike = () => {
  post.value.isLiked = !post.value.isLiked
  post.value.likes += post.value.isLiked ? 1 : -1
  ElMessage.success(post.value.isLiked ? '点赞成功' : '取消点赞')
}

const handleCollect = () => {
  ElMessage.success('收藏成功')
}

const handleShare = () => {
  ElMessage.info('分享功能开发中...')
}

const handlePublish = () => {
  router.push('/community/create')
}

const submitComment = () => {
  if (!newComment.value.trim()) return
  
  const comment = {
    id: Date.now(),
    content: newComment.value,
    author: {
      id: 999,
      name: '当前用户',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    likes: 0,
    createTime: new Date().toLocaleString(),
    isLiked: false,
    replies: []
  }
  
  comments.value.unshift(comment)
  post.value.comments += 1
  newComment.value = ''
  ElMessage.success('评论发表成功')
}

const likeComment = (comment) => {
  comment.isLiked = !comment.isLiked
  comment.likes += comment.isLiked ? 1 : -1
}

const likeReply = (reply) => {
  reply.isLiked = !reply.isLiked
  reply.likes += reply.isLiked ? 1 : -1
}

const replyComment = (comment) => {
  replyingTo.value = comment.id
  replyContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitReply = (comment) => {
  if (!replyContent.value.trim()) return
  
  const reply = {
    id: Date.now(),
    content: replyContent.value,
    author: {
      id: 999,
      name: '当前用户',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    likes: 0,
    createTime: new Date().toLocaleString(),
    isLiked: false
  }
  
  if (!comment.replies) {
    comment.replies = []
  }
  comment.replies.push(reply)
  
  cancelReply()
  ElMessage.success('回复成功')
}

const previewImage = (images, index) => {
  ElMessage.info('图片预览功能')
}

const goToPost = (postId) => {
  // 在新标签页打开帖子详情页
  const route = router.resolve({ name: 'PostDetail', params: { id: postId } })
  window.open(route.href, '_blank')
}
</script>

<style lang="scss" scoped>
.post-detail-page {
  background-color: var(--app-layout-bg-color);
  min-height: calc(100vh - var(--header-height));
  
  .post-detail-content {
    display: flex;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
    
    .main-content {
      flex: 1;
      
      .post-detail {
        background: var(--bg-white);
        border-radius: 8px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: var(--box-shadow);
        
        .post-header {
          border-bottom: 1px solid var(--border-light-color);
          padding-bottom: 20px;
          margin-bottom: 24px;
          
          .post-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary-color);
            margin-bottom: 16px;
            line-height: 1.4;
          }
          
          .post-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .author-info {
              display: flex;
              align-items: center;
              
              .author-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                margin-right: 12px;
                object-fit: cover;
              }
              
              .author-details {
                .author-name {
                  font-weight: 600;
                  color: var(--text-primary-color);
                  margin-bottom: 4px;
                }
                
                .post-time {
                  font-size: 14px;
                  color: var(--text-placeholder-color);
                }
              }
            }
            
            .post-stats {
              display: flex;
              gap: 20px;
              
              .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
                color: var(--text-placeholder-color);
                cursor: pointer;
                transition: color 0.3s;
                
                &:hover {
                  color: var(--theme-primary-color);
                }
                
                &.liked {
                  color: var(--theme-primary-color);
                }
              }
            }
          }
        }
        
        .post-content {
          margin-bottom: 24px;
          
          .post-images {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin: 20px 0;
            
            .post-image {
              width: 100%;
              height: 200px;
              border-radius: 8px;
              object-fit: cover;
              cursor: pointer;
              transition: transform 0.3s;
              
              &:hover {
                transform: scale(1.02);
              }
            }
          }
        }
        
        .post-actions {
          display: flex;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--border-light-color);
          
          .el-button {
            .iconfont {
              margin-right: 4px;
            }
          }
        }
      }
      
      .comments-section {
        background: var(--bg-white);
        border-radius: 8px;
        padding: 24px;
        box-shadow: var(--box-shadow);
        
        .comments-header {
          margin-bottom: 20px;
          
          h3 {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary-color);
          }
        }
        
        .comment-form {
          margin-bottom: 24px;
          
          .comment-input-area {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            
            .user-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
              flex-shrink: 0;
            }
            
            .comment-input {
              flex: 1;
            }
          }
          
          .comment-actions {
            display: flex;
            justify-content: flex-end;
          }
        }
        
        .comments-list {
          .comment-item {
            border-bottom: 1px solid var(--border-light-color);
            padding-bottom: 20px;
            margin-bottom: 20px;
            
            &:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            
            .comment-header {
              display: flex;
              align-items: center;
              margin-bottom: 12px;
              
              .comment-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                margin-right: 12px;
                object-fit: cover;
              }
              
              .comment-info {
                flex: 1;
                
                .comment-author {
                  font-weight: 600;
                  color: var(--text-primary-color);
                  margin-bottom: 4px;
                }
                
                .comment-time {
                  font-size: 12px;
                  color: var(--text-placeholder-color);
                }
              }
              
              .comment-actions {
                display: flex;
                gap: 16px;
                
                .action-btn {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  color: var(--text-placeholder-color);
                  cursor: pointer;
                  font-size: 14px;
                  transition: color 0.3s;
                  
                  &:hover {
                    color: var(--theme-primary-color);
                  }
                  
                  &.liked {
                    color: var(--theme-primary-color);
                  }
                }
              }
            }
            
            .comment-content {
              color: var(--text-primary-color);
              line-height: 1.6;
              margin-bottom: 12px;
            }
            
            .replies-list {
              margin-left: 48px;
              
              .reply-item {
                background: var(--bg-gray);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                
                .reply-header {
                  display: flex;
                  align-items: center;
                  margin-bottom: 8px;
                  
                  .reply-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    margin-right: 8px;
                    object-fit: cover;
                  }
                  
                  .reply-info {
                    flex: 1;
                    
                    .reply-author {
                      font-weight: 600;
                      color: var(--text-primary-color);
                      font-size: 14px;
                    }
                    
                    .reply-time {
                      font-size: 12px;
                      color: var(--text-placeholder-color);
                    }
                  }
                  
                  .reply-actions {
                    .action-btn {
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      color: var(--text-placeholder-color);
                      cursor: pointer;
                      font-size: 12px;
                      transition: color 0.3s;
                      
                      &:hover {
                        color: var(--theme-primary-color);
                      }
                      
                      &.liked {
                        color: var(--theme-primary-color);
                      }
                    }
                  }
                }
                
                .reply-content {
                  color: var(--text-primary-color);
                  line-height: 1.6;
                  font-size: 14px;
                }
              }
            }
            
            .reply-form {
              margin-left: 48px;
              margin-top: 12px;
              
              .reply-input {
                margin-bottom: 8px;
              }
              
              .reply-form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
              }
            }
          }
        }
      }
    }
    
    .sidebar {
      width: 360px;
      position: sticky;
      top: calc(var(--header-height) + 20px);
      align-self: flex-start;
      
      .author-card {
        background: var(--bg-white);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: var(--box-shadow);
        
        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          
          .user-info {
            display: flex;
            align-items: center;
            
            .user-avatar {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              margin-right: 12px;
              object-fit: cover;
            }
            
            .user-details {
              .user-name {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary-color);
              }
            }
          }
          
          .publish-btn {
            border-radius: 20px;
            padding: 6px 16px;
            font-size: 14px;
            
            .iconfont {
              margin-right: 4px;
            }
          }
        }
        
        .user-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          
          .stat-item {
            text-align: center;
            
            .stat-value {
              font-size: 18px;
              font-weight: 600;
              color: var(--text-primary-color);
              margin-bottom: 4px;
            }
            
            .stat-label {
              font-size: 12px;
              color: var(--text-secondary-color);
            }
          }
        }
      }
      
      .related-posts {
        background: var(--bg-white);
        border-radius: 8px;
        padding: 20px;
        box-shadow: var(--box-shadow);
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary-color);
          margin-bottom: 16px;
        }
        
        .related-list {
          .related-item {
            padding: 12px 0;
            border-bottom: 1px solid var(--border-light-color);
            cursor: pointer;
            transition: all 0.3s;
            
            &:last-child {
              border-bottom: none;
            }
            
            &:hover {
              background-color: var(--bg-gray);
              margin: 0 -12px;
              padding: 12px;
              border-radius: 4px;
            }
            
            .related-title {
              font-weight: 500;
              color: var(--text-primary-color);
              margin-bottom: 8px;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            
            .related-stats {
              display: flex;
              gap: 16px;
              font-size: 12px;
              color: var(--text-placeholder-color);
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .post-detail-page {
    .post-detail-content {
      padding: 20px 16px;
    }
  }
}

@media (max-width: 768px) {
  .post-detail-page {
    .post-detail-content {
      flex-direction: column;
      padding: 16px 12px;
      
      .sidebar {
        width: 100%;
        order: -1;
        position: static;
        
        .author-card {
          .user-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            
            .user-info {
              justify-content: center;
            }
          }
          
          .user-stats {
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            
            .stat-item {
              .stat-value {
                font-size: 16px;
              }
              
              .stat-label {
                font-size: 11px;
              }
            }
          }
        }
      }
      
      .main-content {
        .post-detail {
          padding: 16px;
          
          .post-header {
            .post-meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
          }
          
          .post-content {
            .post-images {
              grid-template-columns: 1fr;
              
              .post-image {
                height: 150px;
              }
            }
          }
          
          .post-actions {
            flex-wrap: wrap;
          }
        }
        
        .comments-section {
          padding: 16px;
          
          .comments-list {
            .comment-item {
              .replies-list {
                margin-left: 20px;
              }
              
              .reply-form {
                margin-left: 20px;
              }
            }
          }
        }
      }
    }
  }
}
</style>