<template>
  <div class="ai-forecast">
    <div class="forecast-header">
      <h3>
        <i class="iconfont icon-ai"></i>
        AI行情预测
      </h3>
      <el-button size="small" @click="handleRefresh" :loading="loading">
        <i class="iconfont icon-shuaxin"></i>
        刷新分析
      </el-button>
    </div>

    <div class="forecast-content" v-loading="loading">
      <!-- 综合评分 -->
      <div class="score-section">
        <div class="score-card">
          <div class="score-label">市场热度</div>
          <div class="score-value" :style="{ color: getScoreColor(forecast.marketHeat) }">
            {{ forecast.marketHeat }}
          </div>
          <el-progress
            :percentage="forecast.marketHeat"
            :color="getScoreColor(forecast.marketHeat)"
            :show-text="false"
          />
        </div>
        <div class="score-card">
          <div class="score-label">竞争指数</div>
          <div class="score-value" :style="{ color: getScoreColor(100 - forecast.competition) }">
            {{ forecast.competition }}
          </div>
          <el-progress
            :percentage="forecast.competition"
            :color="getScoreColor(100 - forecast.competition)"
            :show-text="false"
          />
        </div>
        <div class="score-card">
          <div class="score-label">增长潜力</div>
          <div class="score-value" :style="{ color: getScoreColor(forecast.growthPotential) }">
            {{ forecast.growthPotential }}
          </div>
          <el-progress
            :percentage="forecast.growthPotential"
            :color="getScoreColor(forecast.growthPotential)"
            :show-text="false"
          />
        </div>
      </div>

      <!-- 行情分析 -->
      <div class="analysis-section">
        <h4>
          <i class="iconfont icon-fenxi"></i>
          行情分析
        </h4>
        <div class="markdown-content" v-html="renderedAnalysis"></div>
      </div>

      <!-- 调整建议 -->
      <div class="suggestions-section" v-if="showSuggestions">
        <h4>
          <i class="iconfont icon-jianyi"></i>
          调整建议
        </h4>
        <div class="markdown-content" v-html="renderedSuggestions"></div>
      </div>

      <!-- 风险提示 -->
      <div class="risk-section" v-if="showRisks && forecast.risks && forecast.risks.length > 0">
        <h4>
          <i class="iconfont icon-jinggao"></i>
          风险提示
        </h4>
        <el-alert
          v-for="(risk, index) in forecast.risks"
          :key="index"
          :title="risk"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  forecast: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

// 流式渲染的文本
const streamedAnalysis = ref('')
const streamedSuggestions = ref('')
const showSuggestions = ref(false)
const showRisks = ref(false)
const userScrolled = ref(false)
const isStreaming = ref(false)

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

// 渲染后的 markdown 内容
const renderedAnalysis = computed(() => {
  return marked(streamedAnalysis.value)
})

const renderedSuggestions = computed(() => {
  return marked(streamedSuggestions.value)
})

// 监听用户滚动
const handleScroll = () => {
  if (isStreaming.value) {
    const content = document.querySelector('.forecast-content')
    if (content) {
      // 检查是否是用户主动滚动（不在底部）
      const isAtBottom = content.scrollHeight - content.scrollTop - content.clientHeight < 50
      if (!isAtBottom) {
        userScrolled.value = true
      }
    }
  }
}

