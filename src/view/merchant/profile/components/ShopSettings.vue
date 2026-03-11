<template>
  <div class="shop-settings">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>店铺设置</span>
        </div>
      </template>

      <el-form :model="shopForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="店铺Logo" prop="logo">
          <el-upload
            class="logo-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleLogoChange"
          >
            <img v-if="shopForm.logo" :src="shopForm.logo" class="logo" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">建议尺寸：200x200像素</div>
        </el-form-item>

        <el-form-item label="店铺横幅" prop="banner">
          <el-upload
            class="banner-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleBannerChange"
          >
            <img v-if="shopForm.banner" :src="shopForm.banner" class="banner" />
            <div v-else class="banner-uploader-placeholder">
              <el-icon class="banner-uploader-icon"><Plus /></el-icon>
              <div>上传店铺横幅</div>
            </div>
          </el-upload>
          <div class="form-tip">建议尺寸：1400x300像素</div>
        </el-form-item>

        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" style="width: 400px" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="shopForm.phone" placeholder="请输入联系电话" style="width: 400px" />
        </el-form-item>

        <el-form-item label="店铺地址" prop="location">
          <el-input v-model="shopForm.location" placeholder="请输入店铺地址" style="width: 400px" />
        </el-form-item>

        <el-form-item label="店铺简介" prop="description">
          <el-input
            v-model="shopForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入店铺简介"
            maxlength="200"
            show-word-limit
            style="width: 600px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存设置</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getMyShop, updateShopSettings } from '@/apis/shop'
import { uploadFile } from '@/apis/oss'

const formRef = ref(null)
const loading = ref(false)

// 店铺表单
const shopForm = ref({
  logo: '',
  banner: '',
  shopName: '',
  phone: '',
  location: '',
  description: ''
})

// 初始表单数据（用于重置）
const initialFormData = ref({})

// 表单验证规则
const formRules = {
  logo: [
    { required: true, message: '请上传店铺Logo', trigger: 'change' }
  ],
  banner: [
    { required: true, message: '请上传店铺横幅', trigger: 'change' }
  ],
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 20, message: '店铺名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入店铺简介', trigger: 'blur' },
    { min: 10, max: 200, message: '店铺简介长度在 10 到 200 个字符', trigger: 'blur' }
  ]
}

// 加载店铺信息
const loadShopInfo = async () => {
  loading.value = true
  try {
    const res = await getMyShop()
    if (res.data.has_shop && res.data.shop) {
      const shop = res.data.shop
      const user = res.data.user
      shopForm.value = {
        logo: shop.shop_logo || '',
        banner: shop.shop_banner || '',
        shopName: shop.shop_name || '',
        phone: user?.phone || '',
        location: shop.location || '',
        description: shop.description || ''
      }
      initialFormData.value = { ...shopForm.value }
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error)
  } finally {
    loading.value = false
  }
}

const handleLogoChange = async (file) => {
  try {
    const res = await uploadFile(file.raw, 'shop')
    shopForm.value.logo = res.data.url
    ElMessage.success('Logo上传成功')
  } catch (error) {
    console.error('Logo上传失败:', error)
    ElMessage.error('Logo上传失败')
  }
}

const handleBannerChange = async (file) => {
  try {
    const res = await uploadFile(file.raw, 'shop')
    shopForm.value.banner = res.data.url
    ElMessage.success('横幅上传成功')
  } catch (error) {
    console.error('横幅上传失败:', error)
    ElMessage.error('横幅上传失败')
  }
}

const handleSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await updateShopSettings({
          shop_name: shopForm.value.shopName,
          shop_logo: shopForm.value.logo,
          shop_banner: shopForm.value.banner,
          description: shopForm.value.description,
          location: shopForm.value.location,
          phone: shopForm.value.phone
        })
        ElMessage.success('保存成功')
        // 重新加载店铺信息
        await loadShopInfo()
      } catch (error) {
        console.error('保存失败:', error)
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.warning('请填写完整的店铺信息')
    }
  })
}

const handleReset = () => {
  shopForm.value = { ...initialFormData.value }
  formRef.value.clearValidate()
  ElMessage.info('已重置为初始值')
}

onMounted(() => {
  loadShopInfo()
})
</script>

<style lang="scss" scoped>
.shop-settings {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    .card-header {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }
  }

  :deep(.el-card__body) {
    padding: 40px 20px;
  }

  .logo-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        border-color: var(--theme-primary-color);
      }
    }

    .logo-uploader-icon {
      font-size: 28px;
      color: #8c8c8c;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      width: 120px;
      height: 120px;
      display: block;
      object-fit: cover;
    }
  }

  .banner-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      display: block;

      &:hover {
        border-color: var(--theme-primary-color);
      }
    }

    .banner-uploader-placeholder {
      width: 600px;
      height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;

      .banner-uploader-icon {
        font-size: 28px;
        color: #8c8c8c;
        margin-bottom: 8px;
      }

      div {
        font-size: 14px;
        color: #8c8c8c;
      }
    }

    .banner {
      width: 600px;
      height: 150px;
      display: block;
      object-fit: cover;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 8px;
  }
}
</style>
