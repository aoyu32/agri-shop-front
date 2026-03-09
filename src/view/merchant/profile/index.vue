<template>
  <div class="merchant-admin">
    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <div class="header-left">
        <div class="logo">
          <i class="iconfont icon-shangdian-2"></i>
          <span>农户店铺管理</span>
        </div>
      </div>
      <div class="header-right">
        <el-button text @click="goToHome" class="home-btn">
          <i class="iconfont icon-shouye"></i>
          返回首页
        </el-button>
        <div class="user-info">
          <el-dropdown @command="handleDropdownCommand">
            <span class="user-dropdown">
              <el-avatar :src="userStore.userInfo.avatar" :size="32" />
              <span class="username">{{ userStore.userInfo.username }}</span>
              <i class="el-icon-arrow-down"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="!shopInfo.has_shop || (shopInfo.has_shop && shopInfo.shop.audit_status === 2)" command="openShop">
                  <i class="iconfont icon-shangdian-2"></i>
                  {{ !shopInfo.has_shop ? '开通店铺' : '重新申请店铺' }}
                </el-dropdown-item>
                <el-dropdown-item command="logout" :divided="!shopInfo.has_shop || (shopInfo.has_shop && shopInfo.shop.audit_status === 2)">
                  <i class="iconfont icon-tuichu"></i>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="admin-container">
      <!-- 未开通店铺提示 -->
      <div v-if="!shopInfo.has_shop" class="no-shop-container">
        <el-empty description="您还未开通店铺">
          <el-button type="primary" size="large" @click="showApplyDialog = true">
            <i class="iconfont icon-shangdian-2"></i>
            立即开通店铺
          </el-button>
        </el-empty>
      </div>

      <!-- 审核中提示 -->
      <div v-else-if="shopInfo.shop.audit_status === 0" class="audit-pending-container">
        <el-result icon="info" title="店铺审核中" sub-title="您的店铺申请正在审核中，请耐心等待管理员审核">
          <template #extra>
            <el-button type="primary" @click="goToHome">返回首页</el-button>
          </template>
        </el-result>
      </div>

      <!-- 审核未通过提示 -->
      <div v-else-if="shopInfo.shop.audit_status === 2" class="audit-rejected-container">
        <el-result icon="error" title="店铺审核未通过" :sub-title="'拒绝原因：' + (shopInfo.shop.audit_reason || '未提供原因')">
          <template #extra>
            <el-button type="primary" @click="showApplyDialog = true">重新申请</el-button>
            <el-button @click="goToHome">返回首页</el-button>
          </template>
        </el-result>
      </div>

      <!-- 店铺管理界面 -->
      <template v-else-if="shopInfo.shop.audit_status === 1">
        <!-- 左侧边栏 -->
        <MerchantSidebar :active-menu="activeMenu" @menu-change="handleMenuSelect" />

        <!-- 右侧内容区域 -->
        <div class="admin-content">
          <component :is="currentComponent" />
        </div>
      </template>
    </div>

    <!-- 申请开通店铺对话框 -->
    <el-dialog
      v-model="showApplyDialog"
      :title="shopInfo.has_shop && shopInfo.shop.audit_status === 2 ? '重新申请店铺' : '申请开通店铺'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="applyFormRef"
        :model="applyForm"
        :rules="applyRules"
        label-width="100px"
      >
        <el-form-item label="店铺名称" prop="shop_name">
          <el-input
            v-model="applyForm.shop_name"
            placeholder="请输入店铺名称（2-50个字符）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="店铺Logo" prop="shop_logo">
          <el-upload
            class="logo-uploader"
            :show-file-list="false"
            :before-upload="beforeLogoUpload"
            :http-request="handleLogoUpload"
            accept="image/*"
          >
            <img v-if="applyForm.shop_logo" :src="applyForm.shop_logo" class="logo-preview" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：200x200像素</div>
        </el-form-item>

        <el-form-item label="店铺横幅" prop="shop_banner">
          <el-upload
            class="banner-uploader"
            :show-file-list="false"
            :before-upload="beforeBannerUpload"
            :http-request="handleBannerUpload"
            accept="image/*"
          >
            <img v-if="applyForm.shop_banner" :src="applyForm.shop_banner" class="banner-preview" />
            <el-icon v-else class="banner-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：1200x400像素</div>
        </el-form-item>

        <el-form-item label="店铺简介" prop="description">
          <el-input
            v-model="applyForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入店铺简介"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="店铺地址" prop="location">
          <el-input
            v-model="applyForm.location"
            placeholder="请输入店铺地址"
            maxlength="200"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitApply">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { getMyShop, applyShop } from '@/apis/shop'
