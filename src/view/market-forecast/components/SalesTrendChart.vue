<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
        <el-radio-button label="week">近7天</el-radio-button>
        <el-radio-button label="month">近30天</el-radio-button>
        <el-radio-button label="quarter">近3个月</el-radio-button>
      </el-radio-group>
    </div>
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: '销售趋势分析'
  }
})

const timeRange = ref('month')

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['销售额', '订单量'],
    top: 10
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.data[timeRange.value]?.dates || []
  },
  yAxis: [
    {
      type: 'value',
      name: '销售额(元)',
      position: 'left',
      axisLabel: {
        formatter: '{value}'
      }
    },
    {
      type: 'value',
      name: '订单量',
      position: 'right',
      axisLabel: {
        formatter: '{value}'
      }
    }
  ],
  series: [
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      data: props.data[timeRange.value]?.sales || [],
      itemStyle: {
        color: '#52c41a'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
          ]
        }
      }
    },
    {
      name: '订单量',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: props.data[timeRange.value]?.orders || [],
      itemStyle: {
        color: '#1890ff'
      }
    }
  ]
}))

const emit = defineEmits(['timeRangeChange'])

const handleTimeRangeChange = (value) => {
  emit('timeRangeChange', value)
}
</script>

<style lang="scss" scoped>
.chart-card {
  background: var(--bg-white);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--box-shadow);
  height: 100%;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .chart {
    width: 100%;
    height: 300px;
  }
}
</style>
