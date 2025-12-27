import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    role: USER_ROLES.CONSUMER,
    isLogin: false
  })

  // 未读消息数
  const unreadMessages = ref(100)

  // 购物车数量
  const cartCount = ref(100)

  // 计算属性：是否是商户
  const isMerchant = computed(() => userInfo.value.role === USER_ROLES.MERCHANT)

  // 计算属性：是否是消费者
  const isConsumer = computed(() => userInfo.value.role === USER_ROLES.CONSUMER)

  // 计算属性：是否是管理员
  const isAdmin = computed(() => userInfo.value.role === USER_ROLES.ADMIN)

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info, isLogin: true }
  }

  // 登出
  const logout = () => {
    userInfo.value = {
      id: null,
      username: '',
      avatar: '',
      role: USER_ROLES.CONSUMER,
      isLogin: false
    }
    unreadMessages.value = 0
    cartCount.value = 0
  }

  // 更新未读消息数
  const setUnreadMessages = (count) => {
    unreadMessages.value = count
  }

  // 更新购物车数量
  const setCartCount = (count) => {
    cartCount.value = count
  }

  // 模拟登录（开发用）
  const mockLogin = (role = USER_ROLES.CONSUMER) => {
    const mockData = {
      [USER_ROLES.CONSUMER]: {
        id: 1,
        username: '张三',
        avatar: 'https://i.pravatar.cc/150?img=1',
        role: USER_ROLES.CONSUMER
      },
      [USER_ROLES.MERCHANT]: {
        id: 2,
        username: '李四商户',
        avatar: 'https://i.pravatar.cc/150?img=13',
        role: USER_ROLES.MERCHANT
      }
    }
    setUserInfo(mockData[role])
    if (role === USER_ROLES.CONSUMER) {
      setCartCount(3)
    }
    setUnreadMessages(5)
  }

  return {
    userInfo,
    unreadMessages,
    cartCount,
    isMerchant,
    isConsumer,
    isAdmin,
    setUserInfo,
    logout,
    setUnreadMessages,
    setCartCount,
    mockLogin
  }
})
