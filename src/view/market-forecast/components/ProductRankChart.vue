<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>{{ title }}</h3>
    </div>
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '热销农产品排行'
  }
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    name: '销量'
  },
  yAxis: {
    type: 'category',
    data: props.data.map(item => item.name)
  },
  series: [
    {
      type: 'bar',
      data: props.data.map(item => item.sales),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#52c41a' },
            { offset: 1, color: '#95de64' }
          ]
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}'
      }
    }
  ]
}))
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
