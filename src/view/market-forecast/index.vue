<template>
  <div class="market-forecast-page">
    <div class="forecast-container">
      <!-- 左侧图表区域 -->
      <div class="charts-section">
        <!-- 本店销售数据 -->
        <div class="data-section">
          <h3 class="section-title">本店销售数据</h3>
          <div class="charts-grid">
            <SalesTrendChart 
              :data="shopSalesTrendData"
              title="销售趋势分析"
              @timeRangeChange="handleTimeRangeChange"
            />
            <ProductRankChart 
              :data="shopProductRankData"
              title="热销农产品排行"
            />
            <CategoryDistributionChart 
              :data="shopCategoryDistributionData"
              title="品类销售分布"
            />
          </div>
        </div>

        <!-- 平台销售数据 -->
        <div class="data-section">
          <h3 class="section-title">平台销售数据</h3>
          <div class="charts-grid">
            <SalesTrendChart 
              :data="platformSalesTrendData"
              title="销售趋势分析"
              @timeRangeChange="handleTimeRangeChange"
            />
            <ProductRankChart 
              :data="platformProductRankData"
              title="热销农产品排行"
            />
            <CategoryDistributionChart 
              :data="platformCategoryDistributionData"
              title="品类销售分布"
            />
          </div>
        </div>
      </div>

      <!-- 右侧AI预测区域 -->
      <div class="ai-section">
        <AIForecast :forecast="aiForecastData" :loading="forecastLoading" @refresh="handleRefreshForecast" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import SalesTrendChart from './components/SalesTrendChart.vue'
import ProductRankChart from './components/ProductRankChart.vue'
import CategoryDistributionChart from './components/CategoryDistributionChart.vue'
import AIForecast from './components/AIForecast.vue'
import {
  getShopSalesTrend,
  getPlatformSalesTrend,
  getShopProductRank,
  getPlatformProductRank,
  getShopCategoryDistribution,
  getPlatformCategoryDistribution,
  getAIForecast
} from '@/apis/market-forecast'

// 数据
const shopSalesTrendData = ref({
  week: { dates: [], sales: [], orders: [] },
  month: { dates: [], sales: [], orders: [] },
  quarter: { dates: [], sales: [], orders: [] }
})
const platformSalesTrendData = ref({
  week: { dates: [], sales: [], orders: [] },
  month: { dates: [], sales: [], orders: [] },
  quarter: { dates: [], sales: [], orders: [] }
})
const shopProductRankData = ref([])
const platformProductRankData = ref([])
const shopCategoryDistributionData = ref([])
const platformCategoryDistributionData = ref([])
const aiForecastData = ref({
  marketHeat: 0,
  competition: 0,
  growthPotential: 0,
  analysis: '',
  suggestions: '',
  risks: []
})
const forecastLoading = ref(false)
const loading = ref(false)

// 加载店铺销售趋势
const loadShopSalesTrend = async (timeRange = 'month') => {
  try {
    const res = await getShopSalesTrend(timeRange)
    if (res.code === 200) {
      shopSalesTrendData.value = res.data
    }
  } catch (error) {
    console.error('加载店铺销售趋势失败:', error)
  }
}

// 加载平台销售趋势
const loadPlatformSalesTrend = async (timeRange = 'month') => {
  try {
    const res = await getPlatformSalesTrend(timeRange)
    if (res.code === 200) {
      platformSalesTrendData.value = res.data
    }
  } catch (error) {
    console.error('加载平台销售趋势失败:', error)
  }
}

// 加载店铺热销农产品
const loadShopProductRank = async () => {
  try {
    const res = await getShopProductRank()
    if (res.code === 200) {
      shopProductRankData.value = res.data
    }
  } catch (error) {
    console.error('加载店铺热销农产品失败:', error)
  }
}

// 加载平台热销农产品
const loadPlatformProductRank = async () => {
  try {
    const res = await getPlatformProductRank()
    if (res.code === 200) {
      platformProductRankData.value = res.data
    }
  } catch (error) {
    console.error('加载平台热销农产品失败:', error)
  }
}

// 加载店铺品类分布
const loadShopCategoryDistribution = async () => {
  try {
    const res = await getShopCategoryDistribution()
    if (res.code === 200) {
      shopCategoryDistributionData.value = res.data
    }
  } catch (error) {
    console.error('加载店铺品类分布失败:', error)
  }
}

// 加载平台品类分布
const loadPlatformCategoryDistribution = async () => {
  try {
    const res = await getPlatformCategoryDistribution()
    if (res.code === 200) {
      platformCategoryDistributionData.value = res.data
    }
  } catch (error) {
    console.error('加载平台品类分布失败:', error)
  }
}

// 加载AI预测
const loadAIForecast = async () => {
  forecastLoading.value = true
  try {
    const res = await getAIForecast()
    if (res.code === 200) {
      const data = res.data
      
      // 转换数据格式以匹配组件期望的格式
      aiForecastData.value = {
        marketHeat: data.metrics.market_heat,
        competition: data.metrics.competition_index,
        growthPotential: data.metrics.growth_potential,
        analysis: data.analysis,
        suggestions: data.suggestions, // 现在是 Markdown 字符串，不需要格式化
        risks: data.risks
      }
      
      ElMessage.success('AI分析完成')
    } else {
      ElMessage.error(res.message || 'AI分析失败')
    }
  } catch (error) {
    console.error('加载AI预测失败:', error)
    if (error.message && error.message.includes('timeout')) {
      ElMessage.error('AI分析超时，请稍后重试')
    } else {
      ElMessage.error(error.message || 'AI分析失败，请稍后重试')
    }
  } finally {
    forecastLoading.value = false
  }
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadShopSalesTrend('month'),
      loadPlatformSalesTrend('month'),
      loadShopProductRank(),
      loadPlatformProductRank(),
      loadShopCategoryDistribution(),
      loadPlatformCategoryDistribution()
    ])
    
    // 数据加载完成后，不自动加载AI预测，等待用户点击"刷新分析"按钮
    // await loadAIForecast()
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 时间范围变化
const handleTimeRangeChange = (range) => {
  loadShopSalesTrend(range)
  loadPlatformSalesTrend(range)
}

// 刷新AI预测
const handleRefreshForecast = () => {
  // 清空现有数据
  aiForecastData.value = {
    marketHeat: 0,
    competition: 0,
    growthPotential: 0,
    analysis: '',
    suggestions: '',
    risks: []
  }
  // 重新加载
  loadAIForecast()
}

// 页面加载时自动获取数据
onMounted(() => {
  loadAllData()
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
