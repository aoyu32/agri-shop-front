<template>
  <div class="profile-edit">
    <div class="list-header">
      <h3>修改信息</h3>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="edit-form"
    >
      <el-form-item label="头像">
        <div class="avatar-upload">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="handleAvatarUpload"
            accept="image/*"
          >
            <div class="avatar-container">
              <el-avatar :src="form.avatar" :size="100" />
              <div class="avatar-overlay">
                <i class="iconfont icon-edit"></i>
                <span>更换头像</span>
              </div>
            </div>
          </el-upload>
        </div>
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.phone" disabled />
      </el-form-item>

      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入地址" />
      </el-form-item>

      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="form.bio"
          type="textarea"
          :rows="4"
          placeholder="介绍一下自己吧"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="uploading">保存修改</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getUserInfo, updateUserInfo, updateAvatar } from '@/apis/user'
import { uploadFile } from '@/apis/oss'

const userStore = useUserStore()
const formRef = ref(null)
const uploading = ref(false)

const form = reactive({
  avatar: '',
  nickname: '',
  phone: '',
  address: '',
  bio: ''
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 50, message: '昵称长度为2-50个字符', trigger: 'blur' }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    const user = res.data.user
    
    form.avatar = user.avatar || ''
    form.nickname = user.nickname || ''
    form.phone = user.phone || ''
    form.address = user.address || ''
    form.bio = user.bio || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败')
  }
}

// 上传头像
const handleAvatarUpload = async (file) => {
  // 检查文件大小（5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.warning('头像大小不能超过 5MB')
    return false
  }

  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return false
  }

  try {
    uploading.value = true
    
    // 上传到OSS
    const res = await uploadFile(file, 'user')
    const avatarUrl = res.data.url
    
    // 更新头像
    await updateAvatar({ avatar: avatarUrl })
    
    form.avatar = avatarUrl
    
    // 更新store中的用户信息
    userStore.setUserInfo({ avatar: avatarUrl })
    
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.message || '头像上传失败')
  } finally {
    uploading.value = false
  }
  
  return false
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    // 更新用户信息
    await updateUserInfo({
      nickname: form.nickname,
      address: form.address,
      bio: form.bio
    })
    
    // 更新store中的用户信息
    userStore.setUserInfo({
      nickname: form.nickname,
      address: form.address,
      bio: form.bio
    })
    
    ElMessage.success('信息修改成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新失败:', error)
      ElMessage.error(error.message || '信息修改失败')
    }
  }
}

// 重置表单
const handleReset = () => {
  fetchUserInfo()
}

// 页面加载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.profile-edit {
  .list-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .edit-form {
    max-width: 600px;

    .avatar-upload {
      .avatar-uploader {
        :deep(.el-upload) {
          cursor: pointer;
        }

        .avatar-container {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;

          .avatar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
            color: #fff;

            i {
              font-size: 24px;
            }

            span {
              font-size: 12px;
            }
          }

          &:hover .avatar-overlay {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>
