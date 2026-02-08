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

      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.phone" disabled />
      </el-form-item>

      <el-form-item label="城市" prop="city">
        <el-input v-model="form.city" placeholder="请输入所在城市" />
      </el-form-item>

      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="form.bio"
          type="textarea"
          :rows="4"
          placeholder="介绍一下自己吧"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存修改</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const formRef = ref(null)

const form = reactive({
  avatar: userStore.userInfo.avatar,
  username: userStore.userInfo.username,
  phone: '138****0001',
  city: '北京市 朝阳区',
  bio: '热爱生活，喜欢购买新鲜的农产品，支持绿色健康的生活方式。'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' }
  ],
  city: [
    { required: true, message: '请输入所在城市', trigger: 'blur' }
  ]
}

const handleAvatarUpload = (file) => {
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

  // 模拟头像上传
  const reader = new FileReader()
  reader.onload = (e) => {
    form.avatar = e.target.result
    ElMessage.success('头像上传成功')
  }
  reader.readAsDataURL(file)
  return false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    ElMessage.success('信息修改成功')
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}
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
