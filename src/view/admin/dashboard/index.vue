<template>
  <div class="admin-dashboard" v-loading="loading">
    <section class="summary-grid">
      <article
        v-for="card in summaryCards"
        :key="card.key"
        class="summary-card"
        :class="`theme-${card.theme}`"
      >
        <div class="summary-info">
          <div class="card-label">{{ card.label }}</div>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-desc">{{ card.desc }}</div>
        </div>

        <div class="card-meta">
          <el-icon>
            <component :is="card.icon" />
          </el-icon>
        </div>
      </article>
    </section>

    <section class="chart-grid">
      <div class="chart-card chart-span-2">
        <div class="card-header">
          <h3>用户增长趋势</h3>
          <p>近 7 天消费者与农户新增情况</p>
        </div>
        <v-chart class="chart" :option="userGrowthOption" autoresize />
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>店铺审核分布</h3>
          <p>待审核、已通过、已驳回</p>
        </div>
        <v-chart class="chart" :option="shopAuditOption" autoresize />
      </div>

      <div class="chart-card chart-span-2">
        <div class="card-header">
          <h3>交易趋势</h3>
          <p>近 7 天订单量与成交金额</p>
        </div>
        <v-chart class="chart" :option="tradeTrendOption" autoresize />
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>商品分类分布</h3>
          <p>平台农产品分类占比</p>
        </div>
        <v-chart class="chart" :option="productDistributionOption" autoresize />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  ChatDotSquare,
  GoodsFilled,
  Shop,
  Tickets,
  UserFilled
} from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { getAdminDashboardOverview } from '@/apis/admin-dashboard'

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent])

const loading = ref(false)
const dashboard = ref({
  summary: {},
  user_growth: {
    dates: [],
    consumer: [],
    merchant: [],
    total: []
  },
  trade_trend: {
    dates: [],
    order_count: [],
    trade_amount: []
  },
  product_distribution: [],
  shop_audit_distribution: []
})

const fetchDashboard = async () => {
  loading.value = true
  try {
    const res = await getAdminDashboardOverview()
    dashboard.value = res.data || dashboard.value
  } finally {
    loading.value = false
  }
}

const summaryCards = computed(() => {
  const summary = dashboard.value.summary || {}

  return [
    {
      key: 'users',
      label: '平台用户',
      value: summary.total_users || 0,
      desc: `消费者 ${summary.total_consumers || 0} / 农户 ${summary.total_merchants || 0}`,
      icon: UserFilled,
      theme: 'mint'
    },
    {
      key: 'shops',
      label: '商户店铺',
      value: summary.total_shops || 0,
      desc: `已通过 ${summary.approved_shops || 0} / 待审核 ${summary.pending_shop_audits || 0}`,
      icon: Shop,
      theme: 'blue'
    },
    {
      key: 'products',
      label: '商品总数',
      value: summary.total_products || 0,
      desc: '覆盖平台农产品上架信息',
      icon: GoodsFilled,
      theme: 'amber'
    },
    {
      key: 'orders',
      label: '订单总数',
      value: summary.total_orders || 0,
      desc: `累计成交 ￥${summary.total_gmv || 0}`,
      icon: Tickets,
      theme: 'green'
    },
    {
      key: 'posts',
      label: '社区帖子',
      value: summary.total_posts || 0,
      desc: '社区内容总量',
      icon: ChatDotSquare,
      theme: 'violet'
    }
  ]
})

const userGrowthOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    top: 8,
    left: 'center',
    icon: 'roundRect',
    itemWidth: 14,
    itemHeight: 10,
    itemGap: 18
  },
  grid: { left: 42, right: 24, top: 64, bottom: 28, containLabel: true },
  xAxis: {
    type: 'category',
    data: dashboard.value.user_growth?.dates || []
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '消费者',
      type: 'line',
      smooth: true,
      data: dashboard.value.user_growth?.consumer || [],
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#52c41a' },
      lineStyle: { width: 3 }
    },
    {
      name: '农户',
      type: 'line',
      smooth: true,
      data: dashboard.value.user_growth?.merchant || [],
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#1890ff' },
      lineStyle: { width: 3 }
    },
    {
      name: '合计',
      type: 'bar',
      data: dashboard.value.user_growth?.total || [],
      itemStyle: { color: '#73d13d', borderRadius: [8, 8, 0, 0] },
      barMaxWidth: 24
    }
  ]
}))

const tradeTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    top: 8,
    left: 'center',
    icon: 'roundRect',
    itemWidth: 14,
    itemHeight: 10,
    itemGap: 18
  },
  grid: { left: 48, right: 42, top: 64, bottom: 32, containLabel: true },
  xAxis: {
    type: 'category',
    data: dashboard.value.trade_trend?.dates || []
  },
  yAxis: [
    { type: 'value', name: '订单量' },
    { type: 'value', name: '金额', position: 'right' }
  ],
  series: [
    {
      name: '订单量',
      type: 'bar',
      data: dashboard.value.trade_trend?.order_count || [],
      barMaxWidth: 24,
      itemStyle: { color: '#95de64', borderRadius: [8, 8, 0, 0] }
    },
    {
      name: '成交金额',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: dashboard.value.trade_trend?.trade_amount || [],
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#389e0d' },
      lineStyle: { width: 3 }
    }
  ]
}))

const productDistributionOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, left: 'center', icon: 'roundRect' },
  series: [
    {
      type: 'pie',
      radius: ['42%', '70%'],
      center: ['50%', '45%'],
      data: dashboard.value.product_distribution || [],
      label: {
        formatter: '{b}\n{d}%'
      }
    }
  ]
}))

const shopAuditOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, left: 'center', icon: 'roundRect' },
  series: [
    {
      type: 'pie',
      radius: ['38%', '68%'],
      center: ['50%', '45%'],
      data: dashboard.value.shop_audit_distribution || [],
      label: {
        formatter: '{b}\n{c}'
      }
    }
  ]
}))

onMounted(() => {
  fetchDashboard()
})
</script>

<style lang="scss" scoped>
.admin-dashboard {
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .summary-card,
  .chart-card {
    padding: 20px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(82, 196, 26, 0.12);
    box-shadow: 0 18px 32px rgba(31, 56, 20, 0.06);
  }

  .summary-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    position: relative;
    overflow: hidden;
  }

  .summary-card::before {
    content: '';
    position: absolute;
    inset: auto auto 0 0;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(82, 196, 26, 0.06);
    transform: translate(-28px, 48px);
    pointer-events: none;
  }

  .summary-card.theme-blue::before {
    background: rgba(24, 144, 255, 0.08);
  }

  .summary-card.theme-amber::before {
    background: rgba(250, 173, 20, 0.1);
  }

  .summary-card.theme-green::before {
    background: rgba(82, 196, 26, 0.08);
  }

  .summary-card.theme-violet::before {
    background: rgba(114, 46, 209, 0.08);
  }

  .summary-info {
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .card-label {
    font-size: 13px;
    color: var(--text-secondary-color);
  }

  .card-value {
    margin: 10px 0 8px;
    font-size: 34px;
    font-weight: 700;
    color: var(--text-primary-color);
  }

  .card-desc {
    font-size: 12px;
    color: #7f8c74;
    line-height: 1.5;
  }

  .card-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    position: relative;
    z-index: 1;
    color: #fff;
    box-shadow: 0 14px 26px rgba(31, 56, 20, 0.12);

    :deep(.el-icon) {
      font-size: 26px;
    }
  }

  .theme-mint .card-meta {
    background: linear-gradient(135deg, #73d13d, #52c41a);
  }

  .theme-blue .card-meta {
    background: linear-gradient(135deg, #69c0ff, #1890ff);
  }

  .theme-amber .card-meta {
    background: linear-gradient(135deg, #ffd666, #faad14);
  }

  .theme-green .card-meta {
    background: linear-gradient(135deg, #95de64, #52c41a);
  }

  .theme-violet .card-meta {
    background: linear-gradient(135deg, #b37feb, #722ed1);
  }

  .chart-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .chart-span-2 {
    grid-column: span 2;
  }

  .card-header {
    margin-bottom: 12px;

    h3 {
      margin: 0 0 6px;
      font-size: 18px;
      color: var(--text-primary-color);
    }

    p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary-color);
    }
  }

  .chart {
    width: 100%;
    height: 320px;
  }
}

@media screen and (max-width: 1200px) {
  .admin-dashboard {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .chart-grid {
      grid-template-columns: 1fr;
    }

    .chart-span-2 {
      grid-column: span 1;
    }
  }
}

@media screen and (max-width: 640px) {
  .admin-dashboard {
    .summary-grid {
      grid-template-columns: 1fr;
    }

    .summary-card {
      align-items: center;
    }
  }
}
</style>
