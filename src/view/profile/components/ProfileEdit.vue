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
          <el-avatar :src="form.avatar" :size="100" />
          <el-button type="primary" size="small" @click="handleUploadAvatar">
            更换头像
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.phone" disabled>
          <template #append>
            <el-button @click="handleChangePhone">修改</el-button>
          </template>
        </el-input>
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

const handleUploadAvatar = () => {
  ElMessage.info('头像上传功能开发中')
}

const handleChangePhone = () => {
  ElMessage.info('请前往安全设置修改手机号')
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
      display: flex;
      align-items: center;
      gap: 20px;
    }
  }
}
</style>
