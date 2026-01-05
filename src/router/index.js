import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/view/layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/view/home/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/view/category/index.vue'),
        meta: { title: '分类' }
      },
      {
        path: 'ai-consult',
        name: 'AiConsult',
        component: () => import('@/view/ai-consult/index.vue'),
        meta: { title: 'AI咨询', hideFooter: true }
      },
      {
        path: 'community',
        name: 'Community',
        component: () => import('@/view/community/index.vue'),
        meta: { title: '社区' }
      },
      {
        path: 'market-forecast',
        name: 'MarketForecast',
        component: () => import('@/view/market-forecast/index.vue'),
        meta: { title: '行情预测', requireMerchant: true }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('@/view/product-detail/index.vue'),
        meta: { title: '商品详情' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
