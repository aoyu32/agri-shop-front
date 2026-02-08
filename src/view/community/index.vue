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
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>

        <!-- 帖子列表 -->
        <div class="posts-list">
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
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user-xiaowang" alt="用户头像" class="user-avatar" />
              <div class="user-details">
                <div class="user-name">农户小王</div>
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

        <!-- 热门帖子 -->
        <div class="hot-posts">
          <h3 class="section-title">
            <i class="iconfont icon-huo"></i>
            热门帖子
          </h3>
          <div class="posts-list">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { communityPosts, hotTopics } from '@/mock/community/posts'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const activeTab = ref('all')
const posts = ref([...communityPosts])

// 分类标签
const categoryTabs = [
  { key: 'all', label: '全部' },
  { key: 'tech', label: '种植技术' },
  { key: 'market', label: '市场行情' },
  { key: 'share', label: '经验分享' },
  { key: 'question', label: '求助问答' }
]

// 计算属性
const filteredPosts = computed(() => {
  let result = posts.value

  // 根据分类筛选
  if (activeTab.value !== 'all') {
    const filterMap = {
      tech: ['种植技术', '有机农业', '病虫害防治'],
      market: ['市场分析', '价格走势', '农产品'],
      share: ['丰收', '经验分享', 'DIY'],
      question: ['新手求教', '种植入门']
    }
    const filterTags = filterMap[activeTab.value] || []
    result = result.filter(post => 
      post.tags.some(tag => filterTags.includes(tag))
    )
  }

  // 根据搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(post =>
      post.title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword) ||
      post.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  return result
})

// 热门帖子（按浏览量和点赞数排序）
const hotPosts = computed(() => {
  return [...communityPosts]
    .sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2))
    .slice(0, 8)
})

// 获取帖子摘要
const getPostExcerpt = (content) => {
  // 移除 markdown 标记并截取前100个字符
  const plainText = content.replace(/[#*`>\-\[\]]/g, '').replace(/\n/g, ' ')
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
}

// 获取帖子类别
const getPostCategory = (post) => {
  // 根据标签确定类别
  if (post.tags.includes('种植技术') || post.tags.includes('有机农业')) {
    return '种植技术'
  } else if (post.tags.includes('市场分析') || post.tags.includes('价格走势')) {
    return '市场行情'
  } else if (post.tags.includes('丰收') || post.tags.includes('经验分享')) {
    return '经验分享'
  } else if (post.tags.includes('新手求教') || post.tags.includes('种植入门')) {
    return '求助问答'
  }
  return '综合讨论'
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
  router.push({ name: 'PostDetail', params: { id: post.id } })
}

const handleLike = (post) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
  ElMessage.success(post.isLiked ? '点赞成功' : '取消点赞')
}

const handleShare = (post) => {
  ElMessage.info('分享功能开发中...')
}
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>