// 流式渲染函数
const streamText = async (text, targetRef, speed = 15) => {
  targetRef.value = ''
  const chars = text.split('')
  
  for (let i = 0; i < chars.length; i++) {
    targetRef.value += chars[i]
    await new Promise(resolve => setTimeout(resolve, speed))
    
    // 只有在用户没有手动滚动时才自动滚动
    if (i % 10 === 0 && !userScrolled.value) {
      await nextTick()
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }
  
  // 完成后滚动到底部（如果用户没有手动滚动）
  if (!userScrolled.value) {
    await nextTick()
    requestAnimationFrame(() => {
      scrollToBottom()
    })
  }
}

// 滚动到底部（使用 smooth 滚动避免抖动）
const scrollToBottom = () => {
  if (userScrolled.value) return
  
  const content = document.querySelector('.forecast-content')
  if (content) {
    content.scrollTo({
      top: content.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// 滚动到顶部
const scrollToTop = () => {
  const content = document.querySelector('.forecast-content')
  if (content) {
    content.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  }
}

// 监听 forecast 变化，触发流式渲染（先分析后建议后风险）
watch(() => props.forecast, async (newForecast) => {
  if (newForecast.analysis && newForecast.suggestions) {
    // 重置状态
    userScrolled.value = false
    isStreaming.value = true
    showSuggestions.value = false
    showRisks.value = false
    streamedAnalysis.value = ''
    streamedSuggestions.value = ''
    
    // 滚动到顶部
    scrollToTop()
    
    // 等待一小段时间确保滚动完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 先渲染行情分析
    await streamText(newForecast.analysis, streamedAnalysis, 15)
    
    // 等待一小段时间，然后显示调整建议标题
    await new Promise(resolve => setTimeout(resolve, 300))
    showSuggestions.value = true
    
    if (!userScrolled.value) {
      await nextTick()
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
    
    // 再渲染调整建议
    await streamText(newForecast.suggestions, streamedSuggestions, 15)
    
    // 等待一小段时间，然后显示风险提示
    await new Promise(resolve => setTimeout(resolve, 300))
    showRisks.value = true
    
    if (!userScrolled.value) {
      await nextTick()
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
    
    // 渲染完成
    isStreaming.value = false
  }
}, { immediate: true, deep: true })

const handleRefresh = () => {
  emit('refresh')
}

const getScoreColor = (score) => {
  if (score >= 80) return '#52c41a'
  if (score >= 60) return '#faad14'
  return '#f5222d'
}

// 组件挂载时添加滚动监听
onMounted(() => {
  const content = document.querySelector('.forecast-content')
  if (content) {
    content.addEventListener('scroll', handleScroll)
  }
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  const content = document.querySelector('.forecast-content')
  if (content) {
    content.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="scss" scoped>
.ai-forecast {
  background: var(--bg-white);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--box-shadow);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .forecast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f0f0f0;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary-color);
      display: flex;
      align-items: center;
      gap: 8px;

      .iconfont {
        font-size: 20px;
        color: var(--theme-primary-color);
      }
    }
  }

  .forecast-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d9d9d9;
      border-radius: 3px;

      &:hover {
        background: #bfbfbf;
      }
    }

    .score-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .score-card {
        text-align: center;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;

        .score-label {
          font-size: 13px;
          color: var(--text-secondary-color);
          margin-bottom: 8px;
        }

        .score-value {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }
      }
    }

    .analysis-section,
    .suggestions-section,
    .risk-section {
      margin-bottom: 24px;

      h4 {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;

        .iconfont {
          font-size: 16px;
          color: var(--theme-primary-color);
        }
      }
    }

    .markdown-content {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      line-height: 1.8;
      color: var(--text-primary-color);

      :deep(h2) {
        font-size: 16px;
        font-weight: 600;
        margin: 16px 0 12px 0;
        color: var(--text-primary-color);
        
        &:first-child {
          margin-top: 0;
        }
      }

      :deep(h3) {
        font-size: 14px;
        font-weight: 600;
        margin: 12px 0 8px 0;
        color: var(--text-primary-color);
      }

      :deep(p) {
        margin: 0 0 12px 0;
        
        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(ul), :deep(ol) {
        margin: 8px 0 12px 0;
        padding-left: 24px;
      }

      :deep(li) {
        margin-bottom: 6px;
      }

      :deep(strong) {
        color: var(--theme-primary-color);
        font-weight: 600;
      }

      :deep(code) {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }
    }

    .risk-section {
      .el-alert {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
