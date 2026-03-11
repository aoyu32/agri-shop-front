<template>
  <el-dialog
    v-model="dialogVisible"
    title="个人信息"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="personal-info-form"
    >
      <el-form-item label="头像">
        <div class="avatar-upload">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
            accept="image/*"
          >
            <img v-if="formData.avatar" :src="formData.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="avatar-tip">点击上传头像，支持 JPG、PNG 格式</div>
        </div>
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="formData.nickname"
          placeholder="请输入昵称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </el-form-item>

      <el-form-item label="地址" prop="address">
        <el-input
          v-model="formData.address"
          placeholder="请输入地址"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="formData.bio"
          placeholder="请输入个人简介"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { getUserInfo, updateUserInfo } from '@/apis/user'
import { uploadFile } from '@/apis/oss'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单数据
const formData = ref({
  avatar: '',
  nickname: '',
  phone: '',
  address: '',
  bio: ''
})

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 50, message: '昵称长度为2-50个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await getUserInfo()
    if (res.code === 200) {
      const user = res.data.user
      formData.value = {
        avatar: user.avatar || '',
        nickname: user.nickname || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  }
}

// 监听弹窗打开
watch(dialogVisible, (val) => {
  if (val) {
    loadUserInfo()
  }
})

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像上传
const handleAvatarUpload = async ({ file }) => {
  try {
    const res = await uploadFile(file, 'avatar')
    if (res.code === 200) {
      formData.value.avatar = res.data.url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const res = await updateUserInfo(formData.value)
    if (res.code === 200) {
      ElMessage.success('个人信息更新成功')
      
      // 更新 store 中的用户信息
      userStore.updateUserInfo({
        avatar: formData.value.avatar,
        nickname: formData.value.nickname,
        phone: formData.value.phone
      })
      
      emit('success', formData.value)
      dialogVisible.value = false
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('更新个人信息失败:', error)
      ElMessage.error('更新失败')
    }
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.personal-info-form {
  padding: 20px 0;

  .avatar-upload {
    display: flex;
    align-items: center;
    gap: 20px;

    .avatar-uploader {
      :deep(.el-upload) {
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: var(--el-color-primary);
        }
      }

      .avatar {
        width: 100px;
        height: 100px;
        display: block;
        object-fit: cover;
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
      }
    }

    .avatar-tip {
      font-size: 12px;
      color: #999;
      line-height: 1.5;
    }
  }
}
</style>
