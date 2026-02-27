import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { useUserStore } from '@/store/modules/user'
import '@/styles/index.scss'

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn,
})
app.use(pinia)
app.use(router)

// 初始化用户信息
const userStore = useUserStore()
userStore.initUserInfo()

app.mount('#app')
