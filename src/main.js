import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'
import pinia from './store'
import '@/styles/index.scss'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(pinia)

app.mount('#app')
