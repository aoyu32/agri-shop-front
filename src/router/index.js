import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore, USER_ROLES } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import Layout from '@/view/layout/index.vue'

const routes = [
  // 认证相关路由（不需要布局）
  {
    path: '/auth',
    redirect: '/auth/login',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/view/auth/login.vue'),
        meta: { title: '登录', guest: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/view/auth/register.vue'),
        meta: { title: '注册', guest: true }
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: () => import('@/view/auth/reset-password.vue'),
        meta: { title: '重置密码', guest: true }
      }
    ]
  },
  // 管理员路由
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/view/admin/index.vue'),
    meta: { title: '系统管理端', requireAuth: true, requireRole: USER_ROLES.ADMIN }
  },
  // 农户管理后台
  {
    path: '/merchant/profile',
    name: 'MerchantProfile',
    component: () => import('@/view/merchant/profile/index.vue'),
    meta: { title: '农户管理后台', requireAuth: true, requireRole: USER_ROLES.MERCHANT }
  },
  // 主应用路由（消费者）
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
        path: 'search',
        name: 'Search',
        component: () => import('@/view/search/index.vue'),
        meta: { title: '搜索结果' }
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
        path: 'community/create',
        name: 'CreatePost',
        component: () => import('@/view/community/create-post.vue'),
        meta: { title: '发布帖子', requireAuth: true }
      },
      {
        path: 'community/post/:id',
        name: 'PostDetail',
        component: () => import('@/view/community/post-detail.vue'),
        meta: { title: '帖子详情' }
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
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/view/profile/index.vue'),
        meta: { title: '个人中心', requireAuth: true }
      },
      {
        path: 'payment',
        name: 'Payment',
        component: () => import('@/view/payment/index.vue'),
        meta: { title: '订单支付', requireAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLogin = userStore.userInfo.isLogin
  const userRole = userStore.userInfo.role

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 农产品交易平台` : '农产品交易平台'

  // 如果是访客页面（登录、注册等），已登录用户访问时重定向到首页
  if (to.meta.guest && isLogin) {
    if (userRole === USER_ROLES.ADMIN) {
      next('/admin')
    } else if (userRole === USER_ROLES.MERCHANT) {
      next('/merchant/profile')
    } else {
      next('/home')
    }
    return
  }

  // 需要登录的页面
  if (to.meta.requireAuth && !isLogin) {
    ElMessage.warning('请先登录')
    next('/auth/login')
    return
  }

  // 需要特定角色的页面
  if (to.meta.requireRole && userRole !== to.meta.requireRole) {
    ElMessage.error('您没有权限访问该页面')
    next('/')
    return
  }

  next()
})

export default router
