import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/apis/auth'
import { ElMessage } from 'element-plus'

// 用户角色常量
export const USER_ROLES = {
  CONSUMER: 'consumer',  // 普通消费者
  MERCHANT: 'merchant',  // 商户
  ADMIN: 'admin'         // 系统管理员
}

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({
    id: null,
    username: '',
    avatar: '',
    phone: '',
    nickname: '',
    address: '',
    bio: '',
    role: USER_ROLES.CONSUMER,
    isLogin: false
  })

  // 用户统计数据
  const userStatistics = ref({
    order_count: 0,
    favorite_count: 0,
    footprint_count: 0
  })

  // Token
  const token = ref(localStorage.getItem('token') || '')

  // 未读消息数
  const unreadMessages = ref(0)

  // 购物车数量
  const cartCount = ref(0)

  // 计算属性：是否登录
  const isLoggedIn = computed(() => !!token.value && userInfo.value.isLogin)

  // 计算属性：是否是商户
  const isMerchant = computed(() => userInfo.value.role === USER_ROLES.MERCHANT)

  // 计算属性：是否是消费者
  const isConsumer = computed(() => userInfo.value.role === USER_ROLES.CONSUMER)

  // 计算属性：是否是管理员
  const isAdmin = computed(() => userInfo.value.role === USER_ROLES.ADMIN)

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info, isLogin: true }
    // 保存到 localStorage
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  // 设置 Token
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 登录
  const login = async (loginData) => {
    try {
      const res = await loginApi(loginData)

      // 保存 token
      setToken(res.data.token)

      // 保存用户信息
      setUserInfo(res.data.user)

      // 如果是消费者，获取购物车数量
      if (res.data.user.role === USER_ROLES.CONSUMER) {
        fetchCartCount()
      }

      return res
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await getUserInfoApi()
      setUserInfo(res.data.user)

      // 保存统计数据
      if (res.data.statistics) {
        userStatistics.value = res.data.statistics
      }

      // 如果是消费者，获取购物车数量
      if (res.data.user.role === USER_ROLES.CONSUMER) {
        fetchCartCount()
      }

      return res
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败，清除本地数据
      logout()
      throw error
    }
  }

  // 获取购物车数量
  const fetchCartCount = async () => {
    try {
      const { getCartCount } = await import('@/apis/cart')
      const res = await getCartCount()
      cartCount.value = res.data.count
    } catch (error) {
      console.error('获取购物车数量失败:', error)
    }
  }

  // 登出
  const logout = async () => {
    try {
      if (token.value) {
        await logoutApi()
      }
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除本地数据
      userInfo.value = {
        id: null,
        username: '',
        avatar: '',
        phone: '',
        nickname: '',
        address: '',
        bio: '',
        role: USER_ROLES.CONSUMER,
        isLogin: false
      }
      token.value = ''
      unreadMessages.value = 0
      cartCount.value = 0

      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  // 初始化用户信息（从 localStorage 恢复）
  const initUserInfo = () => {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo && token.value) {
      try {
        userInfo.value = JSON.parse(savedUserInfo)
        // 验证 token 是否有效，获取最新用户信息
        getUserInfo().catch(() => {
          // 如果获取失败，清除本地数据
          logout()
        })
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  // 更新未读消息数
  const setUnreadMessages = (count) => {
    unreadMessages.value = count
  }

  // 更新购物车数量
  const setCartCount = (count) => {
    cartCount.value = count
  }

  return {
    userInfo,
    userStatistics,
    token,
    unreadMessages,
    cartCount,
    isLoggedIn,
    isMerchant,
    isConsumer,
    isAdmin,
    setUserInfo,
    setToken,
    login,
    getUserInfo,
    logout,
    initUserInfo,
    setUnreadMessages,
    setCartCount,
    fetchCartCount
  }
})
