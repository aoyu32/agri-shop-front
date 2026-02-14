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
  shopSalesTrendData as mockShopSalesTrendData,
  platformSalesTrendData as mockPlatformSalesTrendData,
  shopProductRankData as mockShopProductRankData,
  platformProductRankData as mockPlatformProductRankData,
  shopCategoryDistributionData as mockShopCategoryDistributionData,
  platformCategoryDistributionData as mockPlatformCategoryDistributionData,
  aiForecastData as mockAiForecastData
} from '@/mock/market-forecast/forecast-data'

// 数据
const shopSalesTrendData = ref(mockShopSalesTrendData)
const platformSalesTrendData = ref(mockPlatformSalesTrendData)
const shopProductRankData = ref(mockShopProductRankData)
const platformProductRankData = ref(mockPlatformProductRankData)
const shopCategoryDistributionData = ref(mockShopCategoryDistributionData)
const platformCategoryDistributionData = ref(mockPlatformCategoryDistributionData)
const aiForecastData = ref(mockAiForecastData)
const forecastLoading = ref(false)

// 时间范围变化
const handleTimeRangeChange = (range) => {
  console.log('时间范围变化:', range)
  // 这里可以根据时间范围重新获取数据
}

// 刷新AI预测
const handleRefreshForecast = () => {
  forecastLoading.value = true
  
  // 模拟AI分析过程
  setTimeout(() => {
    // 重新触发流式渲染
    aiForecastData.value = { ...mockAiForecastData }
    forecastLoading.value = false
    ElMessage.success('AI分析完成')
  }, 2000)
}

// 页面加载时自动生成预测
onMounted(() => {
  console.log('行情预测页面加载完成')
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
