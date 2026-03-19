<template>
  <div class="community-page">
    <div class="community-content">
      <!-- 左侧内容区 -->
      <div class="main-content">
        <!-- 分类标签 -->
        <div class="category-tabs">
          <div
            v-for="tab in categoryTabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key; loadPosts()"
          >
            {{ tab.label }}
          </div>
        </div>

        <!-- 帖子列表 -->
        <div class="posts-list">
          <!-- 空状态 -->
          <div v-if="!loading && filteredPosts.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="iconfont icon-wenzhang"></i>
            </div>
            <div class="empty-text">暂无帖子</div>
            <div class="empty-desc">{{ activeTab === 'all' ? '还没有人发布帖子，快来发布第一个吧！' : '该分类下暂无帖子' }}</div>
            <el-button type="primary" @click="handlePublish">
              <i class="iconfont icon-bianji"></i>
              发布帖子
            </el-button>
          </div>

          <!-- 帖子列表 -->
          <div
            v-for="post in filteredPosts"
            :key="post.id"
            class="post-item"
            @click="handlePostClick(post)"
          >
            <!-- 帖子头部 -->
            <div class="post-header">
              <div class="author-info">
                <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
                <div class="author-details">
                  <div class="author-name">{{ post.author.name }}</div>
                </div>
              </div>
              <div class="post-category">{{ getPostCategory(post) }}</div>
            </div>

            <!-- 帖子内容 -->
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <div class="post-excerpt">{{ getPostExcerpt(post.content) }}</div>
              
              <!-- 帖子图片 -->
              <div v-if="post.images && post.images.length > 0" class="post-images">
                <img
                  v-for="(image, index) in post.images.slice(0, 3)"
                  :key="index"
                  :src="image"
                  :alt="`图片${index + 1}`"
                  class="post-image"
                />
                <div v-if="post.images.length > 3" class="more-images">
                  +{{ post.images.length - 3 }}
                </div>
              </div>
            </div>

            <!-- 帖子底部操作 -->
            <div class="post-footer">
              <div class="post-stats">
                <span class="stat-item">
                  <i class="iconfont icon-eye"></i>
                  {{ post.views }}
                </span>
                <span class="stat-item" :class="{ liked: post.isLiked }" @click.stop="handleLike(post)">
                  <i class="iconfont icon-dianzan"></i>
                  {{ post.likes }}
                </span>
                <span class="stat-item">
                  <i class="iconfont icon-pinglun"></i>
                  {{ post.comments }}
                </span>
              </div>
              <div class="post-time">{{ post.createTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 个人信息卡片 -->
        <div class="user-card">
          <div class="user-header">
            <div class="user-info">
              <img :src="currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'" alt="用户头像" class="user-avatar" />
              <div class="user-details">
                <div class="user-name">{{ currentUser.nickname || currentUser.username || '游客' }}</div>
              </div>
            </div>
            <el-button type="primary" class="publish-btn" @click="handlePublish">
              <i class="iconfont icon-bianji"></i>
              发布
            </el-button>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.post_count }}</div>
              <div class="stat-label">帖子</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.like_count }}</div>
              <div class="stat-label">获赞</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.comment_count }}</div>
              <div class="stat-label">评论</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.view_count }}</div>
              <div class="stat-label">浏览</div>
            </div>
          </div>
        </div>

        <!-- 热门帖子 -->
        <div class="hot-posts">
          <h3 class="section-title">
            <i class="iconfont icon-huo"></i>
            热门帖子
          </h3>
          <div class="posts-list">
            <!-- 空状态 -->
            <div v-if="hotPosts.length === 0" class="hot-posts-empty">
              <i class="iconfont icon-zanwushuju"></i>
              <span>暂无热门帖子</span>
            </div>

            <!-- 热门帖子列表 -->
            <div
              v-for="hotPost in hotPosts"
              :key="hotPost.id"
              class="hot-post-item"
              @click="handlePostClick(hotPost)"
            >
              <div class="hot-post-title">{{ hotPost.title }}</div>
              <div class="hot-post-stats">
                <span>{{ hotPost.views }} 浏览</span>
                <span>{{ hotPost.likes }} 点赞</span>
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPostList, getHotPosts, getUserStats, togglePostLike } from '@/apis/community'
import { POST_CATEGORIES } from '@/constants/community'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const searchKeyword = ref('')
const activeTab = ref('all')
const posts = ref([])
const hotPostsList = ref([])
const userStats = ref({
  post_count: 0,
  like_count: 0,
  comment_count: 0,
  view_count: 0
})
const loading = ref(false)