import { uploadFile } from '@/apis/oss'
import MerchantSidebar from './components/MerchantSidebar.vue'
import Dashboard from './components/Dashboard.vue'
import MerchantOrderList from './components/MerchantOrderList.vue'
import ProductManagement from './components/ProductManagement.vue'
import CategoryManagement from './components/CategoryManagement.vue'
import ReviewManagement from './components/ReviewManagement.vue'
import ShopSettings from './components/ShopSettings.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 店铺信息
const shopInfo = ref({
  has_shop: false,
  shop: null
})

// 当前激活的菜单
const activeMenu = ref(route.query.menu || 'dashboard')

// 申请对话框
const showApplyDialog = ref(false)
const applyFormRef = ref(null)
const submitting = ref(false)

// 申请表单
const applyForm = ref({
  shop_name: '',
  shop_logo: '',
  shop_banner: '',
  description: '',
  location: ''
})

// 表单验证规则
const applyRules = {
  shop_name: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '店铺名称长度为2-50个字符', trigger: 'blur' }
  ],
  shop_logo: [
    { required: true, message: '请上传店铺Logo', trigger: 'change' }
  ],
  shop_banner: [
    { required: true, message: '请上传店铺横幅', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入店铺简介', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ]
}

// 监听路由变化
watch(
  () => route.query.menu,
  (newMenu) => {
    if (newMenu) {
      activeMenu.value = newMenu
    }
  }
)

// 组件映射
const componentMap = {
  'dashboard': Dashboard,
  'order-pending': MerchantOrderList,
  'order-shipped': MerchantOrderList,
  'order-completed': MerchantOrderList,
  'order-refund': MerchantOrderList,
  'order-all': MerchantOrderList,
  'product-list': ProductManagement,
  'product-add': ProductManagement,
  'category-manage': CategoryManagement,
  'reviews': ReviewManagement,
  'shop-settings': ShopSettings
}

// 当前显示的组件
const currentComponent = computed(() => {
  return componentMap[activeMenu.value] || Dashboard
})

// 获取店铺信息
const fetchShopInfo = async () => {
  try {
    const res = await getMyShop()
    shopInfo.value = res.data
    
    // 如果有店铺且审核未通过，填充表单数据以便重新申请
    if (res.data.has_shop && res.data.shop.audit_status === 2) {
      applyForm.value = {
        shop_name: res.data.shop.shop_name,
        shop_logo: res.data.shop.shop_logo,
        shop_banner: res.data.shop.shop_banner,
        description: res.data.shop.description,
        location: res.data.shop.location
      }
    }
  } catch (error) {
    console.error('获取店铺信息失败:', error)
    ElMessage.error('获取店铺信息失败')
  }
}

// Logo上传前验证
const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// Logo上传处理
const handleLogoUpload = async ({ file }) => {
  try {
    const res = await uploadFile(file, 'shop')
    applyForm.value.shop_logo = res.data.url
    ElMessage.success('Logo上传成功')
  } catch (error) {
    console.error('Logo上传失败:', error)
    ElMessage.error('Logo上传失败')
  }
}

// 横幅上传前验证
const beforeBannerUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

// 横幅上传处理
const handleBannerUpload = async ({ file }) => {
  try {
    const res = await uploadFile(file, 'shop')
    applyForm.value.shop_banner = res.data.url
    ElMessage.success('横幅上传成功')
  } catch (error) {
    console.error('横幅上传失败:', error)
    ElMessage.error('横幅上传失败')
  }
}

// 提交申请
const handleSubmitApply = async () => {
  try {
    await applyFormRef.value.validate()
    
    submitting.value = true
    await applyShop(applyForm.value)
    
    ElMessage.success('店铺申请已提交，请等待管理员审核')
    showApplyDialog.value = false
    
    // 重新获取店铺信息
    await fetchShopInfo()
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('提交申请失败:', error)
      ElMessage.error(error.message || '提交申请失败')
    }
  } finally {
    submitting.value = false
  }
}

// 下拉菜单命令处理
const handleDropdownCommand = (command) => {
  switch (command) {
    case 'openShop':
      showApplyDialog.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 菜单切换处理
const handleMenuSelect = (menu) => {
  activeMenu.value = menu
  router.push({ query: { menu } })
}

// 返回首页
const goToHome = () => {
  router.push('/home')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/home')
  }).catch(() => {})
}

// 页面加载时获取店铺信息
onMounted(() => {
  fetchShopInfo()
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
