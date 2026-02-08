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
        </el-form-item>

        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" style="width: 400px" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="shopForm.phone" placeholder="请输入联系电话" style="width: 400px" />
        </el-form-item>

        <el-form-item label="店铺地址" prop="addressCode">
          <el-cascader
            v-model="shopForm.addressCode"
            :options="regionData"
            placeholder="请选择省市区"
            style="width: 400px"
            @change="handleAddressChange"
          />
        </el-form-item>

        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="shopForm.detailAddress" placeholder="请输入详细地址" style="width: 400px" />
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { regionData } from 'element-china-area-data'

const formRef = ref(null)

// 店铺表单
const shopForm = ref({
  logo: 'https://via.placeholder.com/200',
  shopName: '绿野农场',
  phone: '13900000002',
  addressCode: ['370000', '370700', '370783'],
  detailAddress: '洛城街道农业示范园区',
  description: '专注有机蔬菜种植20年，为您提供最新鲜、最健康的农产品。我们坚持绿色种植，不使用化学农药和化肥，让您吃得放心。'
})

// 初始表单数据（用于重置）
const initialFormData = { ...shopForm.value }

// 表单验证规则
const formRules = {
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 20, message: '店铺名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  addressCode: [
    { required: true, message: '请选择店铺地址', trigger: 'change' }
  ],
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入店铺简介', trigger: 'blur' },
    { min: 10, max: 200, message: '店铺简介长度在 10 到 200 个字符', trigger: 'blur' }
  ]
}

const handleLogoChange = (file) => {
  shopForm.value.logo = URL.createObjectURL(file.raw)
}

const handleAddressChange = (value) => {
  console.log('地址变化：', value)
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 模拟保存
      ElMessage.success('保存成功')
      console.log('保存的店铺信息：', shopForm.value)
    } else {
      ElMessage.warning('请填写完整的店铺信息')
    }
  })
}

const handleReset = () => {
  shopForm.value = { ...initialFormData }
  formRef.value.clearValidate()
  ElMessage.info('已重置为初始值')
}
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
}
</style>