// 当前用户信息
const currentUser = computed(() => userStore.userInfo)

// 分类标签 - 从常量中获取
const categoryTabs = [
  { key: 'all', label: '全部' },
  ...POST_CATEGORIES.map(cat => ({ key: cat.value, label: cat.label }))
]

// 计算属性
const filteredPosts = computed(() => {
  return posts.value
})

// 热门帖子
const hotPosts = computed(() => {
  return hotPostsList.value
})

// 生命周期
onMounted(() => {
  loadPosts()
  loadHotPosts()
  loadUserStats()
})

// 加载帖子列表
const loadPosts = async () => {
  try {
    loading.value = true
    const params = {
      category: activeTab.value === 'all' ? '' : activeTab.value,
      keyword: searchKeyword.value,
      page: 1,
      page_size: 20
    }
    const res = await getPostList(params)
    if (res.code === 200) {
      posts.value = res.data.list.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        images: post.images || [],
        category: post.category,
        tags: post.tags || [],
        views: post.view_count,
        likes: post.like_count,
        comments: post.comment_count,
        isLiked: post.is_liked,
        createTime: post.created_at,
        author: {
          id: post.author.id,
          name: post.author.nickname || post.author.username,
          avatar: post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`
        }
      }))
    }
  } catch (error) {
    console.error('加载帖子列表失败:', error)
    ElMessage.error('加载帖子列表失败')
  } finally {
    loading.value = false
  }
}

// 加载热门帖子
const loadHotPosts = async () => {
  try {
    const res = await getHotPosts({ limit: 8 })
    if (res.code === 200) {
      hotPostsList.value = res.data.map(post => ({
        id: post.id,
        title: post.title,
        views: post.view_count,
        likes: post.like_count
      }))
    }
  } catch (error) {
    console.error('加载热门帖子失败:', error)
  }
}

// 加载用户统计
const loadUserStats = async () => {
  try {
    const res = await getUserStats()
    if (res.code === 200) {
      userStats.value = res.data
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

// 获取帖子摘要
const getPostExcerpt = (content) => {
  // 移除 markdown 标记并截取前100个字符
  const plainText = content.replace(/[#*`>\-\[\]]/g, '').replace(/\n/g, ' ')
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
}

// 获取帖子类别
const getPostCategory = (post) => {
  const category = POST_CATEGORIES.find(cat => cat.value === post.category)
  return category ? category.label : '综合讨论'
}

// 事件处理
const handleSearch = () => {
  ElMessage.info(`搜索: ${searchKeyword.value}`)
}

const handlePublish = () => {
  router.push('/community/create')
}

const handleCreatePost = () => {
  router.push('/community/create')
}

const handlePostClick = (post) => {
  // 在新标签页打开帖子详情页
  const route = router.resolve({ name: 'PostDetail', params: { id: post.id } })
  window.open(route.href, '_blank')
}

const handleLike = async (post) => {
  try {
    const res = await togglePostLike({ post_id: post.id })
    if (res.code === 200) {
      post.isLiked = res.data.is_liked
      post.likes = res.data.like_count
      ElMessage.success(res.message)
    }
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleShare = (post) => {
  ElMessage.info('分享功能开发中...')
}
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
